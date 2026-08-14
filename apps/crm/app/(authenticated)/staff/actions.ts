"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { clerkClient } from "@repo/auth/server";
import type { UserStatus } from "@repo/database";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { env } from "@/env";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Staff & role management is gated on the "*" (Super Admin) permission —
// there's no dedicated "users:manage"/"staff:*" key in the seed data, and
// Super Admin is the only role meant to have full access, so it's the
// correct gate for this screen rather than inventing a new key.

export const changeUserRole = async (userId: string, roleId: string) => {
  const actingUser = await requirePermission("*");

  const [targetUser, role] = await Promise.all([
    database.user.findUnique({
      where: { id: userId },
      include: { role: true },
    }),
    database.role.findUnique({ where: { id: roleId } }),
  ]);

  if (!(targetUser && role)) {
    throw new Error("User or role not found.");
  }

  await database.user.update({
    where: { id: userId },
    data: { roleId },
  });

  await logActivity({
    action: "user.role_changed",
    entityType: "User",
    entityId: userId,
    description: `Changed role for ${targetUser.email} from ${targetUser.role.name} to ${role.name}`,
    metadata: {
      fromRoleId: targetUser.roleId,
      toRoleId: roleId,
      actingUserId: actingUser.id,
    },
  });

  revalidatePath("/staff");
};

export const toggleUserStatus = async (userId: string, status: UserStatus) => {
  const actingUser = await requirePermission("*");

  if (userId === actingUser.id && status === "INACTIVE") {
    throw new Error("You can't deactivate your own account.");
  }

  const targetUser = await database.user.update({
    where: { id: userId },
    data: { status },
  });

  await logActivity({
    action: status === "ACTIVE" ? "user.activated" : "user.deactivated",
    entityType: "User",
    entityId: userId,
    description: `${status === "ACTIVE" ? "Activated" : "Deactivated"} ${targetUser.email}`,
  });

  revalidatePath("/staff");
};

// There's no public sign-up (see apps/crm/app/(unauthenticated)/layout.tsx) —
// staff accounts are provisioned by inviting an email through Clerk. The
// intended role rides along in the invitation's publicMetadata and is picked
// up by the user.created webhook (apps/api/app/webhooks/auth/route.ts); if
// that role no longer exists by the time they accept, the webhook falls back
// to the default Staff role rather than failing.
export const inviteStaffMember = async (formData: FormData) => {
  await requirePermission("*");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const roleId = String(formData.get("roleId") ?? "").trim();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const [existingUser, role] = await Promise.all([
    database.user.findUnique({ where: { email } }),
    roleId ? database.role.findUnique({ where: { id: roleId } }) : null,
  ]);

  if (existingUser) {
    throw new Error("This person already has a CRM account.");
  }

  const client = await clerkClient();

  let invitationId: string;
  try {
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: roleId ? { intendedRoleId: roleId } : undefined,
      redirectUrl: `${env.NEXT_PUBLIC_APP_URL}/sign-in`,
    });
    invitationId = invitation.id;
  } catch (error) {
    console.error("inviteStaffMember failed:", error);
    throw new Error(
      "Couldn't send the invitation. They may already have a pending invite — check the Clerk Dashboard."
    );
  }

  await logActivity({
    action: "staff.invited",
    entityType: "Invitation",
    entityId: invitationId,
    description: `Invited ${email}${role ? ` as ${role.name}` : ""}`,
    metadata: { email, roleId: roleId || undefined },
  });

  revalidatePath("/staff");
};

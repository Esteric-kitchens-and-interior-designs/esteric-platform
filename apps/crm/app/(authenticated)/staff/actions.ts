"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import type { UserStatus } from "@repo/database";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

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

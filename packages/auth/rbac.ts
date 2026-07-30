import "server-only";

import { auth } from "@clerk/nextjs/server";
import { database } from "@repo/database";
import { hasPermission } from "./permissions";

export type { PermissionCheckable } from "./permissions";
// Re-exported for backward compatibility — see permissions.ts for why the
// implementation lives there. Client Components should import it from
// "@repo/auth/permissions" directly instead of from this server-only module.
export { hasPermission } from "./permissions";

/**
 * The CRM's staff/permission record for the signed-in Clerk user, or null
 * if there's no session or the webhook-driven sync hasn't created the row
 * yet (e.g. a brand-new user in the few seconds before user.created lands).
 */
export const getCurrentStaffUser = async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  return database.user.findUnique({
    where: { clerkId: userId },
    include: { role: true },
  });
};

/** Throws if the current user is missing or lacks the given permission. Use in server actions/route handlers. */
export const requirePermission = async (permission: string) => {
  const user = await getCurrentStaffUser();
  if (!(user && hasPermission(user, permission))) {
    throw new Error(`Forbidden: missing permission "${permission}"`);
  }
  return user;
};

import "server-only";

import { database } from "@repo/database";
import { headers } from "next/headers";
import { getCurrentStaffUser } from "./rbac";

interface LogActivityInput {
  action: string; // e.g. "lead.status_changed", "quotation.approved"
  description?: string;
  entityId?: string;
  entityType: string; // e.g. "Lead", "Quotation", "Project"
  metadata?: Record<string, unknown>;
}

/**
 * Writes one row to ActivityLog, capturing the acting user, IP, and device
 * (user-agent) from the current request. Call this from server actions and
 * route handlers right after a mutation succeeds — never speculatively.
 */
export const logActivity = async ({
  action,
  entityType,
  entityId,
  description,
  metadata,
}: LogActivityInput) => {
  const [user, headerList] = await Promise.all([
    getCurrentStaffUser(),
    headers(),
  ]);

  const forwardedFor = headerList.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? null;

  await database.activityLog.create({
    data: {
      userId: user?.id,
      action,
      entityType,
      entityId,
      description,
      metadata: metadata as never,
      ipAddress,
      userAgent: headerList.get("user-agent"),
    },
  });
};

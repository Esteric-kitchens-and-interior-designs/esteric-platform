"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { PERMISSION_KEYS } from "../permissions";

const readPermissions = (formData: FormData): string[] => {
  if (formData.get("fullAccess") === "on") {
    return ["*"];
  }
  const selected = formData.getAll("permissions").map(String);
  return selected.filter((p) =>
    (PERMISSION_KEYS as readonly string[]).includes(p)
  );
};

export const createRole = async (formData: FormData) => {
  await requirePermission("*");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    throw new Error("Role name is required.");
  }

  const permissions = readPermissions(formData);

  const role = await database.role.create({
    data: {
      name,
      description: description || undefined,
      permissions,
    },
  });

  await logActivity({
    action: "role.created",
    entityType: "Role",
    entityId: role.id,
    description: `Created role "${role.name}" with permissions: ${permissions.join(", ") || "none"}`,
  });

  revalidatePath("/staff/roles");
};

export const updateRole = async (roleId: string, formData: FormData) => {
  await requirePermission("*");

  const existing = await database.role.findUnique({ where: { id: roleId } });
  if (!existing) {
    throw new Error("Role not found.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const permissions = readPermissions(formData);

  if (!name) {
    throw new Error("Role name is required.");
  }

  const role = await database.role.update({
    where: { id: roleId },
    data: { name, description: description || null, permissions },
  });

  await logActivity({
    action: "role.updated",
    entityType: "Role",
    entityId: role.id,
    description: `Updated role "${role.name}" — permissions: ${permissions.join(", ") || "none"}`,
    metadata: { previousPermissions: existing.permissions },
  });

  revalidatePath("/staff/roles");
};

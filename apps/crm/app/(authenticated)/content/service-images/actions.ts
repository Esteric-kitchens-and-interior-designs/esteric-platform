"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database, type ServiceCategory } from "@repo/database";
import { revalidatePath } from "next/cache";

const MAX_SERVICE_IMAGES = 4;

export interface ServiceImagePayload {
  altText: string | null;
  category: ServiceCategory;
  sortOrder: number;
  url: string;
}

export const createServiceImage = async (payload: ServiceImagePayload) => {
  await requirePermission("content:write");

  const count = await database.serviceImage.count({
    where: { category: payload.category },
  });
  if (count >= MAX_SERVICE_IMAGES) {
    throw new Error(
      `You can have at most ${MAX_SERVICE_IMAGES} images per service. Remove one before adding another.`
    );
  }

  const image = await database.serviceImage.create({ data: payload });

  await logActivity({
    action: "service_image.created",
    entityType: "ServiceImage",
    entityId: image.id,
    description: `Added image to ${payload.category} service gallery`,
  });

  revalidatePath("/content/service-images");
};

export const updateServiceImage = async (
  id: string,
  payload: { altText: string | null; isPublished: boolean; sortOrder: number }
) => {
  await requirePermission("content:write");

  await database.serviceImage.update({ where: { id }, data: payload });

  await logActivity({
    action: "service_image.updated",
    entityType: "ServiceImage",
    entityId: id,
  });

  revalidatePath("/content/service-images");
};

export const deleteServiceImage = async (id: string) => {
  await requirePermission("content:write");

  await database.serviceImage.delete({ where: { id } });

  await logActivity({
    action: "service_image.deleted",
    entityType: "ServiceImage",
    entityId: id,
  });

  revalidatePath("/content/service-images");
};

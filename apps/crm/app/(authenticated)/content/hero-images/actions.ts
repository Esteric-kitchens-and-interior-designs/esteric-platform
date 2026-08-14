"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

const MAX_HERO_IMAGES = 3;

export interface HeroImagePayload {
  altText: string | null;
  sortOrder: number;
  url: string;
}

export const createHeroImage = async (payload: HeroImagePayload) => {
  await requirePermission("content:write");

  const count = await database.heroImage.count();
  if (count >= MAX_HERO_IMAGES) {
    throw new Error(
      `You can have at most ${MAX_HERO_IMAGES} hero images. Remove one before adding another.`
    );
  }

  const image = await database.heroImage.create({ data: payload });

  await logActivity({
    action: "hero_image.created",
    entityType: "HeroImage",
    entityId: image.id,
  });

  revalidatePath("/content/hero-images");
};

export const updateHeroImage = async (
  id: string,
  payload: { altText: string | null; isPublished: boolean; sortOrder: number }
) => {
  await requirePermission("content:write");

  await database.heroImage.update({ where: { id }, data: payload });

  await logActivity({
    action: "hero_image.updated",
    entityType: "HeroImage",
    entityId: id,
  });

  revalidatePath("/content/hero-images");
};

export const deleteHeroImage = async (id: string) => {
  await requirePermission("content:write");

  await database.heroImage.delete({ where: { id } });

  await logActivity({
    action: "hero_image.deleted",
    entityType: "HeroImage",
    entityId: id,
  });

  revalidatePath("/content/hero-images");
};

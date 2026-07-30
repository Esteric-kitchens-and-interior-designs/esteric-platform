"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import {
  type ContentStatus,
  database,
  type PortfolioImageType,
  type ServiceCategory,
} from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "../lib/helpers";

export interface PortfolioFormPayload {
  category: ServiceCategory;
  completionDate?: string | null;
  description?: string | null;
  isFeatured: boolean;
  location?: string | null;
  projectId?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug: string;
  status: ContentStatus;
  title: string;
}

const uniqueSlug = async (base: string, excludeId?: string) => {
  let slug = base || slugify(String(Date.now()));
  let attempt = 0;
  while (
    await database.portfolioProject.findFirst({
      where: { slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    })
  ) {
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
  return slug;
};

export const createPortfolioProject = async (payload: PortfolioFormPayload) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const slug = await uniqueSlug(slugify(payload.slug || payload.title));

  const portfolioProject = await database.portfolioProject.create({
    data: {
      title: payload.title,
      slug,
      category: payload.category,
      description: payload.description || null,
      location: payload.location || null,
      completionDate: payload.completionDate
        ? new Date(payload.completionDate)
        : null,
      isFeatured: payload.isFeatured,
      status: payload.status,
      projectId: payload.projectId || null,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logActivity({
    action:
      payload.status === "PUBLISHED"
        ? "portfolio.published"
        : "portfolio.created",
    entityType: "PortfolioProject",
    entityId: portfolioProject.id,
    description: `Created portfolio project "${payload.title}"`,
  });

  revalidatePath("/content/portfolio");
  redirect(`/content/portfolio/${portfolioProject.id}`);
};

export const updatePortfolioProject = async (
  id: string,
  payload: PortfolioFormPayload
) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const existing = await database.portfolioProject.findUniqueOrThrow({
    where: { id },
  });
  const slug = await uniqueSlug(slugify(payload.slug || payload.title), id);
  const isNewlyPublished =
    payload.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  await database.portfolioProject.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      category: payload.category,
      description: payload.description || null,
      location: payload.location || null,
      completionDate: payload.completionDate
        ? new Date(payload.completionDate)
        : null,
      isFeatured: payload.isFeatured,
      status: payload.status,
      projectId: payload.projectId || null,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      publishedAt: isNewlyPublished ? new Date() : existing.publishedAt,
    },
  });

  await logActivity({
    action: isNewlyPublished ? "portfolio.published" : "portfolio.updated",
    entityType: "PortfolioProject",
    entityId: id,
    description: `Updated portfolio project "${payload.title}"`,
  });

  revalidatePath("/content/portfolio");
  revalidatePath(`/content/portfolio/${id}`);
};

export const addPortfolioImage = async (
  portfolioProjectId: string,
  url: string,
  type: PortfolioImageType,
  caption?: string | null,
  altText?: string | null
) => {
  await requirePermission("content:write");

  const count = await database.portfolioImage.count({
    where: { portfolioProjectId },
  });

  await database.portfolioImage.create({
    data: {
      portfolioProjectId,
      url,
      type,
      caption: caption || null,
      altText: altText || null,
      sortOrder: count,
    },
  });

  await logActivity({
    action: "portfolio.image_added",
    entityType: "PortfolioProject",
    entityId: portfolioProjectId,
    description: `Added a ${type.toLowerCase()} image`,
  });

  revalidatePath(`/content/portfolio/${portfolioProjectId}`);
};

export const removePortfolioImage = async (
  portfolioProjectId: string,
  imageId: string
) => {
  await requirePermission("content:write");

  await database.portfolioImage.delete({ where: { id: imageId } });

  await logActivity({
    action: "portfolio.image_removed",
    entityType: "PortfolioProject",
    entityId: portfolioProjectId,
    description: "Removed a portfolio image",
  });

  revalidatePath(`/content/portfolio/${portfolioProjectId}`);
};

"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { type ContentStatus, database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "../lib/helpers";

export interface BlogFormPayload {
  category?: string | null;
  content: string;
  coverImageUrl?: string | null;
  excerpt?: string | null;
  seoDescription?: string | null;
  seoTitle?: string | null;
  slug: string;
  status: ContentStatus;
  tags: string[];
  title: string;
}

const uniqueSlug = async (base: string, excludeId?: string) => {
  let slug = base || slugify(String(Date.now()));
  let attempt = 0;
  while (
    await database.blogPost.findFirst({
      where: { slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    })
  ) {
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
  return slug;
};

export const createBlogPost = async (payload: BlogFormPayload) => {
  const user = await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }
  if (!payload.content.trim()) {
    throw new Error("Content is required");
  }

  const slug = await uniqueSlug(slugify(payload.slug || payload.title));

  const post = await database.blogPost.create({
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt || null,
      content: payload.content,
      coverImageUrl: payload.coverImageUrl || null,
      category: payload.category || null,
      tags: payload.tags,
      status: payload.status,
      authorId: user.id,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      publishedAt: payload.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logActivity({
    action: payload.status === "PUBLISHED" ? "blog.published" : "blog.created",
    entityType: "BlogPost",
    entityId: post.id,
    description: `Created blog post "${payload.title}"`,
  });

  revalidatePath("/content/blog");
  redirect(`/content/blog/${post.id}`);
};

export const updateBlogPost = async (id: string, payload: BlogFormPayload) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const existing = await database.blogPost.findUniqueOrThrow({ where: { id } });
  const slug = await uniqueSlug(slugify(payload.slug || payload.title), id);
  const isNewlyPublished =
    payload.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  await database.blogPost.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      excerpt: payload.excerpt || null,
      content: payload.content,
      coverImageUrl: payload.coverImageUrl || null,
      category: payload.category || null,
      tags: payload.tags,
      status: payload.status,
      seoTitle: payload.seoTitle || null,
      seoDescription: payload.seoDescription || null,
      publishedAt: isNewlyPublished ? new Date() : existing.publishedAt,
    },
  });

  await logActivity({
    action: isNewlyPublished ? "blog.published" : "blog.updated",
    entityType: "BlogPost",
    entityId: id,
    description: `Updated blog post "${payload.title}"`,
  });

  revalidatePath("/content/blog");
  revalidatePath(`/content/blog/${id}`);
};

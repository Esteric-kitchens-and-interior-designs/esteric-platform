"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface TestimonialFormPayload {
  customerName: string;
  isFeatured: boolean;
  isPublished: boolean;
  photoUrl?: string | null;
  portfolioProjectId?: string | null;
  quote: string;
  rating: number;
}

export const createTestimonial = async (payload: TestimonialFormPayload) => {
  await requirePermission("content:write");
  if (!payload.customerName.trim()) {
    throw new Error("A customer name is required");
  }
  if (!payload.quote.trim()) {
    throw new Error("A quote is required");
  }

  const count = await database.testimonial.count();

  const record = await database.testimonial.create({
    data: {
      customerName: payload.customerName,
      quote: payload.quote,
      rating: Math.min(5, Math.max(1, payload.rating)),
      photoUrl: payload.photoUrl || null,
      portfolioProjectId: payload.portfolioProjectId || null,
      isFeatured: payload.isFeatured,
      isPublished: payload.isPublished,
      sortOrder: count,
    },
  });

  await logActivity({
    action: "testimonial.created",
    entityType: "Testimonial",
    entityId: record.id,
    description: `Added testimonial from ${payload.customerName}`,
  });

  revalidatePath("/content/testimonials");
  redirect(`/content/testimonials/${record.id}`);
};

export const updateTestimonial = async (
  id: string,
  payload: TestimonialFormPayload
) => {
  await requirePermission("content:write");
  if (!payload.customerName.trim()) {
    throw new Error("A customer name is required");
  }
  if (!payload.quote.trim()) {
    throw new Error("A quote is required");
  }

  await database.testimonial.update({
    where: { id },
    data: {
      customerName: payload.customerName,
      quote: payload.quote,
      rating: Math.min(5, Math.max(1, payload.rating)),
      photoUrl: payload.photoUrl || null,
      portfolioProjectId: payload.portfolioProjectId || null,
      isFeatured: payload.isFeatured,
      isPublished: payload.isPublished,
    },
  });

  await logActivity({
    action: "testimonial.updated",
    entityType: "Testimonial",
    entityId: id,
    description: `Updated testimonial from ${payload.customerName}`,
  });

  revalidatePath("/content/testimonials");
  revalidatePath(`/content/testimonials/${id}`);
};

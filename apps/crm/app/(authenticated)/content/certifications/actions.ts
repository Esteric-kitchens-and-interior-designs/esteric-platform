"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { type CertificationAwardType, database } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CertificationFormPayload {
  dateAwarded?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
  issuer?: string | null;
  title: string;
  type: CertificationAwardType;
}

export const createCertification = async (
  payload: CertificationFormPayload
) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const count = await database.certificationAward.count();

  const record = await database.certificationAward.create({
    data: {
      title: payload.title,
      issuer: payload.issuer || null,
      type: payload.type,
      dateAwarded: payload.dateAwarded ? new Date(payload.dateAwarded) : null,
      imageUrl: payload.imageUrl || null,
      description: payload.description || null,
      isPublished: payload.isPublished,
      sortOrder: count,
    },
  });

  await logActivity({
    action: "certification.created",
    entityType: "CertificationAward",
    entityId: record.id,
    description: `Added ${payload.type.toLowerCase()} "${payload.title}"`,
  });

  revalidatePath("/content/certifications");
  redirect(`/content/certifications/${record.id}`);
};

export const updateCertification = async (
  id: string,
  payload: CertificationFormPayload
) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  await database.certificationAward.update({
    where: { id },
    data: {
      title: payload.title,
      issuer: payload.issuer || null,
      type: payload.type,
      dateAwarded: payload.dateAwarded ? new Date(payload.dateAwarded) : null,
      imageUrl: payload.imageUrl || null,
      description: payload.description || null,
      isPublished: payload.isPublished,
    },
  });

  await logActivity({
    action: "certification.updated",
    entityType: "CertificationAward",
    entityId: id,
    description: `Updated "${payload.title}"`,
  });

  revalidatePath("/content/certifications");
  revalidatePath(`/content/certifications/${id}`);
};

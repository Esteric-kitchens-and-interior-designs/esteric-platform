"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

export interface FaqFormPayload {
  answer: string;
  category?: string | null;
  isPublished: boolean;
  question: string;
}

export const createFaq = async (payload: FaqFormPayload) => {
  await requirePermission("content:write");
  if (!(payload.question.trim() && payload.answer.trim())) {
    throw new Error("A question and answer are required");
  }

  const count = await database.fAQ.count();

  const faq = await database.fAQ.create({
    data: {
      question: payload.question,
      answer: payload.answer,
      category: payload.category || null,
      isPublished: payload.isPublished,
      sortOrder: count,
    },
  });

  await logActivity({
    action: "faq.created",
    entityType: "FAQ",
    entityId: faq.id,
    description: `Added FAQ "${payload.question}"`,
  });

  revalidatePath("/content/faqs");
};

export const updateFaq = async (id: string, payload: FaqFormPayload) => {
  await requirePermission("content:write");
  if (!(payload.question.trim() && payload.answer.trim())) {
    throw new Error("A question and answer are required");
  }

  await database.fAQ.update({
    where: { id },
    data: {
      question: payload.question,
      answer: payload.answer,
      category: payload.category || null,
      isPublished: payload.isPublished,
    },
  });

  await logActivity({
    action: "faq.updated",
    entityType: "FAQ",
    entityId: id,
    description: `Updated FAQ "${payload.question}"`,
  });

  revalidatePath("/content/faqs");
};

export const deleteFaq = async (id: string) => {
  await requirePermission("content:write");

  const faq = await database.fAQ.delete({ where: { id } });

  await logActivity({
    action: "faq.deleted",
    entityType: "FAQ",
    entityId: id,
    description: `Deleted FAQ "${faq.question}"`,
  });

  revalidatePath("/content/faqs");
};

"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import {
  type ContentStatus,
  database,
  type EmploymentType,
  type JobApplicationStatus,
} from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "../lib/helpers";

export interface JobPostingFormPayload {
  department?: string | null;
  description: string;
  employmentType: EmploymentType;
  location?: string | null;
  requirements?: string | null;
  slug: string;
  status: ContentStatus;
  title: string;
}

const uniqueSlug = async (base: string, excludeId?: string) => {
  let slug = base || slugify(String(Date.now()));
  let attempt = 0;
  while (
    await database.jobPosting.findFirst({
      where: { slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    })
  ) {
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
  return slug;
};

export const createJobPosting = async (payload: JobPostingFormPayload) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }
  if (!payload.description.trim()) {
    throw new Error("A description is required");
  }

  const slug = await uniqueSlug(slugify(payload.slug || payload.title));

  const posting = await database.jobPosting.create({
    data: {
      title: payload.title,
      slug,
      department: payload.department || null,
      location: payload.location || null,
      employmentType: payload.employmentType,
      description: payload.description,
      requirements: payload.requirements || null,
      status: payload.status,
      postedAt: payload.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logActivity({
    action:
      payload.status === "PUBLISHED"
        ? "job_posting.published"
        : "job_posting.created",
    entityType: "JobPosting",
    entityId: posting.id,
    description: `Created job posting "${payload.title}"`,
  });

  revalidatePath("/content/careers");
  redirect(`/content/careers/${posting.id}`);
};

export const updateJobPosting = async (
  id: string,
  payload: JobPostingFormPayload
) => {
  await requirePermission("content:write");
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const existing = await database.jobPosting.findUniqueOrThrow({
    where: { id },
  });
  const slug = await uniqueSlug(slugify(payload.slug || payload.title), id);
  const isNewlyPublished =
    payload.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  await database.jobPosting.update({
    where: { id },
    data: {
      title: payload.title,
      slug,
      department: payload.department || null,
      location: payload.location || null,
      employmentType: payload.employmentType,
      description: payload.description,
      requirements: payload.requirements || null,
      status: payload.status,
      postedAt: isNewlyPublished ? new Date() : existing.postedAt,
    },
  });

  await logActivity({
    action: isNewlyPublished ? "job_posting.published" : "job_posting.updated",
    entityType: "JobPosting",
    entityId: id,
    description: `Updated job posting "${payload.title}"`,
  });

  revalidatePath("/content/careers");
  revalidatePath(`/content/careers/${id}`);
};

export const deleteJobPosting = async (id: string) => {
  await requirePermission("content:write");

  const [existing, applicationCount] = await Promise.all([
    database.jobPosting.findUniqueOrThrow({ where: { id } }),
    database.jobApplication.count({ where: { jobPostingId: id } }),
  ]);

  if (applicationCount > 0) {
    throw new Error(
      `Can't delete — ${applicationCount} application${applicationCount === 1 ? "" : "s"} reference this posting. Unpublish it instead to remove it from the site.`
    );
  }

  await database.jobPosting.delete({ where: { id } });

  await logActivity({
    action: "job_posting.deleted",
    entityType: "JobPosting",
    entityId: id,
    description: `Deleted job posting "${existing.title}"`,
  });

  revalidatePath("/content/careers");
};

export const updateJobApplicationStatus = async (
  id: string,
  status: JobApplicationStatus
) => {
  await requirePermission("content:write");

  const application = await database.jobApplication.update({
    where: { id },
    data: { status },
    include: { jobPosting: { select: { title: true } } },
  });

  await logActivity({
    action: "job_application.status_changed",
    entityType: "JobApplication",
    entityId: id,
    description: `${application.name}'s application for "${application.jobPosting.title}" set to ${status}`,
  });

  revalidatePath("/content/careers/applications");
};

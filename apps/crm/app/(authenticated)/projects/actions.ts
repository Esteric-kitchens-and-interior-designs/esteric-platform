"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import {
  database,
  type ProjectStatus,
  type ServiceCategory,
} from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateProjectNumber } from "./lib/helpers";

export interface ProjectFormPayload {
  budget?: number | null;
  category: ServiceCategory;
  customerId: string;
  deadline?: string | null;
  description?: string | null;
  location?: string | null;
  quotationId?: string | null;
  startDate?: string | null;
  title: string;
}

const nextProjectNumber = async () => {
  const year = new Date().getFullYear();
  const countThisYear = await database.project.count({
    where: {
      createdAt: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
  });
  return generateProjectNumber(countThisYear, year);
};

export const createProject = async (payload: ProjectFormPayload) => {
  const _user = await requirePermission("projects:write");

  if (!payload.customerId) {
    throw new Error("A customer is required");
  }
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }

  const projectNumber = await nextProjectNumber();

  const project = await database.project.create({
    data: {
      projectNumber,
      customerId: payload.customerId,
      quotationId: payload.quotationId || null,
      title: payload.title,
      category: payload.category,
      budget: payload.budget ?? null,
      startDate: payload.startDate ? new Date(payload.startDate) : null,
      deadline: payload.deadline ? new Date(payload.deadline) : null,
      location: payload.location || null,
      description: payload.description || null,
    },
  });

  await logActivity({
    action: "project.created",
    entityType: "Project",
    entityId: project.id,
    description: `Created project ${projectNumber}: ${payload.title}`,
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
};

export const updateProjectStatus = async (
  id: string,
  status: ProjectStatus
) => {
  await requirePermission("projects:write");

  const project = await database.project.findUniqueOrThrow({ where: { id } });

  await database.project.update({
    where: { id },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : project.completedAt,
    },
  });

  await logActivity({
    action: "project.status_changed",
    entityType: "Project",
    entityId: id,
    description: `Changed project ${project.projectNumber} status from ${project.status} to ${status}`,
    metadata: { from: project.status, to: status },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
};

export const addProjectAssignment = async (
  projectId: string,
  userId: string,
  roleOnProject: string
) => {
  await requirePermission("projects:write");
  if (!roleOnProject.trim()) {
    throw new Error("A role on the project is required");
  }

  await database.projectAssignment.create({
    data: { projectId, userId, roleOnProject },
  });

  const [project, assignedUser] = await Promise.all([
    database.project.findUniqueOrThrow({ where: { id: projectId } }),
    database.user.findUniqueOrThrow({ where: { id: userId } }),
  ]);

  await logActivity({
    action: "project.assignment_added",
    entityType: "Project",
    entityId: projectId,
    description: `Assigned ${assignedUser.firstName} ${assignedUser.lastName} to ${project.projectNumber} as ${roleOnProject}`,
  });

  revalidatePath(`/projects/${projectId}`);
};

export const removeProjectAssignment = async (
  projectId: string,
  assignmentId: string
) => {
  await requirePermission("projects:write");

  await database.projectAssignment.delete({ where: { id: assignmentId } });

  await logActivity({
    action: "project.assignment_removed",
    entityType: "Project",
    entityId: projectId,
    description: "Removed a staff assignment from the project",
  });

  revalidatePath(`/projects/${projectId}`);
};

export const addProjectMilestone = async (
  projectId: string,
  name: string,
  dueDate?: string | null
) => {
  await requirePermission("projects:write");
  if (!name.trim()) {
    throw new Error("A milestone name is required");
  }

  const count = await database.projectMilestone.count({ where: { projectId } });

  await database.projectMilestone.create({
    data: {
      projectId,
      name,
      dueDate: dueDate ? new Date(dueDate) : null,
      sortOrder: count,
    },
  });

  await logActivity({
    action: "project.milestone_added",
    entityType: "Project",
    entityId: projectId,
    description: `Added milestone "${name}"`,
  });

  revalidatePath(`/projects/${projectId}`);
};

export const toggleProjectMilestone = async (
  projectId: string,
  milestoneId: string,
  completed: boolean
) => {
  await requirePermission("projects:write");

  const milestone = await database.projectMilestone.update({
    where: { id: milestoneId },
    data: { completedAt: completed ? new Date() : null },
  });

  await logActivity({
    action: completed
      ? "project.milestone_completed"
      : "project.milestone_reopened",
    entityType: "Project",
    entityId: projectId,
    description: `${completed ? "Completed" : "Reopened"} milestone "${milestone.name}"`,
  });

  revalidatePath(`/projects/${projectId}`);
};

export const addProjectUpdate = async (
  projectId: string,
  note: string,
  completionPercentage?: number | null,
  imageUrls?: string[]
) => {
  const user = await requirePermission("projects:write");
  if (!note.trim()) {
    throw new Error("A note is required");
  }

  await database.projectUpdate.create({
    data: {
      projectId,
      authorId: user.id,
      note,
      completionPercentage: completionPercentage ?? null,
      imageUrls: imageUrls ?? [],
    },
  });

  if (
    completionPercentage !== null &&
    completionPercentage !== undefined &&
    !Number.isNaN(completionPercentage)
  ) {
    await database.project.update({
      where: { id: projectId },
      data: {
        completionPercentage: Math.max(0, Math.min(100, completionPercentage)),
      },
    });
  }

  await logActivity({
    action: "project.progress_updated",
    entityType: "Project",
    entityId: projectId,
    description:
      completionPercentage !== null && completionPercentage !== undefined
        ? `Posted a progress update (${completionPercentage}% complete)`
        : "Posted a progress update",
  });

  revalidatePath(`/projects/${projectId}`);
};

export const addProjectNote = async (projectId: string, body: string) => {
  const user = await requirePermission("projects:write");
  if (!body.trim()) {
    throw new Error("Note body is required");
  }

  await database.projectNote.create({
    data: { projectId, authorId: user.id, body },
  });

  await logActivity({
    action: "project.note_added",
    entityType: "Project",
    entityId: projectId,
    description: "Added an internal note",
  });

  revalidatePath(`/projects/${projectId}`);
};

export const addProjectDocument = async (
  projectId: string,
  name: string,
  url: string,
  mimeType: string,
  sizeBytes: number
) => {
  const user = await requirePermission("projects:write");
  if (!(name.trim() && url.trim())) {
    throw new Error("A document name and file are required");
  }

  await database.document.create({
    data: { projectId, name, url, mimeType, sizeBytes, uploadedById: user.id },
  });

  await logActivity({
    action: "project.document_uploaded",
    entityType: "Project",
    entityId: projectId,
    description: `Uploaded document "${name}"`,
  });

  revalidatePath(`/projects/${projectId}`);
};

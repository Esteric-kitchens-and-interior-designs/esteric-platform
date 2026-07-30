"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import type {
  LeadSource,
  LeadStatus,
  Priority,
  ServiceCategory,
} from "@repo/database";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

const asOptionalString = (value: FormDataEntryValue | null) => {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : undefined;
};

export const createLead = async (formData: FormData) => {
  await requirePermission("leads:write");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!(name && email)) {
    throw new Error("Name and email are required.");
  }

  const lead = await database.lead.create({
    data: {
      name,
      email,
      phone: asOptionalString(formData.get("phone")),
      source:
        (asOptionalString(formData.get("source")) as LeadSource) ?? "WEBSITE",
      serviceCategory: asOptionalString(formData.get("serviceCategory")) as
        | ServiceCategory
        | undefined,
      budgetRange: asOptionalString(formData.get("budgetRange")),
      message: asOptionalString(formData.get("message")),
      assignedToId: asOptionalString(formData.get("assignedToId")),
    },
  });

  await logActivity({
    action: "lead.created",
    entityType: "Lead",
    entityId: lead.id,
    description: `Created lead "${lead.name}"`,
  });

  revalidatePath("/leads");
  revalidatePath("/");
};

export const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
  await requirePermission("leads:write");

  const lead = await database.lead.update({
    where: { id: leadId },
    data: { status },
  });

  await logActivity({
    action: "lead.status_changed",
    entityType: "Lead",
    entityId: lead.id,
    description: `Changed status of "${lead.name}" to ${status}`,
    metadata: { status },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
};

export const updateLeadPriority = async (
  leadId: string,
  priority: Priority
) => {
  await requirePermission("leads:write");

  const lead = await database.lead.update({
    where: { id: leadId },
    data: { priority },
  });

  await logActivity({
    action: "lead.priority_changed",
    entityType: "Lead",
    entityId: lead.id,
    description: `Changed priority of "${lead.name}" to ${priority}`,
    metadata: { priority },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
};

export const assignLead = async (
  leadId: string,
  assignedToId: string | null
) => {
  await requirePermission("leads:write");

  const lead = await database.lead.update({
    where: { id: leadId },
    data: { assignedToId },
    include: { assignedTo: true },
  });

  await logActivity({
    action: "lead.assigned",
    entityType: "Lead",
    entityId: lead.id,
    description: lead.assignedTo
      ? `Assigned "${lead.name}" to ${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
      : `Unassigned "${lead.name}"`,
    metadata: { assignedToId },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
};

export const addLeadNote = async (leadId: string, formData: FormData) => {
  const user = await requirePermission("leads:write");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    throw new Error("Note body is required.");
  }

  await database.leadNote.create({
    data: { leadId, authorId: user.id, body },
  });

  await logActivity({
    action: "lead.note_added",
    entityType: "Lead",
    entityId: leadId,
    description: "Added a note",
  });

  revalidatePath(`/leads/${leadId}`);
};

export const addLeadFollowUp = async (leadId: string, formData: FormData) => {
  const user = await requirePermission("leads:write");

  const note = String(formData.get("note") ?? "").trim();
  const dueAtRaw = String(formData.get("dueAt") ?? "");
  const assignedToId =
    asOptionalString(formData.get("assignedToId")) ?? user.id;

  if (!(note && dueAtRaw)) {
    throw new Error("Reminder note and due date are required.");
  }

  await database.followUp.create({
    data: {
      leadId,
      note,
      dueAt: new Date(dueAtRaw),
      assignedToId,
      createdById: user.id,
    },
  });

  await logActivity({
    action: "lead.followup_added",
    entityType: "Lead",
    entityId: leadId,
    description: `Added a follow-up reminder due ${dueAtRaw}`,
  });

  revalidatePath(`/leads/${leadId}`);
};

export const completeLeadFollowUp = async (
  leadId: string,
  followUpId: string
) => {
  await requirePermission("leads:write");

  await database.followUp.update({
    where: { id: followUpId },
    data: { completedAt: new Date() },
  });

  await logActivity({
    action: "followup.completed",
    entityType: "FollowUp",
    entityId: followUpId,
    description: "Marked follow-up as complete",
  });

  revalidatePath(`/leads/${leadId}`);
};

/**
 * Creates a Customer from the lead's details and links it back via
 * Lead.convertedCustomerId. Returns the new customer id rather than
 * redirecting — the client component navigates so it can distinguish a
 * real failure from Next's redirect-signal throw.
 */
export const convertLeadToCustomer = async (leadId: string) => {
  await requirePermission("leads:write");

  const lead = await database.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw new Error("Lead not found.");
  }
  if (lead.convertedCustomerId) {
    return { customerId: lead.convertedCustomerId };
  }

  const customer = await database.customer.create({
    data: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    },
  });

  await database.lead.update({
    where: { id: lead.id },
    data: { convertedCustomerId: customer.id, status: "WON" },
  });

  await logActivity({
    action: "lead.converted",
    entityType: "Lead",
    entityId: lead.id,
    description: `Converted lead "${lead.name}" to customer`,
    metadata: { customerId: customer.id },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/customers");

  return { customerId: customer.id };
};

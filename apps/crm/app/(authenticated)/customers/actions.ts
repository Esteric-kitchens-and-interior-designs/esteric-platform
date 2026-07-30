"use server";

import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import type {
  CommunicationChannel,
  CommunicationDirection,
} from "@repo/database";
import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

const asOptionalString = (value: FormDataEntryValue | null) => {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : undefined;
};

export const createCustomer = async (formData: FormData) => {
  await requirePermission("customers:write");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!(name && email)) {
    throw new Error("Name and email are required.");
  }

  const customer = await database.customer.create({
    data: {
      name,
      email,
      phone: asOptionalString(formData.get("phone")),
      company: asOptionalString(formData.get("company")),
      addressLine1: asOptionalString(formData.get("addressLine1")),
      addressLine2: asOptionalString(formData.get("addressLine2")),
      city: asOptionalString(formData.get("city")),
      region: asOptionalString(formData.get("region")),
      postalCode: asOptionalString(formData.get("postalCode")),
      country: asOptionalString(formData.get("country")),
    },
  });

  await logActivity({
    action: "customer.created",
    entityType: "Customer",
    entityId: customer.id,
    description: `Created customer "${customer.name}"`,
  });

  revalidatePath("/customers");
};

export const addCustomerNote = async (
  customerId: string,
  formData: FormData
) => {
  const user = await requirePermission("customers:write");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    throw new Error("Note body is required.");
  }

  await database.customerNote.create({
    data: { customerId, authorId: user.id, body },
  });

  await logActivity({
    action: "customer.note_added",
    entityType: "Customer",
    entityId: customerId,
    description: "Added a note",
  });

  revalidatePath(`/customers/${customerId}`);
};

export const addCommunication = async (
  customerId: string,
  formData: FormData
) => {
  const user = await requirePermission("customers:write");

  const channel = String(formData.get("channel") ?? "") as CommunicationChannel;
  const direction = String(
    formData.get("direction") ?? ""
  ) as CommunicationDirection;
  const subject = asOptionalString(formData.get("subject"));
  const body = asOptionalString(formData.get("body"));
  const occurredAtRaw = String(formData.get("occurredAt") ?? "");

  if (!(channel && direction)) {
    throw new Error("Channel and direction are required.");
  }

  await database.communication.create({
    data: {
      customerId,
      staffId: user.id,
      channel,
      direction,
      subject,
      body,
      occurredAt: occurredAtRaw ? new Date(occurredAtRaw) : new Date(),
    },
  });

  await logActivity({
    action: "customer.communication_logged",
    entityType: "Customer",
    entityId: customerId,
    description: `Logged a ${direction.toLowerCase()} ${channel.toLowerCase()} communication`,
  });

  revalidatePath(`/customers/${customerId}`);
};

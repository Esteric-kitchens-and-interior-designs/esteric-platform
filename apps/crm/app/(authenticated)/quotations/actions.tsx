"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { logActivity } from "@repo/auth/activity-log";
import { requirePermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { resend } from "@repo/email";
import { QuotationSentTemplate } from "@repo/email/templates/quotation-sent";
import { put } from "@repo/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { computeQuotationTotals, generateQuoteNumber } from "./lib/helpers";
import { type QuotationPdfData, QuotationPdfDocument } from "./lib/pdf";

export interface QuotationItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationFormPayload {
  currency: string;
  customerId: string;
  discountAmount: number;
  items: QuotationItemPayload[];
  leadId?: string | null;
  taxRate: number;
  termsAndConditions?: string | null;
  title: string;
  validUntil?: string | null;
}

const nextQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const countThisYear = await database.quotation.count({
    where: {
      createdAt: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
  });
  return generateQuoteNumber(countThisYear, year);
};

const validatePayload = (payload: QuotationFormPayload) => {
  if (!payload.customerId) {
    throw new Error("A customer is required");
  }
  if (!payload.title.trim()) {
    throw new Error("A title is required");
  }
  if (payload.items.length === 0) {
    throw new Error("Add at least one line item");
  }
  for (const item of payload.items) {
    if (!item.description.trim()) {
      throw new Error("Every line item needs a description");
    }
    if (item.quantity <= 0 || item.unitPrice < 0) {
      throw new Error("Line item quantity/price must be valid numbers");
    }
  }
};

export const createQuotation = async (payload: QuotationFormPayload) => {
  const user = await requirePermission("quotations:write");
  validatePayload(payload);

  const totals = computeQuotationTotals(
    payload.items,
    payload.taxRate,
    payload.discountAmount
  );
  const quoteNumber = await nextQuoteNumber();

  const quotation = await database.quotation.create({
    data: {
      quoteNumber,
      customerId: payload.customerId,
      leadId: payload.leadId || null,
      title: payload.title,
      status: "DRAFT",
      subtotal: totals.subtotal,
      taxRate: payload.taxRate,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      currency: payload.currency || "KES",
      validUntil: payload.validUntil ? new Date(payload.validUntil) : null,
      termsAndConditions: payload.termsAndConditions || null,
      createdById: user.id,
      items: {
        create: payload.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: Math.round(item.quantity * item.unitPrice * 100) / 100,
          sortOrder: index,
        })),
      },
    },
  });

  await logActivity({
    action: "quotation.created",
    entityType: "Quotation",
    entityId: quotation.id,
    description: `Created quotation ${quoteNumber}`,
  });

  revalidatePath("/quotations");
  redirect(`/quotations/${quotation.id}`);
};

export const updateQuotation = async (
  id: string,
  payload: QuotationFormPayload
) => {
  await requirePermission("quotations:write");
  validatePayload(payload);

  const existing = await database.quotation.findUniqueOrThrow({
    where: { id },
  });
  if (existing.status !== "DRAFT") {
    throw new Error("Only draft quotations can be edited");
  }

  const totals = computeQuotationTotals(
    payload.items,
    payload.taxRate,
    payload.discountAmount
  );

  await database.quotation.update({
    where: { id },
    data: {
      customerId: payload.customerId,
      leadId: payload.leadId || null,
      title: payload.title,
      subtotal: totals.subtotal,
      taxRate: payload.taxRate,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      currency: payload.currency || "KES",
      validUntil: payload.validUntil ? new Date(payload.validUntil) : null,
      termsAndConditions: payload.termsAndConditions || null,
      items: {
        deleteMany: {},
        create: payload.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: Math.round(item.quantity * item.unitPrice * 100) / 100,
          sortOrder: index,
        })),
      },
    },
  });

  await logActivity({
    action: "quotation.updated",
    entityType: "Quotation",
    entityId: id,
    description: `Updated quotation ${existing.quoteNumber}`,
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
  redirect(`/quotations/${id}`);
};

export const sendQuotation = async (id: string) => {
  await requirePermission("quotations:write");

  const quotation = await database.quotation.findUniqueOrThrow({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      customer: true,
    },
  });

  if (quotation.status !== "DRAFT") {
    throw new Error("Only draft quotations can be sent to the customer");
  }

  const pdfData: QuotationPdfData = {
    quoteNumber: quotation.quoteNumber,
    title: quotation.title,
    status: quotation.status,
    currency: quotation.currency,
    customerName: quotation.customer.name,
    customerEmail: quotation.customer.email,
    customerAddress: [quotation.customer.addressLine1, quotation.customer.city]
      .filter(Boolean)
      .join(", "),
    createdAt: quotation.createdAt.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    validUntil: quotation.validUntil
      ? quotation.validUntil.toLocaleDateString("en-KE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null,
    items: quotation.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    })),
    subtotal: Number(quotation.subtotal),
    taxRate: Number(quotation.taxRate),
    taxAmount: Number(quotation.taxAmount),
    discountAmount: Number(quotation.discountAmount),
    total: Number(quotation.total),
    termsAndConditions: quotation.termsAndConditions,
  };

  const pdfBuffer = await renderToBuffer(
    <QuotationPdfDocument data={pdfData} />
  );

  const blob = await put(`quotations/${quotation.quoteNumber}.pdf`, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: true,
  });

  await database.quotation.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), pdfUrl: blob.url },
  });

  if (resend && env.RESEND_FROM) {
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: quotation.customer.email,
      subject: `Your quotation ${quotation.quoteNumber} from Esteric Kitchens & Interior Designs`,
      react: (
        <QuotationSentTemplate
          currency={quotation.currency}
          customerName={quotation.customer.name}
          pdfUrl={blob.url}
          quoteNumber={quotation.quoteNumber}
          title={quotation.title}
          total={Number(quotation.total).toLocaleString("en-KE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          validUntil={pdfData.validUntil ?? undefined}
        />
      ),
    });
  }

  await logActivity({
    action: "quotation.sent",
    entityType: "Quotation",
    entityId: id,
    description: `Sent quotation ${quotation.quoteNumber} to ${quotation.customer.email}`,
    metadata: { pdfUrl: blob.url },
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
};

export const approveQuotation = async (id: string) => {
  await requirePermission("quotations:approve");

  const quotation = await database.quotation.findUniqueOrThrow({
    where: { id },
  });
  if (!["SENT", "VIEWED"].includes(quotation.status)) {
    throw new Error("Only sent or viewed quotations can be approved");
  }

  await database.quotation.update({
    where: { id },
    data: { status: "APPROVED", respondedAt: new Date() },
  });

  await logActivity({
    action: "quotation.approved",
    entityType: "Quotation",
    entityId: id,
    description: `Approved quotation ${quotation.quoteNumber}`,
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
};

export const rejectQuotation = async (id: string, rejectionReason: string) => {
  await requirePermission("quotations:approve");

  const quotation = await database.quotation.findUniqueOrThrow({
    where: { id },
  });
  if (!["SENT", "VIEWED"].includes(quotation.status)) {
    throw new Error("Only sent or viewed quotations can be rejected");
  }
  if (!rejectionReason.trim()) {
    throw new Error("A rejection reason is required");
  }

  await database.quotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      respondedAt: new Date(),
      rejectionReason,
    },
  });

  await logActivity({
    action: "quotation.rejected",
    entityType: "Quotation",
    entityId: id,
    description: `Rejected quotation ${quotation.quoteNumber}: ${rejectionReason}`,
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${id}`);
};

export const createQuotationRevision = async (id: string) => {
  const user = await requirePermission("quotations:write");

  const original = await database.quotation.findUniqueOrThrow({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const quoteNumber = await nextQuoteNumber();

  const revision = await database.quotation.create({
    data: {
      quoteNumber,
      customerId: original.customerId,
      leadId: original.leadId,
      title: original.title,
      status: "DRAFT",
      subtotal: original.subtotal,
      taxRate: original.taxRate,
      taxAmount: original.taxAmount,
      discountAmount: original.discountAmount,
      total: original.total,
      currency: original.currency,
      validUntil: original.validUntil,
      termsAndConditions: original.termsAndConditions,
      version: original.version + 1,
      parentQuotationId: original.id,
      createdById: user.id,
      items: {
        create: original.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          sortOrder: index,
        })),
      },
    },
  });

  await database.quotation.update({
    where: { id: original.id },
    data: { status: "REVISED" },
  });

  await logActivity({
    action: "quotation.revised",
    entityType: "Quotation",
    entityId: revision.id,
    description: `Created revision v${revision.version} of ${original.quoteNumber} as ${revision.quoteNumber}`,
    metadata: { parentQuotationId: original.id },
  });

  revalidatePath("/quotations");
  revalidatePath(`/quotations/${original.id}`);
  redirect(`/quotations/${revision.id}`);
};

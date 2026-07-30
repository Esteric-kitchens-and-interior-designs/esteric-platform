import type { QuotationStatus } from "@repo/database";

export const formatMoney = (
  value: number | string | { toString(): string },
  currency = "KES"
) => {
  const numeric = typeof value === "number" ? value : Number(value.toString());
  return `${currency} ${numeric.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const quotationStatusLabel: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  REVISED: "Revised",
};

export const quotationStatusVariant: Record<
  QuotationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  VIEWED: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  EXPIRED: "destructive",
  REVISED: "outline",
};

export interface QuotationItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationTotals {
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

/**
 * Single source of truth for quotation math — used both for the client-side
 * live preview and recomputed server-side on save so we never trust the
 * client's numbers for what actually gets persisted.
 */
export const computeQuotationTotals = (
  items: QuotationItemInput[],
  taxRate: number,
  discountAmount: number
): QuotationTotals => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discountAmount);

  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    discountAmount: round2(discountAmount),
    total: round2(total),
  };
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Simple sequential-ish quote number, e.g. Q-2026-0001. Not gap-free or
 * transaction-safe, which is acceptable at this scale per the product spec. */
export const generateQuoteNumber = (yearCount: number, year: number) =>
  `Q-${year}-${String(yearCount + 1).padStart(4, "0")}`;

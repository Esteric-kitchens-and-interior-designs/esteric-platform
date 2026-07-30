import type { ProjectStatus, ServiceCategory } from "@repo/database";

export const formatMoney = (
  value: number | string | { toString(): string } | null | undefined,
  currency = "KES"
) => {
  if (value === null || value === undefined) {
    return "-";
  }
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

export const projectStatusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const projectStatusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PLANNING: "outline",
  IN_PROGRESS: "secondary",
  ON_HOLD: "outline",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export const serviceCategoryLabel: Record<ServiceCategory, string> = {
  KITCHEN: "Kitchen",
  INTERIOR: "Interior",
  LANDSCAPING: "Landscaping",
  WARDROBES_CABINETS: "Wardrobes & Cabinets",
  OTHER: "Other",
};

/** Simple sequential-ish project number, e.g. P-2026-0001. */
export const generateProjectNumber = (yearCount: number, year: number) =>
  `P-${year}-${String(yearCount + 1).padStart(4, "0")}`;

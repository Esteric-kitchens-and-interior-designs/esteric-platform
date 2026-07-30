import type { ContentStatus, ServiceCategory } from "@repo/database";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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

export const contentStatusVariant: Record<
  ContentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  PUBLISHED: "default",
};

export const serviceCategoryLabel: Record<ServiceCategory, string> = {
  KITCHEN: "Kitchen",
  INTERIOR: "Interior",
  LANDSCAPING: "Landscaping",
  WARDROBES_CABINETS: "Wardrobes & Cabinets",
  OTHER: "Other",
};

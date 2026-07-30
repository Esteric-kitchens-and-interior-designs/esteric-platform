import type {
  BookingStatus,
  LeadStatus,
  Priority,
  ProjectStatus,
  QuotationStatus,
  UserStatus,
} from "@repo/database";
import { cn } from "@repo/design-system/lib/utils";

// Color-coded badge classes for the CRM's various status/priority enums.
// Tailwind's raw color scale (rather than the brand semantic tokens) is used
// here deliberately — these are internal state indicators (warning/success/
// danger), not brand treatments, and there's no seeded "warning" token.
const tone = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  blue: "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-900/40 dark:text-blue-300",
  amber:
    "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-900/40 dark:text-amber-300",
  green:
    "bg-emerald-100 text-emerald-800 border-transparent dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-red-100 text-red-800 border-transparent dark:bg-red-900/40 dark:text-red-300",
  purple:
    "bg-purple-100 text-purple-800 border-transparent dark:bg-purple-900/40 dark:text-purple-300",
  slate:
    "bg-slate-200 text-slate-800 border-transparent dark:bg-slate-800 dark:text-slate-300",
} as const;

export const leadStatusTone: Record<LeadStatus, keyof typeof tone> = {
  NEW: "blue",
  CONTACTED: "amber",
  QUALIFIED: "purple",
  QUOTE_SENT: "amber",
  WON: "green",
  LOST: "red",
};

export const priorityTone: Record<Priority, keyof typeof tone> = {
  LOW: "neutral",
  MEDIUM: "amber",
  HIGH: "red",
};

export const quotationStatusTone: Record<QuotationStatus, keyof typeof tone> = {
  DRAFT: "neutral",
  SENT: "blue",
  VIEWED: "amber",
  APPROVED: "green",
  REJECTED: "red",
  EXPIRED: "slate",
  REVISED: "purple",
};

export const projectStatusTone: Record<ProjectStatus, keyof typeof tone> = {
  PLANNING: "neutral",
  IN_PROGRESS: "blue",
  ON_HOLD: "amber",
  COMPLETED: "green",
  CANCELLED: "red",
};

export const bookingStatusTone: Record<BookingStatus, keyof typeof tone> = {
  PENDING: "amber",
  CONFIRMED: "green",
  RESCHEDULED: "blue",
  CANCELLED: "red",
  COMPLETED: "slate",
};

export const userStatusTone: Record<UserStatus, keyof typeof tone> = {
  ACTIVE: "green",
  INACTIVE: "slate",
};

export const toneClass = (t: keyof typeof tone, className?: string) =>
  cn(tone[t], className);

import { ServiceCategory } from "@repo/database/generated/enums";
import { z } from "zod";

const serviceCategoryValues = Object.values(ServiceCategory) as [
  ServiceCategory,
  ...ServiceCategory[],
];

const optionalServiceCategory = z
  .union([z.enum(serviceCategoryValues), z.literal("")])
  .optional()
  .transform((value) => (value ? value : undefined));

const name = z.string().trim().min(2, "Please enter your full name.").max(120);
const email = z.string().trim().email("Please enter a valid email address.");
const phone = z
  .string()
  .trim()
  .max(30)
  .optional()
  .transform((value) => (value ? value : undefined));

export const contactSchema = z.object({
  name,
  email,
  phone,
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more about your project.")
    .max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const quoteSchema = z.object({
  name,
  email,
  phone,
  serviceCategory: optionalServiceCategory,
  budgetRange: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((value) => (value ? value : undefined)),
  message: z.string().trim().min(10, "Please describe your project.").max(4000),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const appointmentSchema = z.object({
  name,
  email,
  phone,
  serviceCategory: optionalServiceCategory,
  requestedDate: z.string().trim().min(1, "Please choose a preferred date."),
  requestedSlot: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((value) => (value ? value : undefined)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const newsletterSchema = z.object({
  email,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

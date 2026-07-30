"use server";

import { database } from "@repo/database";
import { resend } from "@repo/email";
import { ContactTemplate } from "@repo/email/templates/contact";
import { parseError } from "@repo/observability/error";
import { env } from "@/env";
import type { FormState } from "@/lib/form-state";
import { protectFormSubmission } from "@/lib/protect-form";
import { contactSchema } from "@/lib/validation";

export const submitContactForm = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    await protectFormSubmission("contact_form");

    const parsed = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      };
    }

    const { name, email, phone, message } = parsed.data;

    // This *is* the CRM intake — no separate submissions inbox, staff work
    // this lead directly from the Leads module.
    await database.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        source: "CONTACT_FORM",
      },
    });

    // Best-effort staff notification email — the lead is already saved
    // above regardless of whether this succeeds.
    if (resend && env.RESEND_FROM) {
      try {
        await resend.emails.send({
          from: env.RESEND_FROM,
          to: env.RESEND_FROM,
          subject: `New contact form submission from ${name}`,
          replyTo: email,
          react: (
            <ContactTemplate email={email} message={message} name={name} />
          ),
        });
      } catch {
        // Non-fatal — the Lead row is the source of truth.
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: parseError(error) };
  }
};

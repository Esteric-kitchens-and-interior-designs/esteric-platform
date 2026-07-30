"use server";

import { database } from "@repo/database";
import { parseError } from "@repo/observability/error";
import type { FormState } from "@/lib/form-state";
import { protectFormSubmission } from "@/lib/protect-form";
import { quoteSchema } from "@/lib/validation";

export const submitQuoteRequest = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    await protectFormSubmission("quote_form");

    const parsed = quoteSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceCategory: formData.get("serviceCategory"),
      budgetRange: formData.get("budgetRange"),
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

    const { name, email, phone, serviceCategory, budgetRange, message } =
      parsed.data;

    await database.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        serviceCategory,
        budgetRange,
        source: "QUOTE_FORM",
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: parseError(error) };
  }
};

"use server";

import { database } from "@repo/database";
import { parseError } from "@repo/observability/error";
import type { FormState } from "@/lib/form-state";
import { protectFormSubmission } from "@/lib/protect-form";
import { appointmentSchema } from "@/lib/validation";

export const submitAppointmentRequest = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    await protectFormSubmission("appointment_form");

    const parsed = appointmentSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceCategory: formData.get("serviceCategory"),
      requestedDate: formData.get("requestedDate"),
      requestedSlot: formData.get("requestedSlot"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      };
    }

    const {
      name,
      email,
      phone,
      serviceCategory,
      requestedDate,
      requestedSlot,
      notes,
    } = parsed.data;

    const parsedDate = new Date(requestedDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return { success: false, error: "Please choose a valid date." };
    }

    // Also raised as a Lead (source: APPOINTMENT_FORM) so it surfaces in
    // the same CRM pipeline as every other inbound enquiry, linked to the
    // booking record for context.
    const lead = await database.lead.create({
      data: {
        name,
        email,
        phone,
        serviceCategory,
        message: notes,
        source: "APPOINTMENT_FORM",
      },
    });

    await database.appointmentBooking.create({
      data: {
        name,
        email,
        phone,
        serviceCategory,
        requestedDate: parsedDate,
        requestedSlot,
        notes,
        leadId: lead.id,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: parseError(error) };
  }
};

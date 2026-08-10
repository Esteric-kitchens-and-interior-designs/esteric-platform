"use server";

import { database } from "@repo/database";
import { parseError } from "@repo/observability/error";
import type { FormState } from "@/lib/form-state";
import { protectFormSubmission } from "@/lib/protect-form";
import { jobApplicationSchema } from "@/lib/validation";

export const submitJobApplication = async (
  _prevState: FormState,
  formData: FormData
): Promise<FormState> => {
  try {
    await protectFormSubmission("careers_application");

    const parsed = jobApplicationSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      jobPostingId: formData.get("jobPostingId"),
      coverMessage: formData.get("coverMessage"),
      resumeUrl: formData.get("resumeUrl"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      };
    }

    const { name, email, phone, jobPostingId, coverMessage, resumeUrl } =
      parsed.data;

    const posting = await database.jobPosting.findFirst({
      where: { id: jobPostingId, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!posting) {
      return { success: false, error: "This position is no longer open." };
    }

    await database.jobApplication.create({
      data: {
        jobPostingId: posting.id,
        name,
        email,
        phone,
        coverMessage,
        resumeUrl,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: parseError(error) };
  }
};

import { type HandleUploadBody, handleUpload } from "@repo/storage/client";
import { NextResponse } from "next/server";
import { protectFormSubmission } from "@/lib/protect-form";

// Client-upload token endpoint for the public Careers application form.
// Unlike the CRM's version, there is no signed-in user to gate on, so we
// lean on the same bot/rate-limit protection every other public form uses.
export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    await protectFormSubmission("careers_resume_upload");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Blocked" },
      { status: 429 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ pathname }),
      }),
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
};

import { getCurrentStaffUser } from "@repo/auth/rbac";
import { type HandleUploadBody, handleUpload } from "@repo/storage/client";
import { NextResponse } from "next/server";

// Shared client-upload token endpoint used by the content management and
// project document uploaders (packages/storage, backed by Vercel Blob).
// Any signed-in, active staff member may request an upload token — the
// actual mutation (writing the resulting URL onto a Prisma row) still goes
// through a permission-gated server action, so this only bounds *who can
// reach the blob store at all*, not what they can do with the URL.
export const POST = async (request: Request): Promise<NextResponse> => {
  const staffUser = await getCurrentStaffUser();

  if (!staffUser || staffUser.status === "INACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/avif",
          "image/gif",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({
          userId: staffUser.id,
          pathname,
        }),
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

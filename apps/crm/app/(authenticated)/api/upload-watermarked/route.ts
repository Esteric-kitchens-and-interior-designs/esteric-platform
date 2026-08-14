import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentStaffUser } from "@repo/auth/rbac";
import { put } from "@repo/storage";
import { applyWatermark } from "@repo/storage/watermark";
import { NextResponse } from "next/server";

// Server-relay upload endpoint for public-facing photography (portfolio,
// blog covers, certifications, testimonials). Unlike /api/upload (which
// hands the browser a token to write straight to Blob), this route receives
// the raw file, watermarks it server-side, and only ever stores the
// watermarked result — there is no unwatermarked copy left anywhere for a
// download/share to expose.
const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export const POST = async (request: Request): Promise<NextResponse> => {
  const staffUser = await getCurrentStaffUser();

  if (!staffUser || staffUser.status === "INACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File) || typeof folder !== "string" || !folder) {
    return NextResponse.json(
      { error: "Missing file or folder" },
      { status: 400 }
    );
  }

  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image type" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  try {
    const [imageBuffer, watermarkBuffer] = await Promise.all([
      file.arrayBuffer().then((buf) => Buffer.from(buf)),
      readFile(path.join(process.cwd(), "public/images/logo/esteric-mark.png")),
    ]);

    const watermarked = await applyWatermark(imageBuffer, watermarkBuffer);

    const blob = await put(
      `${folder}/${Date.now()}-watermarked.jpg`,
      watermarked,
      {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: true,
      }
    );

    return NextResponse.json({
      url: blob.url,
      name: file.name,
      mimeType: "image/jpeg",
      sizeBytes: watermarked.byteLength,
    });
  } catch (error) {
    // Anything caught here is an unexpected server-side failure (image
    // processing or the Blob upload itself), not a validation rejection —
    // those are handled above and already return a specific message. Log
    // the real error for diagnosis but keep the client-facing message
    // generic rather than leaking internals like a native module trace.
    console.error("upload-watermarked failed:", error);
    return NextResponse.json(
      {
        error:
          "Failed to process this image. Try a different photo, or contact support if this keeps happening.",
      },
      { status: 500 }
    );
  }
};

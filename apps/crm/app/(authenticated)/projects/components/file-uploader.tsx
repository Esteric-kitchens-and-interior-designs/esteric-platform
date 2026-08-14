"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { upload } from "@repo/storage/client";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export interface UploadedFile {
  mimeType: string;
  name: string;
  sizeBytes: number;
  url: string;
}

interface FileUploaderProps {
  accept?: string;
  folder: string;
  label?: string;
  onUploaded: (file: UploadedFile) => void;
  /**
   * Route the upload through the server-side watermarking pipeline instead
   * of uploading straight to Blob. Use this for public-facing photography
   * (portfolio, blog covers, certifications, testimonials) — never for
   * documents or files that shouldn't be recompressed/watermarked.
   */
  watermark?: boolean;
}

export const FileUploader = ({
  folder,
  accept,
  label = "Upload file",
  onUploaded,
  watermark,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadWatermarked = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);

    const response = await fetch("/api/upload-watermarked", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Upload failed");
    }

    return result as UploadedFile;
  };

  const uploadDirect = async (file: File): Promise<UploadedFile> => {
    const blob = await upload(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    return {
      url: blob.url,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    };
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = watermark
        ? await uploadWatermarked(file)
        : await uploadDirect(file);
      onUploaded(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        accept={accept}
        className="hidden"
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      <Button
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        size="sm"
        type="button"
        variant="outline"
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        {isUploading ? "Uploading…" : label}
      </Button>
      {error ? <span className="text-destructive text-xs">{error}</span> : null}
    </div>
  );
};

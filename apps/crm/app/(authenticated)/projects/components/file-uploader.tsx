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
}

export const FileUploader = ({
  folder,
  accept,
  label = "Upload file",
  onUploaded,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      const blob = await upload(`${folder}/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      onUploaded({
        url: blob.url,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
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

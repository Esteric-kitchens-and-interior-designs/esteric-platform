"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { addProjectDocument } from "../../actions";
import {
  FileUploader,
  type UploadedFile,
} from "../../components/file-uploader";
import { formatDate } from "../../lib/helpers";

interface ProjectDocument {
  createdAt: Date;
  id: string;
  mimeType: string;
  name: string;
  sizeBytes: number;
  uploadedBy: { firstName: string; lastName: string };
  url: string;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsSection = ({
  projectId,
  documents,
}: {
  projectId: string;
  documents: ProjectDocument[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUploaded = (file: UploadedFile) => {
    startTransition(async () => {
      try {
        await addProjectDocument(
          projectId,
          file.name,
          file.url,
          file.mimeType,
          file.sizeBytes
        );
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save document"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No documents uploaded yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                className="flex items-center justify-between gap-2 rounded border p-2 text-sm"
                key={doc.id}
              >
                <a
                  className="flex items-center gap-2 hover:underline"
                  href={doc.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  {doc.name}
                </a>
                <span className="text-muted-foreground text-xs">
                  {formatBytes(doc.sizeBytes)} · {formatDate(doc.createdAt)} ·{" "}
                  {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                </span>
              </li>
            ))}
          </ul>
        )}
        <FileUploader
          folder="documents"
          label={isPending ? "Saving…" : "Upload document"}
          onUploaded={handleUploaded}
        />
      </CardContent>
    </Card>
  );
};

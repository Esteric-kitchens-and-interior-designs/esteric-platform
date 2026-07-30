"use client";

import type { PortfolioImageType } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  FileUploader,
  type UploadedFile,
} from "../../../projects/components/file-uploader";
import { addPortfolioImage, removePortfolioImage } from "../actions";

interface PortfolioImage {
  altText: string | null;
  caption: string | null;
  id: string;
  type: PortfolioImageType;
  url: string;
}

const imageTypes: PortfolioImageType[] = [
  "COVER",
  "BEFORE",
  "AFTER",
  "PROGRESS",
  "GALLERY",
];

export const ImageManager = ({
  portfolioProjectId,
  images,
}: {
  portfolioProjectId: string;
  images: PortfolioImage[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingUpload, setPendingUpload] = useState<UploadedFile | null>(null);
  const [type, setType] = useState<PortfolioImageType>("GALLERY");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");

  const handleUploaded = (file: UploadedFile) => {
    setPendingUpload(file);
  };

  const handleSave = () => {
    if (!pendingUpload) {
      return;
    }
    startTransition(async () => {
      try {
        await addPortfolioImage(
          portfolioProjectId,
          pendingUpload.url,
          type,
          caption || null,
          altText || null
        );
        setPendingUpload(null);
        setCaption("");
        setAltText("");
        setType("GALLERY");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save image"
        );
      }
    });
  };

  const handleRemove = (imageId: string) => {
    startTransition(async () => {
      try {
        await removePortfolioImage(portfolioProjectId, imageId);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove image"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length === 0 ? (
          <p className="text-muted-foreground text-sm">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <figure
                className="group relative overflow-hidden rounded-lg border"
                key={image.id}
              >
                {/* biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URLs, no next/image domain config needed */}
                <img
                  alt={image.altText ?? image.caption ?? "Portfolio image"}
                  className="h-32 w-full object-cover"
                  height={128}
                  src={image.url}
                  width={400}
                />
                <figcaption className="flex items-center justify-between gap-1 bg-muted/50 px-2 py-1 text-[10px]">
                  <span>{image.type}</span>
                  <Button
                    className="size-5"
                    disabled={isPending}
                    onClick={() => handleRemove(image.id)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t pt-3">
          <FileUploader
            accept="image/*"
            folder="portfolio"
            label={pendingUpload ? "Change image" : "Choose image"}
            onUploaded={handleUploaded}
          />
          {pendingUpload ? (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="truncate text-muted-foreground text-xs">
                {pendingUpload.name}
              </p>
              <Select
                onValueChange={(value) => setType(value as PortfolioImageType)}
                value={type}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageTypes.map((imageType) => (
                    <SelectItem key={imageType} value={imageType}>
                      {imageType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Caption (optional)"
                value={caption}
              />
              <Input
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Alt text (optional)"
                value={altText}
              />
              <Button
                disabled={isPending}
                onClick={handleSave}
                size="sm"
                type="button"
              >
                Add to gallery
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

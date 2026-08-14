"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  FileUploader,
  type UploadedFile,
} from "../../projects/components/file-uploader";

export interface GalleryImage {
  altText: string | null;
  id: string;
  isPublished: boolean;
  sortOrder: number;
  url: string;
}

interface ImageGalleryManagerProps {
  canWrite: boolean;
  emptyLabel: string;
  folder: string;
  images: GalleryImage[];
  maxImages: number;
  onCreate: (payload: {
    altText: string | null;
    sortOrder: number;
    url: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    payload: { altText: string | null; isPublished: boolean; sortOrder: number }
  ) => Promise<void>;
}

const ImageRow = ({
  canWrite,
  image,
  isPending,
  onDelete,
  onUpdate,
}: {
  canWrite: boolean;
  image: GalleryImage;
  isPending: boolean;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    payload: { altText: string | null; isPublished: boolean; sortOrder: number }
  ) => void;
}) => (
  <div className="flex flex-col gap-2 rounded-lg border p-2">
    {/* biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URL preview */}
    <img
      alt={image.altText ?? ""}
      className="h-24 w-full rounded object-cover"
      height={96}
      src={image.url}
      width={200}
    />
    <Input
      defaultValue={image.altText ?? ""}
      disabled={!canWrite || isPending}
      onBlur={(event) => {
        const value = event.target.value.trim();
        if (value !== (image.altText ?? "")) {
          onUpdate(image.id, {
            altText: value || null,
            isPublished: image.isPublished,
            sortOrder: image.sortOrder,
          });
        }
      }}
      placeholder="Alt text"
    />
    <div className="flex items-center justify-between gap-2">
      <Input
        className="w-16"
        defaultValue={image.sortOrder}
        disabled={!canWrite || isPending}
        onBlur={(event) => {
          const value = Number(event.target.value);
          if (!Number.isNaN(value) && value !== image.sortOrder) {
            onUpdate(image.id, {
              altText: image.altText,
              isPublished: image.isPublished,
              sortOrder: value,
            });
          }
        }}
        type="number"
      />
      <Switch
        checked={image.isPublished}
        disabled={!canWrite || isPending}
        onCheckedChange={(checked) =>
          onUpdate(image.id, {
            altText: image.altText,
            isPublished: checked,
            sortOrder: image.sortOrder,
          })
        }
      />
      {canWrite ? (
        <Button
          disabled={isPending}
          onClick={() => onDelete(image.id)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      ) : null}
    </div>
  </div>
);

export const ImageGalleryManager = ({
  canWrite,
  emptyLabel,
  folder,
  images,
  maxImages,
  onCreate,
  onDelete,
  onUpdate,
}: ImageGalleryManagerProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUploaded = (file: UploadedFile) => {
    startTransition(async () => {
      try {
        await onCreate({
          altText: null,
          sortOrder: images.length,
          url: file.url,
        });
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add image");
      }
    });
  };

  const handleUpdate = (
    id: string,
    payload: { altText: string | null; isPublished: boolean; sortOrder: number }
  ) => {
    startTransition(async () => {
      try {
        await onUpdate(id, payload);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update image"
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await onDelete(id);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to remove image"
        );
      }
    });
  };

  const atLimit = images.length >= maxImages;

  return (
    <div className="space-y-3">
      {images.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <ImageRow
              canWrite={canWrite}
              image={image}
              isPending={isPending}
              key={image.id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
      {canWrite && atLimit ? (
        <p className="text-muted-foreground text-xs">
          Maximum of {maxImages} images reached — remove one to add another.
        </p>
      ) : null}
      {canWrite && !atLimit ? (
        <FileUploader
          accept="image/*"
          folder={folder}
          label="Add image"
          onUploaded={handleUploaded}
          watermark
        />
      ) : null}
    </div>
  );
};

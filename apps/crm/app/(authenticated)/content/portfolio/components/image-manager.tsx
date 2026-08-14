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
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  FileUploader,
  type UploadedFile,
} from "../../../projects/components/file-uploader";
import {
  addPortfolioImage,
  removePortfolioImage,
  updatePortfolioImage,
} from "../actions";

interface PortfolioImage {
  altText: string | null;
  caption: string | null;
  id: string;
  type: PortfolioImageType;
  url: string;
}

const MAX_BEFORE_AFTER_IMAGES = 3;

const SECTIONS: {
  description: string;
  label: string;
  max?: number;
  type: PortfolioImageType;
}[] = [
  {
    type: "COVER",
    label: "Cover image",
    description:
      "Shown on the portfolio card and at the top of the project page. Upload one.",
    max: 1,
  },
  {
    type: "BEFORE",
    label: "Before",
    description: "What the space looked like before the project started.",
    max: MAX_BEFORE_AFTER_IMAGES,
  },
  {
    type: "AFTER",
    label: "After",
    description: "The finished result.",
    max: MAX_BEFORE_AFTER_IMAGES,
  },
  {
    type: "PROGRESS",
    label: "In progress",
    description: "Optional work-in-progress shots.",
  },
  {
    type: "GALLERY",
    label: "Gallery",
    description: "Additional photos of the finished project.",
  },
];

const ImageThumbnail = ({
  disabled,
  image,
  onRemove,
  onUpdate,
}: {
  disabled: boolean;
  image: PortfolioImage;
  onRemove: (imageId: string) => void;
  onUpdate: (
    imageId: string,
    payload: { altText?: string; caption?: string }
  ) => void;
}) => (
  <div className="flex flex-col gap-1.5 rounded-lg border p-2">
    {/* biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URLs, no next/image domain config needed */}
    <img
      alt={image.altText ?? image.caption ?? "Portfolio image"}
      className="h-24 w-full rounded object-cover"
      height={96}
      src={image.url}
      width={200}
    />
    <Input
      defaultValue={image.caption ?? ""}
      disabled={disabled}
      onBlur={(event) => {
        const value = event.target.value.trim();
        if (value !== (image.caption ?? "")) {
          onUpdate(image.id, { caption: value });
        }
      }}
      placeholder="Caption"
    />
    <div className="flex items-center gap-1">
      <Input
        defaultValue={image.altText ?? ""}
        disabled={disabled}
        onBlur={(event) => {
          const value = event.target.value.trim();
          if (value !== (image.altText ?? "")) {
            onUpdate(image.id, { altText: value });
          }
        }}
        placeholder="Alt text"
      />
      <Button
        disabled={disabled}
        onClick={() => onRemove(image.id)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  </div>
);

const ImageTypeSection = ({
  description,
  images,
  isPending,
  label,
  max,
  onRemove,
  onUpdate,
  onUploaded,
  type,
}: {
  description: string;
  images: PortfolioImage[];
  isPending: boolean;
  label: string;
  max?: number;
  onRemove: (imageId: string) => void;
  onUpdate: (
    imageId: string,
    payload: { altText?: string; caption?: string }
  ) => void;
  onUploaded: (type: PortfolioImageType, file: UploadedFile) => void;
  type: PortfolioImageType;
}) => {
  const atLimit = max !== undefined && images.length >= max;

  return (
    <div className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-sm">{label}</h3>
        <span className="text-muted-foreground text-xs">
          {max ? `${images.length}/${max}` : images.length || ""}
        </span>
      </div>
      <p className="text-muted-foreground text-xs">{description}</p>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <ImageThumbnail
              disabled={isPending}
              image={image}
              key={image.id}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      ) : null}
      {atLimit ? (
        <p className="text-muted-foreground text-xs">
          Maximum of {max} reached — remove one to add another.
        </p>
      ) : (
        <FileUploader
          accept="image/*"
          folder="portfolio"
          label={`Upload ${label.toLowerCase()} photo`}
          onUploaded={(file) => onUploaded(type, file)}
          watermark
        />
      )}
    </div>
  );
};

const ReadOnlyImageSections = ({ images }: { images: PortfolioImage[] }) => {
  if (images.length === 0) {
    return <p className="text-muted-foreground text-sm">No images yet.</p>;
  }

  const populatedSections = SECTIONS.filter((section) =>
    images.some((image) => image.type === section.type)
  );

  return (
    <>
      {populatedSections.map((section) => (
        <div
          className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0"
          key={section.type}
        >
          <h3 className="font-medium text-sm">{section.label}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images
              .filter((image) => image.type === section.type)
              .map((image) => (
                // biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URLs, no next/image domain config needed
                <img
                  alt={image.altText ?? image.caption ?? "Portfolio image"}
                  className="h-24 w-full rounded object-cover"
                  height={96}
                  key={image.id}
                  src={image.url}
                  width={200}
                />
              ))}
          </div>
        </div>
      ))}
    </>
  );
};

export const ImageManager = ({
  canWrite,
  images,
  portfolioProjectId,
}: {
  canWrite: boolean;
  images: PortfolioImage[];
  portfolioProjectId: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUploaded = (type: PortfolioImageType, file: UploadedFile) => {
    startTransition(async () => {
      try {
        await addPortfolioImage(portfolioProjectId, file.url, type);
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

  const handleUpdate = (
    imageId: string,
    payload: { altText?: string; caption?: string }
  ) => {
    startTransition(async () => {
      try {
        await updatePortfolioImage(portfolioProjectId, imageId, payload);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update image"
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
        {canWrite ? (
          SECTIONS.map((section) => (
            <ImageTypeSection
              description={section.description}
              images={images.filter((image) => image.type === section.type)}
              isPending={isPending}
              key={section.type}
              label={section.label}
              max={section.max}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
              onUploaded={handleUploaded}
              type={section.type}
            />
          ))
        ) : (
          <ReadOnlyImageSections images={images} />
        )}
      </CardContent>
    </Card>
  );
};

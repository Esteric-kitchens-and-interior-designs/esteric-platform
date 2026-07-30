"use client";

import type { CertificationAwardType } from "@repo/database";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitLabel } from "../../../lib/format";
import {
  FileUploader,
  type UploadedFile,
} from "../../../projects/components/file-uploader";
import {
  type CertificationFormPayload,
  createCertification,
  updateCertification,
} from "../actions";

interface CertificationFormProps {
  certificationId?: string;
  initialValue?: Partial<CertificationFormPayload>;
  mode: "create" | "edit";
}

export const CertificationForm = ({
  mode,
  certificationId,
  initialValue,
}: CertificationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [issuer, setIssuer] = useState(initialValue?.issuer ?? "");
  const [type, setType] = useState<CertificationAwardType>(
    initialValue?.type ?? "CERTIFICATION"
  );
  const [dateAwarded, setDateAwarded] = useState(
    initialValue?.dateAwarded ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl ?? "");
  const [description, setDescription] = useState(
    initialValue?.description ?? ""
  );
  const [isPublished, setIsPublished] = useState(
    initialValue?.isPublished ?? true
  );

  const handleSubmit = () => {
    setError(null);
    const payload: CertificationFormPayload = {
      title,
      issuer: issuer || null,
      type,
      dateAwarded: dateAwarded || null,
      imageUrl: imageUrl || null,
      description: description || null,
      isPublished,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createCertification(payload);
        } else if (certificationId) {
          await updateCertification(certificationId, payload);
          toast.success("Saved");
          router.refresh();
        }
      } catch (err) {
        unstable_rethrow(err);
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certification / Award</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issuer">Issuer</Label>
          <Input
            id="issuer"
            onChange={(event) => setIssuer(event.target.value)}
            value={issuer ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            onValueChange={(value) => setType(value as CertificationAwardType)}
            value={type}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
              <SelectItem value="AWARD">Award</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateAwarded">Date awarded</Label>
          <Input
            id="dateAwarded"
            onChange={(event) => setDateAwarded(event.target.value)}
            type="date"
            value={dateAwarded ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            value={description ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Image</Label>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              // biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URL preview
              <img
                alt=""
                className="size-14 rounded object-cover"
                height={56}
                src={imageUrl}
                width={56}
              />
            ) : null}
            <FileUploader
              accept="image/*"
              folder="certifications"
              label={imageUrl ? "Change image" : "Upload image"}
              onUploaded={(file: UploadedFile) => setImageUrl(file.url)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          <Label>Published (visible on the public site)</Label>
        </div>
        {error ? (
          <p className="text-destructive text-sm sm:col-span-2">{error}</p>
        ) : null}
        <div className="flex gap-2 sm:col-span-2">
          <Button disabled={isPending} onClick={handleSubmit} type="button">
            {submitLabel(isPending, mode)}
          </Button>
          <Button onClick={() => router.back()} type="button" variant="ghost">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

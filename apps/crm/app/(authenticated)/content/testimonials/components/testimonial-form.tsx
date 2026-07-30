"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
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
  Combobox,
  type ComboboxOption,
} from "../../../quotations/components/combobox";
import {
  createTestimonial,
  type TestimonialFormPayload,
  updateTestimonial,
} from "../actions";

interface TestimonialFormProps {
  initialValue?: Partial<TestimonialFormPayload>;
  mode: "create" | "edit";
  portfolioProjects: ComboboxOption[];
  testimonialId?: string;
}

export const TestimonialForm = ({
  mode,
  testimonialId,
  portfolioProjects,
  initialValue,
}: TestimonialFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState(
    initialValue?.customerName ?? ""
  );
  const [quote, setQuote] = useState(initialValue?.quote ?? "");
  const [rating, setRating] = useState(initialValue?.rating ?? 5);
  const [photoUrl, setPhotoUrl] = useState(initialValue?.photoUrl ?? "");
  const [portfolioProjectId, setPortfolioProjectId] = useState<string | null>(
    initialValue?.portfolioProjectId ?? null
  );
  const [isFeatured, setIsFeatured] = useState(
    initialValue?.isFeatured ?? false
  );
  const [isPublished, setIsPublished] = useState(
    initialValue?.isPublished ?? true
  );

  const handleSubmit = () => {
    setError(null);
    const payload: TestimonialFormPayload = {
      customerName,
      quote,
      rating,
      photoUrl: photoUrl || null,
      portfolioProjectId,
      isFeatured,
      isPublished,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createTestimonial(payload);
        } else if (testimonialId) {
          await updateTestimonial(testimonialId, payload);
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
        <CardTitle>Testimonial</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Customer name</Label>
          <Input
            id="customerName"
            onChange={(event) => setCustomerName(event.target.value)}
            value={customerName}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            max={5}
            min={1}
            onChange={(event) => setRating(Number(event.target.value))}
            type="number"
            value={rating}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="quote">Quote</Label>
          <Textarea
            id="quote"
            onChange={(event) => setQuote(event.target.value)}
            rows={4}
            value={quote}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Linked portfolio project (optional)</Label>
          <Combobox
            clearable
            emptyText="No portfolio projects found."
            onChange={setPortfolioProjectId}
            options={portfolioProjects}
            placeholder="No project linked"
            value={portfolioProjectId}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Photo</Label>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              // biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URL preview
              <img
                alt=""
                className="size-14 rounded-full object-cover"
                height={56}
                src={photoUrl}
                width={56}
              />
            ) : null}
            <FileUploader
              accept="image/*"
              folder="testimonials"
              label={photoUrl ? "Change photo" : "Upload photo"}
              onUploaded={(file: UploadedFile) => setPhotoUrl(file.url)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label>Featured</Label>
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

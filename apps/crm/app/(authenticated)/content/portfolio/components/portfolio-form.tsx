"use client";

import type { ContentStatus, ServiceCategory } from "@repo/database";
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
  Combobox,
  type ComboboxOption,
} from "../../../quotations/components/combobox";
import { serviceCategoryLabel, slugify } from "../../lib/helpers";
import {
  createPortfolioProject,
  type PortfolioFormPayload,
  updatePortfolioProject,
} from "../actions";

interface PortfolioFormProps {
  initialValue?: Partial<PortfolioFormPayload>;
  internalProjects: ComboboxOption[];
  mode: "create" | "edit";
  portfolioProjectId?: string;
}

export const PortfolioForm = ({
  mode,
  portfolioProjectId,
  internalProjects,
  initialValue,
}: PortfolioFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialValue?.slug);
  const [category, setCategory] = useState<ServiceCategory>(
    initialValue?.category ?? "KITCHEN"
  );
  const [description, setDescription] = useState(
    initialValue?.description ?? ""
  );
  const [location, setLocation] = useState(initialValue?.location ?? "");
  const [completionDate, setCompletionDate] = useState(
    initialValue?.completionDate ?? ""
  );
  const [isFeatured, setIsFeatured] = useState(
    initialValue?.isFeatured ?? false
  );
  const [status, setStatus] = useState<ContentStatus>(
    initialValue?.status ?? "DRAFT"
  );
  const [projectId, setProjectId] = useState<string | null>(
    initialValue?.projectId ?? null
  );
  const [seoTitle, setSeoTitle] = useState(initialValue?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialValue?.seoDescription ?? ""
  );

  const handleSubmit = () => {
    setError(null);
    const payload: PortfolioFormPayload = {
      title,
      slug: slug || slugify(title),
      category,
      description: description || null,
      location: location || null,
      completionDate: completionDate || null,
      isFeatured,
      status,
      projectId,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createPortfolioProject(payload);
        } else if (portfolioProjectId) {
          await updatePortfolioProject(portfolioProjectId, payload);
          toast.success("Portfolio project updated");
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
        <CardTitle>Portfolio project</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) {
                setSlug(slugify(event.target.value));
              }
            }}
            value={title}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            value={slug}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            onValueChange={(value) => setCategory(value as ServiceCategory)}
            value={category}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(serviceCategoryLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            onChange={(event) => setLocation(event.target.value)}
            value={location}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="completionDate">Completion date</Label>
          <Input
            id="completionDate"
            onChange={(event) => setCompletionDate(event.target.value)}
            type="date"
            value={completionDate ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Linked internal project (optional)</Label>
          <Combobox
            clearable
            emptyText="No projects found."
            onChange={setProjectId}
            options={internalProjects}
            placeholder="No project linked"
            value={projectId}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            value={description ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input
            id="seoTitle"
            onChange={(event) => setSeoTitle(event.target.value)}
            value={seoTitle ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="seoDescription">SEO description</Label>
          <Input
            id="seoDescription"
            onChange={(event) => setSeoDescription(event.target.value)}
            value={seoDescription ?? ""}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={status === "PUBLISHED"}
            onCheckedChange={(checked) =>
              setStatus(checked ? "PUBLISHED" : "DRAFT")
            }
          />
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

"use client";

import type { ContentStatus, EmploymentType } from "@repo/database";
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
import { slugify } from "../../lib/helpers";
import {
  createJobPosting,
  type JobPostingFormPayload,
  updateJobPosting,
} from "../actions";

export const employmentTypeLabel: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

interface JobPostingFormProps {
  initialValue?: Partial<JobPostingFormPayload>;
  mode: "create" | "edit";
  postingId?: string;
}

export const JobPostingForm = ({
  mode,
  postingId,
  initialValue,
}: JobPostingFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialValue?.slug);
  const [department, setDepartment] = useState(initialValue?.department ?? "");
  const [location, setLocation] = useState(initialValue?.location ?? "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialValue?.employmentType ?? "FULL_TIME"
  );
  const [description, setDescription] = useState(
    initialValue?.description ?? ""
  );
  const [requirements, setRequirements] = useState(
    initialValue?.requirements ?? ""
  );
  const [status, setStatus] = useState<ContentStatus>(
    initialValue?.status ?? "DRAFT"
  );

  const handleSubmit = () => {
    setError(null);
    const payload: JobPostingFormPayload = {
      title,
      slug: slug || slugify(title),
      department: department || null,
      location: location || null,
      employmentType,
      description,
      requirements: requirements || null,
      status,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createJobPosting(payload);
        } else if (postingId) {
          await updateJobPosting(postingId, payload);
          toast.success("Job posting updated");
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
        <CardTitle>Job posting</CardTitle>
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
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            onChange={(event) => setDepartment(event.target.value)}
            placeholder="e.g. Design"
            value={department ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Nairobi, Kenya"
            value={location ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="employmentType-trigger">Employment type</Label>
          <Select
            onValueChange={(value) =>
              setEmploymentType(value as EmploymentType)
            }
            value={employmentType}
          >
            <SelectTrigger className="w-full" id="employmentType-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(employmentTypeLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={8}
            value={description}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="requirements">Requirements</Label>
          <Textarea
            id="requirements"
            onChange={(event) => setRequirements(event.target.value)}
            rows={6}
            value={requirements ?? ""}
          />
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

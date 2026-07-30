"use client";

import type { ContentStatus } from "@repo/database";
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
import { FileUploader } from "../../../projects/components/file-uploader";
import { slugify } from "../../lib/helpers";
import {
  type BlogFormPayload,
  createBlogPost,
  updateBlogPost,
} from "../actions";

interface BlogFormProps {
  initialValue?: Partial<BlogFormPayload>;
  mode: "create" | "edit";
  postId?: string;
}

export const BlogForm = ({ mode, postId, initialValue }: BlogFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [slug, setSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialValue?.slug);
  const [excerpt, setExcerpt] = useState(initialValue?.excerpt ?? "");
  const [content, setContent] = useState(initialValue?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialValue?.coverImageUrl ?? ""
  );
  const [category, setCategory] = useState(initialValue?.category ?? "");
  const [tags, setTags] = useState((initialValue?.tags ?? []).join(", "));
  const [status, setStatus] = useState<ContentStatus>(
    initialValue?.status ?? "DRAFT"
  );
  const [seoTitle, setSeoTitle] = useState(initialValue?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialValue?.seoDescription ?? ""
  );

  const handleSubmit = () => {
    setError(null);
    const payload: BlogFormPayload = {
      title,
      slug: slug || slugify(title),
      excerpt: excerpt || null,
      content,
      coverImageUrl: coverImageUrl || null,
      category: category || null,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createBlogPost(payload);
        } else if (postId) {
          await updateBlogPost(postId, payload);
          toast.success("Blog post updated");
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
        <CardTitle>Blog post</CardTitle>
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Design Tips"
            value={category ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            onChange={(event) => setTags(event.target.value)}
            placeholder="kitchens, trends, 2026"
            value={tags}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            onChange={(event) => setExcerpt(event.target.value)}
            rows={2}
            value={excerpt ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="content">Content (markdown)</Label>
          <Textarea
            id="content"
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            value={content}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Cover image</Label>
          <div className="flex items-center gap-3">
            {coverImageUrl ? (
              // biome-ignore lint/performance/noImgElement: admin-managed arbitrary blob URL preview
              <img
                alt="Cover"
                className="size-14 rounded object-cover"
                height={56}
                src={coverImageUrl}
                width={56}
              />
            ) : null}
            <FileUploader
              accept="image/*"
              folder="blog"
              label={
                coverImageUrl ? "Change cover image" : "Upload cover image"
              }
              onUploaded={(file) => setCoverImageUrl(file.url)}
            />
          </div>
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

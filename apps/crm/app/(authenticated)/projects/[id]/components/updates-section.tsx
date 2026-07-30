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
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addProjectUpdate } from "../../actions";
import { formatDate } from "../../lib/helpers";

interface Update {
  author: { firstName: string; lastName: string };
  completionPercentage: number | null;
  createdAt: Date;
  id: string;
  imageUrls: string[];
  note: string;
}

export const UpdatesSection = ({
  projectId,
  updates,
}: {
  projectId: string;
  updates: Update[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [completion, setCompletion] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  const handleAdd = () => {
    if (!note.trim()) {
      toast.error("A note is required");
      return;
    }
    startTransition(async () => {
      try {
        await addProjectUpdate(
          projectId,
          note,
          completion ? Number(completion) : null,
          imageUrls
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        );
        setNote("");
        setCompletion("");
        setImageUrls("");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to post update"
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border p-3">
          <Textarea
            onChange={(event) => setNote(event.target.value)}
            placeholder="What happened on site today?"
            rows={3}
            value={note}
          />
          <div className="flex flex-wrap gap-2">
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="completion">
                Completion %
              </Label>
              <Input
                className="w-28"
                id="completion"
                max={100}
                min={0}
                onChange={(event) => setCompletion(event.target.value)}
                type="number"
                value={completion}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs" htmlFor="imageUrls">
                Image URLs (comma-separated)
              </Label>
              <Input
                id="imageUrls"
                onChange={(event) => setImageUrls(event.target.value)}
                placeholder="https://…, https://…"
                value={imageUrls}
              />
            </div>
          </div>
          <Button
            disabled={isPending}
            onClick={handleAdd}
            size="sm"
            type="button"
          >
            Post update
          </Button>
        </div>

        {updates.length === 0 ? (
          <p className="text-muted-foreground text-sm">No updates yet.</p>
        ) : (
          <ul className="space-y-4">
            {updates.map((update) => (
              <li className="border-b pb-3 last:border-0" key={update.id}>
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>
                    {update.author.firstName} {update.author.lastName}
                  </span>
                  <span>{formatDate(update.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {update.note}
                </p>
                {update.completionPercentage !== null ? (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Marked {update.completionPercentage}% complete
                  </p>
                ) : null}
                {update.imageUrls.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {update.imageUrls.map((url) => (
                      // biome-ignore lint/performance/noImgElement: internal progress log thumbnails, no next/image config needed for arbitrary external URLs
                      <img
                        alt="Progress"
                        className="size-16 rounded object-cover"
                        height={64}
                        key={url}
                        src={url}
                        width={64}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

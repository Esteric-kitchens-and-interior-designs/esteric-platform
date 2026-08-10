"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { upload } from "@repo/storage/client";
import { CheckCircle2, Loader2, MoveRight, Upload } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { submitJobApplication } from "@/app/careers/actions";
import { initialFormState } from "@/lib/form-state";

interface ApplyFormProps {
  readonly jobPostingId: string;
}

export const ApplyForm = ({ jobPostingId }: ApplyFormProps) => {
  const [state, formAction, isPending] = useActionState(
    submitJobApplication,
    initialFormState
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleResumeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const blob = await upload(`careers/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setResumeUrl(blob.url);
      setResumeName(file.name);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border bg-card p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <p className="font-display text-xl tracking-tight">
          Application received
        </p>
        <p className="max-w-sm text-muted-foreground text-sm">
          Thank you for applying — we'll review your application and be in touch
          if it's a match.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-md border bg-card p-8"
    >
      <input name="jobPostingId" type="hidden" value={jobPostingId} />
      <input name="resumeUrl" type="hidden" value={resumeUrl} />

      <p className="font-display text-lg tracking-tight">Apply for this role</p>

      <div className="grid gap-1">
        <Label htmlFor="name">Full name</Label>
        <Input
          disabled={isPending}
          id="name"
          name="name"
          required
          type="text"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          disabled={isPending}
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input disabled={isPending} id="phone" name="phone" type="tel" />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="coverMessage">Cover message (optional)</Label>
        <Textarea
          disabled={isPending}
          id="coverMessage"
          name="coverMessage"
          rows={4}
        />
      </div>

      <div className="grid gap-1">
        <Label>Résumé (optional)</Label>
        <input
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleResumeChange}
          ref={fileInputRef}
          type="file"
        />
        <Button
          className="w-fit gap-2"
          disabled={isPending || isUploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          variant="outline"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {resumeName || "Upload résumé (PDF or Word)"}
        </Button>
        {uploadError ? (
          <p className="text-destructive text-sm">{uploadError}</p>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button
        className="w-full gap-2"
        disabled={isPending || isUploading}
        type="submit"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Submit application <MoveRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

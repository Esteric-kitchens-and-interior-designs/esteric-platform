"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createFaq, type FaqFormPayload, updateFaq } from "../actions";

interface FaqDialogProps {
  faqId?: string;
  initialValue?: Partial<FaqFormPayload>;
  mode: "create" | "edit";
}

export const FaqDialog = ({ mode, faqId, initialValue }: FaqDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState(initialValue?.question ?? "");
  const [answer, setAnswer] = useState(initialValue?.answer ?? "");
  const [category, setCategory] = useState(initialValue?.category ?? "");
  const [isPublished, setIsPublished] = useState(
    initialValue?.isPublished ?? true
  );

  const handleSubmit = () => {
    const payload: FaqFormPayload = {
      question,
      answer,
      category: category || null,
      isPublished,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createFaq(payload);
        } else if (faqId) {
          await updateFaq(faqId, payload);
        }
        toast.success(mode === "create" ? "FAQ added" : "FAQ updated");
        setOpen(false);
        if (mode === "create") {
          setQuestion("");
          setAnswer("");
          setCategory("");
          setIsPublished(true);
        }
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus /> New FAQ
          </Button>
        ) : (
          <Button size="icon-sm" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New FAQ" : "Edit FAQ"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              onChange={(event) => setQuestion(event.target.value)}
              value={question}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              onChange={(event) => setAnswer(event.target.value)}
              rows={4}
              value={answer}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Pricing"
              value={category ?? ""}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Published</Label>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import type { QuotationStatus } from "@repo/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/design-system/components/ui/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Check, FileEdit, GitBranch, Send, X } from "lucide-react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  approveQuotation,
  createQuotationRevision,
  rejectQuotation,
  sendQuotation,
} from "../../actions";

interface ActionButtonsProps {
  canApprove: boolean;
  canWrite: boolean;
  quotationId: string;
  status: QuotationStatus;
}

export const QuotationActionButtons = ({
  quotationId,
  status,
  canWrite,
  canApprove,
}: ActionButtonsProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  const run = (action: () => Promise<void>, successMessage?: string) => {
    startTransition(async () => {
      try {
        await action();
        if (successMessage) {
          toast.success(successMessage);
        }
        router.refresh();
      } catch (err) {
        unstable_rethrow(err);
        toast.error(err instanceof Error ? err.message : "Action failed");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canWrite && status === "DRAFT" && (
        <Button
          disabled={isPending}
          onClick={() => router.push(`/quotations/${quotationId}/edit`)}
          variant="outline"
        >
          <FileEdit /> Edit
        </Button>
      )}
      {canWrite && status === "DRAFT" && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => sendQuotation(quotationId), "Quotation sent to customer")
          }
        >
          <Send /> Send to customer
        </Button>
      )}
      {canApprove && (status === "SENT" || status === "VIEWED") && (
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => approveQuotation(quotationId), "Quotation approved")
          }
        >
          <Check /> Approve
        </Button>
      )}
      {canApprove && (status === "SENT" || status === "VIEWED") && (
        <Dialog onOpenChange={setRejectOpen} open={rejectOpen}>
          <DialogTrigger asChild>
            <Button disabled={isPending} variant="destructive">
              <X /> Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject quotation</DialogTitle>
              <DialogDescription>
                This is logged to the activity trail. Provide a reason for the
                record.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="rejectionReason">Rejection reason</Label>
              <Textarea
                id="rejectionReason"
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="e.g. Budget exceeds customer's expectations"
                value={rejectReason}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isPending || !rejectReason.trim()}
                onClick={() => {
                  run(
                    () => rejectQuotation(quotationId, rejectReason),
                    "Quotation rejected"
                  );
                  setRejectOpen(false);
                }}
                variant="destructive"
              >
                Confirm rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {canWrite && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending} variant="outline">
              <GitBranch /> Create revision
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create a new revision?</AlertDialogTitle>
              <AlertDialogDescription>
                This clones the quotation into a new draft version linked back
                to this one, and marks this quotation as revised.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={() => run(() => createQuotationRevision(quotationId))}
              >
                Create revision
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

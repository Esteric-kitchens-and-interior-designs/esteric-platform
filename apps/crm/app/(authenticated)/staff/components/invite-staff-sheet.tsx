"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import { MailPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { inviteStaffMember } from "../actions";

interface RoleOption {
  id: string;
  name: string;
}

export const InviteStaffSheet = ({ roles }: { roles: RoleOption[] }) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await inviteStaffMember(formData);
        toast.success(`Invitation sent to ${formData.get("email") as string}.`);
        setOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send invitation."
        );
      }
    });
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Button onClick={() => setOpen(true)} size="sm">
        <MailPlus /> Invite staff
      </Button>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Invite staff</SheetTitle>
          <SheetDescription>
            They'll get an email from Clerk to set up their account. New
            accounts land with the near-zero-permission "Staff" role unless you
            preselect a role below — you can also change it later from this
            page.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              required
              type="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roleId">Role (optional)</Label>
            <Select name="roleId">
              <SelectTrigger className="w-full" id="roleId">
                <SelectValue placeholder="Default to Staff" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <SheetFooter className="px-0">
            <Button disabled={isPending} type="submit">
              {isPending ? "Sending…" : "Send invitation"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

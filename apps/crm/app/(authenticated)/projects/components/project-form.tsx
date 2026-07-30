"use client";

import type { ServiceCategory } from "@repo/database";
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
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Combobox,
  type ComboboxOption,
} from "../../quotations/components/combobox";
import { createProject, type ProjectFormPayload } from "../actions";
import { serviceCategoryLabel } from "../lib/helpers";

interface ProjectFormProps {
  customers: ComboboxOption[];
  initialCustomerId?: string | null;
  initialQuotationId?: string | null;
  initialTitle?: string | null;
  quotations: ComboboxOption[];
}

export const ProjectForm = ({
  customers,
  quotations,
  initialCustomerId,
  initialQuotationId,
  initialTitle,
}: ProjectFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string | null>(
    initialCustomerId ?? null
  );
  const [quotationId, setQuotationId] = useState<string | null>(
    initialQuotationId ?? null
  );
  const [title, setTitle] = useState(initialTitle ?? "");
  const [category, setCategory] = useState<ServiceCategory>("KITCHEN");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    setError(null);
    const payload: ProjectFormPayload = {
      customerId: customerId ?? "",
      quotationId,
      title,
      category,
      budget: budget ? Number(budget) : null,
      startDate: startDate || null,
      deadline: deadline || null,
      location: location || null,
      description: description || null,
    };

    startTransition(async () => {
      try {
        await createProject(payload);
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
        <CardTitle>Project details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Customer</Label>
          <Combobox
            emptyText="No customers found."
            onChange={setCustomerId}
            options={customers}
            placeholder="Select a customer"
            value={customerId}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Linked quotation (optional)</Label>
          <Combobox
            clearable
            emptyText="No approved quotations found."
            onChange={setQuotationId}
            options={quotations}
            placeholder="No quotation linked"
            value={quotationId}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Modern Kitchen Remodel"
            value={title}
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
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            min={0}
            onChange={(event) => setBudget(event.target.value)}
            step="0.01"
            type="number"
            value={budget}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            onChange={(event) => setStartDate(event.target.value)}
            type="date"
            value={startDate}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            onChange={(event) => setDeadline(event.target.value)}
            type="date"
            value={deadline}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Karen, Nairobi"
            value={location}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            value={description}
          />
        </div>
        {error ? (
          <p className="text-destructive text-sm sm:col-span-2">{error}</p>
        ) : null}
        <div className="flex gap-2 sm:col-span-2">
          <Button disabled={isPending} onClick={handleSubmit} type="button">
            {isPending ? "Creating…" : "Create project"}
          </Button>
          <Button onClick={() => router.back()} type="button" variant="ghost">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

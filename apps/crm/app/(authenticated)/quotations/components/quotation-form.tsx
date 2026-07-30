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
import { Plus, Trash2 } from "lucide-react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createQuotation,
  type QuotationFormPayload,
  type QuotationItemPayload,
  updateQuotation,
} from "../actions";
import { computeQuotationTotals, formatMoney } from "../lib/helpers";
import { Combobox, type ComboboxOption } from "./combobox";

interface QuotationFormProps {
  customers: ComboboxOption[];
  initialValue?: Partial<QuotationFormPayload>;
  leads: ComboboxOption[];
  mode: "create" | "edit";
  quotationId?: string;
}

type Row = QuotationItemPayload & { key: string };

const emptyRow = (): Row => ({
  key: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export const QuotationForm = ({
  customers,
  leads,
  mode,
  quotationId,
  initialValue,
}: QuotationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string | null>(
    initialValue?.customerId ?? null
  );
  const [leadId, setLeadId] = useState<string | null>(
    initialValue?.leadId ?? null
  );
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [currency, setCurrency] = useState(initialValue?.currency ?? "KES");
  const [taxRate, setTaxRate] = useState(initialValue?.taxRate ?? 0);
  const [discountAmount, setDiscountAmount] = useState(
    initialValue?.discountAmount ?? 0
  );
  const [validUntil, setValidUntil] = useState(initialValue?.validUntil ?? "");
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialValue?.termsAndConditions ?? ""
  );
  const [rows, setRows] = useState<Row[]>(
    initialValue?.items?.length
      ? initialValue.items.map((item) => ({
          ...item,
          key: crypto.randomUUID(),
        }))
      : [emptyRow()]
  );

  const totals = computeQuotationTotals(rows, taxRate, discountAmount);

  const updateRow = (key: string, patch: Partial<QuotationItemPayload>) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const removeRow = (key: string) => {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.key !== key)
    );
  };

  const handleSubmit = () => {
    setError(null);
    const payload: QuotationFormPayload = {
      customerId: customerId ?? "",
      leadId,
      title,
      currency,
      taxRate: Number(taxRate),
      discountAmount: Number(discountAmount),
      validUntil: validUntil || null,
      termsAndConditions: termsAndConditions || null,
      items: rows.map(({ key, ...item }) => item),
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createQuotation(payload);
        } else if (quotationId) {
          await updateQuotation(quotationId, payload);
        }
      } catch (err) {
        // Successful create/update server actions redirect() on completion,
        // which throws a special control-flow error — let it propagate so
        // navigation actually happens instead of being treated as a failure.
        unstable_rethrow(err);
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
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
              <Label>Linked lead (optional)</Label>
              <Combobox
                clearable
                emptyText="No leads found."
                onChange={setLeadId}
                options={leads}
                placeholder="No lead linked"
                value={leadId}
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
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                onChange={(event) =>
                  setCurrency(event.target.value.toUpperCase())
                }
                value={currency}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input
                id="validUntil"
                onChange={(event) => setValidUntil(event.target.value)}
                type="date"
                value={validUntil ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Line items</CardTitle>
            <Button
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus /> Add item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-12 gap-2 px-1 font-medium text-muted-foreground text-xs">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {rows.map((row) => (
              <div
                className="grid grid-cols-12 items-center gap-2"
                key={row.key}
              >
                <Input
                  className="col-span-6"
                  onChange={(event) =>
                    updateRow(row.key, { description: event.target.value })
                  }
                  placeholder="Description"
                  value={row.description}
                />
                <Input
                  className="col-span-2"
                  min={0}
                  onChange={(event) =>
                    updateRow(row.key, {
                      quantity: Number(event.target.value),
                    })
                  }
                  step="0.01"
                  type="number"
                  value={row.quantity}
                />
                <Input
                  className="col-span-2"
                  min={0}
                  onChange={(event) =>
                    updateRow(row.key, {
                      unitPrice: Number(event.target.value),
                    })
                  }
                  step="0.01"
                  type="number"
                  value={row.unitPrice}
                />
                <div className="col-span-1 text-right text-sm">
                  {formatMoney(row.quantity * row.unitPrice, currency)}
                </div>
                <Button
                  className="col-span-1 justify-self-end"
                  disabled={rows.length === 1}
                  onClick={() => removeRow(row.key)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms & conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              onChange={(event) => setTermsAndConditions(event.target.value)}
              placeholder="Payment terms, warranty, exclusions…"
              rows={5}
              value={termsAndConditions ?? ""}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="taxRate">Tax rate (%)</Label>
              <Input
                id="taxRate"
                min={0}
                onChange={(event) => setTaxRate(Number(event.target.value))}
                step="0.01"
                type="number"
                value={taxRate}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountAmount">Discount amount</Label>
              <Input
                id="discountAmount"
                min={0}
                onChange={(event) =>
                  setDiscountAmount(Number(event.target.value))
                }
                step="0.01"
                type="number"
                value={discountAmount}
              />
            </div>
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(totals.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatMoney(totals.taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatMoney(totals.discountAmount, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold text-base">
                <span>Total</span>
                <span>{formatMoney(totals.total, currency)}</span>
              </div>
            </div>
            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            <div className="flex flex-col gap-2">
              <Button disabled={isPending} onClick={handleSubmit} type="button">
                {isPending && "Saving…"}
                {!isPending && mode === "create" && "Save as draft"}
                {!isPending && mode === "edit" && "Save changes"}
              </Button>
              <Button
                onClick={() => router.back()}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuotationStatusBadge } from "../components/status-badge";
import { formatDate, formatMoney } from "../lib/helpers";
import { QuotationActionButtons } from "./components/action-buttons";

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>;
}

const QuotationDetailPage = async ({ params }: QuotationDetailPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "quotations:read")) {
    redirect("/");
  }

  const { id } = await params;

  const quotation = await database.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      lead: true,
      createdBy: true,
      assignedTo: true,
      items: { orderBy: { sortOrder: "asc" } },
      project: true,
      parentQuotation: true,
      revisions: { orderBy: { version: "asc" } },
    },
  });

  if (!quotation) {
    notFound();
  }

  const canWrite = hasPermission(staffUser, "quotations:write");
  const canApprove = hasPermission(staffUser, "quotations:approve");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-semibold text-2xl">
              {quotation.quoteNumber}
            </h1>
            <QuotationStatusBadge status={quotation.status} />
            {quotation.version > 1 && (
              <Badge variant="outline">version {quotation.version}</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{quotation.title}</p>
        </div>
        <QuotationActionButtons
          canApprove={canApprove}
          canWrite={canWrite}
          quotationId={quotation.id}
          status={quotation.status}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(item.unitPrice, quotation.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(item.total, quotation.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 ml-auto w-64 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatMoney(quotation.subtotal, quotation.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Tax ({quotation.taxRate.toString()}%)
                  </span>
                  <span>
                    {formatMoney(quotation.taxAmount, quotation.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>
                    -{formatMoney(quotation.discountAmount, quotation.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold text-base">
                  <span>Total</span>
                  <span>
                    {formatMoney(quotation.total, quotation.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {quotation.termsAndConditions ? (
            <Card>
              <CardHeader>
                <CardTitle>Terms & conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                  {quotation.termsAndConditions}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {(quotation.parentQuotation || quotation.revisions.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Revision history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {quotation.parentQuotation ? (
                  <Link
                    className="flex items-center gap-1 text-primary hover:underline"
                    href={`/quotations/${quotation.parentQuotation.id}`}
                  >
                    <ExternalLink className="size-3.5" /> Revised from{" "}
                    {quotation.parentQuotation.quoteNumber} (v
                    {quotation.parentQuotation.version})
                  </Link>
                ) : null}
                {quotation.revisions.map((revision) => (
                  <Link
                    className="flex items-center gap-1 text-primary hover:underline"
                    href={`/quotations/${revision.id}`}
                    key={revision.id}
                  >
                    <ExternalLink className="size-3.5" /> {revision.quoteNumber}{" "}
                    (v{revision.version})
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {quotation.status === "REJECTED" && quotation.rejectionReason ? (
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Rejection reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quotation.rejectionReason}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{quotation.customer.name}</p>
              <p className="text-muted-foreground">
                {quotation.customer.email}
              </p>
              {quotation.customer.phone ? (
                <p className="text-muted-foreground">
                  {quotation.customer.phone}
                </p>
              ) : null}
              {quotation.lead ? (
                <p className="text-muted-foreground">
                  Linked lead: {quotation.lead.name}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(quotation.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid until</span>
                <span>{formatDate(quotation.validUntil)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent</span>
                <span>{formatDate(quotation.sentAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responded</span>
                <span>{formatDate(quotation.respondedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created by</span>
                <span>
                  {quotation.createdBy.firstName} {quotation.createdBy.lastName}
                </span>
              </div>
              {quotation.pdfUrl ? (
                <Button asChild className="w-full" size="sm" variant="outline">
                  <a href={quotation.pdfUrl} rel="noreferrer" target="_blank">
                    View PDF
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {quotation.status === "APPROVED" && !quotation.project ? (
            <Card>
              <CardHeader>
                <CardTitle>Next step</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="sm">
                  <Link href={`/projects/new?quotationId=${quotation.id}`}>
                    <Plus /> Create project from this quotation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {quotation.project ? (
            <Card>
              <CardHeader>
                <CardTitle>Project</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  className="text-primary text-sm hover:underline"
                  href={`/projects/${quotation.project.id}`}
                >
                  {quotation.project.projectNumber} — {quotation.project.title}
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailPage;

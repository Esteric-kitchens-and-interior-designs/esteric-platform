import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database, type QuotationStatus } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { QuotationStatusBadge } from "./components/status-badge";
import { formatDate, formatMoney, quotationStatusLabel } from "./lib/helpers";

interface QuotationsPageProps {
  searchParams: Promise<{ status?: string; customer?: string }>;
}

const QuotationsPage = async ({ searchParams }: QuotationsPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "quotations:read")) {
    redirect("/");
  }

  const { status, customer } = await searchParams;

  const quotations = await database.quotation.findMany({
    where: {
      status:
        status && status !== "ALL" ? (status as QuotationStatus) : undefined,
      customerId: customer && customer !== "ALL" ? customer : undefined,
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const customers = await database.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    take: 500,
  });

  const canWrite = hasPermission(staffUser, "quotations:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Quotations</h1>
          <p className="text-muted-foreground text-sm">
            Draft, send, and track customer quotations.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/quotations/new">
              <Plus /> New quotation
            </Link>
          </Button>
        ) : null}
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <Select defaultValue={status ?? "ALL"} name="status">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.entries(quotationStatusLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue={customer ?? "ALL"} name="customer">
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All customers</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" type="submit" variant="secondary">
          Filter
        </Button>
        {((status && status !== "ALL") || (customer && customer !== "ALL")) && (
          <Button asChild size="sm" variant="ghost">
            <Link href="/quotations">Clear</Link>
          </Button>
        )}
      </form>

      {quotations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No quotations found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters, or create a new quotation.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow className="cursor-pointer" key={quotation.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/quotations/${quotation.id}`}
                    >
                      {quotation.quoteNumber}
                    </Link>
                    {quotation.version > 1 && (
                      <Badge className="ml-2" variant="outline">
                        v{quotation.version}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{quotation.customer.name}</TableCell>
                  <TableCell className="max-w-64 truncate">
                    {quotation.title}
                  </TableCell>
                  <TableCell>
                    <QuotationStatusBadge status={quotation.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoney(quotation.total, quotation.currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(quotation.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;

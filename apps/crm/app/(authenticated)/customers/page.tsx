import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { SearchIcon, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/header";
import { formatDate } from "../lib/format";
import { CustomerFormSheet } from "./components/customer-form-sheet";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer directory",
};

interface CustomersPageProperties {
  searchParams: Promise<{ q?: string }>;
}

const CustomersPage = async ({ searchParams }: CustomersPageProperties) => {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    return null;
  }

  if (!hasPermission(staffUser, "customers:read")) {
    return (
      <>
        <Header page="Customers" pages={[]} />
        <div className="p-4">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Access denied</EmptyTitle>
              <EmptyDescription>
                You don't have permission to view customers.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </>
    );
  }

  const { q } = await searchParams;
  const canWrite = hasPermission(staffUser, "customers:write");

  const customers = await database.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { projects: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <Header page="Customers" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <form action="/customers" className="relative w-full max-w-sm">
            <SearchIcon className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              defaultValue={q}
              name="q"
              placeholder="Search by name or email…"
            />
          </form>
          {canWrite && <CustomerFormSheet />}
        </div>

        {customers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No customers found</EmptyTitle>
              <EmptyDescription>
                {q
                  ? "Try a different search."
                  : "Customers appear here once created or converted from a lead."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        className="block"
                        href={`/customers/${customer.id}`}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {customer.email}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.city ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer._count.projects}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomersPage;

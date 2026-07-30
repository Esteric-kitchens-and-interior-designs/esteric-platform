import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database, type SubscriberStatus } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Input } from "@repo/design-system/components/ui/input";
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
import { Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "../lib/helpers";
import { ExportCsvButton } from "./components/export-button";

interface NewsletterPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

const NewsletterPage = async ({ searchParams }: NewsletterPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { status, q } = await searchParams;

  const subscribers = await database.newsletterSubscriber.findMany({
    where: {
      status:
        status && status !== "ALL" ? (status as SubscriberStatus) : undefined,
      email: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    orderBy: { subscribedAt: "desc" },
    take: 1000,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Newsletter</h1>
          <p className="text-muted-foreground text-sm">
            Subscribers collected from the public site.
          </p>
        </div>
        <ExportCsvButton
          rows={subscribers.map((s) => ({
            email: s.email,
            name: s.name,
            status: s.status,
            source: s.source,
            subscribedAt: s.subscribedAt.toISOString(),
          }))}
        />
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <Input
          className="w-64"
          defaultValue={q ?? ""}
          name="q"
          placeholder="Search by email"
        />
        <Select defaultValue={status ?? "ALL"} name="status">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="SUBSCRIBED">Subscribed</SelectItem>
            <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" type="submit" variant="secondary">
          Filter
        </Button>
        {((status && status !== "ALL") || q) && (
          <Button asChild size="sm" variant="ghost">
            <Link href="/content/newsletter">Clear</Link>
          </Button>
        )}
      </form>

      {subscribers.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail />
            </EmptyMedia>
            <EmptyTitle>No subscribers found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters, or check back once the public site is
              collecting signups.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>{subscriber.name ?? "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        subscriber.status === "SUBSCRIBED"
                          ? "default"
                          : "outline"
                      }
                    >
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {subscriber.source ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(subscriber.subscribedAt)}
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

export default NewsletterPage;

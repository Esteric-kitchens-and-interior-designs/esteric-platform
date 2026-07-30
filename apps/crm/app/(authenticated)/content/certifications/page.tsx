import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { Award, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "../lib/helpers";

const CertificationsListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const records = await database.certificationAward.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">
            Certifications & Awards
          </h1>
          <p className="text-muted-foreground text-sm">
            Credentials shown on the public site.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/content/certifications/new">
              <Plus /> New entry
            </Link>
          </Button>
        ) : null}
      </div>

      {records.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Award />
            </EmptyMedia>
            <EmptyTitle>No certifications or awards yet</EmptyTitle>
            <EmptyDescription>Add your first entry.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Date awarded</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/content/certifications/${record.id}`}
                    >
                      {record.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.type}</Badge>
                  </TableCell>
                  <TableCell>{record.issuer ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(record.dateAwarded)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.isPublished ? "default" : "outline"}>
                      {record.isPublished ? "Published" : "Draft"}
                    </Badge>
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

export default CertificationsListPage;

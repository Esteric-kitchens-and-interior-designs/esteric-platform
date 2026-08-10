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
import { Briefcase, Inbox, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "../../components/header";
import { contentStatusVariant, formatDate } from "../lib/helpers";
import { employmentTypeLabel } from "./components/job-posting-form";

const CareersListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const postings = await database.jobPosting.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <>
      <Header page="Careers" pages={["Content"]} />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-semibold text-2xl">Careers</h1>
            <p className="text-muted-foreground text-sm">
              Job postings published on the public site.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/content/careers/applications">
                <Inbox /> Applications
              </Link>
            </Button>
            {canWrite ? (
              <Button asChild>
                <Link href="/content/careers/new">
                  <Plus /> New posting
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {postings.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase />
              </EmptyMedia>
              <EmptyTitle>No job postings yet</EmptyTitle>
              <EmptyDescription>Create your first opening.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postings.map((posting) => (
                  <TableRow key={posting.id}>
                    <TableCell>
                      <Link
                        className="font-medium hover:underline"
                        href={`/content/careers/${posting.id}`}
                      >
                        {posting.title}
                      </Link>
                    </TableCell>
                    <TableCell>{posting.department ?? "-"}</TableCell>
                    <TableCell>
                      {employmentTypeLabel[posting.employmentType]}
                    </TableCell>
                    <TableCell>
                      <Badge variant={contentStatusVariant[posting.status]}>
                        {posting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{posting._count.applications}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(posting.postedAt)}
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

export default CareersListPage;

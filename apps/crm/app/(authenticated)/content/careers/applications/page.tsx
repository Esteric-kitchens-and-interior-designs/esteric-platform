import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database, type JobApplicationStatus } from "@repo/database";
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
import { ArrowLeft, Inbox } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportCsvButton } from "../../../components/export-csv-button";
import { formatDate } from "../../lib/helpers";
import { ApplicationStatusSelect } from "./components/application-status-select";

interface ApplicationsPageProps {
  searchParams: Promise<{ status?: string; posting?: string }>;
}

const ApplicationsPage = async ({ searchParams }: ApplicationsPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { status, posting } = await searchParams;
  const canWrite = hasPermission(staffUser, "content:write");

  const applications = await database.jobApplication.findMany({
    where: {
      status:
        status && status !== "ALL"
          ? (status as JobApplicationStatus)
          : undefined,
      jobPostingId: posting && posting !== "ALL" ? posting : undefined,
    },
    include: { jobPosting: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const postings = await database.jobPosting.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            className="mb-1 inline-flex items-center gap-1 text-muted-foreground text-sm hover:underline"
            href="/content/careers"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Job postings
          </Link>
          <h1 className="font-display font-semibold text-2xl">Applications</h1>
          <p className="text-muted-foreground text-sm">
            Candidates who applied through the public site.
          </p>
        </div>
        <ExportCsvButton
          filename="job-applications"
          headers={[
            "Name",
            "Email",
            "Phone",
            "Position",
            "Status",
            "Resume",
            "Applied",
          ]}
          rows={applications.map((application) => [
            application.name,
            application.email,
            application.phone ?? "",
            application.jobPosting.title,
            application.status,
            application.resumeUrl ?? "",
            application.createdAt.toISOString(),
          ])}
        />
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <Select defaultValue={status ?? "ALL"} name="status">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {(
              [
                "NEW",
                "REVIEWING",
                "SHORTLISTED",
                "REJECTED",
                "HIRED",
              ] satisfies JobApplicationStatus[]
            ).map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue={posting ?? "ALL"} name="posting">
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All positions</SelectItem>
            {postings.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" type="submit" variant="secondary">
          Filter
        </Button>
        {((status && status !== "ALL") || (posting && posting !== "ALL")) && (
          <Button asChild size="sm" variant="ghost">
            <Link href="/content/careers/applications">Clear</Link>
          </Button>
        )}
      </form>

      {applications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>No applications found</EmptyTitle>
            <EmptyDescription>
              Applications submitted through the public Careers page will show
              up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Résumé</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {application.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="hover:underline"
                      href={`/content/careers/${application.jobPosting.id}`}
                    >
                      {application.jobPosting.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {application.resumeUrl ? (
                      <a
                        className="text-primary hover:underline"
                        href={application.resumeUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(application.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusSelect
                      applicationId={application.id}
                      disabled={!canWrite}
                      status={application.status}
                    />
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

export default ApplicationsPage;

import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import {
  database,
  type ProjectStatus,
  type ServiceCategory,
} from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { Progress } from "@repo/design-system/components/ui/progress";
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
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  formatDate,
  projectStatusLabel,
  projectStatusVariant,
  serviceCategoryLabel,
} from "./lib/helpers";

interface ProjectsPageProps {
  searchParams: Promise<{ status?: string; category?: string }>;
}

const ProjectsPage = async ({ searchParams }: ProjectsPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "projects:read")) {
    redirect("/");
  }

  const { status, category } = await searchParams;

  const projects = await database.project.findMany({
    where: {
      status:
        status && status !== "ALL" ? (status as ProjectStatus) : undefined,
      category:
        category && category !== "ALL"
          ? (category as ServiceCategory)
          : undefined,
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const canWrite = hasPermission(staffUser, "projects:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Track active work from kickoff to completion.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/projects/new">
              <Plus /> New project
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
            {Object.entries(projectStatusLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue={category ?? "ALL"} name="category">
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.entries(serviceCategoryLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" type="submit" variant="secondary">
          Filter
        </Button>
        {((status && status !== "ALL") || (category && category !== "ALL")) && (
          <Button asChild size="sm" variant="ghost">
            <Link href="/projects">Clear</Link>
          </Button>
        )}
      </form>

      {projects.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>No projects found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters, or start a new project.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/projects/${project.id}`}
                    >
                      {project.projectNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{project.customer.name}</TableCell>
                  <TableCell className="max-w-64 truncate">
                    {project.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {serviceCategoryLabel[project.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={projectStatusVariant[project.status]}>
                      {projectStatusLabel[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        className="w-20"
                        value={project.completionPercentage}
                      />
                      <span className="text-muted-foreground text-xs">
                        {project.completionPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(project.deadline)}
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

export default ProjectsPage;

import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Progress } from "@repo/design-system/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "../../components/header";
import { projectStatusTone, toneClass } from "../../lib/badges";
import { formatDate, formatMoney, serviceCategoryLabel } from "../lib/helpers";
import { AssignmentsSection } from "./components/assignments-section";
import { DocumentsSection } from "./components/documents-section";
import { MilestonesSection } from "./components/milestones-section";
import { NotesSection } from "./components/notes-section";
import { ProjectStatusSelect } from "./components/status-select";
import { UpdatesSection } from "./components/updates-section";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const ProjectDetailPage = async ({ params }: ProjectDetailPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "projects:read")) {
    redirect("/");
  }

  const { id } = await params;

  const [project, staff] = await Promise.all([
    database.project.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: true,
        assignments: {
          include: { user: true },
          orderBy: { assignedAt: "asc" },
        },
        milestones: { orderBy: { sortOrder: "asc" } },
        updates: { include: { author: true }, orderBy: { createdAt: "desc" } },
        notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
        documents: {
          include: { uploadedBy: true },
          orderBy: { createdAt: "desc" },
        },
        portfolioProject: true,
      },
    }),
    database.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, jobTitle: true },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const canWrite = hasPermission(staffUser, "projects:write");

  return (
    <>
      <Header page={project.projectNumber} pages={["Projects"]} />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-semibold text-2xl">
                {project.projectNumber}
              </h1>
              <Badge
                className={toneClass(projectStatusTone[project.status])}
                variant="outline"
              >
                {project.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline">
                {serviceCategoryLabel[project.category]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{project.title}</p>
          </div>
          {canWrite ? (
            <ProjectStatusSelect
              projectId={project.id}
              status={project.status}
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-normal text-muted-foreground text-xs">
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatMoney(project.budget)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-normal text-muted-foreground text-xs">
                Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">
                {formatDate(project.deadline)}
              </p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-normal text-muted-foreground text-xs">
                Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={project.completionPercentage} />
              <p className="text-muted-foreground text-xs">
                {project.completionPercentage}% complete
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent className="grid gap-6 lg:grid-cols-3" value="overview">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground text-sm">
                    {project.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-medium">{project.customer.name}</p>
                  <p className="text-muted-foreground">
                    {project.customer.email}
                  </p>
                  {project.location ? (
                    <p className="text-muted-foreground">{project.location}</p>
                  ) : null}
                </CardContent>
              </Card>
              {project.quotation ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Source quotation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      className="text-primary text-sm hover:underline"
                      href={`/quotations/${project.quotation.id}`}
                    >
                      {project.quotation.quoteNumber}
                    </Link>
                  </CardContent>
                </Card>
              ) : null}
              {project.portfolioProject ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Public portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      className="text-primary text-sm hover:underline"
                      href={`/content/portfolio/${project.portfolioProject.id}`}
                    >
                      {project.portfolioProject.title}
                    </Link>
                  </CardContent>
                </Card>
              ) : null}
              <Card>
                <CardHeader>
                  <CardTitle>Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start</span>
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline</span>
                    <span>{formatDate(project.deadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{formatDate(project.completedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <div className="max-w-md">
              <AssignmentsSection
                assignments={project.assignments}
                canWrite={canWrite}
                projectId={project.id}
                staffOptions={staff.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName}`,
                  description: s.jobTitle ?? undefined,
                }))}
              />
            </div>
          </TabsContent>

          <TabsContent value="milestones">
            <div className="max-w-2xl">
              <MilestonesSection
                canWrite={canWrite}
                milestones={project.milestones}
                projectId={project.id}
              />
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="max-w-2xl">
              <UpdatesSection
                canWrite={canWrite}
                projectId={project.id}
                updates={project.updates}
              />
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="max-w-2xl">
              <NotesSection
                canWrite={canWrite}
                notes={project.notes}
                projectId={project.id}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="max-w-2xl">
              <DocumentsSection
                canWrite={canWrite}
                documents={project.documents}
                projectId={project.id}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProjectDetailPage;

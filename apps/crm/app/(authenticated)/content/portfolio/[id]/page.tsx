import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { ImageManager } from "../components/image-manager";
import { PortfolioForm } from "../components/portfolio-form";

interface EditPortfolioProjectPageProps {
  params: Promise<{ id: string }>;
}

const EditPortfolioProjectPage = async ({
  params,
}: EditPortfolioProjectPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { id } = await params;

  const portfolioProject = await database.portfolioProject.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!portfolioProject) {
    notFound();
  }

  const internalProjects = await database.project.findMany({
    where: {
      OR: [
        { portfolioProject: null },
        ...(portfolioProject.projectId
          ? [{ id: portfolioProject.projectId }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectNumber: true, title: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">
          {portfolioProject.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          /portfolio/{portfolioProject.slug}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioForm
          initialValue={{
            title: portfolioProject.title,
            slug: portfolioProject.slug,
            category: portfolioProject.category,
            description: portfolioProject.description,
            location: portfolioProject.location,
            completionDate: portfolioProject.completionDate
              ? portfolioProject.completionDate.toISOString().slice(0, 10)
              : null,
            isFeatured: portfolioProject.isFeatured,
            status: portfolioProject.status,
            projectId: portfolioProject.projectId,
            seoTitle: portfolioProject.seoTitle,
            seoDescription: portfolioProject.seoDescription,
          }}
          internalProjects={internalProjects.map((p) => ({
            value: p.id,
            label: p.projectNumber,
            description: p.title,
          }))}
          mode="edit"
          portfolioProjectId={portfolioProject.id}
        />
        <ImageManager
          images={portfolioProject.images}
          portfolioProjectId={portfolioProject.id}
        />
      </div>
    </div>
  );
};

export default EditPortfolioProjectPage;

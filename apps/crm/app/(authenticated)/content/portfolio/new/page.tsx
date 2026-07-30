import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { redirect } from "next/navigation";
import { PortfolioForm } from "../components/portfolio-form";

const NewPortfolioProjectPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:write")) {
    redirect("/content/portfolio");
  }

  const internalProjects = await database.project.findMany({
    where: { portfolioProject: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, projectNumber: true, title: true },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">
          New portfolio project
        </h1>
        <p className="text-muted-foreground text-sm">
          Only published projects appear on the public site.
        </p>
      </div>
      <div className="max-w-3xl">
        <PortfolioForm
          internalProjects={internalProjects.map((p) => ({
            value: p.id,
            label: p.projectNumber,
            description: p.title,
          }))}
          mode="create"
        />
      </div>
    </div>
  );
};

export default NewPortfolioProjectPage;

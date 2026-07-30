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
import { ImageIcon, Plus, Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  contentStatusVariant,
  formatDate,
  serviceCategoryLabel,
} from "../lib/helpers";

const PortfolioListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const projects = await database.portfolioProject.findMany({
    include: { images: { where: { type: "COVER" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Portfolio</h1>
          <p className="text-muted-foreground text-sm">
            Projects shown on the public portfolio gallery.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/content/portfolio/new">
              <Plus /> New project
            </Link>
          </Button>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>No portfolio projects yet</EmptyTitle>
            <EmptyDescription>
              Create one to start building the public gallery.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    {project.images[0] ? (
                      // biome-ignore lint/performance/noImgElement: admin thumbnail from arbitrary blob URL
                      <img
                        alt={project.title}
                        className="size-10 rounded object-cover"
                        height={40}
                        src={project.images[0].url}
                        width={40}
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded bg-muted">
                        <ImageIcon className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/content/portfolio/${project.id}`}
                    >
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {serviceCategoryLabel[project.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={contentStatusVariant[project.status]}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.isFeatured ? (
                      <Star className="size-4 fill-gold text-gold" />
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(project.createdAt)}
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

export default PortfolioListPage;

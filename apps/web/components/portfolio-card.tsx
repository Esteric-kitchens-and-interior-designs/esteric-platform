import { Badge } from "@repo/design-system/components/ui/badge";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";
import type { getFeaturedPortfolioProjects } from "@/lib/queries";
import { serviceCategoryLabels } from "@/lib/services";

type PortfolioProjectWithImages = Awaited<
  ReturnType<typeof getFeaturedPortfolioProjects>
>[number];

interface PortfolioCardProps {
  readonly project: PortfolioProjectWithImages;
}

export const PortfolioCard = ({ project }: PortfolioCardProps) => {
  const cover =
    project.images.find((image) => image.type === "COVER") ?? project.images[0];

  return (
    <Link
      className="group flex flex-col gap-4 rounded-md"
      href={`/portfolio/${project.slug}`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-md">
        {/* TODO: replace with real cover photography for this project once uploaded */}
        <ImagePlaceholder
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          label={cover?.caption ?? project.title}
          tone="charcoal"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {serviceCategoryLabels[project.category]}
          </Badge>
          {project.location ? (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" /> {project.location}
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-lg tracking-tight transition-colors group-hover:text-primary">
          {project.title}
        </h3>
      </div>
    </Link>
  );
};

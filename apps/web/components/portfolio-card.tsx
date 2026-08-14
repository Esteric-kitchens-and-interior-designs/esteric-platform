import { Badge } from "@repo/design-system/components/ui/badge";
import { MapPin } from "lucide-react";
import Image from "next/image";
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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
        {cover ? (
          <Image
            alt={cover.altText ?? cover.caption ?? project.title}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={cover.url}
          />
        ) : (
          <ImagePlaceholder
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
            label={project.title}
            tone="charcoal"
          />
        )}
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

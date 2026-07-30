import { Button } from "@repo/design-system/components/ui/button";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { PortfolioCard } from "@/components/portfolio-card";
import type { getFeaturedPortfolioProjects } from "@/lib/queries";

interface FeaturedPortfolioProps {
  readonly projects: Awaited<ReturnType<typeof getFeaturedPortfolioProjects>>;
}

export const FeaturedPortfolio = ({ projects }: FeaturedPortfolioProps) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
              Recent work
            </h2>
            <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
              A selection of kitchens, interiors, and landscapes we've recently
              completed.
            </p>
          </div>
          <Button asChild className="gap-2 self-start" variant="outline">
            <Link href="/portfolio">
              View full portfolio <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

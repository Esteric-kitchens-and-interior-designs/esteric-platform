import { ServiceCategory } from "@repo/database/generated/enums";
import { cn } from "@repo/design-system/lib/utils";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioCard } from "@/components/portfolio-card";
import { getPortfolioProjects } from "@/lib/queries";
import { serviceCategoryLabels } from "@/lib/services";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Portfolio",
    description:
      "Explore completed kitchen, interior, landscaping, and cabinetry projects by Esteric Kitchens & Interior Designs.",
  });

interface PortfolioPageProps {
  readonly searchParams: Promise<{ category?: string }>;
}

const filters = [
  { label: "All", value: undefined },
  ...Object.values(ServiceCategory).map((category) => ({
    label: serviceCategoryLabels[category],
    value: category,
  })),
];

const PortfolioPage = async ({ searchParams }: PortfolioPageProps) => {
  const { category } = await searchParams;
  const activeCategory = Object.values(ServiceCategory).includes(
    category as ServiceCategory
  )
    ? (category as ServiceCategory)
    : undefined;

  const projects = await getPortfolioProjects(activeCategory);

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Our Portfolio
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            A selection of completed kitchens, interiors, landscapes, and
            bespoke cabinetry projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter.value === activeCategory;
            const href = filter.value
              ? `/portfolio?category=${filter.value}`
              : "/portfolio";

            return (
              <Link
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
                href={href}
                key={filter.label}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <PortfolioCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No published projects in this category yet — check back soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;

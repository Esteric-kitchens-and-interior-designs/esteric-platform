import { Button } from "@repo/design-system/components/ui/button";
import { CheckCircle2, MoveRight } from "lucide-react";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PortfolioCard } from "@/components/portfolio-card";
import { getPortfolioProjects } from "@/lib/queries";
import type { ServiceDefinition } from "@/lib/services";

interface ServicePageContentProps {
  readonly service: ServiceDefinition;
}

export const ServicePageContent = async ({
  service,
}: ServicePageContentProps) => {
  const projects = await getPortfolioProjects(service.category);

  return (
    <div className="w-full">
      <div className="container mx-auto flex flex-col gap-20 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <span className="font-medium text-primary text-xs uppercase tracking-[0.2em]">
              {service.shortTitle}
            </span>
            <h1 className="max-w-xl text-left font-display font-regular text-4xl tracking-tighter md:text-5xl">
              {service.title}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="gap-2" size="lg">
                <Link href={`/quote?service=${service.category}`}>
                  Request a Quote <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="gap-2" size="lg" variant="outline">
                <Link href={`/appointment?service=${service.category}`}>
                  Book a Consultation
                </Link>
              </Button>
            </div>
          </div>
          {/* TODO: replace with a hero photograph representative of this service */}
          <ImagePlaceholder
            className="aspect-[4/3] w-full"
            icon={service.icon}
            label={service.shortTitle}
            tone="gold"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">
              What's included
            </h2>
            <ul className="flex flex-col gap-3">
              {service.highlights.map((highlight) => (
                <li className="flex items-start gap-3" key={highlight}>
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.5}
                  />
                  <span className="text-muted-foreground">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">
              Our process
            </h2>
            <ol className="flex flex-col gap-4">
              {service.process.map((step, index) => (
                <li className="flex items-start gap-4" key={step.title}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-primary text-sm">
                    {index + 1}
                  </span>
                  <div className="flex flex-col">
                    <p className="font-medium">{step.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl tracking-tight md:text-3xl">
                {service.shortTitle} projects
              </h2>
              <p className="text-muted-foreground">
                A selection of recent {service.shortTitle.toLowerCase()} work.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <PortfolioCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-6 rounded-md bg-secondary p-10 text-center text-secondary-foreground lg:p-16">
          <h2 className="max-w-xl font-display font-regular text-3xl tracking-tighter md:text-4xl">
            Ready to talk about your {service.shortTitle.toLowerCase()} project?
          </h2>
          <p className="max-w-xl text-secondary-foreground/75 leading-relaxed">
            Share a few details and our design team will follow up within one
            business day.
          </p>
          <Button asChild size="lg">
            <Link href={`/quote?service=${service.category}`}>
              Request a Quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

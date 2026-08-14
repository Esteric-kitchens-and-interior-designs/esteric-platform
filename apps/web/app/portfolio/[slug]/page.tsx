import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { createMetadata } from "@repo/seo/metadata";
import { format } from "date-fns";
import { ArrowLeftIcon, CalendarDays, MapPin, MoveRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { RatingStars } from "@/components/rating-stars";
import { getPortfolioProjectBySlug } from "@/lib/queries";
import { serviceCategoryLabels } from "@/lib/services";

interface PortfolioDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

type PortfolioImage = NonNullable<
  Awaited<ReturnType<typeof getPortfolioProjectBySlug>>
>["images"][number];

export const generateMetadata = async ({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return createMetadata({
    title: project.seoTitle ?? project.title,
    description:
      project.seoDescription ??
      project.description ??
      `${project.title} by Esteric Kitchens & Interior Designs.`,
  });
};

const BEFORE_AFTER_BADGE_CLASSES = {
  before: "bg-charcoal/85 text-secondary-foreground",
  after: "bg-gold text-gold-foreground",
} as const;

const BeforeAfterColumn = ({
  images,
  label,
  tone,
}: {
  images: PortfolioImage[];
  label: string;
  tone: keyof typeof BEFORE_AFTER_BADGE_CLASSES;
}) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        images.length > 1 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {images.map((image) => (
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl shadow-sm"
          key={image.id}
        >
          <Image
            alt={image.altText ?? image.caption ?? label}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            src={image.url}
          />
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1 font-display text-xs uppercase tracking-widest backdrop-blur-sm",
              BEFORE_AFTER_BADGE_CLASSES[tone]
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PortfolioDetailPage = async ({ params }: PortfolioDetailPageProps) => {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const cover = project.images.find((image) => image.type === "COVER");
  const before = project.images.filter((image) => image.type === "BEFORE");
  const after = project.images.filter((image) => image.type === "AFTER");
  const gallery = project.images.filter(
    (image) => image.type === "PROGRESS" || image.type === "GALLERY"
  );
  const testimonial = project.testimonials[0];

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-14">
        <Link
          className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-primary"
          href="/portfolio"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Portfolio
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Badge className="w-fit" variant="outline">
              {serviceCategoryLabels[project.category]}
            </Badge>
            <h1 className="font-display font-regular text-4xl tracking-tighter md:text-5xl">
              {project.title}
            </h1>
            {project.description ? (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-6 text-muted-foreground text-sm">
              {project.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {project.location}
                </span>
              ) : null}
              {project.completionDate ? (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {format(project.completionDate, "MMMM yyyy")}
                </span>
              ) : null}
            </div>
            <Button asChild className="w-fit gap-2" size="lg">
              <Link href={`/quote?service=${project.category}`}>
                Start a similar project <MoveRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {cover ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
              <Image
                alt={cover.altText ?? cover.caption ?? project.title}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                src={cover.url}
              />
            </div>
          ) : (
            <ImagePlaceholder
              className="aspect-[4/3] w-full"
              label={project.title}
              tone="gold"
            />
          )}
        </div>

        {before.length > 0 || after.length > 0 ? (
          <div className="flex flex-col gap-8 rounded-2xl border bg-muted/30 p-6 sm:p-10">
            <div className="flex flex-col gap-2 text-center">
              <span className="text-primary text-xs uppercase tracking-[0.3em]">
                The Transformation
              </span>
              <h2 className="font-display text-2xl tracking-tight md:text-3xl">
                Before &amp; After
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BeforeAfterColumn images={before} label="Before" tone="before" />
              <BeforeAfterColumn images={after} label="After" tone="after" />
            </div>
          </div>
        ) : null}

        {gallery.length > 0 ? (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl tracking-tight md:text-3xl">
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {gallery.map((image) => (
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-md"
                  key={image.id}
                >
                  <Image
                    alt={image.altText ?? image.caption ?? project.title}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    src={image.url}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {testimonial ? (
          <div className="flex flex-col gap-4 rounded-md border bg-muted/40 p-8">
            <RatingStars rating={testimonial.rating} />
            <p className="max-w-2xl text-lg leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <p className="font-medium">{testimonial.customerName}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PortfolioDetailPage;

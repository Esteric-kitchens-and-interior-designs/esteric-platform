import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Badge } from "@repo/design-system/components/ui/badge";
import { createMetadata } from "@repo/seo/metadata";
import { Quote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { getAllTestimonials } from "@/lib/queries";
import { serviceCategoryLabels } from "@/lib/services";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Testimonials",
    description:
      "What clients say about working with Esteric Kitchens & Interior Designs.",
  });

const TestimonialsPage = async () => {
  const testimonials = await getAllTestimonials();

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
            Client Testimonials
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            Real feedback from homeowners and clients we've worked with.
          </p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div
                className="flex h-full flex-col justify-between gap-6 rounded-md border bg-card p-6"
                key={testimonial.id}
              >
                <Quote className="h-6 w-6 text-primary/50" strokeWidth={1.5} />
                <div className="flex flex-col gap-3">
                  <RatingStars rating={testimonial.rating} />
                  <p className="text-base leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={testimonial.photoUrl ?? undefined} />
                      <AvatarFallback>
                        {testimonial.customerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {testimonial.customerName}
                    </span>
                  </div>
                  {testimonial.portfolioProject ? (
                    <Link
                      href={`/portfolio/${testimonial.portfolioProject.slug}`}
                    >
                      <Badge className="cursor-pointer" variant="outline">
                        {
                          serviceCategoryLabels[
                            testimonial.portfolioProject.category
                          ]
                        }
                      </Badge>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No testimonials published yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default TestimonialsPage;

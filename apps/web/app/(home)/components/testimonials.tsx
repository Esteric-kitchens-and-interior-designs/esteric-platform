import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import { MoveRight, Quote } from "lucide-react";
import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import type { getFeaturedTestimonials } from "@/lib/queries";

interface TestimonialsProps {
  readonly testimonials: Awaited<ReturnType<typeof getFeaturedTestimonials>>;
}

export const Testimonials = ({ testimonials }: TestimonialsProps) => {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-muted/40 py-16 lg:py-24">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            What our clients say
          </h2>
          <Button asChild className="gap-2 self-start" variant="outline">
            <Link href="/testimonials">
              Read all reviews <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={testimonial.photoUrl ?? undefined} />
                  <AvatarFallback>
                    {testimonial.customerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{testimonial.customerName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

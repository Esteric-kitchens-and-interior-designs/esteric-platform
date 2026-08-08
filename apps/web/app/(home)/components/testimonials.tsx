import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import { Quote } from "lucide-react";
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
    <div
      className="w-full scroll-mt-20 bg-muted/40 py-16 lg:py-24"
      id="testimonials"
    >
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="max-w-xl text-left font-display font-regular text-3xl tracking-tighter md:text-5xl">
            What our clients say
          </h2>
          <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight">
            Real feedback from homeowners and clients we've worked with.
          </p>
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

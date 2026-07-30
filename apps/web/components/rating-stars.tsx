import { cn } from "@repo/design-system/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  readonly className?: string;
  readonly rating: number;
}

export const RatingStars = ({ rating, className }: RatingStarsProps) => (
  <div
    aria-label={`${rating} out of 5 stars`}
    className={cn("flex items-center gap-0.5", className)}
    role="img"
  >
    {Array.from({ length: 5 }).map((_, index) => (
      <Star
        className={cn(
          "h-4 w-4",
          index < rating
            ? "fill-gold text-gold"
            : "fill-transparent text-muted-foreground"
        )}
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static rating scale
        key={index}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

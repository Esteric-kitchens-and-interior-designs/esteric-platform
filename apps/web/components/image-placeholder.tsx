import { cn } from "@repo/design-system/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  readonly className?: string;
  readonly icon?: LucideIcon;
  readonly label?: string;
  readonly tone?: "gold" | "charcoal" | "emerald";
}

const toneClasses: Record<
  NonNullable<ImagePlaceholderProps["tone"]>,
  string
> = {
  gold: "from-gold/50 via-charcoal to-charcoal text-gold-foreground",
  charcoal: "from-charcoal via-charcoal to-gold/20 text-secondary-foreground",
  emerald: "from-emerald/40 via-charcoal to-charcoal text-secondary-foreground",
};

/**
 * Elegant stand-in for real photography. Renders a brand-toned gradient
 * panel with a centered icon and label so placeholders read as intentional
 * design, not broken images. Callers should leave a `{/* TODO: replace
 * with photography of ... *\/}` comment at the call site describing the
 * real photo that belongs there.
 */
export const ImagePlaceholder = ({
  label,
  icon: Icon = ImageIcon,
  className,
  tone = "gold",
}: ImagePlaceholderProps) => (
  <div
    className={cn(
      "relative flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br",
      toneClasses[tone],
      className
    )}
  >
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,currentColor_0,currentColor_1px,transparent_1px,transparent_12px)]"
    />
    <div className="relative flex flex-col items-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-current/30">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      {label ? (
        <span className="font-display text-xs uppercase tracking-[0.2em] opacity-80">
          {label}
        </span>
      ) : null}
    </div>
  </div>
);

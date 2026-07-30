// Simple inline WhatsApp glyph — lucide-react doesn't ship a brand icon for
// it, and pulling in a whole icon-brand package for one glyph isn't worth
// the dependency, so this is a minimal hand-drawn SVG approximation.
export const WhatsAppIcon = ({
  className,
}: {
  readonly className?: string;
}) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.33-1.93 1.4-.51.08-1.14.11-1.84-.11-.42-.13-.96-.31-1.66-.6-2.92-1.26-4.83-4.18-4.98-4.38-.14-.19-1.2-1.59-1.2-3.04s.75-2.16 1.02-2.46c.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.81 2.01.88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.45.29.15.46.13.63-.06.17-.19.72-.83.91-1.12.19-.28.38-.23.63-.14.26.1 1.64.77 1.92.91.29.14.48.21.55.33.07.13.07.71-.17 1.39Z" />
  </svg>
);

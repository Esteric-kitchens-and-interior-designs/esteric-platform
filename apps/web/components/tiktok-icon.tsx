// Inline TikTok glyph — lucide-react doesn't ship a brand icon for it, and
// pulling in a whole icon-brand package for one glyph isn't worth the
// dependency, so this is a minimal hand-drawn SVG approximation.
export const TikTokIcon = ({ className }: { readonly className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.6 5.82c-1.1-.96-1.77-2.33-1.84-3.82H11.8v14.06c0 1.5-1.22 2.72-2.72 2.72-1.5 0-2.72-1.22-2.72-2.72 0-1.5 1.22-2.72 2.72-2.72.28 0 .55.04.8.12v-3.02c-.26-.04-.53-.06-.8-.06-3.2 0-5.8 2.6-5.8 5.8 0 3.2 2.6 5.8 5.8 5.8 3.2 0 5.8-2.6 5.8-5.8V9.1a8.63 8.63 0 0 0 5.03 1.61V7.65c-1.13 0-2.18-.34-3.03-1.02-.28-.22-.53-.51-.5-.81Z" />
  </svg>
);

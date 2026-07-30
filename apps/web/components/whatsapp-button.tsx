import { whatsappHref } from "@/lib/site-config";
import { WhatsAppIcon } from "./whatsapp-icon";

export const WhatsAppButton = () => (
  <a
    aria-label="Chat with us on WhatsApp"
    className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-secondary-foreground shadow-lg transition-transform hover:scale-105 md:right-8 md:bottom-8"
    href={whatsappHref}
    rel="noopener noreferrer"
    target="_blank"
  >
    <WhatsAppIcon className="h-7 w-7" />
  </a>
);

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Gem } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

// No public sign-up: staff accounts are provisioned by an admin (Clerk
// invitation or Staff Management → Invite), then land here to sign in.
const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="container relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
    <div className="relative hidden h-full flex-col bg-charcoal p-10 text-secondary-foreground lg:flex">
      <div className="relative z-20 flex items-center gap-2 font-display font-medium text-gold text-lg">
        <Gem className="h-6 w-6" />
        Esteric CRM
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="relative z-20 mt-auto">
        <blockquote className="space-y-2">
          <p className="font-display text-lg italic">
            &ldquo;Craftsmanship, trust, and design — managed in one
            place.&rdquo;
          </p>
          <footer className="text-secondary-foreground/70 text-sm">
            Esteric Kitchens &amp; Interior Designs
          </footer>
        </blockquote>
      </div>
    </div>
    <div className="lg:p-8">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;

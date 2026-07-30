"use client";

import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Button } from "@repo/design-system/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@repo/design-system/components/ui/navigation-menu";
import { Menu, MoveRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { env } from "@/env";
import { services } from "@/lib/services";

interface NavItem {
  description?: string;
  href?: string;
  items?: { title: string; href: string; description?: string }[];
  title: string;
}

const navigationItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  {
    title: "Services",
    description: "Kitchen, interior, landscaping, and cabinetry design.",
    items: services.map((service) => ({
      title: service.shortTitle,
      href: `/${service.slug}`,
      description: service.tagline,
    })),
  },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Blog", href: "/blog" },
  { title: "Testimonials", href: "/testimonials" },
  { title: "Certifications", href: "/certifications" },
  { title: "FAQs", href: "/faqs" },
  { title: "Contact", href: "/contact" },
];

export const Header = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container relative mx-auto flex min-h-20 flex-row items-center justify-between gap-4">
        <Link className="flex shrink-0 items-center gap-2" href="/">
          <span className="whitespace-nowrap font-display text-lg tracking-tight">
            Esteric
            <span className="text-primary"> Kitchens</span>
          </span>
        </Link>

        <div className="hidden flex-1 flex-row items-center justify-center lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="flex flex-row flex-wrap justify-center gap-1">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <NavigationMenuLink asChild>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={item.href}>{item.title}</Link>
                      </Button>
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[480px] p-4">
                        <div className="flex grid-cols-2 flex-col gap-4 lg:grid">
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button asChild className="mt-10" size="sm">
                              <Link href="/quote">Request a quote</Link>
                            </Button>
                          </div>
                          <div className="flex h-full flex-col justify-end text-sm">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                className="flex flex-row items-center justify-between rounded px-4 py-2 hover:bg-muted"
                                href={subItem.href}
                                key={subItem.href}
                              >
                                <span>{subItem.title}</span>
                                <MoveRight className="h-4 w-4 text-muted-foreground" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ModeToggle />
          <Link
            className="whitespace-nowrap text-muted-foreground text-sm underline-offset-4 hover:underline"
            href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
          >
            Staff Sign In
          </Link>
          <Button asChild className="gap-2">
            <Link href="/quote">
              Get a Quote <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ModeToggle />
          <Button onClick={() => setOpen(!isOpen)} size="icon" variant="ghost">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isOpen ? (
          <div className="container absolute top-20 right-0 flex w-full flex-col gap-6 border-t bg-background py-6 shadow-lg lg:hidden">
            {navigationItems.map((item) => (
              <div key={item.title}>
                <div className="flex flex-col gap-2">
                  {item.href ? (
                    <Link
                      className="flex items-center justify-between"
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-lg">{item.title}</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                  ) : (
                    <p className="text-lg">{item.title}</p>
                  )}
                  {item.items?.map((subItem) => (
                    <Link
                      className="flex items-center justify-between pl-4"
                      href={subItem.href}
                      key={subItem.title}
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-muted-foreground">
                        {subItem.title}
                      </span>
                      <MoveRight className="h-4 w-4 stroke-1" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-3 border-t pt-4">
              <Button
                asChild
                className="w-full gap-2"
                onClick={() => setOpen(false)}
              >
                <Link href="/quote">
                  Get a Quote <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
              <Link
                className="text-center text-muted-foreground text-sm underline-offset-4 hover:underline"
                href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
              >
                Staff Sign In
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

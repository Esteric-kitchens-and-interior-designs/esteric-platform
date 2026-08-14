"use client";

import { dark } from "@clerk/themes";
import { UserButton, useClerk } from "@repo/auth/client";
import { hasPermission } from "@repo/auth/permissions";
import type { getCurrentStaffUser } from "@repo/auth/rbac";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@repo/design-system/components/ui/sidebar";
import {
  Award,
  Briefcase,
  ClipboardList,
  ExternalLink,
  FileText,
  GalleryHorizontalEnd,
  Gauge,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  MessageSquareQuote,
  Newspaper,
  ShieldCheck,
  Users,
  Users2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { Search } from "./search";

// @clerk/types' `Appearance<Theme>` generic has drifted out of sync with
// what @clerk/nextjs's UserButton actually accepts at this version pin;
// baseTheme/elements are stable, documented Clerk appearance options at
// runtime regardless (see packages/auth/provider.tsx for the same cast).
type UserButtonAppearance = ComponentProps<typeof UserButton>["appearance"];

type StaffUser = NonNullable<Awaited<ReturnType<typeof getCurrentStaffUser>>>;

interface GlobalSidebarProperties {
  readonly children: ReactNode;
  readonly staffUser: StaffUser;
  readonly webUrl: string;
}

interface NavItem {
  icon: typeof LayoutDashboard;
  permission?: string;
  title: string;
  url: string;
}

const navMain: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Gauge, permission: "leads:read" },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    permission: "customers:read",
  },
  {
    title: "Quotations",
    url: "/quotations",
    icon: MessageSquareQuote,
    permission: "quotations:read",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: ClipboardList,
    permission: "projects:read",
  },
];

const navContent: NavItem[] = [
  {
    title: "Portfolio",
    url: "/content/portfolio",
    icon: ImageIcon,
    permission: "content:read",
  },
  {
    title: "Hero Images",
    url: "/content/hero-images",
    icon: GalleryHorizontalEnd,
    permission: "content:read",
  },
  {
    title: "Service Images",
    url: "/content/service-images",
    icon: LayoutGrid,
    permission: "content:read",
  },
  {
    title: "Blog",
    url: "/content/blog",
    icon: Newspaper,
    permission: "content:read",
  },
  {
    title: "Certifications & Awards",
    url: "/content/certifications",
    icon: Award,
    permission: "content:read",
  },
  {
    title: "Testimonials",
    url: "/content/testimonials",
    icon: FileText,
    permission: "content:read",
  },
  {
    title: "FAQs",
    url: "/content/faqs",
    icon: FileText,
    permission: "content:read",
  },
  {
    title: "Newsletter",
    url: "/content/newsletter",
    icon: Mail,
    permission: "content:read",
  },
  {
    title: "Careers",
    url: "/content/careers",
    icon: Briefcase,
    permission: "content:read",
  },
];

const navAdmin: NavItem[] = [
  { title: "Staff & Roles", url: "/staff", icon: Users2 },
  { title: "Activity Log", url: "/activity-log", icon: History },
];

const NavGroup = ({
  label,
  items,
  staffUser,
  pathname,
}: {
  label: string;
  items: NavItem[];
  staffUser: StaffUser;
  pathname: string;
}) => {
  const visible = items.filter(
    (item) => !item.permission || hasPermission(staffUser, item.permission)
  );
  const { setOpenMobile } = useSidebar();

  if (visible.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {visible.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url)
              }
              tooltip={item.title}
            >
              <Link href={item.url} onClick={() => setOpenMobile(false)}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export const GlobalSidebar = ({
  children,
  staffUser,
  webUrl,
}: GlobalSidebarProperties) => {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href="/" onClick={() => setOpenMobile(false)}>
                  <Image
                    alt="Esteric"
                    className="size-6 shrink-0"
                    height={48}
                    src="/images/logo/esteric-mark.png"
                    width={48}
                  />
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-display font-semibold">
                      Esteric CRM
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {staffUser.role.name}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Search />
        <SidebarContent>
          <NavGroup
            items={navMain}
            label="Pipeline"
            pathname={pathname}
            staffUser={staffUser}
          />
          <NavGroup
            items={navContent}
            label="Content"
            pathname={pathname}
            staffUser={staffUser}
          />
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <NavGroup
                items={navAdmin}
                label="Admin"
                pathname={pathname}
                staffUser={staffUser}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href={webUrl} rel="noreferrer" target="_blank">
                  <ExternalLink />
                  <span>View website</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <div className="flex min-w-0 items-center gap-2">
              <UserButton
                appearance={
                  {
                    baseTheme: dark,
                    elements: {
                      rootBox: "flex overflow-hidden",
                      userButtonBox: "flex-row-reverse",
                      userButtonOuterIdentifier:
                        "truncate pl-0 text-sidebar-foreground",
                    },
                  } as UserButtonAppearance
                }
                showName
              />
              {staffUser.role.name === "Super Admin" && (
                <Badge className="shrink-0 gap-1" variant="outline">
                  <ShieldCheck className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <ModeToggle />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => signOut()}>
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};

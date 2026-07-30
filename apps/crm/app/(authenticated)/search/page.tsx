import { database } from "@repo/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "../components/header";
import { formatDate } from "../lib/format";

interface SearchPageProperties {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: q ? `${q} - Search results` : "Search",
    description: `Search results for ${q ?? ""}`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;

  if (!q) {
    redirect("/");
  }

  const [leads, customers, quotations, projects] = await Promise.all([
    database.lead.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    database.customer.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    database.quotation.findMany({
      where: {
        OR: [
          { quoteNumber: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    database.project.findMany({
      where: {
        OR: [
          { projectNumber: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const groups = [
    {
      title: "Leads",
      items: leads.map((l) => ({
        id: l.id,
        primary: l.name,
        secondary: l.email,
        href: `/leads/${l.id}`,
        meta: formatDate(l.createdAt),
      })),
    },
    {
      title: "Customers",
      items: customers.map((c) => ({
        id: c.id,
        primary: c.name,
        secondary: c.email,
        href: `/customers/${c.id}`,
        meta: formatDate(c.createdAt),
      })),
    },
    {
      title: "Quotations",
      items: quotations.map((qt) => ({
        id: qt.id,
        primary: qt.quoteNumber,
        secondary: qt.title,
        href: `/quotations/${qt.id}`,
        meta: formatDate(qt.createdAt),
      })),
    },
    {
      title: "Projects",
      items: projects.map((p) => ({
        id: p.id,
        primary: p.projectNumber,
        secondary: p.title,
        href: `/projects/${p.id}`,
        meta: formatDate(p.createdAt),
      })),
    },
  ];

  const totalResults = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      <Header page="Search" pages={[]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="font-display font-semibold text-2xl">
          Results for &ldquo;{q}&rdquo;
        </h1>

        {totalResults === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No results found</EmptyTitle>
              <EmptyDescription>
                Try a different name, email, quote number, or project number.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups
              .filter((g) => g.items.length > 0)
              .map((group) => (
                <Card key={group.title}>
                  <CardHeader>
                    <CardTitle>
                      {group.title}{" "}
                      <span className="font-normal text-muted-foreground">
                        ({group.items.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-2">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <Link
                            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                            href={item.href}
                          >
                            <span className="min-w-0 truncate">
                              <span className="font-medium">
                                {item.primary}
                              </span>{" "}
                              {item.secondary && (
                                <span className="text-muted-foreground">
                                  {item.secondary}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-muted-foreground text-xs">
                              {item.meta}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchPage;

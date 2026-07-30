import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/design-system/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import { MessageSquareQuote, Plus, Star } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const TestimonialsListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const testimonials = await database.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            Customer quotes shown on the public site.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/content/testimonials/new">
              <Plus /> New testimonial
            </Link>
          </Button>
        ) : null}
      </div>

      {testimonials.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareQuote />
            </EmptyMedia>
            <EmptyTitle>No testimonials yet</EmptyTitle>
            <EmptyDescription>Add your first customer quote.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/content/testimonials/${testimonial.id}`}
                    >
                      {testimonial.customerName}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-80 truncate">
                    {testimonial.quote}
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, i) => (
                          <Star
                            className="size-3.5 fill-gold text-gold"
                            // biome-ignore lint/suspicious/noArrayIndexKey: decorative rating stars, fixed count, never reordered
                            key={`${testimonial.id}-star-${i}`}
                          />
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{testimonial.isFeatured ? "Yes" : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={testimonial.isPublished ? "default" : "outline"}
                    >
                      {testimonial.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TestimonialsListPage;

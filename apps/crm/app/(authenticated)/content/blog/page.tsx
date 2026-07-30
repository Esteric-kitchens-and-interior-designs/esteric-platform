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
import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { contentStatusVariant, formatDate } from "../lib/helpers";

const BlogListPage = async () => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const posts = await database.blogPost.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  const canWrite = hasPermission(staffUser, "content:write");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-semibold text-2xl">Blog</h1>
          <p className="text-muted-foreground text-sm">
            Articles published on the public site.
          </p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/content/blog/new">
              <Plus /> New post
            </Link>
          </Button>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper />
            </EmptyMedia>
            <EmptyTitle>No blog posts yet</EmptyTitle>
            <EmptyDescription>Write your first article.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:underline"
                      href={`/content/blog/${post.id}`}
                    >
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {post.author.firstName} {post.author.lastName}
                  </TableCell>
                  <TableCell>{post.category ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={contentStatusVariant[post.status]}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.viewCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(post.publishedAt)}
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

export default BlogListPage;

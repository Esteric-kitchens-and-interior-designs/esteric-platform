import { getCurrentStaffUser, hasPermission } from "@repo/auth/rbac";
import { database } from "@repo/database";
import { notFound, redirect } from "next/navigation";
import { BlogForm } from "../components/blog-form";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

const EditBlogPostPage = async ({ params }: EditBlogPostPageProps) => {
  const staffUser = await getCurrentStaffUser();
  if (!hasPermission(staffUser, "content:read")) {
    redirect("/");
  }

  const { id } = await params;

  const post = await database.blogPost.findUnique({ where: { id } });

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">{post.title}</h1>
        <p className="text-muted-foreground text-sm">/blog/{post.slug}</p>
      </div>
      <div className="max-w-3xl">
        <BlogForm
          initialValue={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImageUrl: post.coverImageUrl,
            category: post.category,
            tags: post.tags,
            status: post.status,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
          }}
          mode="edit"
          postId={post.id}
        />
      </div>
    </div>
  );
};

export default EditBlogPostPage;

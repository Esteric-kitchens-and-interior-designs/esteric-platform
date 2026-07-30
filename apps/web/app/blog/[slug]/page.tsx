import { Badge } from "@repo/design-system/components/ui/badge";
import { createMetadata } from "@repo/seo/metadata";
import { format } from "date-fns";
import { ArrowLeftIcon, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { getBlogPostBySlug } from "@/lib/queries";

interface BlogPostPageProps {
  readonly params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
  params,
}: BlogPostPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  return createMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? post.title,
  });
};

const BlogPostPage = async ({ params }: BlogPostPageProps) => {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="w-full py-16 lg:py-24">
      <div className="container mx-auto flex max-w-3xl flex-col gap-8">
        <Link
          className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-primary"
          href="/blog"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog
        </Link>

        <div className="flex flex-col gap-4">
          {post.category ? (
            <Badge className="w-fit" variant="outline">
              {post.category}
            </Badge>
          ) : null}
          <h1 className="font-display font-regular text-4xl tracking-tighter md:text-5xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
            <span>
              By {post.author.firstName} {post.author.lastName}
            </span>
            {post.publishedAt ? (
              <>
                <span aria-hidden>·</span>
                <span>{format(post.publishedAt, "MMMM d, yyyy")}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* TODO: replace with the post's real cover image */}
        <ImagePlaceholder
          className="aspect-[16/9] w-full"
          icon={Newspaper}
          tone="gold"
        />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static content split, stable per render
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t pt-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BlogPostPage;

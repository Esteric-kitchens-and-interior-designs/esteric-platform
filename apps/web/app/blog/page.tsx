import type { Blog, WithContext } from "@repo/seo/json-ld";
import { JsonLd } from "@repo/seo/json-ld";
import { createMetadata } from "@repo/seo/metadata";
import { format } from "date-fns";
import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { getPublishedBlogPosts } from "@/lib/queries";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Blog",
    description:
      "News, inspiration, and updates from Esteric Kitchens & Interior Designs.",
  });

const BlogIndex = async () => {
  const posts = await getPublishedBlogPosts();

  const jsonLd: WithContext<Blog> = {
    "@type": "Blog",
    "@context": "https://schema.org",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.publishedAt?.toISOString(),
    })),
  };

  return (
    <>
      <JsonLd code={jsonLd} />
      <div className="w-full py-16 lg:py-24">
        <div className="container mx-auto flex flex-col gap-14">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="max-w-xl font-display font-regular text-4xl tracking-tighter md:text-5xl">
                Blog
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                Design inspiration, project updates, and notes from our studio.
              </p>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  className="group flex flex-col gap-4"
                  href={`/blog/${post.slug}`}
                  key={post.id}
                >
                  {/* TODO: replace with the post's real cover image */}
                  <ImagePlaceholder
                    className="aspect-[4/3] w-full"
                    icon={Newspaper}
                    tone="emerald"
                  />
                  <div className="flex flex-col gap-1">
                    {post.category ? (
                      <span className="font-medium text-primary text-xs uppercase tracking-widest">
                        {post.category}
                      </span>
                    ) : null}
                    <h2 className="font-display text-xl tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="line-clamp-2 text-muted-foreground text-sm">
                        {post.excerpt}
                      </p>
                    ) : null}
                    {post.publishedAt ? (
                      <span className="text-muted-foreground text-xs">
                        {format(post.publishedAt, "MMMM d, yyyy")}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              New articles coming soon. Check back for design inspiration and
              project updates.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogIndex;

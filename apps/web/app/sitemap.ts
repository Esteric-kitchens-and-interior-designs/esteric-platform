import { database } from "@repo/database";
import type { MetadataRoute } from "next";
import { env } from "@/env";

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith("https")
  ? "https"
  : "http";
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

const staticRoutes = [
  "/",
  "/about",
  "/kitchen-designs",
  "/interior-designs",
  "/landscaping",
  "/wardrobes-cabinets",
  "/portfolio",
  "/blog",
  "/careers",
  "/contact",
  "/quote",
  "/appointment",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/accessibility",
];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [portfolioProjects, blogPosts, jobPostings] = await Promise.all([
    database.portfolioProject.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    database.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    database.jobPosting.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: new URL(route, url).href,
      lastModified: new Date(),
    })),
    ...portfolioProjects.map((project) => ({
      url: new URL(`/portfolio/${project.slug}`, url).href,
      lastModified: project.updatedAt,
    })),
    ...blogPosts.map((post) => ({
      url: new URL(`/blog/${post.slug}`, url).href,
      lastModified: post.updatedAt,
    })),
    ...jobPostings.map((posting) => ({
      url: new URL(`/careers/${posting.slug}`, url).href,
      lastModified: posting.updatedAt,
    })),
  ];
};

export default sitemap;

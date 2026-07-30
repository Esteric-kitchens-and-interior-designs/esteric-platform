import "server-only";

import { database, type ServiceCategory } from "@repo/database";

// Centralized Prisma queries for public marketing pages. Every query here
// is scoped to published/publicly-visible content only — draft rows
// managed in the CRM never reach these functions.

export const getFeaturedPortfolioProjects = (take = 6) =>
  database.portfolioProject.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { publishedAt: "desc" },
    take,
  });

export const getPortfolioProjects = (category?: ServiceCategory) =>
  database.portfolioProject.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { publishedAt: "desc" },
  });

export const getPortfolioProjectBySlug = (slug: string) =>
  database.portfolioProject.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      testimonials: { where: { isPublished: true } },
    },
  });

export const getFeaturedTestimonials = (take = 6) =>
  database.testimonial.findMany({
    where: { isPublished: true, isFeatured: true },
    include: { portfolioProject: true },
    orderBy: { sortOrder: "asc" },
    take,
  });

export const getAllTestimonials = () =>
  database.testimonial.findMany({
    where: { isPublished: true },
    include: { portfolioProject: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

export const getPublishedCertifications = () =>
  database.certificationAward.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { dateAwarded: "desc" }],
  });

export const getPublishedBlogPosts = () =>
  database.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

export const getBlogPostBySlug = (slug: string) =>
  database.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: true },
  });

export const getFaqTeaser = (take = 5) =>
  database.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    take,
  });

export const getAllFaqs = () =>
  database.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });

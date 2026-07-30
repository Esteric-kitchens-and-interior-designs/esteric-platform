import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import {
  getFaqTeaser,
  getFeaturedPortfolioProjects,
  getFeaturedTestimonials,
} from "@/lib/queries";
import { CTA } from "./components/cta";
import { FaqTeaser } from "./components/faq-teaser";
import { FeaturedPortfolio } from "./components/featured-portfolio";
import { Hero } from "./components/hero";
import { Services } from "./components/services";
import { Testimonials } from "./components/testimonials";
import { WhyEsteric } from "./components/why-esteric";

export const generateMetadata = (): Metadata =>
  createMetadata({
    title: "Esteric Kitchens & Interior Designs",
    description:
      "Bespoke kitchen, interior, and landscape design in Nairobi, Kenya — crafted around the way you live.",
  });

const Home = async () => {
  const [featuredProjects, featuredTestimonials, faqTeaser] = await Promise.all(
    [getFeaturedPortfolioProjects(), getFeaturedTestimonials(), getFaqTeaser()]
  );

  return (
    <>
      <Hero />
      <Services />
      <WhyEsteric />
      <FeaturedPortfolio projects={featuredProjects} />
      <Testimonials testimonials={featuredTestimonials} />
      <FaqTeaser faqs={faqTeaser} />
      <CTA />
    </>
  );
};

export default Home;

import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import {
  getAllFaqs,
  getFeaturedPortfolioProjects,
  getFeaturedTestimonials,
  getPublishedCertifications,
} from "@/lib/queries";
import { Certifications } from "./components/certifications";
import { CTA } from "./components/cta";
import { Faqs } from "./components/faqs";
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
  const [featuredProjects, featuredTestimonials, certifications, faqs] =
    await Promise.all([
      getFeaturedPortfolioProjects(),
      getFeaturedTestimonials(),
      getPublishedCertifications(),
      getAllFaqs(),
    ]);

  return (
    <>
      <Hero />
      <Services />
      <WhyEsteric />
      <FeaturedPortfolio projects={featuredProjects} />
      <Testimonials testimonials={featuredTestimonials} />
      <Certifications items={certifications} />
      <Faqs faqs={faqs} />
      <CTA />
    </>
  );
};

export default Home;

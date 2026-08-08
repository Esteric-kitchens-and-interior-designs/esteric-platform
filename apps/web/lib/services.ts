// Import the enum from the lightweight generated enums module (not the
// `@repo/database` barrel) so this file — which is imported by client
// components like the header nav — never pulls the Prisma Client / neon
// adapter (which imports `server-only`) into the browser bundle.
import { ServiceCategory } from "@repo/database/generated/enums";
import {
  ChefHat,
  DoorClosed,
  type LucideIcon,
  Sofa,
  Trees,
} from "lucide-react";

export interface ServiceImage {
  alt: string;
  src: string;
}

export interface ServiceDefinition {
  category: ServiceCategory;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  /** Real project photography for this service — empty until photos exist, never placeholders. */
  images: ServiceImage[];
  process: { title: string; description: string }[];
  shortTitle: string;
  slug: string;
  tagline: string;
  title: string;
}

export const services: ServiceDefinition[] = [
  {
    category: ServiceCategory.KITCHEN,
    slug: "kitchen-designs",
    title: "Kitchen Designs",
    shortTitle: "Kitchens",
    tagline: "The heart of the home, built around how you cook and gather.",
    description:
      "From first sketch to final installation, we design kitchens that balance everyday practicality with a refined, timeless aesthetic — custom cabinetry, considered storage, and finishes chosen to last.",
    icon: ChefHat,
    images: [
      {
        src: "/images/kitchen-designs/kitchen-navy-island.jpg",
        alt: "Navy-blue kitchen with brass pendant lighting and a marble island",
      },
      {
        src: "/images/kitchen-designs/kitchen-dark-marble-view.jpg",
        alt: "Kitchen with dark marble countertops and a garden view",
      },
      {
        src: "/images/kitchen-designs/kitchen-dark-counters.jpg",
        alt: "Kitchen with built-in double ovens and dark countertops",
      },
      {
        src: "/images/kitchen-designs/kitchen-window-view.jpg",
        alt: "Kitchen island with pendant lighting overlooking large windows",
      },
    ],
    highlights: [
      "Custom cabinetry and joinery, built to measure",
      "Kitchen islands, breakfast counters, and pantry design",
      "Premium worktops, splashbacks, and hardware selection",
      "Full appliance integration and lighting design",
    ],
    process: [
      {
        title: "Consultation",
        description:
          "We visit your space, listen to how you live and cook, and understand your priorities and budget.",
      },
      {
        title: "Design & 3D concept",
        description:
          "Our designers produce layout options and 3D renders so you can see your kitchen before we build it.",
      },
      {
        title: "Fabrication",
        description:
          "Cabinetry and joinery are handcrafted in our workshop to exact specification.",
      },
      {
        title: "Installation & handover",
        description:
          "A dedicated project manager oversees installation, finishing, and a final walkthrough with you.",
      },
    ],
  },
  {
    category: ServiceCategory.INTERIOR,
    slug: "interior-designs",
    title: "Interior Designs",
    shortTitle: "Interiors",
    tagline: "Cohesive interiors that carry your style through every room.",
    description:
      "We design living rooms, bedrooms, offices, and full-home interiors with a considered material palette, curated furnishings, and layouts that make every space feel intentional.",
    icon: Sofa,
    images: [
      {
        src: "/images/interior-designs/living-room-drapery.jpg",
        alt: "Living room with tailored drapery and sheer curtains",
      },
      {
        src: "/images/interior-designs/living-room-windows.jpg",
        alt: "Living room seating arranged before floor-to-ceiling windows",
      },
      {
        src: "/images/interior-designs/staircase-mirror.jpg",
        alt: "Entryway with an octagonal mirror and hardwood staircase",
      },
      {
        src: "/images/interior-designs/grand-staircase.jpg",
        alt: "Grand staircase with wrought-iron balustrade",
      },
    ],
    highlights: [
      "Full-home and single-room interior design",
      "Space planning, furniture selection, and styling",
      "Lighting design and material palettes",
      "Commercial and residential fit-outs",
    ],
    process: [
      {
        title: "Discovery",
        description:
          "We discuss your lifestyle, taste, and how each space needs to function.",
      },
      {
        title: "Concept & moodboards",
        description:
          "We present material palettes, furniture direction, and layout concepts for your approval.",
      },
      {
        title: "Sourcing & fit-out",
        description:
          "We procure furnishings and manage fit-out works with vetted contractors.",
      },
      {
        title: "Styling & handover",
        description:
          "Final styling, staging, and a walkthrough to make sure every detail is right.",
      },
    ],
  },
  {
    category: ServiceCategory.LANDSCAPING,
    slug: "landscaping",
    title: "Landscaping",
    shortTitle: "Landscaping",
    tagline: "Outdoor spaces designed with the same care as your interiors.",
    description:
      "We design and build gardens, patios, and outdoor living areas that extend your home outward — from planting design to hardscaping, water features, and outdoor lighting.",
    icon: Trees,
    // TODO: no landscaping photography available yet — add real project
    // photos here as soon as they exist. Deliberately left empty rather
    // than filled with mismatched interior photos.
    images: [],
    highlights: [
      "Garden design and planting plans",
      "Patios, decking, and outdoor entertaining areas",
      "Water features and outdoor lighting",
      "Irrigation and ongoing landscape maintenance",
    ],
    process: [
      {
        title: "Site assessment",
        description:
          "We assess soil, drainage, sun exposure, and how you want to use the outdoor space.",
      },
      {
        title: "Landscape design",
        description:
          "We produce a planting and hardscape plan tailored to the site and climate.",
      },
      {
        title: "Build",
        description:
          "Our landscaping team executes hardscaping, planting, and installation of features.",
      },
      {
        title: "Handover & care",
        description:
          "We walk you through maintenance needs, with optional ongoing care plans.",
      },
    ],
  },
  {
    category: ServiceCategory.WARDROBES_CABINETS,
    slug: "wardrobes-cabinets",
    title: "Wardrobes & Cabinets",
    shortTitle: "Wardrobes & Cabinets",
    tagline: "Storage built to fit your space and your life, exactly.",
    description:
      "Walk-in closets, fitted wardrobes, and bespoke cabinetry throughout the home — designed to maximise every inch of storage without compromising on style.",
    icon: DoorClosed,
    images: [
      {
        src: "/images/wardrobes-cabinets/pantry-pullout-1.jpg",
        alt: "Fitted pull-out pantry cabinetry mid-installation",
      },
      {
        src: "/images/wardrobes-cabinets/pantry-pullout-2.jpg",
        alt: "Tall pull-out storage unit with wire shelving",
      },
      {
        src: "/images/wardrobes-cabinets/cabinet-detail.jpg",
        alt: "Detail of fitted overhead cabinetry finish",
      },
    ],
    highlights: [
      "Fitted and walk-in wardrobes",
      "Bespoke storage and built-in cabinetry",
      "Custom interior fittings and organisation systems",
      "Finishes matched to your interior scheme",
    ],
    process: [
      {
        title: "Space survey",
        description:
          "We measure the space and talk through what you need to store and how.",
      },
      {
        title: "Design",
        description:
          "We design the layout, materials, and interior fittings for your approval.",
      },
      {
        title: "Manufacture",
        description:
          "Units are handcrafted to precise measurements in our workshop.",
      },
      {
        title: "Fitting",
        description:
          "Our team installs on site and finishes every detail before handover.",
      },
    ],
  },
];

export const getServiceBySlug = (slug: string): ServiceDefinition | undefined =>
  services.find((service) => service.slug === slug);

export const getServiceByCategory = (
  category: ServiceCategory
): ServiceDefinition | undefined =>
  services.find((service) => service.category === category);

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  KITCHEN: "Kitchen Designs",
  INTERIOR: "Interior Designs",
  LANDSCAPING: "Landscaping",
  WARDROBES_CABINETS: "Wardrobes & Cabinets",
  OTHER: "Other",
};

import "dotenv/config";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/client";

// Standalone script (run via tsx, not Next.js) — constructs its own client
// rather than importing ../index, which is guarded by "server-only" and
// throws outside a Next.js server context.
const adapter = new PrismaNeonHttp(process.env.DATABASE_URL ?? "", {});
const database = new PrismaClient({ adapter });

// Permission keys follow "<resource>:<action>". The CRM's user-management
// screen reads/writes these directly, so this list is a starting point,
// not a hardcoded enum — admins can add custom roles with any subset.
const ROLES = [
  {
    name: "Super Admin",
    description: "Full access, including user and role management.",
    isSystem: true,
    permissions: ["*"],
  },
  {
    name: "Admin",
    description: "Full operational access excluding user/role management.",
    isSystem: true,
    permissions: [
      "leads:read",
      "leads:write",
      "customers:read",
      "customers:write",
      "quotations:read",
      "quotations:write",
      "quotations:approve",
      "projects:read",
      "projects:write",
      "content:read",
      "content:write",
      "reports:read",
    ],
  },
  {
    name: "Sales",
    description: "Leads, customers, and quotations.",
    isSystem: true,
    permissions: [
      "leads:read",
      "leads:write",
      "customers:read",
      "customers:write",
      "quotations:read",
      "quotations:write",
    ],
  },
  {
    name: "Designer",
    description: "Projects, portfolio, and gallery content.",
    isSystem: true,
    permissions: [
      "projects:read",
      "projects:write",
      "content:read",
      "content:write",
    ],
  },
  {
    name: "Project Manager",
    description: "Full project and quotation visibility.",
    isSystem: true,
    permissions: [
      "projects:read",
      "projects:write",
      "quotations:read",
      "customers:read",
    ],
  },
  {
    name: "Staff",
    description:
      "Default role for new accounts — minimal read access until promoted.",
    isSystem: true,
    permissions: ["leads:read", "projects:read"],
  },
];

const main = async () => {
  for (const role of ROLES) {
    await database.role.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
  }

  const faqCount = await database.fAQ.count();
  if (faqCount === 0) {
    await database.fAQ.createMany({
      data: [
        {
          question: "How long does a typical kitchen renovation take?",
          answer:
            "Most kitchen projects take 4–8 weeks from final design approval to completion, depending on scope and material lead times.",
          category: "Kitchens",
          sortOrder: 1,
        },
        {
          question: "Do you offer free consultations?",
          answer:
            "Yes — book an appointment through our website and a designer will visit your site or meet you in showroom at no cost.",
          category: "General",
          sortOrder: 2,
        },
        {
          question: "What areas do you serve?",
          answer:
            "We serve Nairobi and surrounding counties. Contact us to confirm availability for your location.",
          category: "General",
          sortOrder: 3,
        },
      ],
    });
  }

  console.log("Seed complete.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await database.$disconnect();
  });

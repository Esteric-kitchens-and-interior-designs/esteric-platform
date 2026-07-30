import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { siteConfig } from "@/lib/site-config";

interface LegalSection {
  readonly heading: string;
  readonly list?: readonly string[];
  readonly paragraphs: readonly string[];
}

interface LegalPageDefinition {
  readonly description: string;
  readonly intro: string;
  readonly lastUpdated: string;
  readonly sections: readonly LegalSection[];
  readonly title: string;
}

const legalPages: Record<
  "privacy" | "terms" | "cookies" | "accessibility",
  LegalPageDefinition
> = {
  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your information.",
    lastUpdated: "27 July 2026",
    intro: `${siteConfig.legalName} ("Esteric", "we", "us", or "our") respects your privacy and is committed to protecting the personal data you share with us through this website (ekiinteriors.com), our contact and quote request forms, appointment bookings, and newsletter sign-up. This policy explains what we collect, why, and the choices you have.`,
    sections: [
      {
        heading: "1. Information we collect",
        paragraphs: [
          "We collect information you provide directly to us, including:",
        ],
        list: [
          "Contact details: name, email address, phone number.",
          "Project information: service category, budget range, project description, preferred appointment date and time, and any notes or files you choose to share.",
          "Newsletter subscription: your email address and, optionally, your name.",
          "Communications: any messages you send us via the contact form, email, phone, or WhatsApp.",
        ],
      },
      {
        heading: "2. How we use your information",
        paragraphs: ["We use the information you provide to:"],
        list: [
          "Respond to enquiries, quote requests, and appointment bookings.",
          "Prepare and send project quotations and manage the resulting client relationship.",
          "Send you our newsletter, if you've subscribed, and project updates related to work you've engaged us for.",
          "Improve our website and services, and understand how visitors use our site (see our Cookie Policy).",
          "Meet our legal, tax, and accounting obligations under Kenyan law.",
        ],
      },
      {
        heading: "3. Legal basis for processing",
        paragraphs: [
          "Under Kenya's Data Protection Act, 2019, we process your personal data on the following bases: your consent (for example, when you submit a contact, quote, or appointment form, or subscribe to our newsletter); to take steps at your request prior to entering into a contract, or to perform a contract with you (for example, once you engage us for a project); and our legitimate business interests in operating and improving our services, provided these do not override your rights.",
        ],
      },
      {
        heading: "4. Who we share your information with",
        paragraphs: [
          "We do not sell your personal data. We may share it with:",
        ],
        list: [
          "Our own staff who need it to respond to your enquiry or deliver your project.",
          "Service providers who support our operations, such as our website hosting provider, email delivery provider, and database provider, who process data on our behalf and under contractual confidentiality obligations.",
          "Authorities where required by law, regulation, or legal process.",
        ],
      },
      {
        heading: "5. Data retention",
        paragraphs: [
          "We retain enquiry, quote, and booking information for as long as necessary to respond to you, deliver any engaged project, and meet our legal and accounting obligations, after which it is deleted or anonymised. Newsletter subscriber data is retained until you unsubscribe.",
        ],
      },
      {
        heading: "6. Your rights",
        paragraphs: [
          "Under the Data Protection Act, 2019, you have the right to be informed of the use to which your personal data is to be put, to access your personal data, to request correction of inaccurate data, to request deletion of your data, to object to processing, and to withdraw consent at any time. To exercise any of these rights, contact us using the details below.",
        ],
      },
      {
        heading: "7. Data security",
        paragraphs: [
          "We apply reasonable technical and organisational measures — including access controls, encrypted connections, and rate limiting on public forms — to protect your data against unauthorised access, loss, or misuse. No system is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "8. Contact us",
        paragraphs: [
          `Questions about this policy or your data can be sent to ${siteConfig.email} or via our Contact page.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    description: "The terms that govern your use of our website and services.",
    lastUpdated: "27 July 2026",
    intro: `These Terms & Conditions govern your use of the ${siteConfig.name} website (ekiinteriors.com) and any enquiry, quote request, appointment booking, or engagement you make with ${siteConfig.legalName} through it. By using this website, you agree to these terms.`,
    sections: [
      {
        heading: "1. Website use",
        paragraphs: [
          "This website provides information about our kitchen, interior, landscaping, and cabinetry design services, a portfolio of completed work, and forms through which you can contact us, request a quote, or book a consultation. You agree to use this website only for lawful purposes and not to submit false, misleading, or malicious information through any form.",
        ],
      },
      {
        heading: "2. Quotes and estimates",
        paragraphs: [
          "Any budget ranges, timelines, or figures discussed via this website, including through our Quote Request form, are indicative only. A formal, itemised quotation is only issued once we've assessed your project in detail, and is subject to site survey, material availability, and final scope agreed in writing.",
        ],
      },
      {
        heading: "3. Project engagements",
        paragraphs: [
          "Submitting a quote request, contact form, or appointment booking does not itself create a binding contract for design or construction services. A separate written agreement, quotation, or contract governs the terms of any project we undertake for you, including pricing, payment schedule, timelines, and warranties.",
        ],
      },
      {
        heading: "4. Intellectual property",
        paragraphs: [
          "All content on this website — including text, images, logos, and portfolio photography — is owned by or licensed to us and may not be reproduced, distributed, or used commercially without our prior written consent. Design concepts we produce for a client engagement remain our intellectual property until the relevant project is paid for in full, unless otherwise agreed in writing.",
        ],
      },
      {
        heading: "5. Portfolio and testimonials",
        paragraphs: [
          "We may showcase completed projects, including photography and client testimonials, on this website for marketing purposes. Where a project involves identifiable client details, we seek permission before publishing. If you'd prefer your project not to be featured, let us know.",
        ],
      },
      {
        heading: "6. Limitation of liability",
        paragraphs: [
          'This website and its content are provided "as is". While we take care to keep information accurate and up to date, we make no warranty that the website will be error-free or uninterrupted, and we are not liable for any loss arising from your use of it, to the extent permitted by Kenyan law.',
        ],
      },
      {
        heading: "7. Governing law",
        paragraphs: [
          "These terms are governed by the laws of the Republic of Kenya, and any disputes arising from them are subject to the exclusive jurisdiction of the Kenyan courts.",
        ],
      },
      {
        heading: "8. Changes to these terms",
        paragraphs: [
          'We may update these terms from time to time to reflect changes to our services or legal requirements. The "last updated" date at the top of this page reflects the most recent revision.',
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description: "How we use cookies and similar technologies on this website.",
    lastUpdated: "27 July 2026",
    intro: `This Cookie Policy explains how ${siteConfig.legalName} uses cookies and similar technologies on ekiinteriors.com, and the choices available to you.`,
    sections: [
      {
        heading: "1. What are cookies",
        paragraphs: [
          "Cookies are small text files placed on your device when you visit a website. They help the site function correctly, remember your preferences, and help us understand how visitors use the site.",
        ],
      },
      {
        heading: "2. Types of cookies we use",
        paragraphs: ["We use the following categories of cookies:"],
        list: [
          "Strictly necessary cookies — required for core site functionality, such as remembering your light/dark theme preference and protecting our forms from abuse.",
          "Analytics cookies — help us understand how visitors use the site (e.g. which pages are most viewed) so we can improve it. These may be set by tools such as Google Analytics or PostHog.",
          "Preference cookies — remember choices you've made, such as display settings.",
        ],
      },
      {
        heading: "3. Third-party cookies",
        paragraphs: [
          "Some cookies are set by third-party services we use, such as analytics providers, embedded Google Maps on our Contact page, and our bot-protection provider (Arcjet). These providers may process data in line with their own privacy policies.",
        ],
      },
      {
        heading: "4. Managing cookies",
        paragraphs: [
          "Most browsers let you control cookies through their settings, including blocking or deleting them. Note that disabling certain cookies may affect how parts of this website function, such as theme preference or embedded maps.",
        ],
      },
      {
        heading: "5. Changes to this policy",
        paragraphs: [
          "We may update this Cookie Policy as our use of cookies changes. Please check back periodically for the latest version.",
        ],
      },
      {
        heading: "6. Contact us",
        paragraphs: [
          `Questions about our use of cookies can be sent to ${siteConfig.email}.`,
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    description:
      "Our commitment to making this website accessible to everyone.",
    lastUpdated: "27 July 2026",
    intro: `${siteConfig.legalName} is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.`,
    sections: [
      {
        heading: "1. Our approach",
        paragraphs: [
          "We aim to align this website with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, a widely recognised standard for web accessibility. This includes attention to colour contrast, keyboard navigability, semantic markup, and descriptive text for interactive elements and images.",
        ],
      },
      {
        heading: "2. What we've built in",
        paragraphs: ["Measures already in place across this website include:"],
        list: [
          "Semantic HTML structure and heading hierarchy for screen reader navigation.",
          "Keyboard-operable navigation, forms, and interactive components.",
          "Sufficient colour contrast between text and background across both light and dark themes.",
          "Descriptive labels on form fields and interactive controls.",
          "Alt text guidance for all published photography (portfolio, blog, and certification images) as content is added.",
        ],
      },
      {
        heading: "3. Known limitations",
        paragraphs: [
          "This site currently uses placeholder graphic panels in place of real photography in several sections while real project photography is being prepared. These are decorative and marked accordingly. As with any website, some third-party embedded content (such as the Google Maps embed on our Contact page) is outside our direct control for accessibility purposes.",
        ],
      },
      {
        heading: "4. Feedback",
        paragraphs: [
          `If you experience any difficulty accessing content on this website, please contact us at ${siteConfig.email} or ${siteConfig.phone}, describing the issue and the page involved. We take accessibility feedback seriously and will work to address issues raised.`,
        ],
      },
    ],
  },
};

type LegalSlug = keyof typeof legalPages;

interface LegalPageProperties {
  readonly params: Promise<{
    slug: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: LegalPageProperties): Promise<Metadata> => {
  const { slug } = await params;
  const post = legalPages[slug as LegalSlug];

  if (!post) {
    return {};
  }

  return createMetadata({
    title: post.title,
    description: post.description,
  });
};

export const generateStaticParams = (): { slug: string }[] =>
  Object.keys(legalPages).map((slug) => ({ slug }));

const LegalPage = async ({ params }: LegalPageProperties) => {
  const { slug } = await params;
  const page = legalPages[slug as LegalSlug];

  if (!page) {
    notFound();
  }

  return (
    <div className="container max-w-5xl py-16">
      <Link
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
        href="/"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Home
      </Link>
      <h1 className="scroll-m-20 text-balance font-display font-extrabold text-4xl tracking-tight lg:text-5xl">
        {page.title}
      </h1>
      <p className="text-balance leading-7 [&:not(:first-child)]:mt-6">
        {page.description}
      </p>
      <div className="mt-16 flex flex-col items-start gap-8 sm:flex-row">
        <div className="sm:flex-1">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>{page.intro}</p>
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list ? (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="sticky top-24 hidden shrink-0 md:block">
          <Sidebar date={new Date(page.lastUpdated)} readingTime="6 min read" />
        </div>
      </div>
    </div>
  );
};

export default LegalPage;

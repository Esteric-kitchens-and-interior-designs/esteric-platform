# Esteric Kitchens & Interior Designs

Corporate marketing website and internal CRM for Esteric Kitchens & Interior Designs Ltd (ekiinteriors.com).

Built on a trimmed-down [next-forge](https://github.com/vercel/next-forge) foundation: a Turborepo monorepo with strict TypeScript, shared design system, and production-grade defaults for auth, database, email, storage, observability and security.

## Structure

```
esteric/
├── apps/
│   ├── web/      # Public marketing site (port 3001) — ekiinteriors.com
│   ├── crm/      # Internal CRM / admin dashboard (port 3000) — crm.ekiinteriors.com
│   ├── api/      # Webhooks, cron jobs (port 3002)
│   ├── email/    # React Email template previews (port 3003)
│   └── studio/   # Prisma Studio (port 3005)
└── packages/
    ├── auth/            # Clerk — authentication, sessions, 2FA
    ├── database/        # Prisma schema + client (Postgres/Neon)
    ├── design-system/   # shadcn/ui + Esteric brand theme (gold / charcoal / emerald)
    ├── email/            # Resend + React Email templates
    ├── storage/          # Vercel Blob (portfolio images, quotation PDFs, documents)
    ├── analytics/        # Web + product analytics
    ├── observability/    # Sentry + logging
    ├── security/         # Arcjet — WAF, bot detection, rate limiting
    ├── payments/         # Stripe (dormant — reserved for future deposit/invoice payments)
    ├── seo/               # Metadata, sitemap, JSON-LD
    ├── webhooks/          # Inbound webhook handlers (Clerk)
    ├── rate-limit/
    ├── next-config/
    └── typescript-config/
```

## Getting started

Prerequisites: Node.js 22+, pnpm.

```sh
pnpm install
pnpm db:push      # push the Prisma schema to your Postgres database
pnpm dev          # run all apps
```

Environment variables live alongside each app/package (`.env.local`, `.env`). See each package's `.env.example` for required keys. Integrations (database, auth, email, storage, error tracking) are provisioned through the Vercel Marketplace — see `CLAUDE.md` for the current provisioning status.

## License

Proprietary — all rights reserved, Esteric Kitchens & Interior Designs Ltd.

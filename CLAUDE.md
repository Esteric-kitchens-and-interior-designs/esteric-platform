# Esteric Kitchens & Interior Designs — Website & CRM

Turborepo monorepo for the ekiinteriors.com marketing site and the internal CRM. See `README.md` for the directory layout and setup commands.

## Product

- `apps/web` — public marketing site. Home, About, service pages (Kitchen Designs, Interior Designs, Landscaping, Wardrobes & Cabinets), Portfolio, Testimonials, Certifications & Awards, Blog, FAQs, Contact, Quote Request, Appointment Booking, Newsletter, legal pages. Public forms write directly into CRM tables (`Lead`, `AppointmentBooking`, `NewsletterSubscriber`) — there is no separate "submissions" inbox, the CRM leads module *is* the inbox.
- `apps/crm` — internal dashboard at `crm.ekiinteriors.com` for staff. Leads → Customers → Quotations → Projects pipeline, portfolio/gallery/blog/certifications content management, staff & role management, activity log.

## Architecture decisions worth knowing

- **No Clerk Organizations.** This is one company, not a multi-tenant SaaS product — next-forge's default template gates the app behind `orgId` and ships an `OrganizationSwitcher`; both were removed. Access control is our own RBAC (`packages/auth/rbac.ts`), not Clerk orgs.
- **RBAC is data-driven.** `Role` is a database table with a `permissions: string[]` column (e.g. `"leads:write"`, `"quotations:approve"`), not a hardcoded enum — admins create/edit roles from the CRM without a deploy. `packages/database/prisma/seed.ts` seeds starter roles (Super Admin, Admin, Sales, Designer, Project Manager, Staff). New Clerk sign-ups land in `Staff` (near-zero permissions) via the `user.created` webhook (`apps/api/app/webhooks/auth/route.ts`) and must be promoted manually — there's no self-serve admin signup.
- **Every mutation in the CRM must call `logActivity()`** (`packages/auth/activity-log.ts`) right after it succeeds, with `action`/`entityType`/`entityId`. It captures the acting user, IP, and user-agent from the request automatically — this is what satisfies the audit-log requirement, not a side feature.
- **Permission checks**: use `requirePermission("resource:action")` from `packages/auth/rbac.ts` at the top of server actions/route handlers that mutate CRM data. Don't reimplement the check inline. `hasPermission()`/`PermissionCheckable` also live in `packages/auth/permissions.ts` (no `server-only`, no `@repo/database` import) — import from there, not `rbac.ts`, in Client Components (e.g. the sidebar nav filters visible items by permission client-side). `rbac.ts` re-exports `hasPermission` for server-side callers.
- **User/role management is gated on `hasPermission(user, "*")`** (Super Admin only) — there's no dedicated `users:manage`/`staff:*` permission key seeded. Add one to `packages/database/prisma/seed.ts` if that ever needs to be delegated to a non-Super-Admin role.
- **No BaseHub/external CMS.** Blog posts, portfolio projects, testimonials, certifications & awards, and FAQs are plain Prisma models managed through CRM admin screens and rendered on the marketing site — simpler than wiring an external CMS for content two people will edit.
- **Payments (Stripe) package is present but dormant** — no keys configured, nothing wired up. Recommended for later if the business wants to take deposits online; don't build against it until asked.
- **Brand tokens**: `bg-gold` / `text-gold` / `bg-charcoal` / `text-emerald` and `font-display` (Playfair Display, for headings) are registered in `packages/design-system/styles/globals.css` alongside the standard shadcn semantic tokens (`primary` = gold, `secondary` = charcoal, `accent` = emerald). Prefer the semantic tokens (`bg-primary`) in components; reach for the brand tokens directly only for one-off marketing-page treatments.
- **Package manager is pnpm**, not bun — next-forge's own scripts default to bun/bunx; root `package.json` scripts were rewritten to `pnpm`/`pnpm dlx`.

## Provisioning status

Real external services (Neon Postgres, Clerk, Resend, Vercel Blob, Sentry, Arcjet) are **not yet provisioned** — the Vercel CLI isn't installed and no Vercel account is linked in this environment. Everything is built against `.env.example` placeholders. Before this can run against real data or deploy, someone needs to: install the Vercel CLI, link/create a Vercel project, and provision each integration through the Vercel Marketplace (or the provider directly), then `vercel env pull`.

**Local dev needs a real Neon (or Neon-compatible) `DATABASE_URL` for any DB-backed page to render.** `packages/database/index.ts` connects via `@prisma/adapter-neon` over a WebSocket (`wss://.../v2`) — that's Neon-specific and cannot reach a plain local Postgres (you'll see `ECONNREFUSED` against `wss://<host>/v2` in the dev log, not a code error). `pnpm typecheck` and static/form-only routes (contact, quote, appointment, legal pages, sign-in) work fine with the placeholder `DATABASE_URL` in each app's `.env.local`; anything that queries Prisma (home, service pages, portfolio, blog, dashboard, etc.) needs a real Neon project — the free tier is enough for local dev and doesn't require linking Vercel, just an account at neon.tech, or provision one through the Vercel Marketplace once that's set up.

**Clerk needs real keys for auth to do anything beyond redirect-to-sign-in.** The placeholder `pk_test_`/`sk_test_` values in `.env.local` let the SDK initialize and unauthenticated requests cleanly redirect to `/sign-in` (rather than throwing), but no one can actually sign in until a real Clerk project's keys are set and `CLERK_WEBHOOK_SECRET` is wired to a webhook endpoint pointed at `apps/api/app/webhooks/auth/route.ts` — that webhook is what creates a row in our `User` table on first sign-in, and without it every sign-in dead-ends at the "pending approval" screen.

## Commands

```sh
pnpm install
pnpm db:push       # push Prisma schema to DATABASE_URL
pnpm db:seed       # seed default roles + starter FAQs
pnpm dev           # all apps
pnpm dev --filter web
pnpm dev --filter crm
```

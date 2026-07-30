// The known permission-key catalog for the Role editor.
//
// There's no separate Permission table — Role.permissions is just a
// string[] column (see packages/database/prisma/schema.prisma) — so this is
// the single source of truth for which keys the UI lets admins toggle.
// It mirrors packages/database/prisma/seed.ts; add a key in both places
// when a new resource needs its own permission.
//
// "*" (super admin / matches every permission check in
// packages/auth/rbac.ts) is deliberately not in this list — it's offered
// as a separate "Full access" toggle in the role editor so it can't be
// confused with an ordinary resource:action key.
export const PERMISSION_KEYS = [
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
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "leads:read": "View leads",
  "leads:write": "Manage leads",
  "customers:read": "View customers",
  "customers:write": "Manage customers",
  "quotations:read": "View quotations",
  "quotations:write": "Manage quotations",
  "quotations:approve": "Approve quotations",
  "projects:read": "View projects",
  "projects:write": "Manage projects",
  "content:read": "View content (portfolio, blog, etc.)",
  "content:write": "Manage content (portfolio, blog, etc.)",
  "reports:read": "View reports & revenue",
};

// Groups keys for a friendlier checkbox layout.
export const PERMISSION_GROUPS: { label: string; keys: PermissionKey[] }[] = [
  { label: "Leads", keys: ["leads:read", "leads:write"] },
  { label: "Customers", keys: ["customers:read", "customers:write"] },
  {
    label: "Quotations",
    keys: ["quotations:read", "quotations:write", "quotations:approve"],
  },
  { label: "Projects", keys: ["projects:read", "projects:write"] },
  { label: "Content", keys: ["content:read", "content:write"] },
  { label: "Reports", keys: ["reports:read"] },
];

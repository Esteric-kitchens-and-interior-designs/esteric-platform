// Pure permission-check logic, deliberately split out from rbac.ts.
//
// rbac.ts starts with `import "server-only"` and pulls in `@repo/database`
// (which is also server-only), so any Client Component that imports
// anything from rbac.ts — even a dependency-free function like
// `hasPermission` — poisons the client bundle and crashes at build time.
// This file has no server-only/database dependency, so Client Components
// (e.g. the sidebar, which needs to conditionally show nav items) can
// import `hasPermission` from here directly. rbac.ts re-exports it so
// existing server-side call sites (`@repo/auth/rbac`) keep working.
export type PermissionCheckable =
  | { role: { permissions: string[] } }
  | null
  | undefined;

export const hasPermission = (
  user: PermissionCheckable,
  permission: string
) => {
  if (!user) {
    return false;
  }
  return (
    user.role.permissions.includes("*") ||
    user.role.permissions.includes(permission)
  );
};

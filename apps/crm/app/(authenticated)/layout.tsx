import { logActivity } from "@repo/auth/activity-log";
import { getCurrentStaffUser } from "@repo/auth/rbac";
import { auth, currentUser } from "@repo/auth/server";
import { database } from "@repo/database";
import { SidebarProvider } from "@repo/design-system/components/ui/sidebar";
import { secure } from "@repo/security";
import type { ReactNode } from "react";
import { env } from "@/env";
import { PendingApproval } from "./components/pending-approval";
import { GlobalSidebar } from "./components/sidebar";

interface AppLayoutProperties {
  readonly children: ReactNode;
}

// This app has no Clerk Organizations — it's one company's internal CRM,
// not multi-tenant SaaS. Access is gated by our own Role/permissions model
// (packages/auth/rbac.ts), synced from Clerk via the user.created webhook.
const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(["CATEGORY:PREVIEW"]);
  }

  const user = await currentUser();
  const { redirectToSignIn, sessionId } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  const staffUser = await getCurrentStaffUser();

  if (!staffUser || staffUser.status === "INACTIVE") {
    return <PendingApproval />;
  }

  // One ActivityLog "user.login" row per new Clerk session, not per request.
  if (sessionId && staffUser.lastSessionId !== sessionId) {
    await database.user.update({
      where: { id: staffUser.id },
      data: { lastSessionId: sessionId, lastLoginAt: new Date() },
    });
    await logActivity({
      action: "user.login",
      entityType: "User",
      entityId: staffUser.id,
    });
  }

  return (
    <SidebarProvider>
      <GlobalSidebar staffUser={staffUser}>{children}</GlobalSidebar>
    </SidebarProvider>
  );
};

export default AppLayout;

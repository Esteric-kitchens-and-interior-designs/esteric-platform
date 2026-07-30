import { UserButton } from "@repo/auth/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";

export const PendingApproval = () => (
  <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Account pending approval</CardTitle>
        <CardDescription>
          Your account isn't active in the Esteric CRM yet. Ask a Super Admin to
          assign you a role from Staff Management, then refresh this page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserButton showName />
      </CardContent>
    </Card>
  </div>
);

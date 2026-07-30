"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UserOption {
  firstName: string;
  id: string;
  lastName: string;
}

export const ActivityLogFilters = ({
  users,
  entityTypes,
}: {
  users: UserOption[];
  entityTypes: string[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters =
    searchParams.get("userId") ||
    searchParams.get("entityType") ||
    searchParams.get("from") ||
    searchParams.get("to");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        onValueChange={(v) => setParam("userId", v === "all" ? null : v)}
        value={searchParams.get("userId") ?? "all"}
      >
        <SelectTrigger className="w-44" size="sm">
          <SelectValue placeholder="User" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All users</SelectItem>
          <SelectItem value="system">System</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(v) => setParam("entityType", v === "all" ? null : v)}
        value={searchParams.get("entityType") ?? "all"}
      >
        <SelectTrigger className="w-40" size="sm">
          <SelectValue placeholder="Entity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All entity types</SelectItem>
          {entityTypes.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        className="w-36"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => setParam("from", e.target.value || null)}
        type="date"
      />
      <span className="text-muted-foreground text-xs">to</span>
      <Input
        className="w-36"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => setParam("to", e.target.value || null)}
        type="date"
      />

      {hasFilters && (
        <Button onClick={() => router.push(pathname)} size="sm" variant="ghost">
          <XIcon className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};

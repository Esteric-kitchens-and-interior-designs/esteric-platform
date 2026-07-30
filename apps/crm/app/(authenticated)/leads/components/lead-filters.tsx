"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STATUS_OPTIONS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTE_SENT",
  "WON",
  "LOST",
];
const SOURCE_OPTIONS = [
  "WEBSITE",
  "QUOTE_FORM",
  "CONTACT_FORM",
  "APPOINTMENT_FORM",
  "PHONE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "OTHER",
];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"];

export const LeadFilters = () => {
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
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters =
    searchParams.get("status") ||
    searchParams.get("source") ||
    searchParams.get("priority") ||
    searchParams.get("assignedTo");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        onValueChange={(v) => setParam("status", v === "all" ? null : v)}
        value={searchParams.get("status") ?? "all"}
      >
        <SelectTrigger className="w-36" size="sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(v) => setParam("source", v === "all" ? null : v)}
        value={searchParams.get("source") ?? "all"}
      >
        <SelectTrigger className="w-36" size="sm">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {SOURCE_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(v) => setParam("priority", v === "all" ? null : v)}
        value={searchParams.get("priority") ?? "all"}
      >
        <SelectTrigger className="w-32" size="sm">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITY_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={() =>
          setParam(
            "assignedTo",
            searchParams.get("assignedTo") === "me" ? null : "me"
          )
        }
        size="sm"
        variant={
          searchParams.get("assignedTo") === "me" ? "default" : "outline"
        }
      >
        Assigned to me
      </Button>

      {hasFilters && (
        <Button onClick={() => router.push(pathname)} size="sm" variant="ghost">
          <XIcon className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
};

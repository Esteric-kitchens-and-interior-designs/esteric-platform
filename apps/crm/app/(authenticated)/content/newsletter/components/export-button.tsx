"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Download } from "lucide-react";

interface SubscriberRow {
  email: string;
  name: string | null;
  source: string | null;
  status: string;
  subscribedAt: string;
}

const CSV_NEEDS_QUOTING = /[",\n]/;
const CSV_QUOTE = /"/g;

const csvEscape = (value: string) => {
  if (CSV_NEEDS_QUOTING.test(value)) {
    return `"${value.replace(CSV_QUOTE, '""')}"`;
  }
  return value;
};

export const ExportCsvButton = ({ rows }: { rows: SubscriberRow[] }) => {
  const handleExport = () => {
    const header = ["Email", "Name", "Status", "Source", "Subscribed at"];
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          row.email,
          row.name ?? "",
          row.status,
          row.source ?? "",
          row.subscribedAt,
        ]
          .map(csvEscape)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download /> Export CSV
    </Button>
  );
};

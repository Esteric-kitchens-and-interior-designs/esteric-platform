"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Download } from "lucide-react";

interface ExportCsvButtonProps {
  readonly filename: string;
  readonly headers: string[];
  readonly rows: (string | number)[][];
}

const CSV_NEEDS_QUOTING = /[",\n]/;
const CSV_QUOTE = /"/g;

const csvEscape = (value: string | number) => {
  const stringValue = String(value);
  if (CSV_NEEDS_QUOTING.test(stringValue)) {
    return `"${stringValue.replace(CSV_QUOTE, '""')}"`;
  }
  return stringValue;
};

export const ExportCsvButton = ({
  filename,
  headers,
  rows,
}: ExportCsvButtonProps) => {
  const handleExport = () => {
    const lines = [
      headers.join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
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

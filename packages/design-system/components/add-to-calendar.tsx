"use client";

import { CalendarPlus, Download } from "lucide-react";
import { buildGoogleCalendarUrl, buildIcsFile } from "../lib/calendar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddToCalendarProps {
  readonly description?: string;
  readonly end: Date;
  readonly iconOnly?: boolean;
  readonly location?: string;
  readonly start: Date;
  readonly title: string;
}

export const AddToCalendar = ({
  title,
  description,
  location,
  start,
  end,
  iconOnly,
}: AddToCalendarProps) => {
  const handleDownloadIcs = () => {
    const ics = buildIcsFile({ title, description, location, start, end });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appointment.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <Button aria-label="Add to calendar" size="icon-sm" variant="outline">
            <CalendarPlus />
          </Button>
        ) : (
          <Button size="sm" variant="outline">
            <CalendarPlus /> Add to calendar
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={buildGoogleCalendarUrl({
              title,
              description,
              location,
              start,
              end,
            })}
            rel="noopener noreferrer"
            target="_blank"
          >
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDownloadIcs}>
          <Download /> Download .ics (Apple / Outlook)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

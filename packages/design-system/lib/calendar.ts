const TIME_SLOT_PATTERN =
  /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

const to24Hour = (hour: number, meridiem: string) => {
  const isPm = meridiem.toUpperCase() === "PM";
  if (hour === 12) {
    return isPm ? 12 : 0;
  }
  return isPm ? hour + 12 : hour;
};

/** Parses a slot label like "9:00 AM – 10:00 AM" into start/end times on the given day. */
export const parseTimeSlotOnDate = (
  date: Date,
  slot: string
): { start: Date; end: Date } | null => {
  const match = slot.match(TIME_SLOT_PATTERN);
  if (!match) {
    return null;
  }

  const [
    ,
    startHour,
    startMinute,
    startMeridiem,
    endHour,
    endMinute,
    endMeridiem,
  ] = match;

  const start = new Date(date);
  start.setHours(
    to24Hour(Number(startHour), startMeridiem ?? ""),
    Number(startMinute),
    0,
    0
  );

  const end = new Date(date);
  end.setHours(
    to24Hour(Number(endHour), endMeridiem ?? ""),
    Number(endMinute),
    0,
    0
  );

  return { start, end };
};

interface CalendarEventInput {
  readonly title: string;
  readonly description?: string;
  readonly location?: string;
  readonly start: Date;
  readonly end: Date;
}

const toIcsDate = (date: Date) =>
  `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

const ICS_ESCAPE_PATTERN = /([,;])/g;
const NEWLINE_PATTERN = /\n/g;
const BACKSLASH_PATTERN = /\\/g;

const icsEscape = (value: string) =>
  value
    .replace(BACKSLASH_PATTERN, "\\\\")
    .replace(ICS_ESCAPE_PATTERN, "\\$1")
    .replace(NEWLINE_PATTERN, "\\n");

export const buildIcsFile = ({
  title,
  description,
  location,
  start,
  end,
}: CalendarEventInput): string => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Esteric Kitchens & Interior Designs//Appointments//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@ekiinteriors.com`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    ...(description ? [`DESCRIPTION:${icsEscape(description)}`] : []),
    ...(location ? [`LOCATION:${icsEscape(location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
};

export const buildGoogleCalendarUrl = ({
  title,
  description,
  location,
  start,
  end,
}: CalendarEventInput): string => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toIcsDate(start)}/${toIcsDate(end)}`,
  });

  if (description) {
    params.set("details", description);
  }
  if (location) {
    params.set("location", location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

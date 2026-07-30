// Small formatting helpers shared across CRM screens.

export const formatCurrency = (value: number | string, currency = "KES") => {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

export const formatDateTime = (value: Date | string | null | undefined) => {
  if (!value) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const timeAgo = (value: Date | string | null | undefined) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(seconds) >= secondsInUnit) {
      return rtf.format(-Math.round(seconds / secondsInUnit), unit);
    }
  }

  return seconds <= 5 ? "just now" : rtf.format(-seconds, "second");
};

/** Label for a create/edit form's submit button across its pending/create/edit states. */
export const submitLabel = (isPending: boolean, mode: "create" | "edit") => {
  if (isPending) {
    return "Saving…";
  }
  return mode === "create" ? "Create" : "Save changes";
};

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/** Turns a raw User-Agent string into a short human summary, e.g. "Chrome on macOS". */
export const summarizeUserAgent = (userAgent: string | null | undefined) => {
  if (!userAgent) {
    return "Unknown device";
  }

  let browser = "Unknown browser";
  if (userAgent.includes("Edg/")) {
    browser = "Edge";
  } else if (userAgent.includes("Chrome/") && !userAgent.includes("Chromium")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    browser = "Safari";
  }

  let os = "Unknown OS";
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS")) {
    os = "macOS";
  } else if (userAgent.includes("Android")) {
    os = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
};

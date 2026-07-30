// Central place for company information used across the marketing site.
// Everything marked "TODO" is placeholder content pending real business
// details from Esteric Kitchens & Interior Designs Ltd.

export const siteConfig = {
  name: "Esteric Kitchens & Interior Designs",
  legalName: "Esteric Kitchens & Interior Designs Ltd",
  tagline:
    "Bespoke kitchens, interiors, and landscapes crafted around the way you live.",
  // TODO: replace with the real registered office / showroom address.
  address: {
    line1: "Waiyaki Way, Westlands",
    line2: "Nairobi, Kenya",
    full: "Waiyaki Way, Westlands, Nairobi, Kenya",
  },
  // TODO: replace with real contact details before launch.
  phone: "+254 700 000 000",
  phoneHref: "tel:+254700000000",
  email: "hello@ekiinteriors.com",
  // TODO: replace with the real WhatsApp Business number (digits only, with country code, no leading +).
  whatsappNumber: "254700000000",
  whatsappMessage:
    "Hello Esteric, I'd like to enquire about your design services.",
  hours: [
    { days: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
    { days: "Saturday", hours: "9:00 AM – 3:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],
  // TODO: swap for the real showroom coordinates once confirmed.
  googleMapsEmbedSrc:
    "https://www.google.com/maps?q=Waiyaki+Way,+Westlands,+Nairobi,+Kenya&output=embed",
  googleMapsLinkSrc:
    "https://maps.google.com/?q=Waiyaki+Way,+Westlands,+Nairobi,+Kenya",
  social: {
    // TODO: replace with the real social profile URLs.
    instagram: "https://instagram.com/estericinteriors",
    facebook: "https://facebook.com/estericinteriors",
    pinterest: "https://pinterest.com/estericinteriors",
    linkedin: "https://linkedin.com/company/estericinteriors",
  },
} as const;

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;

export const budgetRanges = [
  "Under KES 500,000",
  "KES 500,000 – 1,000,000",
  "KES 1,000,000 – 3,000,000",
  "KES 3,000,000 – 5,000,000",
  "Above KES 5,000,000",
  "Not sure yet",
] as const;

export const appointmentSlots = [
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "1:00 PM – 2:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
] as const;

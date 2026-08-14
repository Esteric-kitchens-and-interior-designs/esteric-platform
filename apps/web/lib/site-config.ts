// Central place for company information used across the marketing site.
// Everything marked "TODO" is placeholder content pending real business
// details from Esteric Kitchens & Interior Designs Ltd.

export const siteConfig = {
  name: "Esteric Kitchens & Interior Designs",
  legalName: "Esteric Kitchens & Interior Designs Ltd",
  tagline:
    "Bespoke kitchens, interiors, and landscapes crafted around the way you live.",
  // Disabled at the client's request until a confirmed studio/showroom
  // address is provided — flip back to true to restore the address block
  // and map on the Contact page, the footer, and appointment calendar
  // invites. The address/map fields below are left populated so re-enabling
  // is a one-line change once real details are confirmed.
  showAddress: false,
  // TODO: replace with the real registered office / showroom address.
  address: {
    line1: "Waiyaki Way, Westlands",
    line2: "Nairobi, Kenya",
    full: "Waiyaki Way, Westlands, Nairobi, Kenya",
  },
  phone: "+254 723 993 333",
  phoneHref: "tel:+254723993333",
  email: "hello@ekiinteriors.com",
  whatsappNumber: "254723993333",
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
    instagram: "https://www.instagram.com/ekiinteriors",
    tiktok: "https://www.tiktok.com/@ekiinteriors",
    x: "https://x.com/ekiinteriors",
    facebook: "https://www.facebook.com/EstericKitchensandInteriorDesigns",
    linkedin:
      "https://www.linkedin.com/company/esteric-kitchens-interior-designs",
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

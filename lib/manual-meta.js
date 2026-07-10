/**
 * Presentation metadata for the known Travellink manuals.
 *
 * Titles and blurbs are derived from each document's own <title> and intro
 * paragraph, so they stay truthful to the content behind the card. Files that
 * match nothing here still render, using the filename-derived title.
 */
const KNOWN_MANUALS = [
  {
    key: "superadmin",
    pattern: /super\s*-?admin/,
    title: "SK Voyages Super Admin Dashboard",
    surface: "Web dashboard",
    blurb:
      "Platform money flow, vendor and driver activity, live trips, onboarding, invoices, reports, and SOS alerts."
  },
  {
    key: "supervisor",
    pattern: /supervisor/,
    title: "Travellink Supervisor App",
    surface: "Mobile app",
    blurb:
      "Create a booking, publish it to drivers, accept driver requests, and watch active trips on a map."
  },
  {
    key: "vendor",
    pattern: /vendor/,
    title: "Travellink Vendor Dashboard",
    surface: "Web dashboard",
    blurb:
      "Your daily control room for trips, supervisors, tickets, wallet activity, invoices, and profile settings."
  },
  {
    key: "driver",
    pattern: /driver/,
    title: "Travellink Driver App",
    surface: "Mobile app",
    blurb:
      "Receive trips, chat with passengers, manage your vehicle documents, and withdraw your earnings."
  }
];

export function getManualMeta(page) {
  const haystack = `${page.path} ${page.title}`.toLowerCase();
  const known = KNOWN_MANUALS.find((manual) => manual.pattern.test(haystack));

  if (!known) {
    return { key: "default", title: page.title, surface: "HTML manual", blurb: "" };
  }

  return { key: known.key, title: known.title, surface: known.surface, blurb: known.blurb };
}

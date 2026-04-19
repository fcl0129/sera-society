import { LucideIcon, Clock3, GlassWater, Ticket } from "lucide-react";

export type EventInfoSection = {
  title: string;
  icon: LucideIcon;
  lines: string[];
};

export type EventPageExample = {
  key: string;
  name: string;
  title: string;
  location: string;
  dateTimeLabel: string;
  hostLine: string;
  about: string;
  themeId?: string | null;
  sections: EventInfoSection[];
};

export const eventPageExamples: EventPageExample[] = [
  {
    key: "garden-editorial",
    name: "Garden Editorial",
    title: "Conservatory Luncheon Invitation",
    location: "The Orangery at Gramercy, New York",
    dateTimeLabel: "Sunday, June 14 · 1:00 PM",
    hostLine: "Hosted by Sera Society with floral table settings, strings, and a champagne welcome.",
    about:
      "An airy afternoon gathering with soft florals and long-table dining. The pace is intentionally graceful, moving from welcome service to lounge conversation in the winter garden.",
    themeId: "garden-editorial",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Garden formal attire", "Arrival from 12:30 PM", "Private east conservatory entrance"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["1:00 PM · Welcome pour", "1:35 PM · Seasonal menu", "3:15 PM · Dessert salon"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["Named digital invitation required", "Champagne pairings included", "Tea service through close"],
      },
    ],
  },
  {
    key: "candlelight-supper",
    name: "Candlelight Supper",
    title: "Noir Dining Society",
    location: "Maison Vellum, West Village",
    dateTimeLabel: "Friday, October 9 · 8:15 PM",
    hostLine: "Hosted by Sera Society in a candlelit salon with a private chef tasting.",
    about:
      "A warm, cinematic dinner experience designed around low light, curated courses, and intimate seating rhythms that move naturally into a nightcap lounge.",
    themeId: "candlelight-supper",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Black tie or evening formal", "Doors open at 7:45 PM", "Invite-only, no on-site sales"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["8:15 PM · Seating and aperitif", "8:45 PM · Tasting begins", "10:30 PM · Cigar terrace opens"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["Name-matched entry", "Wine pairings included", "Limited late-arrival window"],
      },
    ],
  },
  {
    key: "gala-noir",
    name: "Gala Noir",
    title: "Champagne Midnight Gala",
    location: "Aurora Hall, Tribeca",
    dateTimeLabel: "Wednesday, December 31 · 9:00 PM",
    hostLine: "Hosted by Sera Society with a midnight performance and skyline toast.",
    about:
      "A sharp, formal evening designed with high contrast and polished detail, balancing energetic stage moments with luxurious lounge transitions.",
    themeId: "gala-noir",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Festive formal dress code", "Entry begins at 8:30 PM", "Coat check on arrival"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["9:00 PM · Reception", "11:50 PM · Countdown staging", "12:00 AM · Midnight toast"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["QR invite required", "Toast pour included", "After-hours access until 2:00 AM"],
      },
    ],
  },
  {
    key: "riviera-sunset",
    name: "Riviera Sunset",
    title: "Sunset Shore Reception",
    location: "Drift House Beach Club, Malibu",
    dateTimeLabel: "Saturday, August 22 · 6:30 PM",
    hostLine: "Hosted by Sera Society with sunset cocktails and acoustic shoreline sets.",
    about:
      "A coastal invitation with warm paper-like tones and relaxed luxury pacing. Guests flow from golden hour service into lantern-lit cabana dining.",
    themeId: "riviera-sunset",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Coastal cocktail attire", "Shuttle drop-off from 6:00 PM", "Barefoot lounge available"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["6:30 PM · Beach welcome", "7:20 PM · Sunset set", "8:15 PM · Dinner lounge"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["Digital pass at gate", "Signature spritz included", "Cabana upgrades on-site"],
      },
    ],
  },
  {
    key: "modern-monograph",
    name: "Modern Monograph",
    title: "Edition No. 07 — Monograph Night",
    location: "Atelier Mercer, SoHo",
    dateTimeLabel: "Thursday, September 17 · 7:30 PM",
    hostLine: "Hosted by Sera Society with live editorial projection and vinyl set transitions.",
    about:
      "A typographic-forward salon with art-directed pacing, quiet luxury materials, and a monochrome-first mood punctuated by one bold accent.",
    themeId: "modern-monograph",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Fashion evening attire", "Doors at 7:00 PM", "Limited capacity seating"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["7:30 PM · Editorial screening", "8:15 PM · Hosted conversation", "9:20 PM · Lounge set"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["Invite scan at check-in", "Signature cocktail token", "Gallery floor access"],
      },
    ],
  },
  {
    key: "after-dark",
    name: "After Dark",
    title: "After Dark Residency",
    location: "The Meridian Rooms, Lower East Side",
    dateTimeLabel: "Saturday, November 7 · 10:00 PM",
    hostLine: "Hosted by Sera Society with a late-night sonic program and curated bar service.",
    about:
      "An atmospheric nighttime invitation with magnetic contrast and subtle glow. Designed for fluid movement between dance floor energy and conversation pockets.",
    themeId: "after-dark",
    sections: [
      {
        title: "Details",
        icon: Ticket,
        lines: ["Night editorial attire", "Priority entry before 10:45 PM", "Photo ID required"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["10:00 PM · Doors", "11:15 PM · Headline set", "1:00 AM · Closing lounge"],
      },
      {
        title: "Guest pass",
        icon: GlassWater,
        lines: ["QR pass required", "Two hosted drink redemptions", "Reserved lounge tiers available"],
      },
    ],
  },
];

export const eventPageExampleByKey = Object.fromEntries(
  eventPageExamples.map((example) => [example.key, example])
) as Record<string, EventPageExample>;

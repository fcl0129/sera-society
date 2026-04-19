import { EventPageThemeKey } from "@/lib/event-page-theme";
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
  themeKey: EventPageThemeKey;
  sections: EventInfoSection[];
};

export const eventPageExamples: EventPageExample[] = [
  {
    key: "light-garden",
    name: "Light Garden",
    title: "Garden Conservatory Luncheon",
    location: "The Glasshouse Terrace, Manhattan",
    dateTimeLabel: "Sunday, June 14 · 1:00 PM",
    hostLine: "Hosted by Sera Society with live strings, floral tablescapes, and champagne service.",
    about:
      "An airy midday gathering framed by seasonal florals, layered linens, and soft instrumental sets. Designed for conversation and an easy flow between dining and garden lounge moments.",
    themeKey: "light-garden",
    sections: [
      {
        title: "Event details",
        icon: Ticket,
        lines: ["Garden formal attire", "Valet opens at 12:30 PM", "Private entrance through the east courtyard"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["1:00 PM · Welcome toast", "1:30 PM · Seasonal tasting menu", "3:15 PM · Dessert garden service"],
      },
      {
        title: "Tickets & passes",
        icon: GlassWater,
        lines: ["Digital invite required", "Complimentary champagne pairing", "Tea and coffee service included"],
      },
    ],
  },
  {
    key: "dark-dinner",
    name: "Dark Dinner",
    title: "Noir Supper Society",
    location: "Maison Vellum, West Village",
    dateTimeLabel: "Friday, October 9 · 8:15 PM",
    hostLine: "Hosted by Sera Society in a candlelit dining room with a private chef menu.",
    about:
      "A luxurious late-evening supper with low light, rich textures, and intimate seating. The pace is intentionally unhurried, moving from welcome cocktails to curated courses and nightcap lounge.",
    themeKey: "dark-dinner",
    sections: [
      {
        title: "Event details",
        icon: Ticket,
        lines: ["Black tie or evening formal", "Doors open at 7:45 PM", "No on-site ticket sales"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["8:15 PM · Seating and aperitif", "8:45 PM · Chef's tasting begins", "10:30 PM · After-dinner lounge"],
      },
      {
        title: "Tickets & passes",
        icon: GlassWater,
        lines: ["Name-matched entry only", "Wine pairings included", "Limited late arrival window"],
      },
    ],
  },
  {
    key: "new-year-gala",
    name: "New Year Gala",
    title: "Champagne Countdown Gala",
    location: "Aurora Hall, Tribeca",
    dateTimeLabel: "Wednesday, December 31 · 9:00 PM",
    hostLine: "Hosted by Sera Society with a midnight performance and skyline countdown.",
    about:
      "A bold New Year celebration with dramatic lighting, champagne-toned details, and high-energy pacing. Expect photo moments, live stage transitions, and a ceremonial midnight toast.",
    themeKey: "new-year-gala",
    sections: [
      {
        title: "Event details",
        icon: Ticket,
        lines: ["Festive formal attire", "Entry begins at 8:30 PM", "Coat check available on arrival"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["9:00 PM · Welcome reception", "11:50 PM · Countdown staging", "12:00 AM · Midnight toast"],
      },
      {
        title: "Tickets & passes",
        icon: GlassWater,
        lines: ["QR ticket required", "Champagne toast included", "After-hours access until 2:00 AM"],
      },
    ],
  },
  {
    key: "sunset-beach",
    name: "Sunset Beach",
    title: "Sunset Shore Reception",
    location: "Drift House Beach Club, Malibu",
    dateTimeLabel: "Saturday, August 22 · 6:30 PM",
    hostLine: "Hosted by Sera Society with shoreline cocktails and acoustic sunset sessions.",
    about:
      "A relaxed premium beach evening with warm tones, soft ambient sound, and coastal dining stations. The experience shifts from sunset cocktails into candlelit cabana seating after dusk.",
    themeKey: "sunset-beach",
    sections: [
      {
        title: "Event details",
        icon: Ticket,
        lines: ["Coastal cocktail attire", "Shuttle drop-off from 6:00 PM", "Barefoot lounge available"],
      },
      {
        title: "Schedule",
        icon: Clock3,
        lines: ["6:30 PM · Beachside welcome", "7:20 PM · Sunset acoustic set", "8:15 PM · Dinner lounge opens"],
      },
      {
        title: "Tickets & passes",
        icon: GlassWater,
        lines: ["Digital pass at security gate", "Signature sunset spritz included", "Premium cabana upgrades onsite"],
      },
    ],
  },
];

export const eventPageExampleByKey = Object.fromEntries(
  eventPageExamples.map((example) => [example.key, example])
) as Record<string, EventPageExample>;

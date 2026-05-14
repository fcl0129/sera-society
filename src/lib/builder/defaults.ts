import type { BuilderConfig, InvitationStyleKey, WidgetKey } from "./types";

export const ALL_WIDGETS: { key: WidgetKey; label: string; description: string }[] = [
  { key: "hero", label: "Hero / Invitation", description: "Title, date, location, invitation text" },
  { key: "rsvp", label: "RSVP", description: "Guest RSVP form" },
  { key: "schedule", label: "Schedule", description: "Timeline for the evening" },
  { key: "location", label: "Location", description: "Address, arrival notes, transport" },
  { key: "dress_code", label: "Dress code", description: "What to wear" },
  { key: "menu", label: "Menu", description: "Food and drink, dietary notes" },
  { key: "guest_notes", label: "Guest notes", description: "Important info from the host" },
  { key: "playlist", label: "Playlist", description: "Spotify or music vibe" },
  { key: "gift", label: "Gift / Contribution", description: "Registry, Swish, or a no-gifts note" },
  { key: "accommodation", label: "Accommodation", description: "Hotel and travel details" },
  { key: "gallery", label: "Gallery / Moodboard", description: "Visual moodboard for the vibe" },
  { key: "drink_tickets", label: "Drink tickets", description: "Sera Pass placeholder" },
  { key: "checkin", label: "Check-in", description: "Event check-in placeholder" },
];

export const INVITATION_STYLES: {
  key: InvitationStyleKey;
  name: string;
  tagline: string;
  swatch: string[];
}[] = [
  {
    key: "midnight_dinner",
    name: "Midnight Dinner",
    tagline: "Deep navy, cream serif, intimate.",
    swatch: ["hsl(var(--sera-deep-navy))", "hsl(var(--sera-ivory))", "hsl(var(--sera-brass, var(--sera-warm-grey)))"],
  },
  {
    key: "oxblood_salon",
    name: "Oxblood Salon",
    tagline: "Dramatic, editorial, exclusive evening.",
    swatch: ["hsl(var(--sera-oxblood))", "hsl(var(--sera-ivory))", "hsl(var(--sera-rosewood))"],
  },
  {
    key: "garden_after_dark",
    name: "Garden After Dark",
    tagline: "Moss, cream, soft evening garden.",
    swatch: ["hsl(var(--sera-moss))", "hsl(var(--sera-ivory))", "hsl(var(--sera-matcha-mist))"],
  },
  {
    key: "champagne_minimal",
    name: "Champagne Minimal",
    tagline: "Clean, light, refined modern.",
    swatch: ["hsl(var(--sera-ivory))", "hsl(var(--sera-beige))", "hsl(var(--sera-warm-grey))"],
  },
  {
    key: "velvet_club",
    name: "Velvet Club",
    tagline: "Cinematic, slightly secretive.",
    swatch: ["hsl(var(--sera-charcoal))", "hsl(var(--sera-oxblood))", "hsl(var(--sera-ivory))"],
  },
];

export function defaultConfig(): BuilderConfig {
  return {
    basics: {
      title: "",
      type: "dinner",
      date: "",
      startTime: "19:00",
      endTime: "23:00",
      location: "",
      dressCode: "Elevated evening",
      hostName: "",
      description: "",
    },
    invitation: {
      style: "midnight_dinner",
      headline: "An evening, by invitation.",
      subheading: "A small gathering for a small circle.",
      hostLine: "Hosted with care",
      rsvpCta: "Reply",
      note: "",
    },
    guests: [],
    rsvp: {
      deadline: "",
      allowPlusOnes: false,
      askDietary: true,
      askSong: false,
      askArrival: false,
      customQuestion: "",
      confirmationMessage: "Thank you. We can’t wait to host you.",
    },
    widgets: {
      enabled: {
        hero: true,
        rsvp: true,
        schedule: true,
        location: true,
        dress_code: true,
        menu: false,
        guest_notes: false,
        playlist: false,
        gift: false,
        accommodation: false,
        gallery: false,
        drink_tickets: false,
        checkin: false,
      },
      order: [
        "hero",
        "rsvp",
        "schedule",
        "location",
        "dress_code",
        "menu",
        "guest_notes",
        "playlist",
        "gift",
        "accommodation",
        "gallery",
        "drink_tickets",
        "checkin",
      ],
      schedule: [
        { id: "s1", time: "19:00", title: "Arrival" },
        { id: "s2", time: "19:45", title: "Dinner" },
        { id: "s3", time: "22:00", title: "Music" },
      ],
      locationNotes: "",
      menu: "",
      guestNotes: "",
      playlistUrl: "",
      gift: "",
      accommodation: "",
      moodboardUrls: [],
    },
  };
}

export function makeSlug(title: string): string {
  const base = (title || "evening").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base || "evening"}-${Math.random().toString(36).slice(2, 6)}`;
}
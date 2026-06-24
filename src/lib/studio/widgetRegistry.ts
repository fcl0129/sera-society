import type { WidgetType, WidgetInstance } from "./types";

export interface WidgetMeta {
  type: WidgetType;
  label: string;
  description: string;
  defaultConfig: Record<string, unknown>;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetMeta> = {
  hero: {
    type: "hero",
    label: "Hero / Invitation",
    description: "Title, host message, date, RSVP call to action.",
    defaultConfig: { showRsvpButton: true, hostMessage: "" },
  },
  rsvp: {
    type: "rsvp",
    label: "RSVP",
    description: "Accept or decline, plus-one, dietary, notes.",
    defaultConfig: { allowPlusOne: true, askDietary: true, askNotes: true },
  },
  map: {
    type: "map",
    label: "Map & Location",
    description: "Address, embedded map link, transport note.",
    defaultConfig: { address: "", mapsUrl: "", transportNote: "" },
  },
  spotify: {
    type: "spotify",
    label: "Spotify Playlist",
    description: "Embed a Spotify playlist for guests.",
    defaultConfig: { url: "", title: "The playlist" },
  },
  photo_wall: {
    type: "photo_wall",
    label: "Live Photo Wall",
    description: "Guests upload photos that appear on the page.",
    defaultConfig: { caption: "Add to the wall" },
  },
  guestbook: {
    type: "guestbook",
    label: "Guestbook",
    description: "Notes from guests, displayed on the page.",
    defaultConfig: { showMessages: true, prompt: "Leave a note." },
  },
  seating: {
    type: "seating",
    label: "Seating / Tables",
    description: "Table assignments — full chart or find-your-seat.",
    defaultConfig: { mode: "find_your_seat", tables: [] },
  },
  prompts: {
    type: "prompts",
    label: "Guest Prompts",
    description: "Ask guests questions before the night.",
    defaultConfig: {
      prompts: [
        { id: "song", label: "Song request" },
        { id: "toast", label: "What should we toast to?" },
      ],
    },
  },
  schedule: {
    type: "schedule",
    label: "Schedule / Run of Show",
    description: "Timeline items with time, title, detail.",
    defaultConfig: {
      items: [
        { time: "19:30", title: "Arrival", detail: "" },
        { time: "20:30", title: "Dinner", detail: "" },
      ],
    },
  },
  dress_code: {
    type: "dress_code",
    label: "Dress Code / Moodboard",
    description: "Dress code text and inspiration notes.",
    defaultConfig: { text: "Cocktail", notes: "" },
  },
  check_in: {
    type: "check_in",
    label: "Check-in Pass",
    description: "Guest sees their personal check-in QR / status (post-RSVP only).",
    defaultConfig: { instructions: "Show this at the door." },
  },
  drink_tickets: {
    type: "drink_tickets",
    label: "Drink Tickets",
    description: "Guest's active drink tickets, redeemable at the bar.",
    defaultConfig: { instructions: "Tap or show to your bartender." },
  },
};

export const WIDGET_ORDER: WidgetType[] = [
  "hero",
  "rsvp",
  "schedule",
  "map",
  "dress_code",
  "spotify",
  "prompts",
  "guestbook",
  "photo_wall",
  "seating",
  "check_in",
  "drink_tickets",
];

let counter = 0;
export function newWidgetId(type: WidgetType) {
  counter += 1;
  return `${type}-${Date.now().toString(36)}-${counter}`;
}

export function defaultWidgets(): WidgetInstance[] {
  return [
    {
      id: newWidgetId("hero"),
      type: "hero",
      enabled: true,
      order: 0,
      config: { ...WIDGET_REGISTRY.hero.defaultConfig },
    },
    {
      id: newWidgetId("rsvp"),
      type: "rsvp",
      enabled: true,
      order: 1,
      config: { ...WIDGET_REGISTRY.rsvp.defaultConfig },
    },
    {
      id: newWidgetId("schedule"),
      type: "schedule",
      enabled: true,
      order: 2,
      config: JSON.parse(JSON.stringify(WIDGET_REGISTRY.schedule.defaultConfig)),
    },
  ];
}
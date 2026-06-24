import type { EventPageConfig, WidgetInstance } from "./types";
import { WIDGET_REGISTRY, newWidgetId } from "./widgetRegistry";
import type { WidgetType } from "./types";

export interface StudioTemplate {
  id: string;
  name: string;
  category: "invitation" | "event_page";
  tagline: string;
  themeId: string;
  accent?: string;
  background?: string;
  /** Sample copy used to pre-fill hero / dress code etc. */
  sampleCopy: {
    title?: string;
    hostMessage?: string;
    dressCode?: string;
    dressNotes?: string;
    venue?: string;
    schedule?: { time: string; title: string; detail?: string }[];
    prompts?: { id: string; label: string }[];
    guestbookPrompt?: string;
    transportNote?: string;
    spotifyUrl?: string;
  };
  /** Widget types to enable, in display order. */
  widgets: WidgetType[];
}

function makeWidget(type: WidgetType, order: number, override: Record<string, unknown> = {}): WidgetInstance {
  return {
    id: newWidgetId(type),
    type,
    enabled: true,
    order,
    config: { ...JSON.parse(JSON.stringify(WIDGET_REGISTRY[type].defaultConfig)), ...override },
  };
}

export function buildConfigFromTemplate(tpl: StudioTemplate): EventPageConfig {
  const widgets: WidgetInstance[] = tpl.widgets.map((type, i) => {
    const override: Record<string, unknown> = {};
    if (type === "hero") override.hostMessage = tpl.sampleCopy.hostMessage ?? "";
    if (type === "dress_code") {
      override.text = tpl.sampleCopy.dressCode ?? "";
      override.notes = tpl.sampleCopy.dressNotes ?? "";
    }
    if (type === "schedule" && tpl.sampleCopy.schedule) override.items = tpl.sampleCopy.schedule;
    if (type === "prompts" && tpl.sampleCopy.prompts) override.prompts = tpl.sampleCopy.prompts;
    if (type === "guestbook" && tpl.sampleCopy.guestbookPrompt) override.prompt = tpl.sampleCopy.guestbookPrompt;
    if (type === "map" && tpl.sampleCopy.transportNote) override.transportNote = tpl.sampleCopy.transportNote;
    if (type === "spotify" && tpl.sampleCopy.spotifyUrl) override.url = tpl.sampleCopy.spotifyUrl;
    return makeWidget(type, i, override);
  });
  return {
    theme: {
      themeId: tpl.themeId,
      accent: tpl.accent,
      background: tpl.background,
      texture: true,
      corner: "editorial",
      density: "airy",
    },
    widgets,
  };
}

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  {
    id: "engagement_dinner",
    name: "Engagement Dinner",
    category: "event_page",
    tagline: "Candlelit, intimate, oxblood and brass.",
    themeId: "midnight_supper",
    sampleCopy: {
      title: "An engagement dinner",
      hostMessage: "A slow dinner with the people we love most, before we say it out loud.",
      dressCode: "Black tie, relaxed",
      dressNotes: "Velvet, silk, the good shoes.",
      schedule: [
        { time: "19:30", title: "Arrival & champagne" },
        { time: "20:15", title: "Dinner served" },
        { time: "22:00", title: "Toasts" },
        { time: "23:00", title: "Music & dancing" },
      ],
      guestbookPrompt: "Leave a wish for the two of us.",
    },
    widgets: ["hero", "rsvp", "schedule", "map", "dress_code", "guestbook"],
  },
  {
    id: "garden_party",
    name: "Garden Party",
    category: "event_page",
    tagline: "Moss, fig leaves, lanterns at dusk.",
    themeId: "garden_after_dark",
    sampleCopy: {
      title: "Supper in the garden",
      hostMessage: "Long table, low light, late summer.",
      dressCode: "Garden cocktail",
      dressNotes: "Linen, flat shoes for grass.",
      schedule: [
        { time: "18:30", title: "Aperitif on the terrace" },
        { time: "19:30", title: "Supper" },
        { time: "22:00", title: "Cordials & cards" },
      ],
      prompts: [
        { id: "song", label: "A song that should play after dessert" },
        { id: "memory", label: "A garden party memory" },
      ],
    },
    widgets: ["hero", "rsvp", "schedule", "map", "dress_code", "prompts", "spotify"],
  },
  {
    id: "gallery_opening",
    name: "Gallery Opening",
    category: "event_page",
    tagline: "White cube, oversized type, restrained.",
    themeId: "gallery_opening",
    sampleCopy: {
      title: "A private viewing",
      hostMessage: "Doors open at six. Drinks in the back room.",
      dressCode: "All black, or surprise us.",
      schedule: [
        { time: "18:00", title: "Doors" },
        { time: "19:00", title: "Artist remarks" },
        { time: "21:00", title: "After" },
      ],
    },
    widgets: ["hero", "rsvp", "schedule", "map", "dress_code", "photo_wall"],
  },
  {
    id: "summer_terrace",
    name: "Summer Terrace",
    category: "event_page",
    tagline: "Sun-bleached linen, terracotta, late afternoon.",
    themeId: "summer_terrace",
    sampleCopy: {
      title: "Sundown on the terrace",
      hostMessage: "Negronis, vinyl, the last warm evening of the week.",
      dressCode: "Resort",
      schedule: [
        { time: "17:00", title: "Drinks" },
        { time: "19:00", title: "Small plates" },
        { time: "22:00", title: "Music until late" },
      ],
    },
    widgets: ["hero", "rsvp", "schedule", "map", "dress_code", "spotify", "photo_wall"],
  },
  {
    id: "birthday_red_room",
    name: "Birthday · Red Room",
    category: "event_page",
    tagline: "Velvet, low light, the slow tempo years.",
    themeId: "red_room",
    sampleCopy: {
      title: "A birthday",
      hostMessage: "No gifts. Just you, properly dressed, properly late.",
      dressCode: "Red carpet, your own version of it.",
      schedule: [
        { time: "21:00", title: "Arrival" },
        { time: "22:00", title: "Cake (we mean it)" },
        { time: "00:00", title: "After" },
      ],
      guestbookPrompt: "Tell me one thing you're glad I did this year.",
    },
    widgets: ["hero", "rsvp", "schedule", "map", "dress_code", "guestbook", "spotify"],
  },
  {
    id: "minimal_invite",
    name: "Minimal Invitation",
    category: "invitation",
    tagline: "Paper-quiet. Just the essentials.",
    themeId: "minimal_ivory",
    sampleCopy: {
      title: "You are invited",
      hostMessage: "Details below. Please reply by next Friday.",
      dressCode: "Smart",
    },
    widgets: ["hero", "rsvp", "map", "dress_code"],
  },
  {
    id: "midnight_invite",
    name: "Midnight Invitation",
    category: "invitation",
    tagline: "An invitation that arrives after dark.",
    themeId: "midnight_supper",
    sampleCopy: {
      title: "An evening, by invitation",
      hostMessage: "A small gathering for a small circle.",
      dressCode: "Elevated evening",
    },
    widgets: ["hero", "rsvp", "map", "dress_code"],
  },
  {
    id: "blank",
    name: "Start blank",
    category: "event_page",
    tagline: "Empty canvas — choose every widget yourself.",
    themeId: "minimal_ivory",
    sampleCopy: { title: "Untitled evening" },
    widgets: ["hero", "rsvp"],
  },
];
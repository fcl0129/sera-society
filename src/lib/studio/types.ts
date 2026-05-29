export type WidgetType =
  | "hero"
  | "rsvp"
  | "map"
  | "spotify"
  | "photo_wall"
  | "guestbook"
  | "seating"
  | "prompts"
  | "schedule"
  | "dress_code";

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

export type Visibility = "private_link" | "request_access" | "invite_only";

export interface ThemeCustomization {
  themeId: string;
  headingFont?: string;
  bodyFont?: string;
  background?: string;
  accent?: string;
  texture?: boolean;
  corner?: "sharp" | "soft" | "editorial";
  density?: "airy" | "compact" | "dramatic";
}

export interface EventPageConfig {
  theme: ThemeCustomization;
  widgets: WidgetInstance[];
}

export interface EventBasics {
  title: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  description: string;
  dress_code: string;
  host_note: string;
  rsvp_cutoff_at: string;
  capacity: string;
  visibility: Visibility;
}

export const DEFAULT_PAGE_CONFIG: EventPageConfig = {
  theme: {
    themeId: "midnight_supper",
    texture: true,
    corner: "editorial",
    density: "airy",
  },
  widgets: [],
};
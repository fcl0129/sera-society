import { CSSProperties } from "react";

export type EventPageTheme = {
  background: string;
  overlay: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  cardStyle: string;
  fontHeading: string;
  fontBody: string;
};

export const eventPageThemes = {
  "light-editorial": {
    background: "#f6f0e7",
    overlay: "linear-gradient(155deg, rgba(255, 250, 242, 0.92), rgba(240, 228, 212, 0.84))",
    textPrimary: "#2a1d16",
    textSecondary: "#6b5648",
    accent: "#8a4738",
    cardStyle: "border-[#dcc8b5]/80 bg-[#fff8ef]/88 backdrop-blur-sm",
    fontHeading: "font-serif",
    fontBody: "font-sans",
  },
  "dark-luxury": {
    background: "#110d0a",
    overlay: "linear-gradient(160deg, rgba(10, 8, 7, 0.88), rgba(31, 19, 13, 0.78))",
    textPrimary: "#f6ebe0",
    textSecondary: "#c8b09a",
    accent: "#d8a679",
    cardStyle: "border-[#6f4e39]/60 bg-[#1c1410]/76 backdrop-blur-sm",
    fontHeading: "font-serif",
    fontBody: "font-sans",
  },
} satisfies Record<string, EventPageTheme>;

export type EventPageThemeKey = keyof typeof eventPageThemes;

type EventThemeInput = {
  themeKey?: string | null;
  overrides?: Partial<EventPageTheme> | null;
};

export function resolveEventPageTheme({ themeKey, overrides }: EventThemeInput): EventPageTheme {
  const preset =
    (themeKey && themeKey in eventPageThemes ? eventPageThemes[themeKey as EventPageThemeKey] : eventPageThemes["light-editorial"]);

  return {
    ...preset,
    ...overrides,
  };
}

export function eventThemeCssVariables(theme: EventPageTheme): CSSProperties {
  return {
    "--event-background": theme.background,
    "--event-overlay": theme.overlay,
    "--event-text-primary": theme.textPrimary,
    "--event-text-secondary": theme.textSecondary,
    "--event-accent": theme.accent,
  } as CSSProperties;
}

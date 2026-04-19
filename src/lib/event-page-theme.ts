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
  "light-garden": {
    background: "#f5efe3",
    overlay:
      "radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 45%), radial-gradient(circle at 84% 16%, rgba(236, 217, 191, 0.44), rgba(236, 217, 191, 0) 48%), linear-gradient(168deg, rgba(255, 250, 241, 0.94), rgba(236, 223, 204, 0.84))",
    textPrimary: "#2f231b",
    textSecondary: "#6f5b49",
    accent: "#9b6f53",
    cardStyle: "border-[#d8c7b0]/80 bg-[#fff8ef]/84 backdrop-blur-sm",
    fontHeading: "font-serif",
    fontBody: "font-sans",
  },
  "dark-dinner": {
    background: "#0f0b09",
    overlay:
      "radial-gradient(circle at 18% 14%, rgba(234, 188, 116, 0.2), rgba(234, 188, 116, 0) 38%), radial-gradient(circle at 78% 24%, rgba(255, 226, 172, 0.16), rgba(255, 226, 172, 0) 34%), linear-gradient(162deg, rgba(7, 6, 5, 0.95), rgba(29, 19, 13, 0.86))",
    textPrimary: "#f5e9db",
    textSecondary: "#ceb69f",
    accent: "#d9ac68",
    cardStyle: "border-[#7a583f]/58 bg-[#19120e]/78 backdrop-blur-sm",
    fontHeading: "font-serif",
    fontBody: "font-sans",
  },
  "new-year-gala": {
    background: "#120f16",
    overlay:
      "radial-gradient(circle at 18% 12%, rgba(255, 220, 170, 0.22), rgba(255, 220, 170, 0) 34%), radial-gradient(circle at 74% 15%, rgba(255, 247, 230, 0.16), rgba(255, 247, 230, 0) 28%), radial-gradient(circle at 56% 42%, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0) 45%), linear-gradient(165deg, rgba(12, 10, 18, 0.94), rgba(38, 27, 32, 0.82))",
    textPrimary: "#fff8ef",
    textSecondary: "#d8c3a4",
    accent: "#f2cc8f",
    cardStyle: "border-[#9a7a53]/48 bg-[#1b1520]/78 backdrop-blur-sm",
    fontHeading: "font-serif",
    fontBody: "font-sans",
  },
  "sunset-beach": {
    background: "#f0cda9",
    overlay:
      "radial-gradient(circle at 16% 8%, rgba(255, 246, 225, 0.56), rgba(255, 246, 225, 0) 42%), radial-gradient(circle at 80% 20%, rgba(255, 177, 123, 0.32), rgba(255, 177, 123, 0) 44%), linear-gradient(172deg, rgba(250, 206, 168, 0.82), rgba(226, 154, 125, 0.76) 46%, rgba(191, 128, 111, 0.8))",
    textPrimary: "#2f1f1a",
    textSecondary: "#6d4d44",
    accent: "#c86f49",
    cardStyle: "border-[#d59e80]/70 bg-[#fff1df]/64 backdrop-blur-md",
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
    themeKey && themeKey in eventPageThemes
      ? eventPageThemes[themeKey as EventPageThemeKey]
      : eventPageThemes["light-garden"];

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

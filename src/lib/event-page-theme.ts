import { CSSProperties } from "react";
import { eventThemeRegistry, eventThemes, resolveEventTheme } from "@/lib/themes";

export type EventPageTheme = ReturnType<typeof resolveEventPageTheme>;

export const eventPageThemes = Object.fromEntries(
  eventThemes.map((theme) => [
    theme.id,
    {
      background: theme.colors.background,
      overlay: theme.backgroundOverlay,
      textPrimary: theme.colors.textPrimary,
      textSecondary: theme.colors.textSecondary,
      accent: theme.colors.accent,
      cardStyle: "border-[var(--event-surface-border)] bg-[var(--event-surface)]",
      fontHeading: theme.typography.heading,
      fontBody: theme.typography.body,
    },
  ])
);

type EventThemeInput = {
  themeKey?: string | null;
  overrides?: Partial<{
    background: string;
    overlay: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardStyle: string;
    fontHeading: string;
    fontBody: string;
  }> | null;
};

export function resolveEventPageTheme({ themeKey, overrides }: EventThemeInput) {
  const resolvedTheme = resolveEventTheme(themeKey);

  return {
    background: resolvedTheme.colors.background,
    overlay: resolvedTheme.backgroundOverlay,
    textPrimary: resolvedTheme.colors.textPrimary,
    textSecondary: resolvedTheme.colors.textSecondary,
    accent: resolvedTheme.colors.accent,
    cardStyle: "border-[var(--event-surface-border)] bg-[var(--event-surface)]",
    fontHeading: resolvedTheme.typography.heading,
    fontBody: resolvedTheme.typography.body,
    ...overrides,
  };
}

export function eventThemeCssVariables(theme: ReturnType<typeof resolveEventPageTheme>): CSSProperties {
  const resolved =
    Object.values(eventThemeRegistry).find((candidate) => candidate.colors.background === theme.background) ??
    resolveEventTheme(null);

  return {
    "--event-background": theme.background,
    "--event-overlay": theme.overlay,
    "--event-text-primary": theme.textPrimary,
    "--event-text-secondary": theme.textSecondary,
    "--event-accent": theme.accent,
    "--event-surface": resolved.colors.surface,
    "--event-surface-border": resolved.colors.surfaceBorder,
    "--event-button-bg": resolved.colors.buttonBg,
    "--event-button-text": resolved.colors.buttonText,
  } as CSSProperties;
}

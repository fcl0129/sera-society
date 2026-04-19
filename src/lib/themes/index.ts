import { CSSProperties } from "react";
import { EventTheme } from "@/types/theme";
import { eventThemes } from "@/lib/themes/themes";

const defaultThemeId = "garden-editorial";

export const eventThemeRegistry = Object.fromEntries(
  eventThemes.map((theme) => [theme.id, theme])
) as Record<string, EventTheme>;

export function resolveEventTheme(themeId?: string | null): EventTheme {
  if (!themeId) return eventThemeRegistry[defaultThemeId];
  return eventThemeRegistry[themeId] ?? eventThemeRegistry[defaultThemeId];
}

export function eventThemeCssVars(theme: EventTheme): CSSProperties {
  return {
    "--event-background": theme.colors.background,
    "--event-overlay": theme.backgroundOverlay,
    "--event-surface": theme.colors.surface,
    "--event-surface-border": theme.colors.surfaceBorder,
    "--event-text-primary": theme.colors.textPrimary,
    "--event-text-secondary": theme.colors.textSecondary,
    "--event-accent": theme.colors.accent,
    "--event-button-bg": theme.colors.buttonBg,
    "--event-button-text": theme.colors.buttonText,
  } as CSSProperties;
}

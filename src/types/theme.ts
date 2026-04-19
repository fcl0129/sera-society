export type ThemeCategory = "soft-light" | "dark-luxury" | "creative";

export type ThemeSurfaceStyle = "glass-light" | "glass-dark" | "paper" | "matte";

export type ThemeButtonStyle = "soft" | "outline" | "solid";

export type EventTheme = {
  id: string;
  name: string;
  category: ThemeCategory;
  backgroundImage?: string;
  backgroundOverlay: string;
  colors: {
    background: string;
    surface: string;
    surfaceBorder: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    buttonBg: string;
    buttonText: string;
  };
  typography: {
    heading: string;
    body: string;
    label: string;
  };
  surfaceStyle: ThemeSurfaceStyle;
  buttonStyle: ThemeButtonStyle;
};

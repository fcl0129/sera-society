export interface StudioTheme {
  id: string;
  name: string;
  mood: string;
  background: string;
  surface: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  headingFont: string;
  bodyFont: string;
  cornerRadius: number;
  buttonStyle: "outline" | "solid" | "soft";
  texture: boolean;
}

export const STUDIO_THEMES: StudioTheme[] = [
  {
    id: "midnight_supper",
    name: "Midnight Supper",
    mood: "Candlelit, intimate, oxblood and brass.",
    background: "linear-gradient(170deg,#0D1B2E 0%,#071426 100%)",
    surface: "rgba(255,250,240,0.04)",
    surfaceBorder: "rgba(169,132,92,0.32)",
    textPrimary: "#F5EFE3",
    textSecondary: "rgba(245,239,227,0.7)",
    accent: "#A9845C",
    accentSoft: "rgba(169,132,92,0.18)",
    headingFont: "Cormorant Garamond",
    bodyFont: "Inter",
    cornerRadius: 2,
    buttonStyle: "outline",
    texture: true,
  },
  {
    id: "garden_after_dark",
    name: "Garden After Dark",
    mood: "Moss, fig, low lanterns.",
    background: "linear-gradient(160deg,#1B2C22 0%,#0D1812 100%)",
    surface: "rgba(245,239,227,0.05)",
    surfaceBorder: "rgba(190,170,120,0.28)",
    textPrimary: "#F1EADA",
    textSecondary: "rgba(241,234,218,0.7)",
    accent: "#BEA678",
    accentSoft: "rgba(190,166,120,0.18)",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    cornerRadius: 4,
    buttonStyle: "outline",
    texture: true,
  },
  {
    id: "gallery_opening",
    name: "Gallery Opening",
    mood: "White cube, oversized type, restrained.",
    background: "#F6F4EE",
    surface: "#FFFFFF",
    surfaceBorder: "rgba(18,16,14,0.12)",
    textPrimary: "#12100E",
    textSecondary: "rgba(18,16,14,0.65)",
    accent: "#12100E",
    accentSoft: "rgba(18,16,14,0.06)",
    headingFont: "Instrument Serif",
    bodyFont: "Inter",
    cornerRadius: 0,
    buttonStyle: "solid",
    texture: false,
  },
  {
    id: "summer_terrace",
    name: "Summer Terrace",
    mood: "Sun-bleached linen, terracotta, late afternoon.",
    background: "linear-gradient(180deg,#F5E9DA 0%,#E9D3B8 100%)",
    surface: "rgba(255,255,255,0.6)",
    surfaceBorder: "rgba(168,98,66,0.25)",
    textPrimary: "#3A2418",
    textSecondary: "rgba(58,36,24,0.7)",
    accent: "#A86242",
    accentSoft: "rgba(168,98,66,0.14)",
    headingFont: "Cormorant Garamond",
    bodyFont: "Work Sans",
    cornerRadius: 18,
    buttonStyle: "soft",
    texture: false,
  },
  {
    id: "red_room",
    name: "Red Room",
    mood: "Velvet, low light, slow tempo.",
    background: "linear-gradient(165deg,#3A0F14 0%,#1A0608 100%)",
    surface: "rgba(245,239,227,0.05)",
    surfaceBorder: "rgba(217,168,140,0.28)",
    textPrimary: "#F5EFE3",
    textSecondary: "rgba(245,239,227,0.7)",
    accent: "#D9A88C",
    accentSoft: "rgba(217,168,140,0.16)",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
    cornerRadius: 2,
    buttonStyle: "outline",
    texture: true,
  },
  {
    id: "minimal_ivory",
    name: "Minimal Ivory",
    mood: "Quiet, paper, generous whitespace.",
    background: "#FAF7F1",
    surface: "#FFFFFF",
    surfaceBorder: "rgba(18,16,14,0.08)",
    textPrimary: "#1A1714",
    textSecondary: "rgba(26,23,20,0.6)",
    accent: "#6B4226",
    accentSoft: "rgba(107,66,38,0.08)",
    headingFont: "EB Garamond",
    bodyFont: "Inter",
    cornerRadius: 6,
    buttonStyle: "soft",
    texture: false,
  },
];

export function getTheme(id: string): StudioTheme {
  return STUDIO_THEMES.find((t) => t.id === id) ?? STUDIO_THEMES[0];
}

export const FONT_PAIRS: { heading: string; body: string; label: string }[] = [
  { heading: "Cormorant Garamond", body: "Inter", label: "Cormorant + Inter" },
  { heading: "Playfair Display", body: "Inter", label: "Playfair + Inter" },
  { heading: "Instrument Serif", body: "Inter", label: "Instrument + Inter" },
  { heading: "EB Garamond", body: "Work Sans", label: "EB Garamond + Work Sans" },
  { heading: "Cormorant Garamond", body: "Jost", label: "Cormorant + Jost" },
  { heading: "Playfair Display", body: "Work Sans", label: "Playfair + Work Sans" },
];

const LOADED = new Set<string>();
export function ensureFont(family: string) {
  if (typeof document === "undefined") return;
  if (LOADED.has(family)) return;
  LOADED.add(family);
  const name = family.replace(/ /g, "+");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${name}:ital,wght@0,400;0,500;0,600;1,400&display=swap`;
  document.head.appendChild(link);
}
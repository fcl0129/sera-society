import { PropsWithChildren } from "react";
import { EventPageTheme, eventThemeCssVariables } from "@/lib/event-page-theme";
import { cn } from "@/lib/utils";

type ThemeWrapperProps = PropsWithChildren<{
  theme: EventPageTheme;
  backgroundImage?: string | null;
}>;

export function ThemeWrapper({ theme, backgroundImage, children }: ThemeWrapperProps) {
  const backgroundStyle = {
    ...eventThemeCssVariables(theme),
    backgroundColor: "var(--event-background)",
    backgroundImage: backgroundImage
      ? `var(--event-overlay), url(${backgroundImage})`
      : "var(--event-overlay), radial-gradient(circle at 12% 15%, rgba(255,255,255,0.22), rgba(255,255,255,0) 52%)",
    backgroundSize: backgroundImage ? "cover" : "auto",
    backgroundPosition: backgroundImage ? "center" : undefined,
  };

  return (
    <div style={backgroundStyle} className={cn("min-h-screen text-[var(--event-text-primary)]", theme.fontBody)}>
      {children}
    </div>
  );
}

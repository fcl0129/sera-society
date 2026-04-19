import { PropsWithChildren } from "react";
import { eventThemeCssVars } from "@/lib/themes";
import { EventTheme } from "@/types/theme";
import { cn } from "@/lib/utils";

type ThemeWrapperProps = PropsWithChildren<{
  theme: EventTheme;
}>;

const surfaceClassByStyle: Record<EventTheme["surfaceStyle"], string> = {
  "glass-light": "backdrop-blur-md",
  "glass-dark": "backdrop-blur-lg",
  paper: "shadow-[0_28px_64px_-52px_rgba(43,20,10,0.62)]",
  matte: "shadow-[0_28px_64px_-58px_rgba(8,8,10,0.48)]",
};

export function ThemeWrapper({ theme, children }: ThemeWrapperProps) {
  return (
    <div
      style={eventThemeCssVars(theme)}
      className={cn(
        "relative min-h-screen overflow-hidden text-[var(--event-text-primary)]",
        theme.typography.body
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--event-background)",
          backgroundImage: "var(--event-overlay)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-black/10" />

      <div
        data-event-surface-style={theme.surfaceStyle}
        className={cn("relative z-10", surfaceClassByStyle[theme.surfaceStyle])}
      >
        {children}
      </div>
    </div>
  );
}

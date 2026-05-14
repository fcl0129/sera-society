import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  bg: string;
  fg: string;
  accent: string;
  className?: string;
  children: ReactNode;
}

export function InvitationFrame({ bg, fg, accent, className, children }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border shadow-elevated aspect-[3/4] w-full",
        className,
      )}
      style={{ background: bg, color: fg, borderColor: `${accent}55` }}
    >
      <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

export function formatEventLine(date: string, start: string, location: string) {
  const parts: string[] = [];
  if (date) {
    try {
      const d = new Date(`${date}T${start || "00:00"}`);
      parts.push(
        d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
      );
    } catch {
      parts.push(date);
    }
  }
  if (start) parts.push(start);
  if (location) parts.push(location);
  return parts.filter(Boolean).join(" · ");
}
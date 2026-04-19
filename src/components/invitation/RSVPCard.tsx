import { EventTheme } from "@/types/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RSVPCardProps = {
  theme: EventTheme;
};

const buttonClassByStyle: Record<EventTheme["buttonStyle"], string> = {
  soft: "opacity-95 hover:opacity-100",
  outline: "border border-[var(--event-button-bg)] bg-transparent",
  solid: "shadow-[0_16px_32px_-24px_var(--event-button-bg)]",
};

export function RSVPCard({ theme }: RSVPCardProps) {
  const fieldClass =
    "border-[var(--event-surface-border)] bg-[var(--event-surface)] text-[var(--event-text-primary)] placeholder:text-[var(--event-text-secondary)]/80 focus-visible:ring-[var(--event-accent)]";

  return (
    <section
      className="rounded-[2rem] border px-5 py-6 md:px-8 md:py-8"
      style={{
        background: "var(--event-surface)",
        borderColor: "var(--event-surface-border)",
      }}
    >
      <p className={cn("sera-label text-[var(--event-text-secondary)]", theme.typography.label)}>RSVP</p>
      <h2 className={cn("mt-3 text-3xl md:text-4xl", theme.typography.heading)}>Kindly reply</h2>
      <form className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className={cn("text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]", theme.typography.label)}>Full name</span>
          <Input placeholder="Your name" className={fieldClass} />
        </label>

        <label className="block space-y-2">
          <span className={cn("text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]", theme.typography.label)}>Guests</span>
          <select className={cn("flex h-11 w-full rounded-md border px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2", fieldClass)}>
            <option>Just me</option>
            <option>+1 guest</option>
            <option>+2 guests</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className={cn("text-xs uppercase tracking-[0.16em] text-[var(--event-text-secondary)]", theme.typography.label)}>Notes</span>
          <Textarea placeholder="Dietary requests, accessibility, or a short note." className={cn("min-h-[110px]", fieldClass)} />
        </label>

        <Button
          type="submit"
          className={cn("h-11 w-full text-sm", buttonClassByStyle[theme.buttonStyle])}
          style={{ backgroundColor: "var(--event-button-bg)", color: "var(--event-button-text)" }}
        >
          RSVP
        </Button>
      </form>
    </section>
  );
}

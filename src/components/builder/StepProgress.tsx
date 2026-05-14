import { cn } from "@/lib/utils";

interface Props {
  steps: { key: string; label: string }[];
  current: number;
  onJump?: (index: number) => void;
}

export function StepProgress({ steps, current, onJump }: Props) {
  return (
    <ol className="flex items-center gap-3 md:gap-6 overflow-x-auto py-2">
      {steps.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={s.key} className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onJump?.(i)}
              className={cn(
                "flex items-center gap-2 group",
                onJump ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "h-7 w-7 rounded-full grid place-items-center font-mono text-xs border transition-colors",
                  active
                    ? "bg-[hsl(var(--sera-deep-navy))] text-[hsl(var(--sera-ivory))] border-[hsl(var(--sera-deep-navy))]"
                    : done
                    ? "bg-[hsl(var(--sera-oxblood))] text-[hsl(var(--sera-ivory))] border-[hsl(var(--sera-oxblood))]"
                    : "bg-transparent text-[hsl(var(--sera-warm-grey))] border-[hsl(var(--border))]",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "text-[0.72rem] uppercase tracking-[0.2em] hidden md:inline",
                  active ? "text-[hsl(var(--sera-deep-navy))]" : "text-[hsl(var(--sera-warm-grey))]",
                )}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className="hidden md:inline w-8 h-px bg-[hsl(var(--border))]" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
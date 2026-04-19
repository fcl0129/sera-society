import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-sera-ivory text-sera-stone border-sera-sand/70",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-rose-50 text-rose-800 border-rose-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
};

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]",
        toneClass[tone],
      )}
    >
      {label}
    </span>
  );
}

export function ControlSection({
  eyebrow,
  title,
  description,
  aside,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-sera-sand/60 bg-sera-ivory/80 p-6 md:p-7", className)}>
      <div className="mb-6 flex flex-col gap-4 border-b border-sera-sand/40 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sera-stone">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-2xl text-sera-navy md:text-[1.75rem]">{title}</h2>
          {description ? <p className="mt-2 text-sm text-sera-warm-grey">{description}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

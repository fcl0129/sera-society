import type { BuilderConfig } from "@/lib/builder/types";
import { EVENT_TYPE_OPTIONS } from "@/lib/builder/types";

interface Props {
  value: BuilderConfig["basics"];
  onChange: (next: BuilderConfig["basics"]) => void;
}

export function EventBasicsStep({ value, onChange }: Props) {
  const set = <K extends keyof BuilderConfig["basics"]>(k: K, v: BuilderConfig["basics"][K]) =>
    onChange({ ...value, [k]: v });

  const labelCls = "text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]";
  const inputCls =
    "w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none focus:border-[hsl(var(--sera-deep-navy))] transition-colors text-[hsl(var(--foreground))]";

  return (
    <div className="space-y-10 max-w-2xl">
      <header className="space-y-2">
        <p className={labelCls}>Step 01 — Basics</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))]">
          Set the scene.
        </h2>
        <p className="text-[hsl(var(--sera-warm-grey))]">
          A few lines is enough to begin. You can refine everything later.
        </p>
      </header>

      <div className="grid gap-8">
        <div className="space-y-2">
          <label className={labelCls}>Event title</label>
          <input
            className={inputCls}
            placeholder="A late dinner for ten"
            value={value.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Event type</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("type", opt.value)}
                className={
                  "px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition-colors " +
                  (value.type === opt.value
                    ? "bg-[hsl(var(--sera-deep-navy))] text-[hsl(var(--sera-ivory))] border-[hsl(var(--sera-deep-navy))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--sera-warm-grey))] hover:border-[hsl(var(--sera-deep-navy))]")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={value.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Start</label>
            <input type="time" className={inputCls} value={value.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>End</label>
            <input type="time" className={inputCls} value={value.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Location</label>
          <input className={inputCls} placeholder="The address, or a hint of one" value={value.location} onChange={(e) => set("location", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelCls}>Dress code</label>
            <input className={inputCls} placeholder="Elevated evening" value={value.dressCode} onChange={(e) => set("dressCode", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Host</label>
            <input className={inputCls} placeholder="Hosted by" value={value.hostName} onChange={(e) => set("hostName", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Mood / short description</label>
          <textarea
            className={inputCls + " min-h-[120px] resize-y"}
            placeholder="A short note about the evening — not a brief, just a feeling."
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
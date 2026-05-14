import type { BuilderConfig } from "@/lib/builder/types";

interface Props {
  value: BuilderConfig["rsvp"];
  onChange: (next: BuilderConfig["rsvp"]) => void;
}

export function RSVPSettingsStep({ value, onChange }: Props) {
  const set = <K extends keyof BuilderConfig["rsvp"]>(k: K, v: BuilderConfig["rsvp"][K]) =>
    onChange({ ...value, [k]: v });
  const labelCls = "text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]";
  const inputCls =
    "w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none focus:border-[hsl(var(--sera-deep-navy))]";

  const Toggle = ({ k, label }: { k: keyof BuilderConfig["rsvp"]; label: string }) => (
    <label className="flex items-center justify-between gap-4 py-3 border-b border-[hsl(var(--border))]">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={Boolean(value[k])}
        onChange={(e) => set(k, e.target.checked as never)}
      />
    </label>
  );

  return (
    <div className="space-y-10 max-w-2xl">
      <header className="space-y-2">
        <p className={labelCls}>Step 04 — RSVP</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))]">What you’d like to know.</h2>
      </header>

      <div className="space-y-2">
        <label className={labelCls}>RSVP deadline</label>
        <input type="date" className={inputCls} value={value.deadline} onChange={(e) => set("deadline", e.target.value)} />
      </div>

      <div>
        <Toggle k="allowPlusOnes" label="Allow plus-ones" />
        <Toggle k="askDietary" label="Ask dietary restrictions" />
        <Toggle k="askSong" label="Ask for a song request" />
        <Toggle k="askArrival" label="Ask arrival time" />
      </div>

      <div className="space-y-2">
        <label className={labelCls}>Custom question (optional)</label>
        <input className={inputCls} value={value.customQuestion} onChange={(e) => set("customQuestion", e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className={labelCls}>Confirmation message</label>
        <textarea className={inputCls + " min-h-[100px] resize-y"} value={value.confirmationMessage} onChange={(e) => set("confirmationMessage", e.target.value)} />
      </div>
    </div>
  );
}
import type { BuilderConfig, InvitationStyleKey } from "@/lib/builder/types";
import { INVITATION_STYLES } from "@/lib/builder/defaults";
import { InvitationPreview } from "@/components/invitation-styles";

interface Props {
  config: BuilderConfig;
  onChange: (next: BuilderConfig["invitation"]) => void;
}

export function InvitationStyleStep({ config, onChange }: Props) {
  const v = config.invitation;
  const set = <K extends keyof BuilderConfig["invitation"]>(k: K, val: BuilderConfig["invitation"][K]) =>
    onChange({ ...v, [k]: val });

  const labelCls = "text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]";
  const inputCls =
    "w-full bg-transparent border-b border-[hsl(var(--border))] py-3 outline-none focus:border-[hsl(var(--sera-deep-navy))] transition-colors";

  return (
    <div className="space-y-10">
      <header className="space-y-2 max-w-2xl">
        <p className={labelCls}>Step 02 — Invitation</p>
        <h2 className="font-serif text-3xl md:text-4xl text-[hsl(var(--sera-deep-navy))]">
          Choose how the night announces itself.
        </h2>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {INVITATION_STYLES.map((s) => {
          const active = v.style === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => set("style", s.key as InvitationStyleKey)}
              className={
                "text-left rounded border transition-all p-3 space-y-2 " +
                (active
                  ? "border-[hsl(var(--sera-deep-navy))] shadow-elevated"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--sera-deep-navy))]")
              }
            >
              <div className="flex gap-1">
                {s.swatch.map((c, i) => (
                  <span key={i} className="w-5 h-5 rounded-full border border-[hsl(var(--border))]" style={{ background: c }} />
                ))}
              </div>
              <p className="font-serif text-sm">{s.name}</p>
              <p className="text-[0.7rem] text-[hsl(var(--sera-warm-grey))] leading-tight">{s.tagline}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className={labelCls}>Headline</label>
            <input className={inputCls} value={v.headline} onChange={(e) => set("headline", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Subheading</label>
            <input className={inputCls} value={v.subheading} onChange={(e) => set("subheading", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Host line</label>
            <input className={inputCls} value={v.hostLine} onChange={(e) => set("hostLine", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>RSVP button text</label>
            <input className={inputCls} value={v.rsvpCta} onChange={(e) => set("rsvpCta", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Note from host (optional)</label>
            <textarea
              className={inputCls + " min-h-[100px] resize-y"}
              value={v.note}
              onChange={(e) => set("note", e.target.value)}
            />
          </div>
        </div>
        <div>
          <p className={labelCls + " mb-3"}>Preview</p>
          <div className="max-w-sm mx-auto">
            <InvitationPreview config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}
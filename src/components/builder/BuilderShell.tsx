import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StepProgress } from "./StepProgress";
import { EventBasicsStep } from "./steps/EventBasicsStep";
import { InvitationStyleStep } from "./steps/InvitationStyleStep";
import { GuestListStep } from "./steps/GuestListStep";
import { RSVPSettingsStep } from "./steps/RSVPSettingsStep";
import { WidgetSelectorStep } from "./steps/WidgetSelectorStep";
import { InvitationPreview } from "@/components/invitation-styles";
import { createEvent, getEvent, saveEvent } from "@/lib/builder/storage";
import type { BuilderConfig, SavedEvent } from "@/lib/builder/types";

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "invitation", label: "Invitation" },
  { key: "guests", label: "Guests" },
  { key: "rsvp", label: "RSVP" },
  { key: "widgets", label: "Page" },
];

export function BuilderShell() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SavedEvent | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let ev = id ? getEvent(id) : undefined;
    if (!ev) {
      ev = createEvent();
      navigate(`/host/events/${ev.id}/edit`, { replace: true });
    }
    setEvent(ev);
  }, [id, navigate]);

  useEffect(() => {
    if (event) document.title = `${event.config.basics.title || "New event"} · Sera`;
  }, [event]);

  const config = event?.config;

  function update(patch: Partial<BuilderConfig>) {
    if (!event || !config) return;
    const next = { ...config, ...patch };
    const saved = saveEvent(event.id, next);
    if (saved) setEvent(saved);
  }

  const stepLabel = useMemo(() => STEPS[step]?.label, [step]);

  if (!event || !config) {
    return <div className="p-10 text-[hsl(var(--sera-warm-grey))]">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
          <button onClick={() => navigate("/host")} className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--sera-warm-grey))] hover:text-[hsl(var(--sera-deep-navy))]">
            ← Sera
          </button>
          <p className="font-serif text-lg truncate">{config.basics.title || "Untitled evening"}</p>
          <button
            onClick={() => navigate(`/e/${event.slug}`)}
            className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--sera-oxblood))]"
          >
            View event page
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <StepProgress steps={STEPS} current={step} onJump={setStep} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 pb-32 lg:pb-10">
        <div>
          {step === 0 && <EventBasicsStep value={config.basics} onChange={(basics) => update({ basics })} />}
          {step === 1 && <InvitationStyleStep config={config} onChange={(invitation) => update({ invitation })} />}
          {step === 2 && <GuestListStep guests={config.guests} onChange={(guests) => update({ guests })} />}
          {step === 3 && <RSVPSettingsStep value={config.rsvp} onChange={(rsvp) => update({ rsvp })} />}
          {step === 4 && <WidgetSelectorStep value={config.widgets} onChange={(widgets) => update({ widgets })} />}
        </div>

        <aside className="hidden lg:block sticky top-10 self-start">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))] mb-3">Invitation</p>
          <InvitationPreview config={config} />
          <p className="text-xs text-[hsl(var(--sera-warm-grey))] mt-3 italic">Updates as you write.</p>
        </aside>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))] z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--sera-warm-grey))] disabled:opacity-30"
          >
            ← Back
          </button>
          <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[hsl(var(--sera-warm-grey))]">
            {stepLabel} · {step + 1} / {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="px-5 py-2 bg-[hsl(var(--sera-deep-navy))] text-[hsl(var(--sera-ivory))] text-xs uppercase tracking-[0.22em]"
            >
              Save & continue →
            </button>
          ) : (
            <button
              onClick={() => navigate(`/host/events/${event.id}`)}
              className="px-5 py-2 bg-[hsl(var(--sera-oxblood))] text-[hsl(var(--sera-ivory))] text-xs uppercase tracking-[0.22em]"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
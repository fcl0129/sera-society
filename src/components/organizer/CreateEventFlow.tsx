import { FormEvent, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarIcon, Check, ImagePlus, MapPin, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (eventId: string) => void;
};

type StepKey = "name" | "when" | "where" | "story" | "cover" | "review";

const STEPS: { key: StepKey; label: string; eyebrow: string; heading: string; helper: string }[] = [
  {
    key: "name",
    label: "Title",
    eyebrow: "Chapter one",
    heading: "What shall we call this evening?",
    helper: "A title sets the tone before a single guest reads further.",
  },
  {
    key: "when",
    label: "When",
    eyebrow: "Chapter two",
    heading: "Choose the hour.",
    helper: "Select a date and a time. Guests will see this on every invitation.",
  },
  {
    key: "where",
    label: "Where",
    eyebrow: "Chapter three",
    heading: "Where will it unfold?",
    helper: "An address, a private room, a discreet location. Anything that helps guests arrive.",
  },
  {
    key: "story",
    label: "Story",
    eyebrow: "Chapter four",
    heading: "A few lines for your guests.",
    helper: "Optional. A short description sets the mood — what to wear, what to expect.",
  },
  {
    key: "cover",
    label: "Cover",
    eyebrow: "Chapter five",
    heading: "An image, perhaps.",
    helper: "Optional. A single photograph or texture that becomes the face of your invitation.",
  },
  {
    key: "review",
    label: "Review",
    eyebrow: "Final pass",
    heading: "Read it once more.",
    helper: "Confirm the details. You can refine everything later.",
  },
];

const TIME_OPTIONS = (() => {
  const arr: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      arr.push(`${hh}:${mm}`);
    }
  }
  return arr;
})();

export function CreateEventFlow({ open, onClose, onCreated }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("19:00");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      setTitle("");
      setDate(undefined);
      setTime("19:00");
      setVenue("");
      setDescription("");
      setCoverUrl("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const startsAtIso = useMemo(() => {
    if (!date) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh ?? 19, mm ?? 0, 0, 0);
    return d.toISOString();
  }, [date, time]);

  const canAdvance = useMemo(() => {
    switch (step.key) {
      case "name":
        return title.trim().length >= 2;
      case "when":
        return !!date && !!time;
      case "where":
      case "story":
      case "cover":
      case "review":
        return true;
    }
  }, [step.key, title, date, time]);

  const isLast = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    setError(null);
    if (!canAdvance) return;
    if (isLast) {
      void handleSubmit();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please sign in again.");
      setSubmitting(false);
      return;
    }
    if (!title.trim() || !startsAtIso) {
      setError("A title and a date are required.");
      setSubmitting(false);
      return;
    }

    const descriptionWithCover = (() => {
      const trimmed = description.trim();
      if (!coverUrl.trim()) return trimmed || null;
      const marker = `[cover:${coverUrl.trim()}]`;
      return trimmed ? `${marker}\n\n${trimmed}` : marker;
    })();

    const { data, error: insertError } = await (supabase as any)
      .from("events")
      .insert({
        organizer_id: user.id,
        title: title.trim(),
        venue: venue.trim() || null,
        starts_at: startsAtIso,
        description: descriptionWithCover,
        status: "draft",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onCreated(data?.id ?? "");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-sera-ink/40 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div className="relative ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden bg-sera-paper shadow-elevated animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sera-line/70 px-6 py-5 md:px-10">
          <div>
            <p className="sera-label text-sera-warm-grey">An invitation in the making</p>
            <h2 className="mt-1 font-serif text-lg text-sera-ink">Compose an evening</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-sera-warm-grey transition-colors hover:bg-sera-cloud hover:text-sera-ink"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Progress rail */}
        <div className="border-b border-sera-line/70 bg-sera-ivory px-6 py-4 md:px-10">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.key} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      "h-px flex-1 transition-colors duration-500",
                      done || active ? "bg-sera-ink" : "bg-sera-line",
                    )}
                  />
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors duration-300",
                      done && "border-sera-ink bg-sera-ink text-sera-paper",
                      active && "border-sera-ink bg-sera-paper text-sera-ink",
                      !done && !active && "border-sera-line bg-sera-paper text-sera-warm-grey",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={2} /> : i + 1}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-sera-warm-grey">
            {step.label} · {stepIndex + 1} of {STEPS.length}
          </p>
        </div>

        {/* Body */}
        <div key={step.key} className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-14 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="font-serif text-xs italic text-sera-warm-grey">{step.eyebrow}</p>
          <h3 className="mt-2 font-serif text-3xl leading-[1.1] text-sera-ink md:text-4xl">{step.heading}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-sera-warm-grey">{step.helper}</p>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleNext();
            }}
            className="mt-10 max-w-lg"
          >
            {step.key === "name" && (
              <div className="space-y-2">
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="An autumn supper"
                  className="h-14 rounded-none border-x-0 border-t-0 border-b border-sera-line bg-transparent px-0 font-serif text-2xl text-sera-ink shadow-none placeholder:text-sera-warm-grey/60 focus-visible:border-sera-ink focus-visible:ring-0"
                />
                <p className="text-xs text-sera-warm-grey">A short, evocative title reads best.</p>
              </div>
            )}

            {step.key === "when" && (
              <div className="space-y-5">
                <div>
                  <p className="sera-label mb-2 text-sera-warm-grey">Date</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-14 w-full justify-start rounded-xl border-sera-line bg-sera-ivory px-4 font-serif text-lg text-sera-ink hover:bg-sera-cloud",
                          !date && "text-sera-warm-grey",
                        )}
                      >
                        <CalendarIcon className="mr-3 h-4 w-4" strokeWidth={1.5} />
                        {date ? format(date, "EEEE, d MMMM yyyy") : "Choose a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <p className="sera-label mb-2 text-sera-warm-grey">Time</p>
                  <div className="relative">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="h-14 w-full appearance-none rounded-xl border border-sera-line bg-sera-ivory px-4 font-serif text-lg text-sera-ink focus:border-sera-ink focus:outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step.key === "where" && (
              <div className="space-y-2">
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-0 top-4 h-4 w-4 text-sera-warm-grey"
                    strokeWidth={1.5}
                  />
                  <Input
                    autoFocus
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="A private residence, 12 rue de Sèvres"
                    className="h-14 rounded-none border-x-0 border-t-0 border-b border-sera-line bg-transparent pl-7 font-serif text-xl text-sera-ink shadow-none placeholder:text-sera-warm-grey/60 focus-visible:border-sera-ink focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-sera-warm-grey">Leave empty to share the location later.</p>
              </div>
            )}

            {step.key === "story" && (
              <div className="space-y-2">
                <Textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Join us for an evening of slow conversation, candlelight, and a single long table. Black tie optional."
                  rows={6}
                  className="rounded-xl border-sera-line bg-sera-ivory font-serif text-base leading-relaxed text-sera-ink shadow-none placeholder:text-sera-warm-grey/60"
                />
                <p className="text-xs text-sera-warm-grey">
                  {description.length} characters · keep it intimate.
                </p>
              </div>
            )}

            {step.key === "cover" && (
              <div className="space-y-4">
                <div>
                  <p className="sera-label mb-2 text-sera-warm-grey">Image URL</p>
                  <Input
                    autoFocus
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://…"
                    className="h-12 rounded-xl border-sera-line bg-sera-ivory text-sm text-sera-ink shadow-none focus-visible:border-sera-ink focus-visible:ring-0"
                  />
                  <p className="mt-2 text-xs text-sera-warm-grey">
                    Paste a link to a photograph or texture. You may skip this and add one later.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-sera-line bg-sera-ivory">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="aspect-[3/2] w-full object-cover"
                      onError={(e) => ((e.currentTarget.style.opacity = "0.2"))}
                    />
                  ) : (
                    <div className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-2 text-sera-warm-grey">
                      <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
                      <p className="text-xs">No cover yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step.key === "review" && (
              <div className="space-y-6 rounded-2xl border border-sera-line bg-sera-ivory p-6 md:p-8">
                {coverUrl && (
                  <div className="-mx-6 -mt-6 mb-2 overflow-hidden md:-mx-8 md:-mt-8">
                    <img src={coverUrl} alt="" className="aspect-[3/1] w-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-serif text-xs italic text-sera-warm-grey">You are invited to</p>
                  <h4 className="mt-2 font-serif text-3xl leading-tight text-sera-ink">
                    {title || "Untitled evening"}
                  </h4>
                </div>
                <div className="h-px bg-sera-line" />
                <ReviewRow label="When">
                  {date ? `${format(date, "EEEE, d MMMM yyyy")} · ${time}` : "—"}
                </ReviewRow>
                <ReviewRow label="Where">{venue || "To be announced"}</ReviewRow>
                {description && (
                  <ReviewRow label="A note">
                    <span className="font-serif italic">{description}</span>
                  </ReviewRow>
                )}
              </div>
            )}

            {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 border-t border-sera-line/70 bg-sera-ivory px-6 py-4 md:px-10">
          <Button
            type="button"
            variant="ghost"
            onClick={stepIndex === 0 ? onClose : handleBack}
            className="rounded-full text-sera-warm-grey hover:text-sera-ink"
          >
            <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>

          <Button
            type="button"
            variant="sera"
            disabled={!canAdvance || submitting}
            onClick={handleNext}
            className="rounded-full px-6"
          >
            {submitting ? "Composing…" : isLast ? "Compose event" : "Continue"}
            {!isLast && <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-4 text-sm">
      <p className="sera-label pt-0.5 text-sera-warm-grey">{label}</p>
      <div className="text-sera-ink">{children}</div>
    </div>
  );
}

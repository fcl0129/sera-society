import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Check, X, Loader2, CalendarClock, MapPin, Sparkles } from "lucide-react";

type RsvpStatus = "pending" | "accepted" | "declined";

type GuestData = {
  id: string;
  full_name: string | null;
  invited_email: string;
  phone_number: string | null;
  rsvp_status: RsvpStatus;
  plus_one_allowed: boolean;
  plus_one_count: number;
  rsvp_message: string | null;
  rsvp_responded_at: string | null;
};

type EventData = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  rsvp_cutoff_at: string | null;
  status: string;
};

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
});

export default function RsvpPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const allowEdit = searchParams.get("edit") === "1";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);

  const [status, setStatus] = useState<RsvpStatus>("pending");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [plusOnes, setPlusOnes] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("This RSVP link is missing a token.");
        setLoading(false);
        return;
      }
      const { data, error: rpcErr } = await (supabase as any).rpc("get_rsvp_by_token", { _token: token });
      if (rpcErr || !data?.ok) {
        setError("We couldn't find this RSVP. The link may be invalid.");
        setLoading(false);
        return;
      }
      const g = data.guest as GuestData;
      const e = data.event as EventData;
      setGuest(g);
      setEvent(e);
      setStatus(g.rsvp_status);
      setFullName(g.full_name ?? "");
      setPhone(g.phone_number ?? "");
      setPlusOnes(g.plus_one_count ?? 0);
      setMessage(g.rsvp_message ?? "");
      setLoading(false);
    };
    void load();
  }, [token]);

  const isLocked = useMemo(() => {
    if (allowEdit) return false;
    return Boolean(guest?.rsvp_responded_at) && guest?.rsvp_status !== "pending";
  }, [guest, allowEdit]);

  const cutoffPassed = useMemo(() => {
    if (!event?.rsvp_cutoff_at) return false;
    return new Date(event.rsvp_cutoff_at).getTime() < Date.now();
  }, [event]);

  const submit = async (chosen: RsvpStatus) => {
    if (!token || !guest) return;
    setSubmitting(true);
    const { data, error: rpcErr } = await (supabase as any).rpc("submit_rsvp", {
      _token: token,
      _status: chosen,
      _full_name: fullName || null,
      _phone_number: phone || null,
      _plus_one_count: chosen === "accepted" ? plusOnes : 0,
      _message: message || null,
    });
    setSubmitting(false);
    if (rpcErr || !data?.ok) {
      setError(data?.code === "cutoff_passed" ? "RSVP deadline has passed." : "Could not save your RSVP. Please retry.");
      return;
    }
    setStatus(chosen);
    setSubmitted(true);
    setGuest({ ...guest, rsvp_status: chosen, rsvp_responded_at: new Date().toISOString() });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper">
        <Loader2 className="w-5 h-5 animate-spin text-sera-warm-grey" />
      </main>
    );
  }

  if (error && !guest) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper px-5">
        <div className="max-w-md w-full rounded-[28px] border border-sera-line bg-sera-ivory p-10 text-center shadow-soft">
          <p className="sera-label text-sera-warm-grey">Sera Society</p>
          <h1 className="mt-2 font-serif text-3xl text-sera-ink">RSVP unavailable</h1>
          <p className="mt-3 text-sm text-sera-warm-grey">{error}</p>
        </div>
      </main>
    );
  }

  const guestName = guest?.full_name ?? guest?.invited_email?.split("@")[0] ?? "guest";

  return (
    <main className="min-h-screen bg-sera-paper">
      {/* Cinematic invitation header */}
      <section className="px-5 pt-14 pb-10 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-xl text-center">
          <p className="sera-label text-sera-warm-grey">Sera Society · Invitation</p>
          <p className="mt-6 font-serif text-base italic text-sera-warm-grey">
            For {guestName}
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.02] text-sera-ink md:text-6xl">
            {event?.title}
          </h1>

          <div className="mx-auto my-7 h-px w-16 bg-sera-line" />

          <div className="space-y-2 text-sm text-sera-ink">
            {event?.starts_at && (
              <p className="flex items-center justify-center gap-2 font-serif text-lg italic">
                <CalendarClock className="h-4 w-4 text-sera-warm-grey" />
                {fmt.format(new Date(event.starts_at))}
              </p>
            )}
            {event?.venue && (
              <p className="flex items-center justify-center gap-2 text-sera-warm-grey">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </p>
            )}
          </div>

          {event?.description && (
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-sera-warm-grey">
              {event.description}
            </p>
          )}
        </div>
      </section>

      {/* Response surface */}
      <section className="px-5 pb-20">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-[28px] border border-sera-line bg-sera-ivory p-6 shadow-soft md:p-8">
            {isLocked ? (
              <ConfirmedState status={status} respondedAt={guest?.rsvp_responded_at ?? null} />
            ) : cutoffPassed ? (
              <DeadlinePassedState />
            ) : submitted && status !== "pending" ? (
              <ConfirmedState status={status} respondedAt={guest?.rsvp_responded_at ?? null} subtle />
            ) : (
              <>
                <p className="sera-label text-sera-warm-grey">Your response</p>
                <h2 className="mt-1 font-serif text-2xl text-sera-ink">Will you join us?</h2>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("accepted")}
                    className={`group relative flex h-16 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-all ${
                      status === "accepted"
                        ? "border-sera-ink bg-sera-ink text-sera-ivory shadow-soft"
                        : "border-sera-line bg-sera-ivory text-sera-ink hover:border-sera-ink/40"
                    }`}
                    aria-pressed={status === "accepted"}
                  >
                    <Check className="h-4 w-4" />
                    Accept with pleasure
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("declined")}
                    className={`group relative flex h-16 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-all ${
                      status === "declined"
                        ? "border-sera-ink bg-sera-ink text-sera-ivory shadow-soft"
                        : "border-sera-line bg-sera-ivory text-sera-ink hover:border-sera-ink/40"
                    }`}
                    aria-pressed={status === "declined"}
                  >
                    <X className="h-4 w-4" />
                    Regretfully decline
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <Field label="Your name">
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-xl" />
                  </Field>
                  <Field label="Phone (optional)">
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" className="rounded-xl" />
                  </Field>

                  {status === "accepted" && guest?.plus_one_allowed && (
                    <div className="flex items-center justify-between rounded-2xl border border-sera-line bg-sera-cloud p-4">
                      <div>
                        <p className="font-serif text-base text-sera-ink">Bringing guests?</p>
                        <p className="text-xs text-sera-warm-grey">Up to 5 additional</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPlusOnes((v) => Math.max(0, v - 1))}
                          disabled={plusOnes <= 0}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-sera-line bg-sera-ivory text-sera-ink disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-mono text-base text-sera-ink tabular-nums">{plusOnes}</span>
                        <button
                          type="button"
                          onClick={() => setPlusOnes((v) => Math.min(5, v + 1))}
                          disabled={plusOnes >= 5}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-sera-line bg-sera-ivory text-sera-ink disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <Field label="Note for the host (optional)">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Dietary requests, accessibility, or a short word"
                      maxLength={500}
                      rows={3}
                      className="rounded-xl"
                    />
                  </Field>
                </div>

                <Button
                  variant="sera"
                  className="mt-6 h-12 w-full rounded-full"
                  onClick={() => void submit(status === "pending" ? "accepted" : status)}
                  disabled={submitting || status === "pending"}
                >
                  {submitting ? "Sending…" : "Confirm RSVP"}
                </Button>
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
              </>
            )}
          </div>

          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.22em] text-sera-warm-grey">
            Hosted with Sera Society
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-sera-warm-grey">{label}</Label>
      {children}
    </div>
  );
}

function ConfirmedState({
  status,
  respondedAt,
  subtle,
}: {
  status: RsvpStatus;
  respondedAt: string | null;
  subtle?: boolean;
}) {
  const accepted = status === "accepted";
  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          accepted ? "bg-status-success-soft text-status-success" : "bg-sera-line/60 text-sera-warm-grey"
        }`}
      >
        {accepted ? <Sparkles className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </div>
      <h2 className="mt-4 font-serif text-3xl text-sera-ink">
        {accepted ? "We'll be expecting you" : "Thank you for letting us know"}
      </h2>
      <p className="mt-2 text-sm text-sera-warm-grey">
        {accepted
          ? "Your seat is held. You'll receive details closer to the date."
          : "Your regrets have been sent to the host."}
      </p>
      {respondedAt && (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-sera-warm-grey">
          Responded {new Date(respondedAt).toLocaleString()}
        </p>
      )}
      {!subtle && (
        <p className="mt-5 text-xs text-sera-warm-grey">
          To change your response, kindly contact your host.
        </p>
      )}
    </div>
  );
}

function DeadlinePassedState() {
  return (
    <div className="text-center">
      <p className="sera-label text-sera-warm-grey">Closed</p>
      <h2 className="mt-2 font-serif text-2xl text-sera-ink">RSVPs are no longer open</h2>
      <p className="mt-2 text-sm text-sera-warm-grey">
        The deadline for this event has passed. Please reach out to your host directly.
      </p>
    </div>
  );
}

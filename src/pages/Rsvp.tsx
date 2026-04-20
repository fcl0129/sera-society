import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Check, X, Loader2 } from "lucide-react";

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
      <main className="min-h-screen flex items-center justify-center bg-sera-surface-light">
        <Loader2 className="w-6 h-6 animate-spin text-sera-warm-grey" />
      </main>
    );
  }

  if (error && !guest) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-surface-light px-4">
        <Card className="max-w-md w-full p-8 text-center bg-white">
          <h1 className="font-serif text-2xl text-sera-navy">RSVP unavailable</h1>
          <p className="text-sm text-sera-warm-grey mt-2">{error}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sera-surface-light px-4 py-8 md:py-16">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <p className="sera-label text-sera-warm-grey">You're invited</p>
        <h1 className="font-serif text-4xl text-sera-navy">{event?.title}</h1>
        <p className="text-sm text-sera-warm-grey">
          {event?.starts_at && fmt.format(new Date(event.starts_at))}
          {event?.venue ? ` · ${event.venue}` : ""}
        </p>
        {event?.description && <p className="text-sm text-sera-warm-grey">{event.description}</p>}

        <Card className="rounded-3xl border-sera-sand/60 bg-sera-ivory">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-sera-navy">
              {isLocked ? "Your response" : submitted ? "Thank you" : "Will you attend?"}
            </CardTitle>
            {guest && (
              <p className="text-sm text-sera-warm-grey">
                For {guest.full_name ?? guest.invited_email}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLocked ? (
              <div className="rounded-2xl border border-sera-sand/60 bg-white p-4 space-y-2">
                <p className="text-sm text-sera-warm-grey">Status</p>
                <p className="font-serif text-2xl text-sera-navy capitalize">{status}</p>
                {guest?.rsvp_responded_at && (
                  <p className="text-xs text-sera-warm-grey">
                    Responded {new Date(guest.rsvp_responded_at).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-sera-warm-grey pt-2">
                  To change your response, contact your host.
                </p>
              </div>
            ) : cutoffPassed ? (
              <p className="text-sm text-sera-oxblood">The RSVP deadline has passed.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={status === "accepted" ? "sera" : "sera-outline"}
                    onClick={() => setStatus("accepted")}
                    className="h-14"
                  >
                    <Check className="w-4 h-4 mr-2" /> Accept
                  </Button>
                  <Button
                    type="button"
                    variant={status === "declined" ? "sera" : "sera-outline"}
                    onClick={() => setStatus("declined")}
                    className="h-14"
                  >
                    <X className="w-4 h-4 mr-2" /> Decline
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-sera-warm-grey">Your name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-sera-warm-grey">Phone (optional)</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
                  </div>

                  {status === "accepted" && guest?.plus_one_allowed && (
                    <div className="rounded-2xl border border-sera-sand/60 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-sera-warm-grey">Additional guests</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" type="button"
                            onClick={() => setPlusOnes((v) => Math.max(0, v - 1))}
                            disabled={plusOnes <= 0}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-lg text-sera-navy">{plusOnes}</span>
                          <Button variant="outline" size="icon" type="button"
                            onClick={() => setPlusOnes((v) => Math.min(5, v + 1))}
                            disabled={plusOnes >= 5}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-[10px] uppercase tracking-wider text-sera-warm-grey">Note for the host (optional)</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Dietary requests, accessibility, or a short note"
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  variant="sera"
                  className="w-full h-12"
                  onClick={() => void submit(status === "pending" ? "accepted" : status)}
                  disabled={submitting || status === "pending"}
                >
                  {submitting ? "Saving…" : submitted ? "Update response" : "Confirm RSVP"}
                </Button>
                {error && <p className="text-sm text-sera-oxblood">{error}</p>}
                {submitted && <p className="text-sm text-sera-navy">Your response has been saved.</p>}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

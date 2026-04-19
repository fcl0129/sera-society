import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";

type RsvpStatus = "going" | "maybe" | "not_going";

const statusOptions: Array<{ value: RsvpStatus; label: string; description: string }> = [
  { value: "going", label: "I'll be there", description: "Reserve my spot." },
  { value: "maybe", label: "Maybe", description: "Keep me tentative for now." },
  { value: "not_going", label: "Can't make it", description: "Decline this invite." },
];

export default function RsvpPage() {
  const { token } = useParams();
  const [status, setStatus] = useState<RsvpStatus>("going");
  const [plusOnes, setPlusOnes] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maxPlusOnes = status === "going" ? 10 : 0;

  const submit = async () => {
    if (!token) {
      setMsg("This RSVP link is missing a token.");
      return;
    }

    setSubmitting(true);
    setMsg("Saving your response…");

    const { data, error } = await supabase.functions.invoke("rsvp", {
      body: { token, status, plusOnes: Math.min(Math.max(plusOnes, 0), maxPlusOnes) },
    });

    if (error) setMsg("We could not save your RSVP. Please retry.");
    else if (data?.ok) setMsg("Confirmed. Your RSVP is now saved.");
    else setMsg("RSVP was not accepted. Please check the invite link.");

    setSubmitting(false);
  };

  const helper = useMemo(() => {
    if (status === "going") return "Add guests if your invitation allows them.";
    if (status === "maybe") return "You can update to attending later.";
    return "Thanks for letting the host know.";
  }, [status]);

  return (
    <main className="min-h-screen bg-sera-surface-light px-4 py-8 md:py-16">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <p className="sera-label text-sera-warm-grey">RSVP</p>
        <h1 className="font-serif text-4xl text-sera-navy">One-tap response</h1>
        <p className="text-sm text-sera-warm-grey">Pick a response, adjust guest count, and submit in seconds.</p>

        <Card className="rounded-3xl border-sera-sand/60 bg-sera-ivory">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-sera-navy">Your attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatus(option.value);
                    if (option.value !== "going") setPlusOnes(0);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    status === option.value
                      ? "border-sera-navy bg-sera-navy text-sera-ivory"
                      : "border-sera-sand/60 bg-white text-sera-navy"
                  }`}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className={`text-xs ${status === option.value ? "text-sera-sand" : "text-sera-warm-grey"}`}>{option.description}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-sera-sand/60 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-sera-warm-grey">Additional guests</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPlusOnes((v) => Math.max(0, v - 1))}
                    disabled={plusOnes <= 0 || status !== "going"}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-lg text-sera-navy">{plusOnes}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPlusOnes((v) => Math.min(maxPlusOnes, v + 1))}
                    disabled={plusOnes >= maxPlusOnes || status !== "going"}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-sera-warm-grey">{helper}</p>
            </div>

            <Button variant="sera" className="w-full" onClick={() => void submit()} disabled={submitting}>
              {submitting ? "Saving…" : "Confirm RSVP"}
            </Button>
            {msg && <p className="text-sm text-sera-warm-grey">{msg}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

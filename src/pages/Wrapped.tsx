import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, CalendarClock, MapPin } from "lucide-react";

type WrappedResponse = {
  ok: boolean;
  code?: string;
  event?: { title: string; starts_at: string; ends_at: string | null; venue: string | null; cover_image_url: string | null };
  guest?: { full_name: string | null; invited_email: string };
  wrapped?: { custom_note: string | null; is_published: boolean; summary: Record<string, unknown> } | null;
  stats?: { invited: number; accepted: number; attended: number; tickets_total: number; tickets_redeemed: number };
};

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long", month: "long", day: "numeric",
});

export default function WrappedPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WrappedResponse | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: res, error } = await (supabase as any).rpc("get_wrapped_by_token", { _token: token });
      if (error) setData({ ok: false, code: "rpc_error" });
      else setData(res as WrappedResponse);
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper">
        <Loader2 className="w-5 h-5 animate-spin text-sera-warm-grey" />
      </main>
    );
  }

  if (!data?.ok || !data.event) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper px-5">
        <div className="max-w-md w-full rounded-[28px] border border-sera-line bg-sera-ivory p-10 text-center shadow-soft">
          <p className="sera-label text-sera-warm-grey">Sera Society</p>
          <h1 className="mt-2 font-serif text-3xl text-sera-ink">Recap unavailable</h1>
          <p className="mt-3 text-sm text-sera-warm-grey">This recap link could not be opened.</p>
          {token && (
            <Link to={`/pass/${encodeURIComponent(token)}`} className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-sera-ink px-7 text-xs uppercase tracking-[0.2em] text-sera-ivory">
              Open your pass
            </Link>
          )}
        </div>
      </main>
    );
  }

  const { event, guest, wrapped, stats } = data;
  const ended = event.ends_at ? new Date(event.ends_at) < new Date() : new Date(event.starts_at) < new Date();
  const guestName = guest?.full_name?.trim() || guest?.invited_email.split("@")[0];

  if (!ended) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper px-5">
        <div className="max-w-md w-full rounded-[28px] border border-sera-line bg-sera-ivory p-10 text-center shadow-soft">
          <p className="sera-label text-sera-warm-grey">Almost there</p>
          <h1 className="mt-2 font-serif text-3xl text-sera-ink">The recap arrives after the evening.</h1>
          <p className="mt-3 text-sm text-sera-warm-grey">Come back once {event.title} has ended.</p>
        </div>
      </main>
    );
  }

  if (!wrapped || !wrapped.is_published) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper px-5">
        <div className="max-w-md w-full rounded-[28px] border border-sera-line bg-sera-ivory p-10 text-center shadow-soft">
          <p className="sera-label text-sera-warm-grey">Coming soon</p>
          <h1 className="mt-2 font-serif text-3xl text-sera-ink">Your host is preparing the recap.</h1>
          <p className="mt-3 text-sm text-sera-warm-grey">We&rsquo;ll have it ready shortly.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sera-paper px-5 py-12 md:py-20">
      <section className="mx-auto w-full max-w-xl text-center">
        <p className="sera-label text-sera-warm-grey">Sera Society · Wrapped</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl leading-[1.05] text-sera-ink">{event.title}</h1>
        <div className="mx-auto my-5 h-px w-12 bg-sera-line" />
        <p className="font-serif text-base italic text-sera-warm-grey flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4" />{fmt.format(new Date(event.starts_at))}
        </p>
        {event.venue && (
          <p className="mt-1 text-sm text-sera-warm-grey flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />{event.venue}
          </p>
        )}
        {guestName && <p className="mt-6 font-serif italic text-sera-warm-grey">Thank you for being there, {guestName}.</p>}
      </section>

      {wrapped.custom_note && (
        <section className="mx-auto mt-10 w-full max-w-xl rounded-[24px] border border-sera-line bg-sera-ivory p-8 shadow-soft">
          <Sparkles className="mx-auto h-5 w-5 text-sera-warm-grey" strokeWidth={1.5} />
          <p className="mt-3 font-serif text-xl md:text-2xl italic text-sera-ink text-center leading-snug whitespace-pre-wrap">
            {wrapped.custom_note}
          </p>
        </section>
      )}

      {stats && (
        <section className="mx-auto mt-8 w-full max-w-xl grid grid-cols-2 gap-3">
          <Stat label="Invited" value={stats.invited} />
          <Stat label="Said yes" value={stats.accepted} />
          <Stat label="Walked through the door" value={stats.attended} />
          <Stat label="Drinks poured" value={stats.tickets_redeemed} suffix={`/ ${stats.tickets_total}`} />
        </section>
      )}

      <p className="mt-12 text-center text-[10px] uppercase tracking-[0.22em] text-sera-warm-grey">
        Hosted with Sera Society
      </p>
    </main>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-[20px] border border-sera-line bg-sera-ivory p-5 text-center">
      <p className="font-serif text-3xl text-sera-ink tabular-nums">{value}{suffix ?? ""}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-sera-warm-grey">{label}</p>
    </div>
  );
}
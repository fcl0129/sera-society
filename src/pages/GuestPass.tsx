import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, MapPin, Loader2, CheckCircle2, Ban, Ticket as TicketIcon } from "lucide-react";

// TODO(future): Apple Wallet / Passmeister integration. For now this is a
// web-based wallet-like pass rendered from a secure RSVP token URL.

type PassStatus = "active" | "redeemed" | "void" | string;

type PassTicket = {
  id: string;
  token: string;
  status: PassStatus;
  redeemed_at: string | null;
  created_at: string;
};

type PassEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  status: string;
  cover_image_url: string | null;
};

type PassGuest = {
  id: string;
  full_name: string | null;
  invited_email: string;
  rsvp_status: "pending" | "accepted" | "declined";
  plus_one_allowed: boolean;
  plus_one_count: number;
};

type PassResponse = {
  ok: boolean;
  code?: string;
  event?: PassEvent;
  guest?: PassGuest;
  tickets?: PassTicket[];
};

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function GuestPassPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PassResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setData({ ok: false, code: "missing_token" });
        setLoading(false);
        return;
      }
      const { data: rpcData, error } = await (supabase as any).rpc(
        "get_guest_pass_by_token",
        { _token: token }
      );
      if (error) {
        setData({ ok: false, code: "rpc_error" });
      } else {
        setData(rpcData as PassResponse);
      }
      setLoading(false);
    };
    void load();

    // Poll every 8s while page is open so redemptions reflect quickly.
    const interval = window.setInterval(load, 8000);
    return () => window.clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper">
        <Loader2 className="w-5 h-5 animate-spin text-sera-warm-grey" />
      </main>
    );
  }

  if (!data?.ok || !data.event || !data.guest) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-sera-paper px-5">
        <div className="max-w-md w-full rounded-[28px] border border-sera-line bg-sera-ivory p-10 text-center shadow-soft">
          <p className="sera-label text-sera-warm-grey">Sera Society</p>
          <h1 className="mt-2 font-serif text-3xl text-sera-ink">Pass unavailable</h1>
          <p className="mt-3 text-sm text-sera-warm-grey">
            This guest pass link could not be opened. Please confirm the link with your host.
          </p>
        </div>
      </main>
    );
  }

  const { event, guest, tickets = [] } = data;
  const guestName = guest.full_name?.trim() || guest.invited_email.split("@")[0];
  const accepted = guest.rsvp_status === "accepted";
  const activeTickets = tickets.filter((t) => t.status === "active");
  const redeemedTickets = tickets.filter((t) => t.status === "redeemed");
  const voidTickets = tickets.filter((t) => t.status === "void");

  return (
    <main className="min-h-screen bg-sera-paper">
      {/* Header card */}
      <section className="px-5 pt-10 pb-6 md:pt-16 md:pb-10">
        <div className="mx-auto w-full max-w-xl text-center">
          <p className="sera-label text-sera-warm-grey">Sera Society · Guest Pass</p>
          <p className="mt-5 font-serif text-base italic text-sera-warm-grey">For {guestName}</p>
          <h1 className="mt-2 font-serif text-4xl leading-[1.05] text-sera-ink md:text-5xl">
            {event.title}
          </h1>

          <div className="mx-auto my-6 h-px w-12 bg-sera-line" />

          <div className="space-y-2 text-sm text-sera-ink">
            <p className="flex items-center justify-center gap-2 font-serif text-base italic">
              <CalendarClock className="h-4 w-4 text-sera-warm-grey" />
              {fmt.format(new Date(event.starts_at))}
            </p>
            {event.venue && (
              <p className="flex items-center justify-center gap-2 text-sera-warm-grey">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* RSVP gate */}
      {!accepted && (
        <section className="px-5 pb-6">
          <div className="mx-auto w-full max-w-xl rounded-[24px] border border-sera-line bg-sera-ivory p-6 text-center shadow-soft">
            <p className="sera-label text-sera-warm-grey">RSVP first</p>
            <h2 className="mt-1 font-serif text-2xl text-sera-ink">
              Confirm your attendance to unlock your pass
            </h2>
            <p className="mt-2 text-sm text-sera-warm-grey">
              Once you accept, any drink tickets your host issues will appear here.
            </p>
            <Link
              to={`/rsvp/${encodeURIComponent(token!)}`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-sera-ink px-7 text-xs uppercase tracking-[0.2em] text-sera-ivory hover:opacity-90"
            >
              Open RSVP
            </Link>
          </div>
        </section>
      )}

      {/* Tickets */}
      {accepted && (
        <section className="px-5 pb-20">
          <div className="mx-auto w-full max-w-xl space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="sera-label text-sera-warm-grey">Your tickets</p>
              <p className="text-xs text-sera-warm-grey">
                {activeTickets.length} active · {redeemedTickets.length} redeemed
              </p>
            </div>

            {tickets.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-sera-line bg-sera-ivory p-8 text-center">
                <TicketIcon className="mx-auto h-6 w-6 text-sera-warm-grey" strokeWidth={1.5} />
                <p className="mt-3 font-serif text-xl text-sera-ink">No tickets yet</p>
                <p className="mt-1 text-xs text-sera-warm-grey">
                  Your host will issue your drink tickets shortly. This page updates automatically.
                </p>
              </div>
            )}

            {tickets.map((ticket, idx) => (
              <PassTicketCard key={ticket.id} ticket={ticket} index={idx + 1} />
            ))}

            {voidTickets.length > 0 && (
              <p className="text-center text-[11px] text-sera-warm-grey">
                {voidTickets.length} ticket{voidTickets.length === 1 ? " was" : "s were"} voided by your host.
              </p>
            )}
          </div>
        </section>
      )}

      <p className="pb-10 text-center text-[10px] uppercase tracking-[0.22em] text-sera-warm-grey">
        Hosted with Sera Society
      </p>
    </main>
  );
}

function PassTicketCard({ ticket, index }: { ticket: PassTicket; index: number }) {
  const isActive = ticket.status === "active";
  const isRedeemed = ticket.status === "redeemed";
  const isVoid = ticket.status === "void";

  const statusChip = useMemo(() => {
    if (isActive)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-status-success-soft px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-status-success">
          <CheckCircle2 className="h-3 w-3" /> Active
        </span>
      );
    if (isRedeemed)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sera-line/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sera-warm-grey">
          <CheckCircle2 className="h-3 w-3" /> Redeemed
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sera-line/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-sera-warm-grey">
        <Ban className="h-3 w-3" /> Void
      </span>
    );
  }, [isActive, isRedeemed, isVoid]);

  return (
    <article
      className={`relative overflow-hidden rounded-[24px] border bg-sera-ivory shadow-soft transition-opacity ${
        isActive ? "border-sera-ink/30" : "border-sera-line opacity-80"
      }`}
    >
      <div className="flex items-start justify-between border-b border-sera-line/70 px-5 py-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-sera-warm-grey">
          Drink ticket · #{String(index).padStart(2, "0")}
        </p>
        {statusChip}
      </div>

      <div className="px-5 py-6 text-center">
        {isActive ? (
          <>
            <div className="mx-auto inline-block rounded-2xl bg-white p-4 shadow-soft">
              <QRCodeSVG value={ticket.token} size={196} level="H" />
            </div>
            <p className="mt-4 text-xs text-sera-warm-grey">
              Brightness up. Hold this code to the bartender's scanner.
            </p>
            <p className="mt-3 break-all rounded-xl border border-dashed border-sera-line bg-sera-cloud px-3 py-2 text-center font-mono text-[11px] text-sera-warm-grey">
              {ticket.token}
            </p>
          </>
        ) : isRedeemed ? (
          <div className="py-6">
            <CheckCircle2 className="mx-auto h-10 w-10 text-sera-warm-grey" strokeWidth={1.4} />
            <p className="mt-3 font-serif text-2xl text-sera-ink">Redeemed</p>
            {ticket.redeemed_at && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-sera-warm-grey">
                {new Date(ticket.redeemed_at).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="py-6">
            <Ban className="mx-auto h-10 w-10 text-sera-warm-grey" strokeWidth={1.4} />
            <p className="mt-3 font-serif text-2xl text-sera-ink">Voided</p>
            <p className="mt-1 text-xs text-sera-warm-grey">This ticket can no longer be redeemed.</p>
          </div>
        )}
      </div>
    </article>
  );
}
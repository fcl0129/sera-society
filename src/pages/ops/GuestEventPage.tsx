import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { detectNfcCapability, startNfcRead } from "@/lib/nfc";
import { redeemTicket } from "@/lib/redemption";
import { CalendarClock, Clock3, LogOut, MapPin, ScanLine, Smartphone, Ticket } from "lucide-react";
import { toast } from "sonner";

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type TicketRow = {
  id: string;
  code: string;
  status: "active" | "redeemed" | "cancelled" | "expired";
  ticket_type: string;
  redemption_limit: number;
  redeemed_count: number;
  qr_payload: string;
  event_id: string;
};

type EventRow = {
  id: string;
  title: string;
  venue: string | null;
  starts_at: string;
  slug: string | null;
  description: string | null;
};

export default function GuestEventPage() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guest-tickets"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { event: null as EventRow | null, tickets: [] as TicketRow[] };

      const { data: tickets, error } = await (supabase as any)
        .from("tickets")
        .select("id, code, status, ticket_type, redemption_limit, redeemed_count, qr_payload, event_id")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const firstEventId = tickets?.[0]?.event_id;
      if (!firstEventId) return { event: null, tickets: [] as TicketRow[] };

      const { data: event } = await (supabase as any)
        .from("events")
        .select("id, title, venue, starts_at, slug, description")
        .eq("id", firstEventId)
        .maybeSingle();

      return { event: (event ?? null) as EventRow | null, tickets: (tickets ?? []) as TicketRow[] };
    },
  });

  const event = data?.event;
  const tickets = data?.tickets ?? [];
  const activeTicket = tickets.find((ticket) => ticket.status === "active") ?? null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <header className="border-b border-sera-sand/40 bg-sera-ivory/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="font-serif text-sera-navy">Sera Society</p>
            <p className="text-xs text-sera-warm-grey">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-warm-grey">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-6 md:py-8">
        {isLoading ? (
          <p className="text-sm text-sera-warm-grey">Preparing your guest pass…</p>
        ) : !event ? (
          <p className="rounded-2xl border border-dashed border-sera-sand/60 p-4 text-sm text-sera-warm-grey">No active invite has been assigned yet.</p>
        ) : (
          <>
            <section className="rounded-3xl border border-sera-sand/50 bg-sera-ivory p-6">
              <p className="sera-label text-sera-warm-grey">Your invitation</p>
              <h1 className="mt-2 font-serif text-3xl text-sera-navy">{event.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-sera-warm-grey"><CalendarClock className="h-4 w-4" />{fmt.format(new Date(event.starts_at))}</p>
              {event.venue && <p className="mt-1 flex items-center gap-2 text-sm text-sera-warm-grey"><MapPin className="h-4 w-4" />{event.venue}</p>}
              {event.description && <p className="mt-4 text-sm text-sera-navy">{event.description}</p>}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {activeTicket ? (
                  <TicketDialog ticket={activeTicket} onRedeemed={() => refetch()} triggerLabel="Show entry ticket" />
                ) : (
                  <Button variant="sera" disabled>No active ticket</Button>
                )}
                <Button variant="sera-outline" onClick={() => navigate("/event-pages")}>Event details</Button>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              <InfoTile icon={<Clock3 className="h-4 w-4" />} title="Entry" text="Show your QR at check-in for quickest access." />
              <InfoTile icon={<MapPin className="h-4 w-4" />} title="Directions" text={event.venue ?? "Venue details will appear here."} />
              <InfoTile icon={<ScanLine className="h-4 w-4" />} title="Redemption" text="Use your ticket for drinks/items where enabled." />
            </section>

            <section className="rounded-3xl border border-sera-sand/50 bg-white/70 p-5">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-sera-warm-grey">Tickets</p>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="flex items-center justify-between gap-3 rounded-2xl border border-sera-sand/60 bg-sera-ivory p-3">
                    <div>
                      <p className="font-medium capitalize text-sera-navy">{ticket.ticket_type.replaceAll("_", " ")}</p>
                      <p className="text-xs text-sera-warm-grey">{ticket.redeemed_count}/{ticket.redemption_limit} redeemed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={ticket.status} />
                      <TicketDialog ticket={ticket} onRedeemed={() => refetch()} triggerLabel="Open" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InfoTile({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-sera-sand/50 bg-sera-ivory p-4">
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sera-warm-grey">{icon}{title}</p>
      <p className="text-sm text-sera-navy">{text}</p>
    </article>
  );
}

function StatusChip({ status }: { status: TicketRow["status"] }) {
  const tone =
    status === "active"
      ? "border-emerald-500/50 text-emerald-700"
      : status === "redeemed"
      ? "border-amber-500/60 text-amber-700"
      : "border-rose-500/60 text-rose-700";

  return (
    <Badge variant="outline" className={`capitalize ${tone}`}>
      {status}
    </Badge>
  );
}

function TicketDialog({ ticket, onRedeemed, triggerLabel }: { ticket: TicketRow; onRedeemed: () => void; triggerLabel: string }) {
  const [open, setOpen] = useState(false);
  const [nfcActive, setNfcActive] = useState(false);
  const nfcCapability = useMemo(() => detectNfcCapability(), []);

  useEffect(() => {
    if (!open || !nfcActive) return;
    let stop: (() => void) | undefined;
    void (async () => {
      stop = await startNfcRead(
        async (event) => {
          if (!event.payload?.trim()) return;
          const result = await redeemTicket({ code: event.payload, method: "nfc", metadata: { source: "guest_nfc" } });
          if (result.ok) {
            toast.success("Ticket redeemed");
            setOpen(false);
            onRedeemed();
          } else {
            toast.error(result.message ?? "Redemption failed");
          }
          setNfcActive(false);
        },
        (err) => {
          toast.error(err.message);
          setNfcActive(false);
        }
      );
    })();

    return () => stop?.();
  }, [open, nfcActive, onRedeemed]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="sera" size="sm" disabled={ticket.status !== "active"}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="bg-sera-ivory sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-sera-navy">Present ticket</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-1">
          <div className="rounded-2xl border border-sera-sand/50 bg-white p-4">
            <QRCodeSVG value={ticket.qr_payload} size={220} level="H" />
          </div>
        </div>
        <p className="rounded-xl border border-sera-sand/60 bg-white px-3 py-2 text-center text-xs text-sera-warm-grey">Ticket code: {ticket.code}</p>
        {nfcCapability.supported ? (
          <Button variant={nfcActive ? "sera-outline" : "sera"} className="w-full" onClick={() => setNfcActive((v) => !v)}>
            <Smartphone className="mr-2 h-4 w-4" />
            {nfcActive ? "Listening for NFC tag…" : "Use NFC tap"}
          </Button>
        ) : (
          <p className="text-center text-xs text-sera-warm-grey">
            <ScanLine className="mr-1 inline h-3 w-3" />
            NFC is unavailable on this browser/device. Please use QR.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

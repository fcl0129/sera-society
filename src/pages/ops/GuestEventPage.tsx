import { useEffect, useMemo, useState } from "react";
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
import { LogOut, ScanLine, Smartphone } from "lucide-react";
import { toast } from "sonner";

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Ticket = {
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
};

export default function GuestEventPage() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guest-tickets"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { event: null as EventRow | null, tickets: [] as Ticket[] };

      const { data: tickets, error } = await (supabase as any)
        .from("tickets")
        .select("id, code, status, ticket_type, redemption_limit, redeemed_count, qr_payload, event_id")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const firstEventId = tickets?.[0]?.event_id;
      if (!firstEventId) return { event: null, tickets: [] as Ticket[] };

      const { data: event } = await (supabase as any)
        .from("events")
        .select("id, title, venue, starts_at, slug")
        .eq("id", firstEventId)
        .maybeSingle();

      return { event: (event ?? null) as EventRow | null, tickets: (tickets ?? []) as Ticket[] };
    },
  });

  const event = data?.event;
  const tickets = data?.tickets ?? [];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <header className="border-b border-sera-sand/40">
        <div className="mx-auto max-w-3xl px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-serif text-sera-navy">Sera Society</p>
            <p className="text-xs text-sera-warm-grey">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-warm-grey">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 md:px-6 py-8 space-y-6">
        {isLoading ? (
          <p className="text-sm text-sera-warm-grey">Preparing your tickets…</p>
        ) : !event ? (
          <p className="text-sm text-sera-warm-grey border border-dashed border-sera-sand/60 p-4">No active tickets assigned yet.</p>
        ) : (
          <>
            <section className="border border-sera-sand/40 bg-sera-ivory p-7">
              <p className="sera-label text-sera-stone mb-2">My event</p>
              <h1 className="font-serif text-3xl text-sera-navy">{event.title}</h1>
              <p className="mt-2 text-sera-warm-grey">{fmt.format(new Date(event.starts_at))}{event.venue ? ` · ${event.venue}` : ""}</p>
            </section>

            <section className="border border-sera-sand/40 bg-sera-ivory p-7">
              <p className="sera-label text-sera-stone mb-4">My tickets</p>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="border border-sera-sand/40 p-4 bg-white/40 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg text-sera-navy">{ticket.ticket_type.replaceAll("_", " ")}</p>
                      <p className="text-xs text-sera-warm-grey mt-1">{ticket.redeemed_count}/{ticket.redemption_limit} redeemed</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={ticket.status} />
                      <TicketDialog ticket={ticket} onRedeemed={() => refetch()} />
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

function StatusChip({ status }: { status: Ticket["status"] }) {
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

function TicketDialog({ ticket, onRedeemed }: { ticket: Ticket; onRedeemed: () => void }) {
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
        <Button variant="sera" disabled={ticket.status !== "active"}>Present</Button>
      </DialogTrigger>
      <DialogContent className="bg-sera-ivory">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-sera-navy">Present ticket</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-3">
          <div className="bg-white p-4 border border-sera-sand/50">
            <QRCodeSVG value={ticket.qr_payload} size={220} level="H" />
          </div>
        </div>
        {nfcCapability.supported ? (
          <Button variant={nfcActive ? "sera-outline" : "sera"} className="w-full" onClick={() => setNfcActive((v) => !v)}>
            <Smartphone className="h-4 w-4 mr-2" />
            {nfcActive ? "Listening for NFC tag…" : "Use NFC tap"}
          </Button>
        ) : (
          <p className="text-xs text-center text-sera-warm-grey">
            <ScanLine className="h-3 w-3 inline mr-1" />
            NFC is unavailable on this browser/device. Please use QR.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
import { LogOut, Smartphone, ScanLine } from "lucide-react";
import { toast } from "sonner";

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type Membership = {
  event_id: string;
  events: { id: string; title: string; venue: string | null; description: string | null; starts_at: string } | null;
};

type Ticket = {
  id: string;
  token: string;
  status: string;
  redeemed_at: string | null;
};

export default function GuestEventPage() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guest-experience"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { membership: null as Membership | null, tickets: [] as Ticket[] };

      const { data: memberships } = await (supabase as any)
        .from("event_guests")
        .select("event_id, events(id, title, venue, description, starts_at)")
        .eq("guest_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!memberships?.event_id) return { membership: null, tickets: [] as Ticket[] };

      const { data: tickets } = await (supabase as any)
        .from("drink_tickets")
        .select("id, token, status, redeemed_at")
        .eq("event_id", memberships.event_id)
        .eq("guest_id", u.user.id)
        .order("created_at", { ascending: true });

      return { membership: memberships as Membership, tickets: (tickets ?? []) as Ticket[] };
    },
  });

  const membership = data?.membership ?? null;
  const tickets = data?.tickets ?? [];
  const activeTicket = tickets.find((t) => t.status === "active") ?? null;
  const redeemedCount = tickets.filter((t) => t.status === "redeemed").length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const firstName = (fullName ?? email ?? "").split(/[ @]/)[0];

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <header className="border-b border-sera-sand/40">
        <div className="mx-auto max-w-2xl px-4 md:px-6 py-4 flex items-center justify-between">
          <p className="font-serif text-sera-navy">Sera Society</p>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sera-warm-grey">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
        {isLoading ? (
          <p className="text-sm text-sera-warm-grey">Preparing your evening…</p>
        ) : !membership?.events ? (
          <EmptyState firstName={firstName} />
        ) : (
          <>
            <section className="border border-sera-sand/40 bg-sera-ivory p-7 md:p-10">
              <p className="sera-label text-sera-stone mb-4">Your evening</p>
              <h1 className="font-serif text-3xl md:text-5xl text-sera-navy leading-tight">
                {membership.events.title}
              </h1>
              <div className="mt-6 space-y-1 border-t border-sera-sand/40 pt-5 text-sera-warm-grey">
                <p>{fmt.format(new Date(membership.events.starts_at))}</p>
                {membership.events.venue && <p>{membership.events.venue}</p>}
              </div>
              {membership.events.description && (
                <p className="mt-5 text-sm text-sera-warm-grey leading-relaxed">{membership.events.description}</p>
              )}
            </section>

            <section className="mt-6 border border-sera-sand/40 bg-sera-ivory p-7 md:p-9">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="sera-label text-sera-stone">Drink service</p>
                  <p className="font-serif text-2xl text-sera-navy mt-1">
                    {activeTicket
                      ? `${tickets.filter((t) => t.status === "active").length} ready to present`
                      : redeemedCount > 0
                      ? "Service complete"
                      : "Awaiting host"}
                  </p>
                </div>
                {activeTicket && (
                  <Badge variant="outline" className="border-sera-oxblood/60 text-sera-oxblood">
                    Active
                  </Badge>
                )}
              </div>

              {activeTicket && (
                <div className="mt-6 border-t border-sera-sand/40 pt-6 space-y-3">
                  <PresentTicketDialog ticket={activeTicket} onRedeemed={() => refetch()} />
                  <p className="text-[11px] text-sera-warm-grey leading-relaxed">
                    Show your code to the bartender, tap the bar&rsquo;s NFC sticker, or scan the bar&rsquo;s QR.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ firstName }: { firstName: string }) {
  return (
    <section className="border border-sera-sand/40 bg-sera-ivory p-10 md:p-12 text-center">
      <p className="sera-label text-sera-stone mb-4">Sera Society</p>
      <h1 className="font-serif text-3xl md:text-4xl text-sera-navy">
        Welcome{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-4 max-w-md mx-auto text-sera-warm-grey">
        Your host is finalising the evening. Your invitation will appear here the moment it&rsquo;s released.
      </p>
    </section>
  );
}

function PresentTicketDialog({ ticket, onRedeemed }: { ticket: Ticket; onRedeemed: () => void }) {
  const [open, setOpen] = useState(false);
  const cap = useMemo(() => detectNfcCapability(), []);
  const [nfcActive, setNfcActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !nfcActive) return;
    let stop: (() => void) | undefined;
    void (async () => {
      stop = await startNfcRead(
        async () => {
          await redeem("nfc_tag");
        },
        (err) => {
          toast.error(err.message);
          setNfcActive(false);
        }
      );
    })();
    return () => {
      stop?.();
    };
  }, [open, nfcActive]);

  const redeem = async (method: "nfc_tag" | "qr" | "manual") => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("redeem-ticket", {
      body: { token: ticket.token, method },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const r = data as { ok: boolean; code: string; message?: string };
    if (r.ok) {
      toast.success("Enjoy your drink");
      setOpen(false);
      onRedeemed();
    } else {
      toast.error(r.message ?? "Could not redeem");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="sera" size="lg" className="w-full">
          Present ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-sera-ivory">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-sera-navy">Your ticket</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="bg-white p-4 border border-sera-sand/60">
            <QRCodeSVG value={ticket.token} size={200} level="H" />
          </div>
        </div>

        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-sera-stone">
          {ticket.token.slice(0, 12)}…
        </p>

        <div className="space-y-2 mt-4">
          {cap.supported ? (
            <Button
              variant={nfcActive ? "sera-outline" : "sera"}
              onClick={() => setNfcActive((v) => !v)}
              disabled={busy}
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {nfcActive ? "Listening for NFC tap…" : "Tap the bar&rsquo;s NFC sticker"}
            </Button>
          ) : (
            <p className="text-[11px] text-center text-sera-warm-grey">
              <ScanLine className="w-3 h-3 inline mr-1" />
              NFC tap not available on this device — use the QR above.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

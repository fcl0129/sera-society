import { ReactNode, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { eventThemeCssVariables, eventPageThemes, resolveEventPageTheme } from "@/lib/event-page-theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { detectNfcCapability, startNfcRead } from "@/lib/nfc";
import { redeemTicket } from "@/lib/redemption";
import { CalendarClock, Clock3, LogOut, MapPin, ScanLine, Smartphone } from "lucide-react";
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
  token: string;
  status: "active" | "redeemed" | "void";
  redeemed_at: string | null;
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
  const [searchParams] = useSearchParams();

  const theme = useMemo(
    () =>
      resolveEventPageTheme({
        themeKey: searchParams.get("theme"),
      }),
    [searchParams]
  );

  const backgroundImage = searchParams.get("bg")?.trim() || null;

  const backgroundStyle = {
    ...eventThemeCssVariables(theme),
    backgroundColor: "var(--event-background)",
    backgroundImage: backgroundImage
      ? `var(--event-overlay), url(${backgroundImage})`
      : "var(--event-overlay)",
    backgroundSize: backgroundImage ? "cover" : "auto",
    backgroundPosition: backgroundImage ? "center" : undefined,
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guest-tickets"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { event: null as EventRow | null, tickets: [] as TicketRow[] };

      const { data: tickets, error } = await (supabase as any)
        .from("drink_tickets")
        .select("id, token, status, redeemed_at, event_id")
        .eq("guest_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const firstEventId = tickets?.[0]?.event_id;
      if (!firstEventId) return { event: null, tickets: [] as TicketRow[] };

      const { data: event } = await (supabase as any)
        .from("events")
        .select("id, title, venue, starts_at, description")
        .eq("id", firstEventId)
        .maybeSingle();

      return {
        event: event ? ({ ...event, slug: null } as EventRow) : null,
        tickets: (tickets ?? []) as TicketRow[],
      };
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
    <div style={backgroundStyle} className={cn("min-h-screen bg-fixed bg-center text-[var(--event-text-primary)]", theme.fontBody)}>
      <header className={cn("border-b px-4 py-4 md:px-6", theme.cardStyle)}>
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className={cn("text-lg", theme.fontHeading)}>Sera Society</p>
            <p className="text-xs text-[var(--event-text-secondary)]">{fullName ?? email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[var(--event-text-secondary)] hover:text-[var(--event-text-primary)]">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-6 md:py-8">
        <ThemePicker currentTheme={searchParams.get("theme")} />

        {isLoading ? (
          <p className="text-sm text-[var(--event-text-secondary)]">Preparing your guest pass…</p>
        ) : !event ? (
          <p className={cn("rounded-2xl border border-dashed p-4 text-sm text-[var(--event-text-secondary)]", theme.cardStyle)}>
            No active invite has been assigned yet.
          </p>
        ) : (
          <>
            <section className={cn("rounded-3xl border p-6", theme.cardStyle)}>
              <p className="sera-label text-[var(--event-text-secondary)]">Your invitation</p>
              <h1 className={cn("mt-2 text-3xl text-[var(--event-text-primary)]", theme.fontHeading)}>{event.title}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-[var(--event-text-secondary)]"><CalendarClock className="h-4 w-4" />{fmt.format(new Date(event.starts_at))}</p>
              {event.venue && <p className="mt-1 flex items-center gap-2 text-sm text-[var(--event-text-secondary)]"><MapPin className="h-4 w-4" />{event.venue}</p>}
              {event.description && <p className="mt-4 text-sm text-[var(--event-text-primary)]">{event.description}</p>}

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {activeTicket ? (
                  <TicketDialog ticket={activeTicket} onRedeemed={() => refetch()} triggerLabel="Show entry ticket" themeCard={theme.cardStyle} headingFont={theme.fontHeading} />
                ) : (
                  <Button variant="sera" disabled>No active ticket</Button>
                )}
                <Button variant="sera-outline" onClick={() => navigate("/event-pages")}>Event details</Button>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              <InfoTile icon={<Clock3 className="h-4 w-4" />} title="Entry" text="Show your QR at check-in for quickest access." cardStyle={theme.cardStyle} />
              <InfoTile icon={<MapPin className="h-4 w-4" />} title="Directions" text={event.venue ?? "Venue details will appear here."} cardStyle={theme.cardStyle} />
              <InfoTile icon={<ScanLine className="h-4 w-4" />} title="Redemption" text="Use your ticket for drinks/items where enabled." cardStyle={theme.cardStyle} />
            </section>

            <section className={cn("rounded-3xl border p-5", theme.cardStyle)}>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--event-text-secondary)]">Tickets</p>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className={cn("flex items-center justify-between gap-3 rounded-2xl border p-3", theme.cardStyle)}>
                    <div>
                      <p className="font-medium capitalize text-[var(--event-text-primary)]">Drink ticket</p>
                      <p className="text-xs text-[var(--event-text-secondary)]">
                        {ticket.status === "redeemed" && ticket.redeemed_at
                          ? `Redeemed ${new Date(ticket.redeemed_at).toLocaleString()}`
                          : ticket.status === "void"
                          ? "Void"
                          : "Ready to redeem"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={ticket.status} />
                      <TicketDialog ticket={ticket} onRedeemed={() => refetch()} triggerLabel="Open" themeCard={theme.cardStyle} headingFont={theme.fontHeading} />
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

function ThemePicker({ currentTheme }: { currentTheme: string | null }) {
  const activeTheme = currentTheme && currentTheme in eventPageThemes ? currentTheme : "garden-editorial";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--event-accent)]/40 bg-[var(--event-background)]/35 p-2">
      {Object.keys(eventPageThemes).map((themeKey) => (
        <Button
          key={themeKey}
          variant={themeKey === activeTheme ? "sera" : "sera-outline"}
          size="sm"
          asChild
        >
          <a href={`?theme=${themeKey}`}>{themeKey.replace("-", " ")}</a>
        </Button>
      ))}
    </div>
  );
}

function InfoTile({ icon, title, text, cardStyle }: { icon: ReactNode; title: string; text: string; cardStyle: string }) {
  return (
    <article className={cn("rounded-2xl border p-4", cardStyle)}>
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--event-text-secondary)]">{icon}{title}</p>
      <p className="text-sm text-[var(--event-text-primary)]">{text}</p>
    </article>
  );
}

function StatusChip({ status }: { status: TicketRow["status"] }) {
  const tone =
    status === "active"
      ? "border-[var(--event-accent)]/70 text-[var(--event-accent)]"
      : status === "redeemed"
      ? "border-[var(--event-text-secondary)]/60 text-[var(--event-text-secondary)]"
      : "border-[var(--event-text-secondary)]/50 text-[var(--event-text-secondary)]";

  return (
    <Badge variant="outline" className={`capitalize ${tone}`}>
      {status}
    </Badge>
  );
}

function TicketDialog({
  ticket,
  onRedeemed,
  triggerLabel,
  themeCard,
  headingFont,
}: {
  ticket: TicketRow;
  onRedeemed: () => void;
  triggerLabel: string;
  themeCard: string;
  headingFont: string;
}) {
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
          const result = await redeemTicket({ token: event.payload, method: "nfc", stationLabel: "guest_nfc" });
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
      <DialogContent className={cn("sm:max-w-md", themeCard)}>
        <DialogHeader>
          <DialogTitle className={cn("text-2xl text-[var(--event-text-primary)]", headingFont)}>Present ticket</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-1">
          <div className={cn("rounded-2xl border p-4", themeCard)}>
            <QRCodeSVG value={ticket.token} size={220} level="H" />
          </div>
        </div>
        <p className={cn("rounded-xl border px-3 py-2 text-center font-mono text-xs text-[var(--event-text-secondary)] break-all", themeCard)}>{ticket.token}</p>
        {nfcCapability.supported ? (
          <Button variant={nfcActive ? "sera-outline" : "sera"} className="w-full" onClick={() => setNfcActive((v) => !v)}>
            <Smartphone className="mr-2 h-4 w-4" />
            {nfcActive ? "Listening for NFC tag…" : "Use NFC tap"}
          </Button>
        ) : (
          <p className="text-center text-xs text-[var(--event-text-secondary)]">
            <ScanLine className="mr-1 inline h-3 w-3" />
            NFC is unavailable on this browser/device. Please use QR.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

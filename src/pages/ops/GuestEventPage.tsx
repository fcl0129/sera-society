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
import { CalendarClock, Clock3, LogOut, MapPin, ScanLine, Smartphone, Ticket as TicketIcon } from "lucide-react";
import { toast } from "sonner";
import { RedemptionReceipt, type ReceiptData, receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";

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

            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--event-text-secondary)]">Your tickets</p>
                <p className="text-xs text-[var(--event-text-secondary)]">{tickets.length} total</p>
              </div>
              <div className="space-y-3">
                {tickets.map((ticket, idx) => (
                  <WalletTicket
                    key={ticket.id}
                    ticket={ticket}
                    eventTitle={event.title}
                    eventDate={event.starts_at}
                    venue={event.venue}
                    index={idx + 1}
                    onRedeemed={() => refetch()}
                    themeCard={theme.cardStyle}
                    headingFont={theme.fontHeading}
                  />
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
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
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
            setReceipt({
              status: "success",
              token: ticket.token,
              timestamp: result.redeemed_at ?? new Date().toISOString(),
              stationLabel: "guest_nfc",
              message: result.message,
            });
            onRedeemed();
          } else {
            toast.error(result.message ?? "Redemption failed");
            setReceipt({
              status: receiptStatusFromCode(result.code, false),
              token: ticket.token,
              timestamp: new Date().toISOString(),
              stationLabel: "guest_nfc",
              message: result.message,
            });
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
  }, [open, nfcActive, onRedeemed, ticket.token]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReceipt(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="sera" size="sm" disabled={ticket.status !== "active"} className="rounded-full">
          <TicketIcon className="mr-1.5 h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-md rounded-[28px]", themeCard)}>
        {receipt ? (
          <RedemptionReceipt data={receipt} onDismiss={() => setOpen(false)} />
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--event-text-secondary)]">
                Present at the bar
              </p>
              <DialogTitle className={cn("text-3xl text-[var(--event-text-primary)]", headingFont)}>
                Tap to redeem
              </DialogTitle>
            </DialogHeader>

            <div className="flex justify-center pt-2">
              <div className="relative rounded-3xl bg-white p-5 shadow-soft">
                <QRCodeSVG value={ticket.token} size={220} level="H" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-sera-ink/5" />
              </div>
            </div>

            <p className="mx-auto mt-1 max-w-[260px] text-center text-xs text-[var(--event-text-secondary)]">
              Brightness up. Hold the screen to the bartender's scanner.
            </p>

            <p className="mt-1 break-all rounded-xl border border-dashed border-[var(--event-text-secondary)]/40 bg-[var(--event-background)]/40 px-3 py-2 text-center font-mono text-[11px] text-[var(--event-text-secondary)]">
              {ticket.token}
            </p>

            {nfcCapability.supported ? (
              <Button
                variant={nfcActive ? "sera-outline" : "sera"}
                className="w-full rounded-full"
                onClick={() => setNfcActive((v) => !v)}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                {nfcActive ? "Listening for tap…" : "Use NFC tap"}
              </Button>
            ) : (
              <p className="text-center text-xs text-[var(--event-text-secondary)]">
                <ScanLine className="mr-1 inline h-3 w-3" />
                NFC unavailable on this device — use the QR code.
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WalletTicket({
  ticket,
  eventTitle,
  eventDate,
  venue,
  index,
  onRedeemed,
  themeCard,
  headingFont,
}: {
  ticket: TicketRow;
  eventTitle: string;
  eventDate: string;
  venue: string | null;
  index: number;
  onRedeemed: () => void;
  themeCard: string;
  headingFont: string;
}) {
  const isActive = ticket.status === "active";
  const isUsed = ticket.status === "redeemed";
  const isVoid = ticket.status === "void";

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(eventDate));

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border transition-opacity",
        themeCard,
        !isActive && "opacity-75",
      )}
    >
      {/* Perforation strip */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
        <div
          className="mx-3 h-px"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--event-text-secondary) 50%, transparent 50%)",
            backgroundSize: "8px 1px",
            opacity: 0.35,
          }}
        />
      </div>
      {/* Notches */}
      <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--event-background)]" aria-hidden />
      <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--event-background)]" aria-hidden />

      <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--event-text-secondary)]">
            Drink ticket · #{String(index).padStart(2, "0")}
          </p>
          <p className={cn("mt-1 truncate text-lg text-[var(--event-text-primary)]", headingFont)}>{eventTitle}</p>
          <p className="mt-1 text-xs text-[var(--event-text-secondary)]">
            {dateLabel}
            {venue ? ` · ${venue}` : ""}
          </p>
        </div>
        <TicketStateBadge status={ticket.status} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-dashed border-[var(--event-text-secondary)]/30 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--event-text-secondary)]">Status</p>
          <p className="mt-0.5 text-xs text-[var(--event-text-primary)]">
            {isUsed && ticket.redeemed_at
              ? `Used ${new Date(ticket.redeemed_at).toLocaleString()}`
              : isVoid
              ? "Cancelled by host"
              : "Tap to present"}
          </p>
        </div>
        {isActive ? (
          <TicketDialog
            ticket={ticket}
            onRedeemed={onRedeemed}
            triggerLabel="Tap to redeem"
            themeCard={themeCard}
            headingFont={headingFont}
          />
        ) : (
          <Button variant="sera-outline" size="sm" disabled>
            {isUsed ? "Redeemed" : "Unavailable"}
          </Button>
        )}
      </div>
    </div>
  );
}

function TicketStateBadge({ status }: { status: TicketRow["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-soft px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-status-success">
        <span className="h-1.5 w-1.5 rounded-full bg-status-success animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "redeemed") {
    return (
      <span className="inline-flex items-center rounded-full bg-sera-line/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-sera-warm-grey">
        Used
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-destructive">
      Void
    </span>
  );
}

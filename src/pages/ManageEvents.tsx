// @ts-nocheck — schema is evolving quickly while tier features are being rolled out
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type RsvpStatus = "pending" | "yes" | "no" | "maybe";
type EventTier = "essential" | "social" | "host" | "occasions";
const tierOrder: EventTier[] = ["essential", "social", "host", "occasions"];

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  venue: string | null;
  status: string;
  capacity: number | null;
  enable_qr: boolean;
  enable_nfc: boolean;
  tier: EventTier;
  reminder_days: number[] | null;
  rsvp_cutoff_at: string | null;
  contact_host_email: string | null;
  test_mode: boolean;
}

interface GuestRow {
  id: string;
  full_name: string;
  email: string | null;
  rsvp_status: RsvpStatus;
}

interface CheckinRow {
  id: string;
  guest_id: string;
}

interface DrinkTicketRow {
  id: string;
  guest_id: string | null;
  status: string;
}

interface EventMessageRow {
  id: string;
  body: string;
  channel: string;
  created_at: string;
}

interface StaffRoleRow {
  id: string;
  staff_email: string | null;
  role: string;
}

interface SeatingTableRow {
  id: string;
  label: string;
  seat_count: number;
}

interface SeatingAssignmentRow {
  id: string;
  guest_id: string;
  seating_table_id: string;
}

interface TimelineItemRow {
  id: string;
  title: string;
  kind: "timeline" | "checklist";
  starts_at: string | null;
  status: "pending" | "done";
}

interface WrappedSummaryRow {
  id: string;
  summary: Record<string, unknown>;
  created_at: string;
}

const tierCaps: Record<EventTier, string[]> = {
  essential: ["Event + RSVP", "Reminder + kalender", "Bas-sida"],
  social: ["QR/NFC check-in", "Drink tickets", "Host messaging"],
  host: ["Staff tools", "Export + test mode", "Avancerad RSVP automation"],
  occasions: ["Seating", "Timeline/checklist", "Evening Wrapped"],
};

const parseReminderDays = (value: string) =>
  value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 30);

const toDatetimeLocal = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const asCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escaped = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escaped(row[h])).join(","))].join("\n");
};

const downloadCsv = (fileName: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function ManageEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [checkinsByGuest, setCheckinsByGuest] = useState<Record<string, string>>({});
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [ticketsByGuest, setTicketsByGuest] = useState<Record<string, number>>({});

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<EventMessageRow[]>([]);

  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("host");
  const [staffRoles, setStaffRoles] = useState<StaffRoleRow[]>([]);

  const [reminderDaysInput, setReminderDaysInput] = useState("3");
  const [rsvpCutoffInput, setRsvpCutoffInput] = useState("");
  const [contactHostEmail, setContactHostEmail] = useState("");

  const [tableLabel, setTableLabel] = useState("");
  const [tableSeats, setTableSeats] = useState("8");
  const [seatingTables, setSeatingTables] = useState<SeatingTableRow[]>([]);
  const [seatingAssignments, setSeatingAssignments] = useState<SeatingAssignmentRow[]>([]);

  const [timelineTitle, setTimelineTitle] = useState("");
  const [timelineKind, setTimelineKind] = useState<"timeline" | "checklist">("timeline");
  const [timelineAt, setTimelineAt] = useState("");
  const [timelineItems, setTimelineItems] = useState<TimelineItemRow[]>([]);

  const [wrappedSummaries, setWrappedSummaries] = useState<WrappedSummaryRow[]>([]);
  const [allowedTier, setAllowedTier] = useState<EventTier>("essential");

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [events],
  );

  const selectedEvent = useMemo(
    () => sortedEvents.find((event) => event.id === selectedEventId) ?? null,
    [sortedEvents, selectedEventId],
  );

  const guestStats = useMemo(() => {
    const pending = guests.filter((g) => g.rsvp_status === "pending").length;
    const yes = guests.filter((g) => g.rsvp_status === "yes").length;
    const checkedIn = guests.filter((g) => checkinsByGuest[g.id]).length;
    return { pending, yes, checkedIn };
  }, [guests, checkinsByGuest]);

  const loadEvents = async () => {
    setLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Kunde inte läsa användarsession. Logga in igen.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("id,title,starts_at,venue,status,capacity,enable_qr,enable_nfc,tier,reminder_days,rsvp_cutoff_at,contact_host_email,test_mode")
      .eq("organizer_id", user.id)
      .order("starts_at", { ascending: true });

    if (error) {
      setErrorMessage("Kunde inte hämta events just nu.");
      setLoading(false);
      return;
    }

    const nextEvents = (data ?? []) as EventRow[];
    setEvents(nextEvents);
    if (!selectedEventId && nextEvents.length > 0) {
      setSelectedEventId(nextEvents[0].id);
    }
    setLoading(false);
  };

  const loadAllowedTier = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const normalizedEmail = user.email?.toLowerCase() ?? null;
    const { data: byUser } = await supabase
      .from("user_tier_access")
      .select("max_tier")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (byUser?.max_tier) {
      setAllowedTier((byUser.max_tier as EventTier) ?? "essential");
      return;
    }

    if (!normalizedEmail) {
      setAllowedTier("essential");
      return;
    }

    const { data: byEmail } = await supabase
      .from("user_tier_access")
      .select("max_tier")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setAllowedTier((byEmail?.max_tier as EventTier) ?? "essential");
  };

  const loadEventFeatureData = async (eventId: string) => {
    if (!eventId) {
      setMessages([]);
      setStaffRoles([]);
      setSeatingTables([]);
      setSeatingAssignments([]);
      setTimelineItems([]);
      setWrappedSummaries([]);
      return;
    }

    const [
      { data: messagesData },
      { data: staffData },
      { data: seatingData },
      { data: assignmentData },
      { data: timelineData },
      { data: wrappedData },
    ] = await Promise.all([
      supabase.from("event_messages").select("id,body,channel,created_at").eq("event_id", eventId).order("created_at", { ascending: false }).limit(20),
      supabase.from("event_staff_roles").select("id,staff_email,role").eq("event_id", eventId).order("created_at", { ascending: false }),
      supabase.from("seating_tables").select("id,label,seat_count").eq("event_id", eventId).order("label", { ascending: true }),
      supabase.from("seating_assignments").select("id,guest_id,seating_table_id").eq("event_id", eventId),
      supabase.from("event_timeline_items").select("id,title,kind,starts_at,status").eq("event_id", eventId).order("created_at", { ascending: false }),
      supabase.from("event_post_event_summaries").select("id,summary,created_at").eq("event_id", eventId).order("created_at", { ascending: false }).limit(3),
    ]);

    setMessages((messagesData ?? []) as EventMessageRow[]);
    setStaffRoles((staffData ?? []) as StaffRoleRow[]);
    setSeatingTables((seatingData ?? []) as SeatingTableRow[]);
    setSeatingAssignments((assignmentData ?? []) as SeatingAssignmentRow[]);
    setTimelineItems((timelineData ?? []) as TimelineItemRow[]);
    setWrappedSummaries((wrappedData ?? []) as WrappedSummaryRow[]);
  };

  const loadGuestsForEvent = async (eventId: string) => {
    if (!eventId) {
      setGuests([]);
      setCheckinsByGuest({});
      setTicketsByGuest({});
      return;
    }

    setLoadingGuests(true);
    setErrorMessage(null);

    const [
      { data: guestsData, error: guestsError },
      { data: checkinsData, error: checkinsError },
      { data: ticketData, error: ticketError },
    ] = await Promise.all([
      supabase.from("guests").select("id,full_name,email,rsvp_status").eq("event_id", eventId).order("created_at", { ascending: false }),
      supabase.from("checkins").select("id,guest_id").eq("event_id", eventId),
      supabase.from("drink_tickets").select("id,guest_id,status").eq("event_id", eventId).neq("status", "void"),
    ]);

    if (guestsError || checkinsError || ticketError) {
      setErrorMessage("Kunde inte läsa gäster/check-ins just nu.");
      setLoadingGuests(false);
      return;
    }

    setGuests((guestsData ?? []) as GuestRow[]);
    const map: Record<string, string> = {};
    (checkinsData as CheckinRow[] | null)?.forEach((row) => {
      map[row.guest_id] = row.id;
    });
    setCheckinsByGuest(map);

    const ticketCountMap: Record<string, number> = {};
    (ticketData as DrinkTicketRow[] | null)?.forEach((ticket) => {
      if (!ticket.guest_id) return;
      ticketCountMap[ticket.guest_id] = (ticketCountMap[ticket.guest_id] ?? 0) + 1;
    });
    setTicketsByGuest(ticketCountMap);
    setLoadingGuests(false);
  };

  useEffect(() => {
    void loadEvents();
    void loadAllowedTier();
  }, []);

  useEffect(() => {
    void loadGuestsForEvent(selectedEventId);
    void loadEventFeatureData(selectedEventId);
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEvent) return;
    setReminderDaysInput((selectedEvent.reminder_days ?? [3]).join(", "));
    setRsvpCutoffInput(toDatetimeLocal(selectedEvent.rsvp_cutoff_at));
    setContactHostEmail(selectedEvent.contact_host_email ?? "");
  }, [selectedEvent]);

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Du behöver vara inloggad för att skapa event.");
      setIsSaving(false);
      return;
    }

    const startsAtIso = new Date(startsAt).toISOString();
    const endsAtIso = endsAt ? new Date(endsAt).toISOString() : null;

    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title,
      venue: venue || null,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      capacity: capacity ? Number(capacity) : null,
      status: "draft",
      tier: "essential",
      reminder_days: [3],
      contact_host_email: user.email ?? null,
    });

    if (error) {
      setErrorMessage(error.message || "Kunde inte skapa event just nu.");
      setIsSaving(false);
      return;
    }

    setSuccessMessage("Event skapat!");
    setTitle("");
    setVenue("");
    setStartsAt("");
    setEndsAt("");
    setCapacity("");
    setIsSaving(false);
    await loadEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Är du säker på att du vill radera detta event?")) return;

    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      setErrorMessage("Kunde inte radera event.");
      return;
    }

    setSuccessMessage("Event raderat.");
    if (selectedEventId === eventId) {
      setSelectedEventId("");
      setGuests([]);
      setCheckinsByGuest({});
      setTicketsByGuest({});
    }
    await loadEvents();
  };

  const handlePublishToggle = async (event: EventRow) => {
    const nextStatus = event.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("events").update({ status: nextStatus }).eq("id", event.id);

    if (error) {
      setErrorMessage("Kunde inte uppdatera status.");
      return;
    }

    setSuccessMessage(`Event markerat som ${nextStatus}.`);
    await loadEvents();
  };

  const handleTicketModeToggle = async (mode: "qr" | "nfc", value: boolean) => {
    if (!selectedEventId) return;
    const payload = mode === "qr" ? { enable_qr: value } : { enable_nfc: value };
    const { error } = await supabase.from("events").update(payload).eq("id", selectedEventId);

    if (error) {
      setErrorMessage("Kunde inte uppdatera biljettläge.");
      return;
    }

    setEvents((prev) =>
      prev.map((event) =>
        event.id === selectedEventId
          ? {
              ...event,
              enable_qr: mode === "qr" ? value : event.enable_qr,
              enable_nfc: mode === "nfc" ? value : event.enable_nfc,
            }
          : event,
      ),
    );
  };

  const handleEventTierUpdate = async (tier: EventTier) => {
    if (!selectedEventId) return;
    if (tierOrder.indexOf(tier) > tierOrder.indexOf(allowedTier)) {
      setErrorMessage(`Din plan tillåter max ${allowedTier}. Kontakta superuser för uppgradering.`);
      return;
    }

    const { error } = await supabase.from("events").update({ tier }).eq("id", selectedEventId);
    if (error) {
      setErrorMessage("Kunde inte uppdatera tier.");
      return;
    }
    setSuccessMessage("Tier uppdaterad.");
    setEvents((prev) => prev.map((event) => (event.id === selectedEventId ? { ...event, tier } : event)));
  };

  const handleAutomationSave = async () => {
    if (!selectedEventId) return;

    const reminderDays = parseReminderDays(reminderDaysInput);
    if (reminderDays.length === 0) {
      setErrorMessage("Ange minst en reminder-dag (0–30). Ex: 7,3,1");
      return;
    }

    const payload = {
      reminder_days: reminderDays,
      rsvp_cutoff_at: rsvpCutoffInput ? new Date(rsvpCutoffInput).toISOString() : null,
      contact_host_email: contactHostEmail || null,
    };

    const { error } = await supabase.from("events").update(payload).eq("id", selectedEventId);
    if (error) {
      setErrorMessage("Kunde inte spara RSVP automation.");
      return;
    }

    setSuccessMessage("RSVP automation sparad.");
    await loadEvents();
  };

  const handleTestModeToggle = async (nextValue: boolean) => {
    if (!selectedEventId) return;
    const { error } = await supabase.from("events").update({ test_mode: nextValue }).eq("id", selectedEventId);
    if (error) {
      setErrorMessage("Kunde inte uppdatera test mode.");
      return;
    }
    setSuccessMessage(nextValue ? "Test mode aktiverad." : "Test mode avstängd.");
    setEvents((prev) => prev.map((event) => (event.id === selectedEventId ? { ...event, test_mode: nextValue } : event)));
  };

  const handleAddGuest = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    const { error } = await supabase.from("guests").insert({
      event_id: selectedEventId,
      full_name: guestName,
      email: guestEmail || null,
      rsvp_status: "pending",
    });

    if (error) {
      setErrorMessage("Kunde inte lägga till gäst.");
      return;
    }

    setGuestName("");
    setGuestEmail("");
    setSuccessMessage("Gäst tillagd.");
    await loadGuestsForEvent(selectedEventId);
  };

  const handleRsvpChange = async (guestId: string, status: RsvpStatus) => {
    const { error } = await supabase.from("guests").update({ rsvp_status: status }).eq("id", guestId);
    if (error) {
      setErrorMessage("Kunde inte uppdatera RSVP.");
      return;
    }

    setGuests((prev) => prev.map((guest) => (guest.id === guestId ? { ...guest, rsvp_status: status } : guest)));
  };

  const handleCheckinToggle = async (guestId: string) => {
    if (!selectedEventId) return;

    const existingCheckinId = checkinsByGuest[guestId];

    if (existingCheckinId) {
      const { error } = await supabase.from("checkins").delete().eq("id", existingCheckinId);
      if (error) {
        setErrorMessage("Kunde inte ångra check-in.");
        return;
      }
      setCheckinsByGuest((prev) => {
        const next = { ...prev };
        delete next[guestId];
        return next;
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("checkins")
      .insert({
        event_id: selectedEventId,
        guest_id: guestId,
        checked_in_by: user?.id ?? null,
      })
      .select("id,guest_id")
      .single();

    if (error || !data) {
      setErrorMessage("Kunde inte checka in gäst.");
      return;
    }

    setCheckinsByGuest((prev) => ({ ...prev, [data.guest_id]: data.id }));
  };

  const generateTicketCode = () => `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const generateNfcTag = () => `NFC-${Math.random().toString(36).slice(2, 12).toUpperCase()}`;

  const handleIssueTicket = async (guestId: string) => {
    if (!selectedEvent) return;

    const payload = {
      event_id: selectedEvent.id,
      guest_id: guestId,
      ticket_code: selectedEvent.enable_qr ? generateTicketCode() : generateNfcTag(),
      nfc_tag: selectedEvent.enable_nfc ? generateNfcTag() : null,
      status: "issued",
    };

    const { error } = await supabase.from("drink_tickets").insert(payload);
    if (error) {
      setErrorMessage("Kunde inte utfärda drinkbiljett.");
      return;
    }

    setTicketsByGuest((prev) => ({ ...prev, [guestId]: (prev[guestId] ?? 0) + 1 }));
  };

  const handleSendHostMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !messageText.trim()) return;

    const { error } = await supabase.from("event_messages").insert({
      event_id: selectedEventId,
      channel: "host_message",
      body: messageText.trim(),
    });

    if (error) {
      setErrorMessage("Kunde inte spara host-meddelande.");
      return;
    }

    setMessageText("");
    setSuccessMessage("Host-meddelande sparat.");
    await loadEventFeatureData(selectedEventId);
  };

  const handleAddStaffRole = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !staffEmail) return;

    const { error } = await supabase.from("event_staff_roles").insert({
      event_id: selectedEventId,
      staff_email: staffEmail,
      role: staffRole,
    });

    if (error) {
      setErrorMessage("Kunde inte lägga till staff-roll.");
      return;
    }

    setStaffEmail("");
    setSuccessMessage("Staff-roll tillagd.");
    await loadEventFeatureData(selectedEventId);
  };

  const handleCreateSeatingTable = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !tableLabel) return;

    const { error } = await supabase.from("seating_tables").insert({
      event_id: selectedEventId,
      label: tableLabel,
      seat_count: Number(tableSeats) || 0,
    });

    if (error) {
      setErrorMessage("Kunde inte skapa bord.");
      return;
    }

    setTableLabel("");
    setTableSeats("8");
    setSuccessMessage("Bord skapat.");
    await loadEventFeatureData(selectedEventId);
  };

  const handleAssignGuestSeat = async (guestId: string, seatingTableId: string) => {
    if (!selectedEventId) return;
    const existing = seatingAssignments.find((assignment) => assignment.guest_id === guestId);

    if (!seatingTableId && existing) {
      const { error } = await supabase.from("seating_assignments").delete().eq("id", existing.id);
      if (!error) await loadEventFeatureData(selectedEventId);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from("seating_assignments")
        .update({ seating_table_id: seatingTableId })
        .eq("id", existing.id);
      if (!error) await loadEventFeatureData(selectedEventId);
      return;
    }

    const { error } = await supabase.from("seating_assignments").insert({
      event_id: selectedEventId,
      guest_id: guestId,
      seating_table_id: seatingTableId,
    });
    if (!error) await loadEventFeatureData(selectedEventId);
  };

  const handleCreateTimelineItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !timelineTitle.trim()) return;

    const { error } = await supabase.from("event_timeline_items").insert({
      event_id: selectedEventId,
      title: timelineTitle.trim(),
      kind: timelineKind,
      starts_at: timelineAt ? new Date(timelineAt).toISOString() : null,
      status: "pending",
    });

    if (error) {
      setErrorMessage("Kunde inte lägga till timeline/checklist-item.");
      return;
    }

    setTimelineTitle("");
    setTimelineAt("");
    setSuccessMessage("Timeline/checklist-item tillagd.");
    await loadEventFeatureData(selectedEventId);
  };

  const handleTimelineStatusToggle = async (item: TimelineItemRow) => {
    const next = item.status === "done" ? "pending" : "done";
    const { error } = await supabase.from("event_timeline_items").update({ status: next }).eq("id", item.id);
    if (error) return;
    setTimelineItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: next } : row)));
  };

  const handleCreateWrappedSummary = async () => {
    if (!selectedEventId) return;

    const totalGuests = guests.length;
    const accepted = guests.filter((guest) => guest.rsvp_status === "yes").length;
    const checkedIn = Object.keys(checkinsByGuest).length;
    const totalDrinkTickets = Object.values(ticketsByGuest).reduce((sum, count) => sum + count, 0);

    const summary = {
      totalGuests,
      accepted,
      checkedIn,
      totalDrinkTickets,
      createdFromTier: selectedEvent?.tier ?? "essential",
    };

    const { error } = await supabase.from("event_post_event_summaries").insert({
      event_id: selectedEventId,
      summary,
    });

    if (error) {
      setErrorMessage("Kunde inte skapa Evening Wrapped.");
      return;
    }

    setSuccessMessage("Evening Wrapped skapad.");
    await loadEventFeatureData(selectedEventId);
  };

  const exportGuestList = () => {
    const csv = asCsv(
      guests.map((guest) => ({
        name: guest.full_name,
        email: guest.email,
        rsvp_status: guest.rsvp_status,
        checked_in: Boolean(checkinsByGuest[guest.id]),
        drink_tickets: ticketsByGuest[guest.id] ?? 0,
      })),
    );
    if (!csv) return;
    downloadCsv(`sera-guests-${selectedEvent?.id ?? "event"}.csv`, csv);
  };

  const exportAttendance = () => {
    const rows = guests
      .filter((guest) => Boolean(checkinsByGuest[guest.id]))
      .map((guest) => ({
        name: guest.full_name,
        email: guest.email,
        checked_in: "yes",
      }));
    const csv = asCsv(rows);
    if (!csv) return;
    downloadCsv(`sera-attendance-${selectedEvent?.id ?? "event"}.csv`, csv);
  };

  const exportTicketUsage = () => {
    const csv = asCsv(
      guests.map((guest) => ({
        name: guest.full_name,
        email: guest.email,
        issued_tickets: ticketsByGuest[guest.id] ?? 0,
      })),
    );
    if (!csv) return;
    downloadCsv(`sera-ticket-usage-${selectedEvent?.id ?? "event"}.csv`, csv);
  };

  const seatGuestMap = useMemo(() => {
    const map: Record<string, string> = {};
    seatingAssignments.forEach((assignment) => {
      map[assignment.guest_id] = assignment.seating_table_id;
    });
    return map;
  }, [seatingAssignments]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-6xl mx-auto px-6">
          <p className="sera-label text-sera-stone mb-4">Organizer Dashboard</p>
          <h1 className="sera-heading text-sera-ivory text-4xl md:text-5xl mb-3">Create & manage events</h1>
          <p className="sera-body text-sera-sand text-lg max-w-2xl">
            Nu med tier-funktioner för Essential, Social, Host och Occasions i samma arbetsyta.
          </p>
        </div>
      </section>

      <section className="py-16 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-sera-ivory/60 border border-sera-sand/60 p-6">
            <h2 className="font-serif text-sera-navy text-2xl mb-5">New event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Venue</Label>
                <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Starts at</Label>
                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Ends at (optional)</Label>
                <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="sera-label text-sera-navy text-[10px]">Capacity (optional)</Label>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>

              {errorMessage && <p className="text-xs text-red-700">{errorMessage}</p>}
              {successMessage && <p className="text-xs text-green-700">{successMessage}</p>}

              <Button variant="sera" size="lg" className="w-full" type="submit" disabled={isSaving}>
                {isSaving ? "Creating..." : "Create event"}
              </Button>
            </form>
          </div>

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-sera-navy text-2xl">Your events</h2>
              <Link className="text-xs text-sera-oxblood underline underline-offset-4" to="/dashboard">
                Back to dashboard
              </Link>
            </div>

            {loading ? (
              <p className="sera-body text-sera-warm-grey text-sm">Loading events…</p>
            ) : sortedEvents.length === 0 ? (
              <p className="sera-body text-sera-warm-grey text-sm">Inga events ännu.</p>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`border p-4 ${selectedEventId === event.id ? "border-sera-oxblood bg-sera-ivory" : "border-sera-sand/50 bg-sera-ivory/80"}`}
                  >
                    <button type="button" className="text-left w-full" onClick={() => setSelectedEventId(event.id)}>
                      <p className="font-sans text-sm font-medium text-sera-navy">{event.title}</p>
                      <p className="text-xs text-sera-warm-grey mt-1">
                        {new Date(event.starts_at).toLocaleString()} {event.venue ? `• ${event.venue}` : ""}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-sera-stone mt-2">
                        {event.status} · {event.tier}
                      </p>
                    </button>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handlePublishToggle(event)}
                        className="text-[10px] uppercase tracking-wider border border-sera-sand px-2 py-1"
                      >
                        {event.status === "published" ? "Set draft" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-[10px] uppercase tracking-wider border border-red-300 text-red-700 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 mt-10 space-y-10">
          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-serif text-sera-navy text-2xl">Tier controls</h3>
                <p className="text-xs text-sera-warm-grey mt-1">
                  Aktivera funktioner per event utifrån vad som utlovas i respektive tier.
                </p>
              </div>

              {selectedEvent && (
                <select
                  className="border border-sera-sand bg-sera-ivory px-3 py-2 text-sm"
                  value={selectedEvent.tier}
                  onChange={(e) => handleEventTierUpdate(e.target.value as EventTier)}
                >
                  <option value="essential">Essential</option>
                  <option value="social" disabled={tierOrder.indexOf(allowedTier) < tierOrder.indexOf("social")}>Social</option>
                  <option value="host" disabled={tierOrder.indexOf(allowedTier) < tierOrder.indexOf("host")}>Host</option>
                  <option value="occasions" disabled={tierOrder.indexOf(allowedTier) < tierOrder.indexOf("occasions")}>Occasions</option>
                </select>
              )}
            </div>
            <p className="text-xs text-sera-stone mt-2">Din tilldelade max-tier: <span className="uppercase">{allowedTier}</span>.</p>

            {selectedEvent ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-sera-sand/50 bg-sera-ivory/80 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-sera-stone">Active capabilities</p>
                  <ul className="space-y-1 text-sm text-sera-warm-grey">
                    {tierCaps[selectedEvent.tier].map((capability) => (
                      <li key={capability}>• {capability}</li>
                    ))}
                  </ul>
                  <label className="flex items-center gap-2 text-sm text-sera-navy pt-2">
                    <input
                      type="checkbox"
                      checked={selectedEvent.test_mode}
                      onChange={(e) => handleTestModeToggle(e.target.checked)}
                    />
                    Test mode (simulerar check-in och ticket redeem)
                  </label>
                </div>

                <div className="p-4 border border-sera-sand/50 bg-sera-ivory/80 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-sera-stone">RSVP automation</p>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Reminder days (komma-separerat)</Label>
                    <Input value={reminderDaysInput} onChange={(e) => setReminderDaysInput(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">RSVP cutoff</Label>
                    <Input type="datetime-local" value={rsvpCutoffInput} onChange={(e) => setRsvpCutoffInput(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase">Contact host email</Label>
                    <Input type="email" value={contactHostEmail} onChange={(e) => setContactHostEmail(e.target.value)} />
                  </div>
                  <Button type="button" variant="outline" className="w-full" onClick={handleAutomationSave}>
                    Save automation settings
                  </Button>
                </div>
              </div>
            ) : (
              <p className="sera-body text-sera-warm-grey text-sm mt-4">Välj ett event för att styra tier-funktionerna.</p>
            )}
          </div>

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <h3 className="font-serif text-sera-navy text-2xl">
                Guests & RSVP {selectedEvent ? `for ${selectedEvent.title}` : ""}
              </h3>
              {selectedEvent && (
                <div className="text-xs text-sera-warm-grey">
                  Pending: {guestStats.pending} · Yes: {guestStats.yes} · Checked-in: {guestStats.checkedIn}
                </div>
              )}
            </div>

            {!selectedEvent ? (
              <p className="sera-body text-sera-warm-grey text-sm">Välj ett event ovan för att hantera gäster.</p>
            ) : (
              <>
                <div className="mb-4 p-3 border border-sera-sand/50 bg-sera-ivory/80">
                  <p className="text-xs uppercase tracking-wider text-sera-stone mb-2">Drink ticket configuration</p>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEvent.enable_qr}
                        onChange={(e) => handleTicketModeToggle("qr", e.target.checked)}
                      />
                      Enable QR tickets
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedEvent.enable_nfc}
                        onChange={(e) => handleTicketModeToggle("nfc", e.target.checked)}
                      />
                      Enable NFC tags
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Button type="button" variant="outline" size="sm" onClick={exportGuestList}>Export guest list CSV</Button>
                  <Button type="button" variant="outline" size="sm" onClick={exportAttendance}>Export attendance CSV</Button>
                  <Button type="button" variant="outline" size="sm" onClick={exportTicketUsage}>Export ticket usage CSV</Button>
                </div>

                <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <Input placeholder="Guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
                  <Input placeholder="Guest email (optional)" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                  <Button type="submit" variant="sera">Add guest</Button>
                </form>

                {loadingGuests ? (
                  <p className="sera-body text-sera-warm-grey text-sm">Loading guests…</p>
                ) : guests.length === 0 ? (
                  <p className="sera-body text-sera-warm-grey text-sm">Inga gäster ännu.</p>
                ) : (
                  <div className="space-y-2">
                    {guests.map((guest) => (
                      <div key={guest.id} className="border border-sera-sand/50 bg-sera-ivory p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-sans text-sm font-medium text-sera-navy">{guest.full_name}</p>
                          <p className="text-xs text-sera-warm-grey">{guest.email || "No email"}</p>
                          <p className="text-[10px] uppercase tracking-wider text-sera-stone mt-1">
                            Drink tickets: {ticketsByGuest[guest.id] ?? 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={guest.rsvp_status}
                            onChange={(e) => handleRsvpChange(guest.id, e.target.value as RsvpStatus)}
                            className="border border-sera-sand bg-sera-ivory px-2 py-1 text-xs"
                          >
                            <option value="pending">pending</option>
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                            <option value="maybe">maybe</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleCheckinToggle(guest.id)}
                            className="text-xs border border-sera-sand px-2 py-1"
                          >
                            {checkinsByGuest[guest.id] ? "Undo check-in" : "Check in"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleIssueTicket(guest.id)}
                            className="text-xs border border-sera-sand px-2 py-1"
                          >
                            Issue ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
              <h3 className="font-serif text-sera-navy text-2xl mb-4">Host messaging (Social)</h3>
              <form onSubmit={handleSendHostMessage} className="space-y-3">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Message to guests" />
                <Button type="submit" variant="outline" className="w-full">Save host message</Button>
              </form>
              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-3 border border-sera-sand/50 bg-sera-ivory text-xs">
                    <p className="text-sera-navy">{msg.body}</p>
                    <p className="text-sera-stone mt-1">{new Date(msg.created_at).toLocaleString()} · {msg.channel}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-sm text-sera-warm-grey">Inga host-meddelanden ännu.</p>}
              </div>
            </div>

            <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
              <h3 className="font-serif text-sera-navy text-2xl mb-4">Staff roles (Host)</h3>
              <form onSubmit={handleAddStaffRole} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input value={staffEmail} type="email" required placeholder="staff@email.com" onChange={(e) => setStaffEmail(e.target.value)} />
                <select className="border border-sera-sand bg-sera-ivory px-2 text-sm" value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                  <option value="organizer">Organizer</option>
                  <option value="door">Door</option>
                  <option value="bartender">Bartender</option>
                  <option value="host">Host</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button type="submit" variant="outline">Add role</Button>
              </form>
              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
                {staffRoles.map((role) => (
                  <div key={role.id} className="p-3 border border-sera-sand/50 bg-sera-ivory text-xs flex justify-between">
                    <span>{role.staff_email ?? "(user id linked)"}</span>
                    <span className="uppercase tracking-wide">{role.role}</span>
                  </div>
                ))}
                {staffRoles.length === 0 && <p className="text-sm text-sera-warm-grey">Inga staff-roller ännu.</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
              <h3 className="font-serif text-sera-navy text-2xl mb-4">Seating system (Occasions)</h3>
              <form onSubmit={handleCreateSeatingTable} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <Input value={tableLabel} onChange={(e) => setTableLabel(e.target.value)} placeholder="Table A" required />
                <Input value={tableSeats} type="number" min={1} onChange={(e) => setTableSeats(e.target.value)} required />
                <Button type="submit" variant="outline">Create table</Button>
              </form>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {seatingTables.map((table) => {
                  const used = seatingAssignments.filter((item) => item.seating_table_id === table.id).length;
                  return (
                    <div key={table.id} className="p-3 border border-sera-sand/50 bg-sera-ivory text-xs">
                      <p className="text-sera-navy font-medium">{table.label}</p>
                      <p className="text-sera-stone">{used}/{table.seat_count} assigned</p>
                    </div>
                  );
                })}
                {seatingTables.length === 0 && <p className="text-sm text-sera-warm-grey">Inga bord skapade ännu.</p>}
              </div>

              <div className="mt-4 border-t border-sera-sand/50 pt-4 space-y-2 max-h-56 overflow-y-auto">
                {guests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between gap-2 text-xs">
                    <span>{guest.full_name}</span>
                    <select
                      className="border border-sera-sand bg-sera-ivory px-2 py-1"
                      value={seatGuestMap[guest.id] ?? ""}
                      onChange={(e) => handleAssignGuestSeat(guest.id, e.target.value)}
                    >
                      <option value="">No table</option>
                      {seatingTables.map((table) => (
                        <option key={table.id} value={table.id}>{table.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
              <h3 className="font-serif text-sera-navy text-2xl mb-4">Timeline + checklist (Occasions)</h3>
              <form onSubmit={handleCreateTimelineItem} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <Input value={timelineTitle} onChange={(e) => setTimelineTitle(e.target.value)} placeholder="Soundcheck" required />
                <select
                  className="border border-sera-sand bg-sera-ivory px-2 text-sm"
                  value={timelineKind}
                  onChange={(e) => setTimelineKind(e.target.value as "timeline" | "checklist")}
                >
                  <option value="timeline">Timeline</option>
                  <option value="checklist">Checklist</option>
                </select>
                <Input type="datetime-local" value={timelineAt} onChange={(e) => setTimelineAt(e.target.value)} />
                <Button type="submit" variant="outline" className="md:col-span-3">Add item</Button>
              </form>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {timelineItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full p-3 border border-sera-sand/50 bg-sera-ivory text-left"
                    onClick={() => handleTimelineStatusToggle(item)}
                  >
                    <p className="text-sm text-sera-navy">{item.title}</p>
                    <p className="text-[10px] text-sera-stone uppercase tracking-wide mt-1">
                      {item.kind} · {item.status} {item.starts_at ? `· ${new Date(item.starts_at).toLocaleString()}` : ""}
                    </p>
                  </button>
                ))}
                {timelineItems.length === 0 && <p className="text-sm text-sera-warm-grey">Inga items ännu.</p>}
              </div>
            </div>
          </div>

          <div className="bg-sera-ivory/50 border border-sera-sand/60 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-serif text-sera-navy text-2xl">Evening Wrapped + post-event recap</h3>
                <p className="text-sm text-sera-warm-grey">Skapa summering med attendance, drink usage och delningsbar recap-data.</p>
              </div>
              <Button type="button" variant="sera" onClick={handleCreateWrappedSummary}>Generate Evening Wrapped</Button>
            </div>

            <div className="mt-4 space-y-2">
              {wrappedSummaries.map((summary) => (
                <div key={summary.id} className="p-3 border border-sera-sand/50 bg-sera-ivory text-xs">
                  <p className="text-sera-stone mb-1">{new Date(summary.created_at).toLocaleString()}</p>
                  <pre className="whitespace-pre-wrap text-sera-navy">{JSON.stringify(summary.summary, null, 2)}</pre>
                </div>
              ))}
              {wrappedSummaries.length === 0 && <p className="text-sm text-sera-warm-grey">Ingen wrapped-summary ännu.</p>}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

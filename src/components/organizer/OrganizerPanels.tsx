import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Trash2, Send, Plus, MessageSquare, Sparkles, Users } from "lucide-react";

const sectionStyle: React.CSSProperties = {
  border: "1px solid var(--app-card-border)",
  background: "var(--app-card-bg)",
  padding: "24px 32px",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  marginBottom: 20,
  paddingBottom: 20,
  borderBottom: "1px solid var(--app-line-brass)",
};

const labelKicker: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.62rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--app-line-brass)",
  margin: 0,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: "1.5rem",
  letterSpacing: "-0.02em",
  color: "var(--app-text)",
  margin: "6px 0 0",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(7,20,38,0.7)",
  border: "1px solid var(--app-card-border)",
  color: "var(--app-text)",
  borderRadius: 0,
};

const primaryBtn: React.CSSProperties = {
  background: "#5A1218",
  color: "#F4EBDD",
  border: 0,
  borderRadius: 999,
  padding: "8px 16px",
  fontFamily: "var(--font-sans)",
  fontSize: "0.7rem",
  fontWeight: 500,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--app-card-border)",
  color: "var(--app-text-muted)",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: "0.72rem",
  cursor: "pointer",
};

const muted: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.66rem",
  color: "var(--app-text-muted)",
};

/* ---------------- Seating ---------------- */

type SeatingTable = { id: string; label: string; seat_count: number; event_id: string };
type SeatingAssignment = { id: string; guest_id: string; seating_table_id: string };
type AcceptedGuest = { id: string; full_name: string | null; invited_email: string; rsvp_status: string };

export function SeatingPanel({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [newLabel, setNewLabel] = useState("");
  const [newSeats, setNewSeats] = useState(8);

  const tablesQuery = useQuery({
    queryKey: ["org-seating-tables", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("seating_tables")
        .select("id,label,seat_count,event_id")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SeatingTable[];
    },
  });

  const assignQuery = useQuery({
    queryKey: ["org-seating-assignments", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("seating_assignments")
        .select("id,guest_id,seating_table_id")
        .eq("event_id", eventId);
      if (error) throw error;
      return (data ?? []) as SeatingAssignment[];
    },
  });

  const guestsQuery = useQuery({
    queryKey: ["org-accepted-guests", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_guests")
        .select("id,full_name,invited_email,rsvp_status")
        .eq("event_id", eventId)
        .eq("rsvp_status", "accepted")
        .order("full_name", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as AcceptedGuest[];
    },
  });

  const tables = tablesQuery.data ?? [];
  const assignments = assignQuery.data ?? [];
  const guests = guestsQuery.data ?? [];

  const tableForGuest = (guestId: string) =>
    assignments.find((a) => a.guest_id === guestId)?.seating_table_id ?? "";

  const fillFor = (tableId: string) =>
    assignments.filter((a) => a.seating_table_id === tableId).length;

  const addTable = async (e: FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    const { error } = await (supabase as any)
      .from("seating_tables")
      .insert({ event_id: eventId, label, seat_count: Math.max(1, newSeats || 1) });
    if (error) toast({ title: "Could not add table", description: error.message, variant: "destructive" });
    else {
      setNewLabel(""); setNewSeats(8);
      await qc.invalidateQueries({ queryKey: ["org-seating-tables", eventId] });
    }
  };

  const renameTable = async (id: string, label: string) => {
    const next = window.prompt("Rename table", label);
    if (!next || next.trim() === label) return;
    const { error } = await (supabase as any).from("seating_tables").update({ label: next.trim() }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-seating-tables", eventId] });
  };

  const updateSeats = async (id: string, value: number) => {
    const { error } = await (supabase as any).from("seating_tables").update({ seat_count: Math.max(1, value) }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-seating-tables", eventId] });
  };

  const deleteTable = async (id: string) => {
    if (!window.confirm("Delete this table? Guest assignments will be removed.")) return;
    const { error } = await (supabase as any).from("seating_tables").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else {
      await qc.invalidateQueries({ queryKey: ["org-seating-tables", eventId] });
      await qc.invalidateQueries({ queryKey: ["org-seating-assignments", eventId] });
    }
  };

  const assignGuest = async (guestId: string, tableId: string) => {
    const existing = assignments.find((a) => a.guest_id === guestId);
    if (!tableId) {
      if (!existing) return;
      const { error } = await (supabase as any).from("seating_assignments").delete().eq("id", existing.id);
      if (error) toast({ title: "Unassign failed", description: error.message, variant: "destructive" });
      else await qc.invalidateQueries({ queryKey: ["org-seating-assignments", eventId] });
      return;
    }
    const target = tables.find((t) => t.id === tableId);
    if (target && fillFor(tableId) >= target.seat_count && existing?.seating_table_id !== tableId) {
      toast({ title: "Table is full", description: `${target.label} is at capacity.`, variant: "destructive" });
      return;
    }
    if (existing) {
      const { error } = await (supabase as any)
        .from("seating_assignments")
        .update({ seating_table_id: tableId })
        .eq("id", existing.id);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      const { error } = await (supabase as any)
        .from("seating_assignments")
        .insert({ event_id: eventId, guest_id: guestId, seating_table_id: tableId });
      if (error) toast({ title: "Assign failed", description: error.message, variant: "destructive" });
    }
    await qc.invalidateQueries({ queryKey: ["org-seating-assignments", eventId] });
  };

  return (
    <div style={sectionStyle}>
      <div style={headerRow}>
        <div>
          <p style={labelKicker}>The room</p>
          <h3 style={titleStyle}>Seating</h3>
        </div>
        <span style={muted}>{tables.length} table{tables.length === 1 ? "" : "s"} · {assignments.length}/{guests.length} seated</span>
      </div>

      <form onSubmit={addTable} className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Table label (e.g. Table 1)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} style={{ ...inputStyle, flex: "1 1 220px" }} />
        <Input type="number" min={1} max={50} value={newSeats} onChange={(e) => setNewSeats(parseInt(e.target.value || "0", 10))} style={{ ...inputStyle, width: 90 }} />
        <button type="submit" style={primaryBtn}><Plus className="inline w-3 h-3 mr-1" />Add table</button>
      </form>

      {tables.length === 0 ? (
        <p style={{ ...muted, fontSize: "0.8rem" }}>No tables yet. Add one to begin assigning guests.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {tables.map((t) => {
            const fill = fillFor(t.id);
            const full = fill >= t.seat_count;
            return (
              <div key={t.id} style={{ border: "1px solid var(--app-card-border)", padding: "14px 16px" }}>
                <div className="flex items-baseline justify-between">
                  <button onClick={() => renameTable(t.id, t.label)} style={{ background: "none", border: 0, padding: 0, fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--app-text)", cursor: "pointer", letterSpacing: "-0.01em" }}>{t.label}</button>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: full ? "#A9845C" : "var(--app-text-muted)" }}>{fill}/{t.seat_count}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label style={{ fontSize: "0.66rem", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Seats</label>
                  <Input type="number" min={1} max={50} value={t.seat_count} onChange={(e) => updateSeats(t.id, parseInt(e.target.value || "0", 10))} style={{ ...inputStyle, height: 32, width: 80 }} />
                  <button onClick={() => deleteTable(t.id)} style={{ ...ghostBtn, marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4 }} title="Delete table"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2">
        <p style={{ ...labelKicker, marginBottom: 10 }}>Place guests</p>
        {guests.length === 0 ? (
          <p style={{ ...muted, fontSize: "0.8rem" }}>No accepted guests yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-[24rem] overflow-auto pr-1">
            {guests.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3" style={{ borderTop: "1px solid var(--app-card-border)", padding: "8px 0" }}>
                <div className="min-w-0">
                  <p style={{ fontSize: "0.88rem", color: "var(--app-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.full_name ?? g.invited_email}</p>
                  {g.full_name && <p style={{ ...muted, fontSize: "0.64rem", margin: 0 }}>{g.invited_email}</p>}
                </div>
                <select
                  value={tableForGuest(g.id)}
                  onChange={(e) => assignGuest(g.id, e.target.value)}
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", border: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.7)", color: "var(--app-text)", padding: "4px 8px", minWidth: 140 }}
                >
                  <option value="">— Unassigned —</option>
                  {tables.map((t) => {
                    const fill = fillFor(t.id);
                    const isCurrent = tableForGuest(g.id) === t.id;
                    const full = fill >= t.seat_count && !isCurrent;
                    return (
                      <option key={t.id} value={t.id} disabled={full}>
                        {t.label} ({fill}/{t.seat_count}){full ? " · full" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Broadcasts ---------------- */

type EventMessage = { id: string; body: string; channel: string; created_at: string };

export function BroadcastPanel({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"accepted" | "all">("accepted");
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesQuery = useQuery({
    queryKey: ["org-event-messages", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_messages")
        .select("id,body,channel,created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventMessage[];
    },
  });

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const { error: insertErr } = await (supabase as any)
      .from("event_messages")
      .insert({ event_id: eventId, body: text, channel: "broadcast" });
    if (insertErr) {
      toast({ title: "Broadcast failed", description: insertErr.message, variant: "destructive" });
      setSending(false);
      return;
    }

    let emailedCount = 0;
    let failedCount = 0;
    if (sendEmail) {
      let q = (supabase as any).from("event_guests").select("invited_email,rsvp_status").eq("event_id", eventId);
      if (audience === "accepted") q = q.eq("rsvp_status", "accepted");
      const { data: guestList } = await q;
      const recipients = (guestList ?? []) as { invited_email: string }[];
      for (const r of recipients) {
        const { error } = await supabase.functions.invoke("send-sera-email", {
          body: {
            template: "invitation",
            to: r.invited_email,
            data: {
              event_title: `Update · ${eventTitle}`,
              event_date: "",
              venue: "",
              rsvp_url: `${window.location.origin}/login`,
              pass_url: "",
              host_name: text.slice(0, 600),
              app_url: window.location.origin,
            },
          },
        });
        if (error) failedCount += 1;
        else emailedCount += 1;
      }
    }

    setBody("");
    setSending(false);
    await qc.invalidateQueries({ queryKey: ["org-event-messages", eventId] });
    toast({
      title: "Broadcast sent",
      description: sendEmail
        ? `${emailedCount} emailed${failedCount ? ` · ${failedCount} failed` : ""} · also visible on guest passes`
        : "Visible on guest passes",
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this broadcast from the guest pass history?")) return;
    const { error } = await (supabase as any).from("event_messages").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-event-messages", eventId] });
  };

  const messages = messagesQuery.data ?? [];

  return (
    <div style={sectionStyle}>
      <div style={headerRow}>
        <div>
          <p style={labelKicker}>A word to your guests</p>
          <h3 style={titleStyle}>Broadcasts</h3>
        </div>
        <span style={muted}><MessageSquare className="inline w-3.5 h-3.5 mr-1" />{messages.length} sent</span>
      </div>

      <form onSubmit={send} className="space-y-3">
        <Textarea
          placeholder="A note to your guests — a change of dress code, arrival instructions, a last-minute address…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          style={{ ...inputStyle, minHeight: 110 }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select value={audience} onChange={(e) => setAudience(e.target.value as "accepted" | "all")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", border: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.7)", color: "var(--app-text)", padding: "6px 10px" }}>
            <option value="accepted">Accepted guests only</option>
            <option value="all">All invited guests</option>
          </select>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--app-text)" }}>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Also send branded email
          </label>
          <button type="submit" disabled={sending || !body.trim()} style={{ ...primaryBtn, marginLeft: "auto", opacity: sending ? 0.7 : 1, cursor: sending ? "not-allowed" : "pointer" }}>
            <Send className="inline w-3 h-3 mr-1" />{sending ? "Sending…" : "Broadcast"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p style={{ ...labelKicker, marginBottom: 10 }}>History</p>
        {messages.length === 0 ? (
          <p style={{ ...muted, fontSize: "0.8rem" }}>No broadcasts yet.</p>
        ) : (
          <div className="space-y-2 max-h-[20rem] overflow-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} style={{ border: "1px solid var(--app-card-border)", padding: "12px 14px" }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span style={muted}>{new Date(m.created_at).toLocaleString()}</span>
                  <button onClick={() => remove(m.id)} style={{ ...ghostBtn, padding: "2px 8px", fontSize: "0.66rem" }}>Delete</button>
                </div>
                <p style={{ marginTop: 6, fontSize: "0.9rem", color: "var(--app-text)", whiteSpace: "pre-wrap" }}>{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Wrapped recap ---------------- */

type WrappedRow = { id: string; custom_note: string | null; is_published: boolean; summary: Record<string, unknown> };

export function WrappedPanel({ eventId, eventEndsAt, rsvpTokenSample }: { eventId: string; eventEndsAt: string | null; rsvpTokenSample?: string | null }) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const wrappedQuery = useQuery({
    queryKey: ["org-wrapped", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("wrapped_summaries")
        .select("id,custom_note,is_published,summary")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as WrappedRow | null;
    },
  });

  if (!loaded && wrappedQuery.data !== undefined) {
    setLoaded(true);
    setNote(wrappedQuery.data?.custom_note ?? "");
    setIsPublished(wrappedQuery.data?.is_published ?? false);
  }

  const save = async (publish: boolean) => {
    const payload = {
      event_id: eventId,
      custom_note: note.trim() || null,
      is_published: publish,
      summary: wrappedQuery.data?.summary ?? {},
    };
    const existing = wrappedQuery.data;
    const { error } = existing
      ? await (supabase as any).from("wrapped_summaries").update(payload).eq("id", existing.id)
      : await (supabase as any).from("wrapped_summaries").insert(payload);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else {
      setIsPublished(publish);
      toast({ title: publish ? "Recap published" : "Recap saved as draft" });
      await qc.invalidateQueries({ queryKey: ["org-wrapped", eventId] });
    }
  };

  const ended = eventEndsAt ? new Date(eventEndsAt) < new Date() : false;

  return (
    <div style={sectionStyle}>
      <div style={headerRow}>
        <div>
          <p style={labelKicker}>After the evening</p>
          <h3 style={titleStyle}>Wrapped recap</h3>
        </div>
        <span style={muted}>
          <Sparkles className="inline w-3.5 h-3.5 mr-1" />
          {isPublished ? "Live to guests" : "Draft"}
          {ended ? "" : " · event hasn't ended yet"}
        </span>
      </div>

      <Textarea
        placeholder="A short thank-you note — this appears at the top of your guests' recap page."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={5}
        style={{ ...inputStyle, minHeight: 130 }}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={() => save(false)} style={ghostBtn}>Save draft</button>
        <button onClick={() => save(true)} style={primaryBtn}>Publish recap</button>
        {isPublished && (
          <button onClick={() => save(false)} style={{ ...ghostBtn, marginLeft: "auto" }}>Unpublish</button>
        )}
        {rsvpTokenSample && isPublished && (
          <a
            href={`/wrapped/${encodeURIComponent(rsvpTokenSample)}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...ghostBtn, marginLeft: isPublished ? 0 : "auto", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            Preview as guest
          </a>
        )}
      </div>
      <p style={{ ...muted, marginTop: 10 }}>
        Recap stats (attendance, tickets redeemed) are calculated automatically when guests view their pass after the event.
      </p>
    </div>
  );
}

/* ---------------- Staff roles ---------------- */

type StaffRoleRow = { id: string; staff_email: string | null; role: string; created_at: string };

export function StaffRolesPanel({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("bartender");

  const rolesQuery = useQuery({
    queryKey: ["org-staff-roles", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("staff_roles")
        .select("id,staff_email,role,created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StaffRoleRow[];
    },
  });

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;
    const { error } = await (supabase as any)
      .from("staff_roles")
      .insert({ event_id: eventId, staff_email: normalized, role });
    if (error) {
      toast({ title: "Could not assign", description: error.message, variant: "destructive" });
      return;
    }
    setEmail("");

    // If the user already has a profile and their account-wide role is just 'guest',
    // promote them to the matching app role (bartender) so they can access Bar Mode.
    if (role === "bartender") {
      const { data: prof } = await (supabase as any)
        .from("profiles")
        .select("id,role")
        .eq("email", normalized)
        .maybeSingle();
      if (prof && prof.role === "guest") {
        await (supabase as any).from("profiles").update({ role: "bartender" }).eq("id", prof.id);
      }
    }

    await qc.invalidateQueries({ queryKey: ["org-staff-roles", eventId] });
    toast({
      title: "Staff assigned",
      description: `${normalized} · ${role}. If they don't yet have access, ask them to request access at /request-access.`,
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this staff assignment?")) return;
    const { error } = await (supabase as any).from("staff_roles").delete().eq("id", id);
    if (error) toast({ title: "Remove failed", description: error.message, variant: "destructive" });
    else await qc.invalidateQueries({ queryKey: ["org-staff-roles", eventId] });
  };

  const rows = rolesQuery.data ?? [];

  return (
    <div style={sectionStyle}>
      <div style={headerRow}>
        <div>
          <p style={labelKicker}>Your team</p>
          <h3 style={titleStyle}>Staff roles</h3>
        </div>
        <span style={muted}><Users className="inline w-3.5 h-3.5 mr-1" />{rows.length} assigned</span>
      </div>

      <form onSubmit={add} className="flex flex-wrap gap-2 mb-4">
        <Input type="email" placeholder="person@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ ...inputStyle, flex: "1 1 240px" }} />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", border: "1px solid var(--app-card-border)", background: "rgba(7,20,38,0.7)", color: "var(--app-text)", padding: "6px 10px" }}>
          <option value="bartender">Bartender</option>
          <option value="door">Door staff</option>
          <option value="host">Host</option>
        </select>
        <button type="submit" style={primaryBtn}><Plus className="inline w-3 h-3 mr-1" />Assign</button>
      </form>

      {rows.length === 0 ? (
        <p style={{ ...muted, fontSize: "0.8rem" }}>No staff assigned yet.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3" style={{ borderTop: "1px solid var(--app-card-border)", padding: "10px 0" }}>
              <div>
                <p style={{ fontSize: "0.88rem", color: "var(--app-text)", margin: 0 }}>{r.staff_email ?? "—"}</p>
                <p style={{ ...muted, margin: 0 }}>{r.role} · added {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => remove(r.id)} style={{ ...ghostBtn, display: "inline-flex", alignItems: "center", gap: 4 }} title="Remove"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
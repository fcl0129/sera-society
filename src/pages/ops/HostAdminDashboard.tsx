import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus } from "lucide-react";

const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

type EventRow = { id: string; title: string; starts_at: string; venue: string | null };

type RedemptionLog = {
  id: string;
  created_at: string;
  result: string;
  method: string;
  metadata: Record<string, unknown>;
  ticket_id: string | null;
};

export default function HostAdminDashboard() {
  const { fullName, email } = useAuthState();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const eventsQuery = useQuery({
    queryKey: ["ops-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id,title,starts_at,venue")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EventRow[];
    },
  });

  const events = eventsQuery.data ?? [];
  const currentEventId = activeEventId ?? events[0]?.id ?? null;

  const ticketsQuery = useQuery({
    queryKey: ["ops-tickets", currentEventId],
    enabled: !!currentEventId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tickets")
        .select("id,ticket_type,status")
        .eq("event_id", currentEventId);
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; ticket_type: string; status: string }>;
    },
  });

  const redemptionsQuery = useQuery({
    queryKey: ["ops-redemptions", currentEventId],
    enabled: !!currentEventId,
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("redemptions")
        .select("id,created_at,result,method,metadata,ticket_id")
        .eq("event_id", currentEventId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as RedemptionLog[];
    },
  });

  const pointsQuery = useQuery({
    queryKey: ["ops-points", currentEventId],
    enabled: !!currentEventId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("redemption_points")
        .select("id,name,type,identifier,active")
        .eq("event_id", currentEventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: ["ops-staff", currentEventId],
    enabled: !!currentEventId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("staff_assignments")
        .select("id,user_id,role,profiles:user_id(display_name,email)")
        .eq("event_id", currentEventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const tickets = ticketsQuery.data ?? [];
    const byType = tickets.reduce<Record<string, { total: number; redeemed: number }>>((acc, ticket) => {
      const curr = acc[ticket.ticket_type] ?? { total: 0, redeemed: 0 };
      curr.total += 1;
      if (ticket.status === "redeemed") curr.redeemed += 1;
      acc[ticket.ticket_type] = curr;
      return acc;
    }, {});
    return byType;
  }, [ticketsQuery.data]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-sera-surface-light">
      <header className="border-b border-sera-sand/40 bg-sera-ivory/60">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="sera-label text-sera-stone">Organizer mode</p>
            <h1 className="font-serif text-xl text-sera-navy">{fullName ?? email ?? "Sera Society"}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" />Sign out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <section className="space-y-2">
            <h2 className="font-serif text-xl text-sera-navy">Events</h2>
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setActiveEventId(event.id)}
                className={`w-full text-left border p-3 ${currentEventId === event.id ? "border-sera-navy bg-sera-ivory" : "border-sera-sand/40 bg-white"}`}
              >
                <p className="font-serif text-sera-navy">{event.title}</p>
                <p className="text-xs text-sera-warm-grey">{fmt.format(new Date(event.starts_at))}{event.venue ? ` · ${event.venue}` : ""}</p>
              </button>
            ))}
          </section>

          <section className="space-y-6">
            <article className="border border-sera-sand/40 bg-sera-ivory p-5">
              <h3 className="font-serif text-xl text-sera-navy">Redemption overview</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {Object.entries(stats).map(([type, stat]) => (
                  <div key={type} className="border border-sera-sand/40 p-3 bg-white/40">
                    <p className="text-xs uppercase tracking-widest text-sera-stone">{type.replaceAll("_", " ")}</p>
                    <p className="font-serif text-xl text-sera-navy mt-1">{stat.redeemed}/{stat.total}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="grid lg:grid-cols-2 gap-4">
              <div className="border border-sera-sand/40 bg-sera-ivory p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg text-sera-navy">Redemption points</h4>
                  <CreatePointForm
                    eventId={currentEventId}
                    onDone={() => qc.invalidateQueries({ queryKey: ["ops-points", currentEventId] })}
                  />
                </div>
                <div className="space-y-2">
                  {(pointsQuery.data ?? []).map((point: any) => (
                    <div key={point.id} className="border border-sera-sand/40 p-3 bg-white/40">
                      <p className="font-medium">{point.name}</p>
                      <p className="text-xs text-sera-warm-grey">{point.type} · {point.identifier}</p>
                      <Badge variant="outline" className="mt-1">{point.active ? "active" : "disabled"}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-sera-sand/40 bg-sera-ivory p-4 space-y-3">
                <h4 className="font-serif text-lg text-sera-navy">Staff assignments</h4>
                <CreateAssignmentForm
                  eventId={currentEventId}
                  onDone={() => qc.invalidateQueries({ queryKey: ["ops-staff", currentEventId] })}
                />
                <div className="space-y-2">
                  {(assignmentsQuery.data ?? []).map((assignment: any) => (
                    <div key={assignment.id} className="border border-sera-sand/40 p-3 bg-white/40">
                      <p className="text-sm">{assignment.profiles?.display_name ?? assignment.profiles?.email ?? assignment.user_id}</p>
                      <Badge variant="outline" className="mt-1">{assignment.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="border border-sera-sand/40 bg-sera-ivory p-4">
              <h4 className="font-serif text-lg text-sera-navy">Scan history</h4>
              <div className="mt-3 space-y-2 max-h-72 overflow-auto">
                {(redemptionsQuery.data ?? []).map((log) => (
                  <div key={log.id} className="border border-sera-sand/40 bg-white/40 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm capitalize">{log.result.replaceAll("_", " ")}</p>
                      <p className="text-xs text-sera-warm-grey">{fmt.format(new Date(log.created_at))} · {log.method.toUpperCase()}</p>
                    </div>
                    <Badge variant="outline">{log.ticket_id ? "ticket" : "no ticket"}</Badge>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}

function CreatePointForm({ eventId, onDone }: { eventId: string | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("qr_station");
  const [identifier, setIdentifier] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    const { error } = await (supabase as any).from("redemption_points").insert({ event_id: eventId, name, type, identifier });
    if (!error) {
      setOpen(false);
      setName("");
      setIdentifier("");
      onDone();
    }
  };

  if (!open) return <Button size="sm" variant="sera" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />New</Button>;

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Point name" required />
      <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Type (qr_station)" required />
      <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Identifier" required />
      <Button type="submit" size="sm">Save</Button>
    </form>
  );
}

function CreateAssignmentForm({ eventId, onDone }: { eventId: string | null; onDone: () => void }) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("bartender");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventId || !userId.trim()) return;
    const { error } = await (supabase as any).from("staff_assignments").insert({ event_id: eventId, user_id: userId.trim(), role });
    if (!error) {
      setUserId("");
      onDone();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Staff user UUID" required />
      <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (bartender)" required />
      <Button type="submit" size="sm">Assign staff</Button>
    </form>
  );
}

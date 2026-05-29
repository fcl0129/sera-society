import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function StudioListPage() {
  const [events, setEvents] = useState<{ id: string; title: string; status: string; starts_at: string; slug: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        nav("/login?redirect=/host");
        return;
      }
      const { data } = await supabase
        .from("events")
        .select("id,title,status,starts_at,slug")
        .eq("organizer_id", u.user.id)
        .order("created_at", { ascending: false });
      setEvents(data || []);
      setLoading(false);
    })();
  }, [nav]);

  return (
    <div style={{ minHeight: "100vh", background: "#F6F4EE", fontFamily: "Inter, system-ui, sans-serif", padding: "60px 24px", color: "#12100E" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <p style={{ fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#A9845C" }}>Sera · Host</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 500, fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "-0.03em", margin: "10px 0 0" }}>Event Studio</h1>
        <p style={{ marginTop: 12, color: "#555", maxWidth: 540, lineHeight: 1.6 }}>Compose private event microsites — invitation, RSVP, schedule, playlist, photo wall.</p>

        <Link to="/host/studio/new" style={{ display: "inline-block", marginTop: 28, padding: "14px 28px", background: "#3A0F14", color: "#F5EFE3", textDecoration: "none", fontSize: "0.74rem", letterSpacing: "0.24em", textTransform: "uppercase" }}>
          Begin a new evening
        </Link>

        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? (
            <p style={{ color: "#999" }}>Loading…</p>
          ) : events.length === 0 ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>No events yet.</p>
          ) : (
            events.map((e) => (
              <Link
                key={e.id}
                to={`/host/studio/${e.id}`}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", background: "#fff", border: "1px solid rgba(18,16,14,0.08)", textDecoration: "none", color: "#12100E" }}
              >
                <div>
                  <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontStyle: "italic" }}>{e.title || "Untitled evening"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#888", letterSpacing: "0.06em" }}>
                    {e.starts_at ? new Date(e.starts_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "No date"}
                  </p>
                </div>
                <span style={{ fontSize: "0.66rem", letterSpacing: "0.26em", textTransform: "uppercase", color: e.status === "published" ? "#3A0F14" : "#999" }}>
                  {e.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
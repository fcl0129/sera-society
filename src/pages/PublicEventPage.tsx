import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GuestPageRenderer, type RenderEvent } from "@/components/studio/GuestPageRenderer";
import { DEFAULT_PAGE_CONFIG } from "@/lib/studio/types";
import { defaultWidgets } from "@/lib/studio/widgetRegistry";

export default function PublicEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<RenderEvent | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("events")
      .select("id,title,starts_at,ends_at,venue,description,status,slug,event_page_config")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        const cfg =
          data.event_page_config && Object.keys(data.event_page_config).length > 0
            ? data.event_page_config
            : { ...DEFAULT_PAGE_CONFIG, widgets: defaultWidgets() };
        setEvent({ ...data, event_page_config: cfg } as RenderEvent);
        document.title = `${data.title} · Sera`;
      });
  }, [slug]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F4EE", fontFamily: "system-ui", padding: 40, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#888" }}>Sera</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "2.5rem", margin: "12px 0 0" }}>Not found</h1>
          <p style={{ color: "#666", marginTop: 8 }}>This event is private, unpublished, or doesn't exist.</p>
          <Link to="/" style={{ marginTop: 20, display: "inline-block", color: "#6B2C2C" }}>Return home</Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div style={{ minHeight: "100vh", background: "#F6F4EE" }} />;
  }

  return <GuestPageRenderer event={event} />;
}
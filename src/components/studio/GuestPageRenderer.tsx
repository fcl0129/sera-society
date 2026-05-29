import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTheme, ensureFont, STUDIO_THEMES } from "@/lib/studio/themes";
import type { EventPageConfig, WidgetInstance } from "@/lib/studio/types";

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  description: string | null;
  status: string;
  slug: string | null;
  event_page_config: EventPageConfig;
}

export interface RenderEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  description?: string | null;
  status?: string;
  slug?: string | null;
  event_page_config: EventPageConfig;
}

function fmtDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function GuestPageRenderer({
  event,
  isPreview = false,
}: {
  event: RenderEvent;
  isPreview?: boolean;
}) {
  const cfg = event.event_page_config ?? { theme: { themeId: "midnight_supper" }, widgets: [] };
  const baseTheme = getTheme(cfg.theme?.themeId ?? "midnight_supper");
  const theme = {
    ...baseTheme,
    headingFont: cfg.theme?.headingFont || baseTheme.headingFont,
    bodyFont: cfg.theme?.bodyFont || baseTheme.bodyFont,
    background: cfg.theme?.background || baseTheme.background,
    accent: cfg.theme?.accent || baseTheme.accent,
    cornerRadius:
      cfg.theme?.corner === "sharp" ? 0 : cfg.theme?.corner === "soft" ? 14 : baseTheme.cornerRadius,
    texture: cfg.theme?.texture ?? baseTheme.texture,
  };

  const density = cfg.theme?.density ?? "airy";
  const sectionPad = density === "compact" ? "32px" : density === "dramatic" ? "96px" : "56px";

  useEffect(() => {
    ensureFont(theme.headingFont);
    ensureFont(theme.bodyFont);
  }, [theme.headingFont, theme.bodyFont]);

  const widgets = (cfg.widgets || [])
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      style={{
        background: theme.background,
        color: theme.textPrimary,
        fontFamily: `'${theme.bodyFont}', system-ui, sans-serif`,
        minHeight: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {theme.texture && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            pointerEvents: "none",
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          maxWidth: 720,
          margin: "0 auto",
          padding: `${sectionPad} clamp(20px,5vw,40px)`,
          display: "flex",
          flexDirection: "column",
          gap: density === "compact" ? 24 : density === "dramatic" ? 56 : 40,
        }}
      >
        {widgets.length === 0 && (
          <p style={{ opacity: 0.6, fontStyle: "italic", textAlign: "center" }}>
            Add widgets in the Studio to build this page.
          </p>
        )}
        {widgets.map((w) => (
          <WidgetRenderer
            key={w.id}
            widget={w}
            event={event}
            theme={theme}
            isPreview={isPreview}
          />
        ))}
      </div>
    </div>
  );
}

function Surface({
  theme,
  children,
  style,
}: {
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.surfaceBorder}`,
        borderRadius: theme.cornerRadius,
        padding: "28px 28px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Heading({
  theme,
  children,
  size = "lg",
}: {
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
  size?: "xl" | "lg" | "md";
}) {
  const fs =
    size === "xl"
      ? "clamp(2.6rem,7vw,4.4rem)"
      : size === "lg"
      ? "clamp(1.6rem,4vw,2.4rem)"
      : "1.2rem";
  return (
    <h2
      style={{
        fontFamily: `'${theme.headingFont}', serif`,
        fontWeight: 500,
        fontSize: fs,
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
        margin: 0,
      }}
    >
      {children}
    </h2>
  );
}

function Label({ theme, children }: { theme: ReturnType<typeof getTheme>; children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: "0.62rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: theme.accent,
      }}
    >
      {children}
    </p>
  );
}

function Btn({
  theme,
  children,
  onClick,
  type = "button",
  disabled,
}: {
  theme: ReturnType<typeof getTheme>;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    padding: "12px 22px",
    fontSize: "0.72rem",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    borderRadius: theme.cornerRadius,
    fontFamily: "inherit",
    transition: "opacity .2s",
  };
  if (theme.buttonStyle === "solid") {
    return (
      <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: theme.accent, color: theme.background.includes("#") ? "#fff" : "#fff", border: "1px solid transparent" }}>
        {children}
      </button>
    );
  }
  if (theme.buttonStyle === "soft") {
    return (
      <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: theme.accentSoft, color: theme.textPrimary, border: `1px solid ${theme.surfaceBorder}` }}>
        {children}
      </button>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: theme.textPrimary, border: `1px solid ${theme.accent}` }}>
      {children}
    </button>
  );
}

function WidgetRenderer({
  widget,
  event,
  theme,
  isPreview,
}: {
  widget: WidgetInstance;
  event: RenderEvent;
  theme: ReturnType<typeof getTheme>;
  isPreview: boolean;
}) {
  switch (widget.type) {
    case "hero":
      return <HeroWidget widget={widget} event={event} theme={theme} />;
    case "rsvp":
      return <RsvpWidget widget={widget} event={event} theme={theme} isPreview={isPreview} />;
    case "schedule":
      return <ScheduleWidget widget={widget} theme={theme} />;
    case "map":
      return <MapWidget widget={widget} event={event} theme={theme} />;
    case "dress_code":
      return <DressCodeWidget widget={widget} theme={theme} />;
    case "spotify":
      return <SpotifyWidget widget={widget} theme={theme} />;
    case "prompts":
      return <PromptsWidget widget={widget} event={event} theme={theme} isPreview={isPreview} />;
    case "guestbook":
      return <GuestbookWidget widget={widget} event={event} theme={theme} isPreview={isPreview} />;
    case "photo_wall":
      return <PhotoWallWidget widget={widget} event={event} theme={theme} isPreview={isPreview} />;
    case "seating":
      return <SeatingWidget widget={widget} theme={theme} />;
    default:
      return null;
  }
}

function HeroWidget({ widget, event, theme }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme> }) {
  const hostMessage = (widget.config.hostMessage as string) || "";
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 24 }}>
      <Label theme={theme}>{event.venue ? `For our guests · ${event.venue}` : "An evening with friends"}</Label>
      <Heading theme={theme} size="xl">
        <span style={{ fontStyle: "italic" }}>{event.title || "Untitled evening"}</span>
      </Heading>
      <p style={{ margin: 0, fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", color: theme.textSecondary }}>
        {fmtDate(event.starts_at)}
      </p>
      {(hostMessage || event.description) && (
        <p style={{ margin: "8px 0 0", fontFamily: `'${theme.headingFont}', serif`, fontStyle: "italic", fontSize: "1.25rem", lineHeight: 1.5, color: theme.textPrimary, opacity: 0.88, maxWidth: 540 }}>
          "{hostMessage || event.description}"
        </p>
      )}
      {widget.config.showRsvpButton !== false && (
        <div style={{ marginTop: 8 }}>
          <a href="#rsvp" style={{ textDecoration: "none" }}>
            <Btn theme={theme}>RSVP</Btn>
          </a>
        </div>
      )}
    </header>
  );
}

function ScheduleWidget({ widget, theme }: { widget: WidgetInstance; theme: ReturnType<typeof getTheme> }) {
  const items = (widget.config.items as { time: string; title: string; detail?: string }[]) || [];
  return (
    <Surface theme={theme}>
      <Label theme={theme}>Schedule</Label>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 14, alignItems: "baseline" }}>
            <span style={{ fontSize: "0.84rem", color: theme.accent, letterSpacing: "0.06em" }}>{it.time}</span>
            <div>
              <p style={{ margin: 0, fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.05rem" }}>{it.title}</p>
              {it.detail && <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: theme.textSecondary }}>{it.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function MapWidget({ widget, event, theme }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme> }) {
  const address = (widget.config.address as string) || event.venue || "";
  const mapsUrl = (widget.config.mapsUrl as string) || (address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : "");
  const note = (widget.config.transportNote as string) || "";
  return (
    <Surface theme={theme}>
      <Label theme={theme}>Location</Label>
      <p style={{ margin: "14px 0 0", fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.3rem" }}>{address || "Venue to be confirmed"}</p>
      {note && <p style={{ margin: "8px 0 0", fontSize: "0.9rem", color: theme.textSecondary }}>{note}</p>}
      {mapsUrl && (
        <div style={{ marginTop: 16 }}>
          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ color: theme.accent, fontSize: "0.74rem", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", borderBottom: `1px solid ${theme.accent}` }}>
            Open in maps →
          </a>
        </div>
      )}
    </Surface>
  );
}

function DressCodeWidget({ widget, theme }: { widget: WidgetInstance; theme: ReturnType<typeof getTheme> }) {
  return (
    <Surface theme={theme}>
      <Label theme={theme}>Dress code</Label>
      <p style={{ margin: "14px 0 0", fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.5rem" }}>{(widget.config.text as string) || "—"}</p>
      {(widget.config.notes as string) && (
        <p style={{ margin: "10px 0 0", fontSize: "0.92rem", color: theme.textSecondary, lineHeight: 1.55 }}>{widget.config.notes as string}</p>
      )}
    </Surface>
  );
}

function SpotifyWidget({ widget, theme }: { widget: WidgetInstance; theme: ReturnType<typeof getTheme> }) {
  const url = (widget.config.url as string) || "";
  const title = (widget.config.title as string) || "The playlist";
  const embed = url.match(/playlist\/([\w]+)/)?.[1];
  return (
    <Surface theme={theme}>
      <Label theme={theme}>Playlist</Label>
      <p style={{ margin: "14px 0 0", fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.3rem" }}>{title}</p>
      {embed ? (
        <iframe
          title="Spotify playlist"
          src={`https://open.spotify.com/embed/playlist/${embed}`}
          width="100%"
          height="152"
          frameBorder={0}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ marginTop: 16, borderRadius: theme.cornerRadius, border: 0 }}
        />
      ) : url ? (
        <a href={url} target="_blank" rel="noreferrer" style={{ color: theme.accent, fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", display: "inline-block", marginTop: 12, textDecoration: "none", borderBottom: `1px solid ${theme.accent}` }}>
          Open playlist →
        </a>
      ) : (
        <p style={{ margin: "10px 0 0", color: theme.textSecondary, fontSize: "0.9rem", fontStyle: "italic" }}>
          Add a Spotify URL to embed the playlist.
        </p>
      )}
    </Surface>
  );
}

function SeatingWidget({ widget, theme }: { widget: WidgetInstance; theme: ReturnType<typeof getTheme> }) {
  const tables = (widget.config.tables as { name: string; seats: string[] }[]) || [];
  return (
    <Surface theme={theme}>
      <Label theme={theme}>Seating</Label>
      {tables.length === 0 ? (
        <p style={{ margin: "12px 0 0", color: theme.textSecondary, fontStyle: "italic", fontSize: "0.92rem" }}>Seating to be announced.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {tables.map((t, i) => (
            <div key={i} style={{ border: `1px solid ${theme.surfaceBorder}`, padding: "14px 16px", borderRadius: theme.cornerRadius }}>
              <p style={{ margin: 0, fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.1rem" }}>{t.name}</p>
              <p style={{ margin: "6px 0 0", fontSize: "0.84rem", color: theme.textSecondary, lineHeight: 1.5 }}>
                {(t.seats || []).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}

function RsvpWidget({ widget, event, theme, isPreview }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme>; isPreview: boolean }) {
  const [status, setStatus] = useState<"accepted" | "declined" | "">("");
  const [name, setName] = useState("");
  const [plusOne, setPlusOne] = useState(false);
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <Surface theme={theme} style={{ scrollMarginTop: 80 }}>
      <div id="rsvp" />
      <Label theme={theme}>RSVP</Label>
      {submitted ? (
        <p style={{ margin: "14px 0 0", fontFamily: `'${theme.headingFont}', serif`, fontSize: "1.3rem", fontStyle: "italic" }}>
          {status === "accepted" ? "Thank you — we'll save you a seat." : "Noted with care. Until the next one."}
        </p>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStatus("accepted")} style={pill(theme, status === "accepted")}>Accept</button>
            <button type="button" onClick={() => setStatus("declined")} style={pill(theme, status === "declined")}>Decline</button>
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required style={inputStyle(theme)} />
          {status === "accepted" && (
            <>
              {widget.config.allowPlusOne !== false && (
                <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.92rem", color: theme.textSecondary }}>
                  <input type="checkbox" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)} />
                  Bringing a plus one
                </label>
              )}
              {widget.config.askDietary !== false && (
                <input value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="Dietary notes (optional)" style={inputStyle(theme)} />
              )}
              {widget.config.askNotes !== false && (
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="A note to the host (optional)" rows={3} style={{ ...inputStyle(theme), resize: "vertical", fontFamily: "inherit" }} />
              )}
            </>
          )}
          <div>
            <Btn theme={theme} type="submit" disabled={!status || !name || isPreview}>
              {isPreview ? "Preview" : "Send RSVP"}
            </Btn>
          </div>
        </form>
      )}
    </Surface>
  );
}

function PromptsWidget({ widget, event, theme, isPreview }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme>; isPreview: boolean }) {
  const prompts = (widget.config.prompts as { id: string; label: string }[]) || [];
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isPreview) {
      setDone(true);
      return;
    }
    const rows = prompts
      .filter((p) => answers[p.id])
      .map((p) => ({ event_id: event.id, prompt_id: p.id, prompt_label: p.label, guest_name: name, response: answers[p.id] }));
    if (rows.length) await supabase.from("event_prompt_responses").insert(rows);
    setDone(true);
  }

  return (
    <Surface theme={theme}>
      <Label theme={theme}>Tell us</Label>
      {done ? (
        <p style={{ margin: "14px 0 0", fontStyle: "italic", color: theme.textSecondary }}>Thank you.</p>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required style={inputStyle(theme)} />
          {prompts.map((p) => (
            <div key={p.id}>
              <p style={{ margin: 0, fontSize: "0.86rem", color: theme.textSecondary, marginBottom: 6 }}>{p.label}</p>
              <input value={answers[p.id] || ""} onChange={(e) => setAnswers({ ...answers, [p.id]: e.target.value })} style={inputStyle(theme)} />
            </div>
          ))}
          <div><Btn theme={theme} type="submit">Send</Btn></div>
        </form>
      )}
    </Surface>
  );
}

function GuestbookWidget({ widget, event, theme, isPreview }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme>; isPreview: boolean }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<{ id: string; guest_name: string; message: string }[]>([]);

  useEffect(() => {
    if (isPreview || !event.id) return;
    supabase
      .from("event_guestbook_entries")
      .select("id,guest_name,message")
      .eq("event_id", event.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setEntries(data || []));
  }, [event.id, isPreview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !message) return;
    if (!isPreview) {
      const { data } = await supabase
        .from("event_guestbook_entries")
        .insert({ event_id: event.id, guest_name: name, message })
        .select("id,guest_name,message")
        .single();
      if (data) setEntries([data, ...entries]);
    }
    setName("");
    setMessage("");
  }

  return (
    <Surface theme={theme}>
      <Label theme={theme}>Guestbook</Label>
      <p style={{ margin: "12px 0 0", fontSize: "0.92rem", color: theme.textSecondary }}>{(widget.config.prompt as string) || "Leave a note."}</p>
      <form onSubmit={submit} style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle(theme)} />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A few words…" rows={2} style={{ ...inputStyle(theme), resize: "vertical", fontFamily: "inherit" }} />
        <div><Btn theme={theme} type="submit">Sign</Btn></div>
      </form>
      {widget.config.showMessages !== false && entries.length > 0 && (
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {entries.map((e) => (
            <div key={e.id} style={{ borderTop: `1px solid ${theme.surfaceBorder}`, paddingTop: 12 }}>
              <p style={{ margin: 0, fontFamily: `'${theme.headingFont}', serif`, fontStyle: "italic", fontSize: "1.05rem" }}>"{e.message}"</p>
              <p style={{ margin: "6px 0 0", fontSize: "0.74rem", letterSpacing: "0.18em", textTransform: "uppercase", color: theme.accent }}>— {e.guest_name}</p>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}

function PhotoWallWidget({ widget, event, theme, isPreview }: { widget: WidgetInstance; event: RenderEvent; theme: ReturnType<typeof getTheme>; isPreview: boolean }) {
  const [photos, setPhotos] = useState<{ id: string; image_url: string; guest_name: string | null }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isPreview || !event.id) return;
    supabase
      .from("event_photos")
      .select("id,image_url,guest_name")
      .eq("event_id", event.id)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => setPhotos(data || []));
  }, [event.id, isPreview]);

  async function upload(file: File) {
    if (isPreview) return;
    setBusy(true);
    try {
      const path = `${event.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("event-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("event-photos").getPublicUrl(path);
      const { data } = await supabase
        .from("event_photos")
        .insert({ event_id: event.id, image_url: urlData.publicUrl })
        .select("id,image_url,guest_name")
        .single();
      if (data) setPhotos([data, ...photos]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Surface theme={theme}>
      <Label theme={theme}>Photo wall</Label>
      <p style={{ margin: "12px 0 0", fontSize: "0.92rem", color: theme.textSecondary }}>{(widget.config.caption as string) || "Add to the wall"}</p>
      <label style={{ marginTop: 14, display: "inline-block" }}>
        <span style={{ ...pill(theme, false), display: "inline-block" }}>{busy ? "Uploading…" : "Upload a photo"}</span>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          disabled={isPreview || busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </label>
      {photos.length > 0 && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8 }}>
          {photos.map((p) => (
            <img key={p.id} src={p.image_url} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: theme.cornerRadius }} />
          ))}
        </div>
      )}
      {isPreview && photos.length === 0 && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ aspectRatio: "1/1", background: theme.accentSoft, borderRadius: theme.cornerRadius }} />
          ))}
        </div>
      )}
    </Surface>
  );
}

function inputStyle(theme: ReturnType<typeof getTheme>): React.CSSProperties {
  return {
    width: "100%",
    background: "transparent",
    border: `1px solid ${theme.surfaceBorder}`,
    borderRadius: theme.cornerRadius,
    padding: "10px 12px",
    color: theme.textPrimary,
    fontSize: "0.94rem",
    fontFamily: "inherit",
    outline: "none",
  };
}

function pill(theme: ReturnType<typeof getTheme>, active: boolean): React.CSSProperties {
  return {
    padding: "10px 18px",
    borderRadius: 999,
    border: `1px solid ${active ? theme.accent : theme.surfaceBorder}`,
    background: active ? theme.accentSoft : "transparent",
    color: theme.textPrimary,
    fontSize: "0.74rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export { STUDIO_THEMES };
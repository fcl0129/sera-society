import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GuestPageRenderer, type RenderEvent } from "@/components/studio/GuestPageRenderer";
import { STUDIO_THEMES, FONT_PAIRS, HEADING_FONT_OPTIONS, BODY_FONT_OPTIONS, ensureFont, getTheme } from "@/lib/studio/themes";
import {
  WIDGET_REGISTRY,
  WIDGET_ORDER,
  defaultWidgets,
  newWidgetId,
} from "@/lib/studio/widgetRegistry";
import type { EventPageConfig, WidgetInstance, WidgetType, Visibility } from "@/lib/studio/types";
import { DEFAULT_PAGE_CONFIG } from "@/lib/studio/types";
import { STUDIO_TEMPLATES, buildConfigFromTemplate, type StudioTemplate } from "@/lib/studio/templates";

type Step = "basics" | "theme" | "widgets" | "publish";
const STEPS: { key: Step; label: string }[] = [
  { key: "basics", label: "Basics" },
  { key: "theme", label: "Theme" },
  { key: "widgets", label: "Page" },
  { key: "publish", label: "Publish" },
];

interface DraftEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  starts_at: string;
  ends_at: string;
  rsvp_cutoff_at: string;
  capacity: string;
  visibility: Visibility;
  status: string;
  slug: string | null;
  event_page_config: EventPageConfig;
  organizer_id?: string;
  // ad-hoc fields kept in page_config
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || Math.random().toString(36).slice(2, 8);
}

export default function StudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<DraftEvent | null>(null);
  const [step, setStep] = useState<Step>("basics");
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState<string | null>(null);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    async function load() {
      if (!id) return;
      if (id === "new") {
        // Show template gallery; creation deferred until template chosen.
        return;
      }
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error || !data) return;
      const raw = data.event_page_config as unknown;
      const cfg: EventPageConfig =
        raw && typeof raw === "object" && Object.keys(raw as object).length > 0
          ? (raw as EventPageConfig)
          : { ...DEFAULT_PAGE_CONFIG, widgets: defaultWidgets() };
      setEvent({
        id: data.id,
        title: data.title || "",
        description: data.description || "",
        venue: data.venue || "",
        starts_at: data.starts_at || "",
        ends_at: data.ends_at || "",
        rsvp_cutoff_at: data.rsvp_cutoff_at || "",
        capacity: data.capacity?.toString() || "",
        visibility: (data.visibility as Visibility) || "private_link",
        status: data.status || "draft",
        slug: data.slug,
        event_page_config: cfg,
        organizer_id: data.organizer_id,
      });
    }
    load();
  }, [id, navigate]);

  const createFromTemplate = useCallback(
    async (tpl: StudioTemplate) => {
      setCreatingFromTemplate(tpl.id);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        navigate("/login?redirect=/host/studio/new");
        return;
      }
      const now = new Date();
      now.setDate(now.getDate() + 30);
      now.setHours(19, 30, 0, 0);
      const config =
        tpl.id === "blank"
          ? { ...DEFAULT_PAGE_CONFIG, widgets: defaultWidgets() }
          : buildConfigFromTemplate(tpl);
      const { data, error } = await (supabase.from("events") as any)
        .insert({
          organizer_id: uid,
          title: tpl.sampleCopy.title || "Untitled evening",
          starts_at: now.toISOString(),
          status: "draft",
          visibility: "private_link",
          event_page_config: config,
        })
        .select("*")
        .single();
      setCreatingFromTemplate(null);
      if (error || !data) {
        alert("Could not create event: " + error?.message);
        return;
      }
      navigate(`/host/studio/${data.id}`, { replace: true });
    },
    [navigate],
  );

  if (id === "new") {
    return <TemplateGallery onPick={createFromTemplate} creating={creatingFromTemplate} onCancel={() => navigate("/host")} />;
  }

  const persist = useCallback(
    async (patch: Partial<DraftEvent>) => {
      if (!event) return;
      const merged = { ...event, ...patch };
      setEvent(merged);
      setSaving(true);
      const payload: Record<string, unknown> = {
        title: merged.title,
        description: merged.description,
        venue: merged.venue,
        starts_at: merged.starts_at || new Date().toISOString(),
        ends_at: merged.ends_at || null,
        rsvp_cutoff_at: merged.rsvp_cutoff_at || null,
        capacity: merged.capacity ? parseInt(merged.capacity, 10) || null : null,
        visibility: merged.visibility,
        event_page_config: merged.event_page_config,
      };
      await (supabase.from("events") as any).update(payload).eq("id", merged.id);
      setSaving(false);
    },
    [event],
  );

  // Apply page config patches
  const updateConfig = (mut: (cfg: EventPageConfig) => EventPageConfig) => {
    if (!event) return;
    const next = mut(event.event_page_config);
    persist({ event_page_config: next });
  };

  if (!event) {
    return <div style={{ padding: 60, fontFamily: "system-ui", color: "#666" }}>Loading studio…</div>;
  }

  const renderEvent: RenderEvent = {
    id: event.id,
    title: event.title,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    venue: event.venue,
    description: event.description,
    status: event.status,
    slug: event.slug,
    event_page_config: event.event_page_config,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F6F4EE", color: "#12100E", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      <header style={{ borderBottom: "1px solid rgba(18,16,14,0.12)", background: "#fff" }}>
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <button onClick={() => navigate("/")} style={topBtn}>← Sera</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {STEPS.map((s, i) => (
              <button key={s.key} onClick={() => setStep(s.key)} style={{ ...stepBtn, ...(s.key === step ? stepBtnActive : {}) }}>
                <span style={{ opacity: 0.5, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#999" }}>
              {saving ? "Saving…" : event.status === "published" ? "Published" : "Draft"}
            </span>
            {event.status === "published" && event.slug && (
              <a href={`/e/${event.slug}`} target="_blank" rel="noreferrer" style={{ ...topBtn, color: "#6B2C2C" }}>View live →</a>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(360px,460px)", gap: 32, alignItems: "start" }} className="studio-grid">
        {/* Editor */}
        <div style={{ background: "#fff", border: "1px solid rgba(18,16,14,0.08)", borderRadius: 6, padding: 32, minHeight: 600 }}>
          {step === "basics" && <BasicsStep event={event} onChange={persist} />}
          {step === "theme" && <ThemeStep config={event.event_page_config} onChange={updateConfig} />}
          {step === "widgets" && <WidgetsStep config={event.event_page_config} onChange={updateConfig} />}
          {step === "publish" && <PublishStep event={event} onPersist={persist} />}
        </div>

        {/* Live preview */}
        <aside style={{ position: "sticky", top: 88 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#888" }}>Live preview</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setDevice("mobile")} style={{ ...miniBtn, ...(device === "mobile" ? miniBtnActive : {}) }}>Mobile</button>
              <button onClick={() => setDevice("desktop")} style={{ ...miniBtn, ...(device === "desktop" ? miniBtnActive : {}) }}>Desktop</button>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "78vh",
              background: "#0a0a0a",
              borderRadius: 18,
              padding: device === "mobile" ? 14 : 8,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: device === "mobile" ? 360 : "100%",
                maxWidth: device === "mobile" ? 360 : "100%",
                height: "100%",
                background: "#fff",
                borderRadius: 12,
                overflow: "auto",
              }}
            >
              <GuestPageRenderer event={renderEvent} isPreview />
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .studio-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ============ Steps ============ */

function BasicsStep({ event, onChange }: { event: DraftEvent; onChange: (p: Partial<DraftEvent>) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Title eyebrow="01 · Basics" title="The shape of the evening" />
      <Field label="Event name">
        <input value={event.title} onChange={(e) => onChange({ title: e.target.value })} style={input} />
      </Field>
      <div style={twoCol}>
        <Field label="Starts at">
          <input type="datetime-local" value={toLocal(event.starts_at)} onChange={(e) => onChange({ starts_at: fromLocal(e.target.value) })} style={input} />
        </Field>
        <Field label="Ends at">
          <input type="datetime-local" value={toLocal(event.ends_at)} onChange={(e) => onChange({ ends_at: fromLocal(e.target.value) })} style={input} />
        </Field>
      </div>
      <Field label="Location / venue">
        <input value={event.venue} onChange={(e) => onChange({ venue: e.target.value })} style={input} placeholder="Salon vert, Stockholm" />
      </Field>
      <Field label="Description">
        <textarea value={event.description} onChange={(e) => onChange({ description: e.target.value })} rows={4} style={{ ...input, resize: "vertical" }} />
      </Field>
      <div style={twoCol}>
        <Field label="Dress code">
          <input
            value={(event.event_page_config?.widgets?.find((w) => w.type === "dress_code")?.config?.text as string) || ""}
            onChange={(e) => {
              const w = event.event_page_config.widgets.find((x) => x.type === "dress_code");
              if (w) {
                const next = { ...event.event_page_config, widgets: event.event_page_config.widgets.map((x) => x.id === w.id ? { ...x, config: { ...x.config, text: e.target.value } } : x) };
                onChange({ event_page_config: next });
              } else {
                const next = { ...event.event_page_config, widgets: [...event.event_page_config.widgets, { id: newWidgetId("dress_code"), type: "dress_code" as const, enabled: true, order: 99, config: { text: e.target.value, notes: "" } }] };
                onChange({ event_page_config: next });
              }
            }}
            style={input}
            placeholder="Cocktail"
          />
        </Field>
        <Field label="Capacity">
          <input type="number" value={event.capacity} onChange={(e) => onChange({ capacity: e.target.value })} style={input} />
        </Field>
      </div>
      <Field label="Host note (shown in the hero)">
        <textarea
          value={(event.event_page_config?.widgets?.find((w) => w.type === "hero")?.config?.hostMessage as string) || ""}
          onChange={(e) => {
            const widgets = event.event_page_config.widgets.map((w) =>
              w.type === "hero" ? { ...w, config: { ...w.config, hostMessage: e.target.value } } : w
            );
            onChange({ event_page_config: { ...event.event_page_config, widgets } });
          }}
          rows={3}
          style={{ ...input, resize: "vertical" }}
          placeholder="A small, slow dinner before the doors open to the rest of the season."
        />
      </Field>
      <div style={twoCol}>
        <Field label="RSVP deadline">
          <input type="datetime-local" value={toLocal(event.rsvp_cutoff_at)} onChange={(e) => onChange({ rsvp_cutoff_at: fromLocal(e.target.value) })} style={input} />
        </Field>
        <Field label="Visibility">
          <select value={event.visibility} onChange={(e) => onChange({ visibility: e.target.value as Visibility })} style={input}>
            <option value="private_link">Private link</option>
            <option value="request_access">Request access</option>
            <option value="invite_only">Invite only</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

function ThemeStep({ config, onChange }: { config: EventPageConfig; onChange: (m: (c: EventPageConfig) => EventPageConfig) => void }) {
  const current = config.theme.themeId;
  const [bgMode, setBgMode] = useState<"theme" | "color" | "gradient" | "image">(
    config.theme?.backgroundImageUrl ? "image" : config.theme?.background?.includes("gradient") ? "gradient" : config.theme?.background ? "color" : "theme",
  );
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function uploadAsset(file: File, kind: "background" | "cover"): Promise<string | null> {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return null;
    const path = `studio/${uid}/${kind}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("event-photos").upload(path, file, { upsert: false });
    if (error) {
      alert("Upload failed: " + error.message);
      return null;
    }
    return supabase.storage.from("event-photos").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Title eyebrow="02 · Theme" title="Choose the mood" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {STUDIO_THEMES.map((t) => {
          const active = current === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange((c) => ({ ...c, theme: { ...c.theme, themeId: t.id, headingFont: undefined, bodyFont: undefined, accent: undefined, background: undefined } }))}
              style={{
                textAlign: "left",
                padding: 0,
                border: active ? "2px solid #12100E" : "1px solid rgba(18,16,14,0.12)",
                borderRadius: 6,
                cursor: "pointer",
                background: "transparent",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 110, background: t.background, position: "relative", padding: 16, color: t.textPrimary, fontFamily: `'${t.headingFont}', serif` }}>
                <div style={{ fontSize: 26, fontStyle: "italic", lineHeight: 1 }}>{t.name}</div>
              </div>
              <div style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid rgba(18,16,14,0.08)" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>{t.mood}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Title eyebrow="Customize" title="Make it yours" />
      <Field label="Heading font">
        <select
          value={config.theme.headingFont || getTheme(current).headingFont}
          onChange={(e) => {
            ensureFont(e.target.value);
            onChange((c) => ({ ...c, theme: { ...c.theme, headingFont: e.target.value } }));
          }}
          style={input}
        >
          {HEADING_FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Body font">
        <select
          value={config.theme.bodyFont || getTheme(current).bodyFont}
          onChange={(e) => {
            ensureFont(e.target.value);
            onChange((c) => ({ ...c, theme: { ...c.theme, bodyFont: e.target.value } }));
          }}
          style={input}
        >
          {BODY_FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <div style={twoCol}>
        <Field label="Accent color">
          <input type="color" value={config.theme.accent || getTheme(current).accent} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, accent: e.target.value } }))} style={{ ...input, height: 44, padding: 4 }} />
        </Field>
        <Field label="Background type">
          <select value={bgMode} onChange={(e) => setBgMode(e.target.value as typeof bgMode)} style={input}>
            <option value="theme">Use theme default</option>
            <option value="color">Solid color</option>
            <option value="gradient">CSS gradient</option>
            <option value="image">Uploaded image</option>
          </select>
        </Field>
      </div>
      {bgMode === "color" && (
        <Field label="Background color">
          <input type="color" value={config.theme.background?.startsWith("#") ? config.theme.background : "#0d1b2e"} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, background: e.target.value, backgroundImageUrl: undefined } }))} style={{ ...input, height: 44, padding: 4 }} />
        </Field>
      )}
      {bgMode === "gradient" && (
        <Field label="CSS gradient">
          <input value={config.theme.background || ""} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, background: e.target.value, backgroundImageUrl: undefined } }))} placeholder="linear-gradient(170deg,#0d1b2e 0%,#071426 100%)" style={input} />
        </Field>
      )}
      {bgMode === "image" && (
        <Field label="Background image">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ ...chip, display: "inline-block" }}>
              {uploadingBg ? "Uploading…" : config.theme.backgroundImageUrl ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploadingBg}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setUploadingBg(true);
                  const url = await uploadAsset(f, "background");
                  setUploadingBg(false);
                  if (url) onChange((c) => ({ ...c, theme: { ...c.theme, backgroundImageUrl: url, background: undefined } }));
                }}
              />
            </label>
            {config.theme.backgroundImageUrl && (
              <>
                <img src={config.theme.backgroundImageUrl} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)" }} />
                <button onClick={() => onChange((c) => ({ ...c, theme: { ...c.theme, backgroundImageUrl: undefined } }))} style={{ ...chip, background: "transparent" }}>Remove</button>
              </>
            )}
          </div>
        </Field>
      )}
      {bgMode === "theme" && config.theme.background && (
        <button onClick={() => onChange((c) => ({ ...c, theme: { ...c.theme, background: undefined, backgroundImageUrl: undefined } }))} style={{ ...chip, alignSelf: "flex-start" }}>
          Clear custom background
        </button>
      )}

      <Field label="Cover / hero image (shown in the hero widget)">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ ...chip, display: "inline-block" }}>
            {uploadingCover ? "Uploading…" : config.theme.coverImageUrl ? "Replace cover" : "Upload cover"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={uploadingCover}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploadingCover(true);
                const url = await uploadAsset(f, "cover");
                setUploadingCover(false);
                if (url) onChange((c) => ({ ...c, theme: { ...c.theme, coverImageUrl: url } }));
              }}
            />
          </label>
          {config.theme.coverImageUrl && (
            <>
              <img src={config.theme.coverImageUrl} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)" }} />
              <button onClick={() => onChange((c) => ({ ...c, theme: { ...c.theme, coverImageUrl: undefined } }))} style={{ ...chip, background: "transparent" }}>Remove</button>
            </>
          )}
        </div>
      </Field>

      <div style={twoCol}>
        <Field label="Corner style">
          <select value={config.theme.corner || "editorial"} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, corner: e.target.value as "sharp" | "soft" | "editorial" } }))} style={input}>
            <option value="sharp">Sharp</option>
            <option value="soft">Soft</option>
            <option value="editorial">Editorial (theme default)</option>
          </select>
        </Field>
        <Field label="Page density">
          <select value={config.theme.density || "airy"} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, density: e.target.value as "airy" | "compact" | "dramatic" } }))} style={input}>
            <option value="compact">Compact</option>
            <option value="airy">Airy</option>
            <option value="dramatic">Dramatic</option>
          </select>
        </Field>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.9rem" }}>
        <input type="checkbox" checked={config.theme.texture ?? true} onChange={(e) => onChange((c) => ({ ...c, theme: { ...c.theme, texture: e.target.checked } }))} />
        Background texture (film grain)
      </label>
    </div>
  );
}

function WidgetsStep({ config, onChange }: { config: EventPageConfig; onChange: (m: (c: EventPageConfig) => EventPageConfig) => void }) {
  const widgets = [...config.widgets].sort((a, b) => a.order - b.order);
  const usedTypes = new Set(widgets.map((w) => w.type));
  const [openId, setOpenId] = useState<string | null>(null);

  function addWidget(type: WidgetType) {
    onChange((c) => ({
      ...c,
      widgets: [...c.widgets, { id: newWidgetId(type), type, enabled: true, order: c.widgets.length, config: JSON.parse(JSON.stringify(WIDGET_REGISTRY[type].defaultConfig)) }],
    }));
  }
  function removeWidget(id: string) {
    onChange((c) => ({ ...c, widgets: c.widgets.filter((w) => w.id !== id) }));
  }
  function move(id: string, dir: -1 | 1) {
    onChange((c) => {
      const sorted = [...c.widgets].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((w) => w.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= sorted.length) return c;
      [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
      return { ...c, widgets: sorted.map((w, i) => ({ ...w, order: i })) };
    });
  }
  function toggle(id: string) {
    onChange((c) => ({ ...c, widgets: c.widgets.map((w) => w.id === id ? { ...w, enabled: !w.enabled } : w) }));
  }
  function setWidgetConfig(id: string, patch: Record<string, unknown>) {
    onChange((c) => ({ ...c, widgets: c.widgets.map((w) => w.id === id ? { ...w, config: { ...w.config, ...patch } } : w) }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Title eyebrow="03 · Page" title="Compose the guest experience" />

      <div>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#888", margin: "0 0 10px" }}>Add a module</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {WIDGET_ORDER.filter((t) => !usedTypes.has(t) || t === "prompts" || t === "schedule").map((t) => (
            <button key={t} onClick={() => addWidget(t)} style={chip}>+ {WIDGET_REGISTRY[t].label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {widgets.map((w, i) => {
          const meta = WIDGET_REGISTRY[w.type];
          const open = openId === w.id;
          return (
            <div key={w.id} style={{ border: "1px solid rgba(18,16,14,0.1)", borderRadius: 6, background: w.enabled ? "#fff" : "#f6f4ee" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button onClick={() => move(w.id, -1)} disabled={i === 0} style={arrow}>▲</button>
                  <button onClick={() => move(w.id, 1)} disabled={i === widgets.length - 1} style={arrow}>▼</button>
                </div>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setOpenId(open ? null : w.id)}>
                  <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem" }}>{meta.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#888" }}>{meta.description}</p>
                </div>
                <label style={{ fontSize: "0.72rem", color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={w.enabled} onChange={() => toggle(w.id)} />
                  On
                </label>
                <button onClick={() => removeWidget(w.id)} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.78rem" }}>Remove</button>
              </div>
              {open && (
                <div style={{ borderTop: "1px solid rgba(18,16,14,0.08)", padding: 16, background: "#faf7f1" }}>
                  <WidgetEditor widget={w} onChange={(p) => setWidgetConfig(w.id, p)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WidgetEditor({ widget, onChange }: { widget: WidgetInstance; onChange: (p: Record<string, unknown>) => void }) {
  switch (widget.type) {
    case "hero":
      return (
        <>
          <Field label="Host message">
            <textarea rows={3} value={(widget.config.hostMessage as string) || ""} onChange={(e) => onChange({ hostMessage: e.target.value })} style={{ ...input, resize: "vertical" }} />
          </Field>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={widget.config.showRsvpButton !== false} onChange={(e) => onChange({ showRsvpButton: e.target.checked })} />
            Show RSVP button
          </label>
        </>
      );
    case "rsvp":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            ["allowPlusOne", "Allow plus-one"],
            ["askDietary", "Ask dietary"],
            ["askNotes", "Ask notes to host"],
          ].map(([k, l]) => (
            <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.9rem" }}>
              <input type="checkbox" checked={widget.config[k] !== false} onChange={(e) => onChange({ [k]: e.target.checked })} />
              {l}
            </label>
          ))}
        </div>
      );
    case "map":
      return (
        <>
          <Field label="Address"><input value={(widget.config.address as string) || ""} onChange={(e) => onChange({ address: e.target.value })} style={input} /></Field>
          <Field label="Maps URL (optional)"><input value={(widget.config.mapsUrl as string) || ""} onChange={(e) => onChange({ mapsUrl: e.target.value })} style={input} placeholder="https://maps.google.com/?q=…" /></Field>
          <Field label="Transport note"><textarea rows={2} value={(widget.config.transportNote as string) || ""} onChange={(e) => onChange({ transportNote: e.target.value })} style={{ ...input, resize: "vertical" }} /></Field>
        </>
      );
    case "spotify":
      return (
        <>
          <Field label="Title"><input value={(widget.config.title as string) || ""} onChange={(e) => onChange({ title: e.target.value })} style={input} /></Field>
          <Field label="Spotify playlist URL"><input value={(widget.config.url as string) || ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://open.spotify.com/playlist/…" style={input} /></Field>
        </>
      );
    case "dress_code":
      return (
        <>
          <Field label="Dress code"><input value={(widget.config.text as string) || ""} onChange={(e) => onChange({ text: e.target.value })} style={input} /></Field>
          <Field label="Notes / moodboard text"><textarea rows={3} value={(widget.config.notes as string) || ""} onChange={(e) => onChange({ notes: e.target.value })} style={{ ...input, resize: "vertical" }} /></Field>
        </>
      );
    case "guestbook":
      return (
        <>
          <Field label="Prompt"><input value={(widget.config.prompt as string) || ""} onChange={(e) => onChange({ prompt: e.target.value })} style={input} /></Field>
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={widget.config.showMessages !== false} onChange={(e) => onChange({ showMessages: e.target.checked })} />
            Show messages publicly on the page
          </label>
        </>
      );
    case "prompts": {
      const prompts = (widget.config.prompts as { id: string; label: string }[]) || [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {prompts.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input value={p.label} onChange={(e) => { const next = [...prompts]; next[i] = { ...p, label: e.target.value }; onChange({ prompts: next }); }} style={input} />
              <button onClick={() => onChange({ prompts: prompts.filter((_, j) => j !== i) })} style={{ ...chip, background: "transparent" }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange({ prompts: [...prompts, { id: `p${Date.now()}`, label: "New prompt" }] })} style={chip}>+ Add prompt</button>
        </div>
      );
    }
    case "schedule": {
      const items = (widget.config.items as { time: string; title: string; detail?: string }[]) || [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr auto", gap: 6 }}>
              <input value={it.time} onChange={(e) => { const n = [...items]; n[i] = { ...it, time: e.target.value }; onChange({ items: n }); }} style={input} />
              <input value={it.title} onChange={(e) => { const n = [...items]; n[i] = { ...it, title: e.target.value }; onChange({ items: n }); }} style={input} />
              <input value={it.detail || ""} onChange={(e) => { const n = [...items]; n[i] = { ...it, detail: e.target.value }; onChange({ items: n }); }} placeholder="detail" style={input} />
              <button onClick={() => onChange({ items: items.filter((_, j) => j !== i) })} style={{ ...chip, background: "transparent" }}>×</button>
            </div>
          ))}
          <button onClick={() => onChange({ items: [...items, { time: "21:00", title: "Course", detail: "" }] })} style={chip}>+ Add item</button>
        </div>
      );
    }
    case "seating": {
      const tables = (widget.config.tables as { name: string; seats: string[] }[]) || [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Mode">
            <select value={(widget.config.mode as string) || "find_your_seat"} onChange={(e) => onChange({ mode: e.target.value })} style={input}>
              <option value="find_your_seat">Find your seat</option>
              <option value="full_chart">Full chart</option>
            </select>
          </Field>
          {tables.map((t, i) => (
            <div key={i} style={{ border: "1px solid rgba(18,16,14,0.08)", padding: 10, borderRadius: 4 }}>
              <input value={t.name} onChange={(e) => { const n = [...tables]; n[i] = { ...t, name: e.target.value }; onChange({ tables: n }); }} placeholder="Table name" style={input} />
              <textarea value={(t.seats || []).join("\n")} onChange={(e) => { const n = [...tables]; n[i] = { ...t, seats: e.target.value.split("\n").filter(Boolean) }; onChange({ tables: n }); }} rows={3} placeholder="One guest per line" style={{ ...input, marginTop: 6, resize: "vertical" }} />
              <button onClick={() => onChange({ tables: tables.filter((_, j) => j !== i) })} style={{ ...chip, marginTop: 6 }}>Remove table</button>
            </div>
          ))}
          <button onClick={() => onChange({ tables: [...tables, { name: `Table ${tables.length + 1}`, seats: [] }] })} style={chip}>+ Add table</button>
        </div>
      );
    }
    case "photo_wall":
      return (
        <Field label="Caption"><input value={(widget.config.caption as string) || ""} onChange={(e) => onChange({ caption: e.target.value })} style={input} /></Field>
      );
    default:
      return null;
  }
}

function PublishStep({ event, onPersist }: { event: DraftEvent; onPersist: (p: Partial<DraftEvent>) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = event.slug ? `${window.location.origin}/e/${event.slug}` : "";

  async function publish() {
    setBusy(true);
    const slug = event.slug || slugify(event.title || "evening");
    const { error } = await (supabase.from("events") as any).update({ status: "published", slug }).eq("id", event.id);
    if (error) {
      alert("Publish failed: " + error.message);
    } else {
      await onPersist({ status: "published", slug });
    }
    setBusy(false);
  }

  async function unpublish() {
    setBusy(true);
    await (supabase.from("events") as any).update({ status: "draft" }).eq("id", event.id);
    await onPersist({ status: "draft" });
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Title eyebrow="04 · Publish" title={event.status === "published" ? "Live" : "Ready when you are"} />
      {event.status === "published" ? (
        <>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontStyle: "italic", color: "#3A0F14" }}>
            Your event page is live. Share the link with your guests.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={link} style={{ ...input, fontFamily: "monospace" }} />
            <button
              onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              style={chip}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={link} target="_blank" rel="noreferrer" style={{ ...chip, textDecoration: "none" }}>Open guest page →</a>
            <button onClick={unpublish} disabled={busy} style={{ ...chip, color: "#6B2C2C" }}>Unpublish</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: "#555", maxWidth: 480, lineHeight: 1.6 }}>
            Publishing generates a guest-facing link. You can keep editing afterwards — changes are live immediately.
          </p>
          <ChecklistRow ok={!!event.title.trim()} label="Event name" />
          <ChecklistRow ok={!!event.starts_at} label="Date & time" />
          <ChecklistRow ok={event.event_page_config.widgets.filter((w) => w.enabled).length > 0} label="At least one widget enabled" />
          <div>
            <button onClick={publish} disabled={busy || !event.title.trim() || !event.starts_at} style={{ padding: "14px 28px", background: "#3A0F14", color: "#F5EFE3", border: "none", fontSize: "0.74rem", letterSpacing: "0.24em", textTransform: "uppercase", cursor: "pointer" }}>
              {busy ? "Publishing…" : "Publish event"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.95rem", color: ok ? "#3A0F14" : "#999" }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${ok ? "#3A0F14" : "#ccc"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{ok ? "✓" : ""}</span>
      {label}
    </div>
  );
}

/* ============ atoms & styles ============ */

function Title({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: "0.66rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#A9845C" }}>{eyebrow}</p>
      <h1 style={{ margin: "10px 0 0", fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontStyle: "italic", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "#12100E" }}>{title}</h1>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: "0.66rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#888", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid rgba(18,16,14,0.18)",
  borderRadius: 4,
  fontSize: "0.95rem",
  fontFamily: "inherit",
  background: "#fff",
  outline: "none",
};
const twoCol: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const topBtn: React.CSSProperties = { background: "none", border: "none", fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#666", cursor: "pointer", textDecoration: "none" };
const stepBtn: React.CSSProperties = { padding: "8px 14px", background: "none", border: "none", fontSize: "0.74rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#999", cursor: "pointer", borderRadius: 4 };
const stepBtnActive: React.CSSProperties = { color: "#12100E", background: "#F6F4EE" };
const miniBtn: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(18,16,14,0.12)", background: "#fff", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", cursor: "pointer", borderRadius: 4 };
const miniBtnActive: React.CSSProperties = { background: "#12100E", color: "#fff", borderColor: "#12100E" };
const chip: React.CSSProperties = { padding: "8px 14px", background: "#F6F4EE", border: "1px solid rgba(18,16,14,0.12)", fontSize: "0.78rem", color: "#12100E", cursor: "pointer", borderRadius: 999, fontFamily: "inherit" };
const arrow: React.CSSProperties = { background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 10, padding: 2 };

function toLocal(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}
function fromLocal(v: string) {
  if (!v) return "";
  return new Date(v).toISOString();
}
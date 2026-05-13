import { supabase } from "@/integrations/supabase/client";

const LS_KEY = "sera-tt-demo";

export type DemoInfo = {
  event_id: string;
  pass_id: string;
  manual_code: string;
  station_id: string;
  station_slug: string;
  station_secret?: string | null;
  tap_station_mode: "auto_redeem" | "staff_confirm";
};

export function getStoredDemo(): DemoInfo | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DemoInfo) : null;
  } catch {
    return null;
  }
}

export function setStoredDemo(d: DemoInfo) {
  // Preserve secret across reseeds when not returned (only returned at first creation)
  const prev = getStoredDemo();
  const merged: DemoInfo = {
    ...d,
    station_secret: d.station_secret ?? prev?.station_secret ?? null,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(merged));
}

export function clearStoredDemo() {
  localStorage.removeItem(LS_KEY);
}

export async function rpc<T = any>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  // @ts-expect-error - tt_* RPCs are not in the generated types
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

export async function ensureDemo(): Promise<DemoInfo> {
  const stored = getStoredDemo();
  const data = await rpc<any>("tt_seed_demo");
  const info: DemoInfo = {
    event_id: data.event_id,
    pass_id: data.pass_id,
    manual_code: data.manual_code,
    station_id: data.station_id,
    station_slug: data.station_slug,
    station_secret: data.station_secret ?? stored?.station_secret ?? null,
    tap_station_mode: data.tap_station_mode,
  };
  setStoredDemo(info);
  return info;
}

export async function resetDemo(): Promise<DemoInfo> {
  clearStoredDemo();
  const data = await rpc<any>("tt_reset_demo");
  const info: DemoInfo = {
    event_id: data.event_id,
    pass_id: data.pass_id,
    manual_code: data.manual_code,
    station_id: data.station_id,
    station_slug: data.station_slug,
    station_secret: data.station_secret ?? null,
    tap_station_mode: data.tap_station_mode,
  };
  setStoredDemo(info);
  return info;
}

export function buildStationUrl(demo: DemoInfo): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const secret = demo.station_secret ?? "MISSING_SECRET_RESET_DEMO";
  return `${origin}/ticket-test/station/${demo.station_slug}?s=${encodeURIComponent(secret)}&pass=${demo.pass_id}`;
}
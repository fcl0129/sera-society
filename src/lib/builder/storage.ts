import type { SavedEvent, BuilderConfig } from "./types";
import { defaultConfig, makeSlug } from "./defaults";

const KEY = "sera.builder.events.v1";

function readAll(): SavedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: SavedEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listEvents(): SavedEvent[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getEvent(id: string): SavedEvent | undefined {
  return readAll().find((e) => e.id === id);
}

export function getEventBySlug(slug: string): SavedEvent | undefined {
  return readAll().find((e) => e.slug === slug);
}

export function createEvent(): SavedEvent {
  const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  const now = new Date().toISOString();
  const ev: SavedEvent = {
    id,
    slug: makeSlug("evening"),
    createdAt: now,
    updatedAt: now,
    config: defaultConfig(),
  };
  const all = readAll();
  all.push(ev);
  writeAll(all);
  return ev;
}

export function saveEvent(id: string, config: BuilderConfig): SavedEvent | undefined {
  const all = readAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return undefined;
  const next: SavedEvent = {
    ...all[idx],
    slug: all[idx].config.basics.title !== config.basics.title
      ? makeSlug(config.basics.title)
      : all[idx].slug,
    updatedAt: new Date().toISOString(),
    config,
  };
  all[idx] = next;
  writeAll(all);
  return next;
}

export function deleteEvent(id: string) {
  writeAll(readAll().filter((e) => e.id !== id));
}
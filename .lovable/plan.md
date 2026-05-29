# Event Studio — Implementation Plan

A premium, editorial event page builder layered on top of the existing Sera Society app. Reuses the existing `events` table and `builder_config` JSONB; no rebuild.

## Scope

Replace/extend the current `/host/events/new` builder with a full **Event Studio** at `/host/studio/:eventId` (plus `/host/studio/new` to create a draft and redirect). Existing brand, navbar, routing, and marketing pages stay untouched.

## 1. Data model (single migration)

Extend `public.events` only — keep it backwards compatible:

- `event_page_config jsonb not null default '{}'` — theme + widgets + customization
- `visibility text not null default 'private_link'` — `private_link | request_access | invite_only`
- ensure `slug` is unique (already exists, add unique index if missing)

New tables (all with GRANTs + RLS scoped via `events.organizer_id`, public read where guest page needs it):

- `event_guestbook_entries` (event_id, guest_name, message, created_at, approved bool) — public insert on published events, public select where approved
- `event_prompt_responses` (event_id, prompt_id text, guest_name, response, created_at) — public insert, organizer read
- `event_photos` (event_id, guest_name, image_url, approved bool, created_at) — organizer-only writes for now (upload UI uses storage bucket `event-photos`, public read)
- `event_seating` already covered by `seating_tables` / `seating_assignments` — reuse

Storage bucket `event-photos` (public read).

## 2. Theme system

`src/lib/studio/themes.ts` — 6 curated themes (Midnight Supper, Garden After Dark, Gallery Opening, Summer Terrace, Red Room, Minimal Ivory). Each defines: background (color/gradient/texture), surface, accent, heading font, body font, card radius, button style, density, mood tagline.

`src/lib/studio/fontPairs.ts` — ~6 curated pairings using fonts already loadable (Cormorant Garamond, Playfair Display, Instrument Serif, EB Garamond + Inter, Work Sans, Jost). Loaded via `<link>` injection on demand.

Customization overlay: heading font, body font, background color/gradient, accent, texture on/off, corner style (sharp/soft/editorial), density (airy/compact/dramatic).

## 3. Widget system

`src/lib/studio/widgets.ts` — registry with:

```ts
type WidgetType = 'hero'|'rsvp'|'map'|'spotify'|'photo_wall'|'guestbook'|'seating'|'prompts'|'schedule'|'dress_code';
interface WidgetInstance { id: string; type: WidgetType; enabled: boolean; order: number; config: Record<string, unknown>; }
```

Each widget exports `{ defaultConfig, GuestRender, EditorPanel, label, icon }`. Stored under `event_page_config.widgets[]`.

Files: `src/components/studio/widgets/{Hero,Rsvp,Map,Spotify,PhotoWall,Guestbook,Seating,Prompts,Schedule,DressCode}.tsx` — each with the two render exports.

## 4. Event Studio editor

Route: `/host/studio/:eventId` (lazy-loaded). Three-pane layout on desktop, tabbed on mobile.

- **Left rail** — Steps: Basics · Theme · Widgets · Publish. Stepper from existing `StepProgress` reused.
- **Center** — Form for current step (editorial card style, generous whitespace).
- **Right** — Live preview iframe-style frame using the actual `GuestEventPage` component rendered inline with theme + widgets from local state. Desktop/mobile toggle (390 / full width). Updates on every state change — no reload.

Widget editor: drag handles (`@dnd-kit/sortable` if available, else simple up/down buttons — check deps first), per-widget enable toggle, expandable config panel.

## 5. Publish flow

Publish button updates `events.status = 'published'`, generates slug if missing, shows confirmation screen with copyable link `/{slug}` and QR code (reuse existing QR if present, else simple `qrcode` lib check).

## 6. Guest-facing page

Update existing `/e/:slug` (or create if absent — check `EventPages.tsx`) to render `event_page_config.theme` + `widgets[]` via the registry's `GuestRender`. Mobile-first, editorial. Public RSVP via existing `submit_rsvp` RPC (already exists). Guestbook/prompt submissions via new public RPCs or direct insert with RLS.

## 7. Brand guardrails

- Reuse Sera tokens (navy, ivory, beige, oxblood, moss) from `index.css`.
- Studio chrome stays in existing host-area styling.
- Guest page themes can break out into more dramatic moods (that's the point), but always within the curated theme set.

## 8. Out of scope (this pass)

- Photo moderation queue UI (structure exists, simple approve toggle only)
- Advanced seating drag-drop (manual table+guest list only)
- Real Spotify oAuth (URL embed only)
- Email blasts from Studio

## Technical notes

- One migration file; all new tables include `GRANT` + RLS.
- Reuse `BuilderShell` patterns where sensible, but Studio is a new component tree under `src/components/studio/` to avoid breaking the existing builder.
- Old `/host/events/new` route kept working; new `/host/studio/new` is the promoted entry point.
- No new heavy deps unless `@dnd-kit/core` + `@dnd-kit/sortable` and `qrcode.react` are missing — will check and add only if needed.
- All preview updates via React state; no iframe, no reload.

## Deliverables

- 1 migration
- ~10 widget files
- Studio shell + 4 step screens + live preview
- Updated guest page renderer
- Theme + font-pair libraries

After approval I'll run the migration first, then build in this order: themes/fonts → widget registry → studio shell → guest renderer → publish flow → manual QA pass.

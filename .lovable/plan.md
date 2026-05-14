# Sera Society — Event Builder & Private Event Page Rebuild

## Goal
Make creating an event feel like setting the scene for an evening — not filling a form. Ship a guided builder, an invitation maker with 5 premium styles, a widget-based private event page, and an improved host dashboard. Editorial, dark blue / oxblood / cream / moss, cinematic.

## Scope of this pass
Frontend-first. Reuse existing Supabase tables where they map cleanly (events, event_guests, rsvp). Where backend is missing (invitation style, widgets, RSVP question config), store on the existing `events` row via a `builder_config` JSONB column added in one small migration. No changes to `/ticket-test`, auth, or the landing page beyond what's needed to surface the new builder entry point in the host dashboard.

## What gets built

### 1. Route structure
```
/host                       → improved dashboard (replaces current host landing)
/host/events/new            → EventBuilder (5 steps)
/host/events/:id/edit       → EventBuilder (resumes at any step)
/host/events/:id            → host-side event detail (manage)
/e/:slug                    → public/private guest-facing event page
```
Existing `/ops/*`, `/rsvp/:token`, `/pass/:token` left intact.

### 2. EventBuilder (multi-step)
Single shell with progress rail, Back / Save & continue, sticky mobile bar, live preview panel (desktop) / preview drawer (mobile).

Steps:
1. **EventBasicsStep** — title, type (Dinner / Birthday / Party / Corporate / Wedding-adjacent / Private gathering / Launch / Other), date, start, end, location, dress code, host name, mood/description.
2. **InvitationStyleStep** — pick one of 5 styles, edit headline / subheading / host line / RSVP CTA / note. Live `InvitationPreview` re-renders.
3. **GuestListStep** — add/edit guests (name, email, phone, plus-one, notes), inline status badge (Not invited → Invited → Opened → RSVP pending → Attending → Declined). Bulk paste textarea.
4. **RSVPSettingsStep** — deadline, plus-ones, dietary, song request, arrival time, custom question, confirmation message.
5. **WidgetSelectorStep** — toggle the 13 widgets, drag to reorder, live `EventPagePreview`.

### 3. Invitation styles (5)
Each is a React component with its own typography + palette tokens, rendered into a shared `InvitationFrame`:
- Midnight Dinner — deep navy, cream serif
- Oxblood Salon — oxblood, cream, dramatic editorial
- Garden After Dark — moss, cream, soft botanical
- Champagne Minimal — ivory, fine rules, modern
- Velvet Club — near-black, oxblood accent, cinematic

### 4. Private event page (`/e/:slug`)
Editorial microsite assembled from selected widgets in chosen order. Widgets:
Hero/Invitation, RSVP, Schedule, Location, Dress Code, Menu, Guest Notes, Playlist, Gift, Accommodation, Gallery/Moodboard, Drink Tickets (placeholder), Check-in (placeholder).

Each widget is a self-contained component with consistent editorial frame (rule above, serif eyebrow, generous spacing).

### 5. Host dashboard (`/host`)
Grid of `EventDashboardCard`s: title, date, status, guest count, RSVP progress bar, quick actions (Edit, Invitation, Guests, View page, Copy link, Preview RSVP). Empty state with the editorial copy from the brief and a single "Create an event" CTA.

### 6. Backend touch (one migration)
Add to `events`:
- `builder_config jsonb default '{}'::jsonb` — holds invitation style, widget order/toggles, RSVP question config, mood text, dress code, host display name.
- `slug text unique` — for `/e/:slug`. Backfill from existing events.

No RLS changes beyond keeping existing host-only write / token-based read patterns.

Guest list & RSVP continue using existing `event_guests` + token flow. Builder writes through the existing RPCs already in use by `HostAdminDashboard`.

## Component map
```
src/pages/host/
  HostDashboard.tsx
  EventBuilderPage.tsx          (loads/saves, hosts the stepper)
  EventManagePage.tsx
src/pages/event/
  PublicEventPage.tsx           (/e/:slug)
src/components/builder/
  BuilderShell.tsx
  StepProgress.tsx
  steps/EventBasicsStep.tsx
  steps/InvitationStyleStep.tsx
  steps/GuestListStep.tsx
  steps/RSVPSettingsStep.tsx
  steps/WidgetSelectorStep.tsx
  PreviewPanel.tsx
src/components/invitation-styles/
  InvitationFrame.tsx
  MidnightDinner.tsx
  OxbloodSalon.tsx
  GardenAfterDark.tsx
  ChampagneMinimal.tsx
  VelvetClub.tsx
  index.ts                      (registry)
src/components/event-widgets/
  HeroWidget.tsx, RsvpWidget.tsx, ScheduleWidget.tsx, LocationWidget.tsx,
  DressCodeWidget.tsx, MenuWidget.tsx, GuestNotesWidget.tsx, PlaylistWidget.tsx,
  GiftWidget.tsx, AccommodationWidget.tsx, GalleryWidget.tsx,
  DrinkTicketsWidget.tsx, CheckInWidget.tsx, registry.ts
src/components/host/
  EventDashboardCard.tsx
  GuestStatusBadge.tsx
  WidgetToggleCard.tsx
src/lib/builder/
  types.ts          (BuilderConfig, WidgetKey, InvitationStyleKey)
  defaults.ts
  storage.ts        (load/save against events.builder_config + localStorage draft)
```

## Design tokens (added to index.css / tailwind config)
```
--sera-navy: 220 45% 12%
--sera-oxblood: 358 55% 28%
--sera-cream: 38 40% 94%
--sera-moss: 130 22% 28%
--sera-ink: 220 30% 8%
```
Plus per-style local overrides inside each invitation/widget component. All HSL, all via tokens — no hex in components.

## Out of scope (this pass)
- Real ticketing/check-in wiring (placeholders only — `/ticket-test` untouched).
- Email send for invitations beyond the existing `send-sera-email` flow.
- Importing guests from CSV file (paste textarea only).
- Image uploads for moodboard (URL field + placeholder grid for now).

## Acceptance
- From `/host` empty state → create event → 5 steps → preview event page → land on manage page with shareable `/e/:slug` link.
- Invitation preview reflects style + edits live.
- Widget toggles change the public event page in real time.
- Mobile: each step usable at 390px, sticky continue bar.
- No regressions to landing, auth, `/ticket-test`, or existing ops routes.
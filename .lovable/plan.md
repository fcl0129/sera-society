## Sera Pass / Tap Station — Isolated Test Harness at `/ticket-test`

A fully self-contained prototype of the Sera Pass drink-ticket redemption system. Lives entirely under `/ticket-test/*`. Does not touch the existing landing page, event pages, navigation, theme, components, or production tables.

### Scope guarantees

- Existing site, design system, components, colors, typography, animations: untouched.
- New tables only — no changes to `events`, `event_guests`, `drink_tickets`, etc.
- New routes only — not added to nav.
- Test data lives in its own tables prefixed `tt_*` so there is zero chance of contaminating production.

### Database (new migration, all `tt_*` tables)

```text
tt_events            id, slug='ticket-test', name, tap_station_mode, is_test, created_at
tt_guest_passes      id, event_id, display_name, guest_email, manual_code, status, created_at, updated_at
tt_drink_units       id, event_id, guest_pass_id, status (unused|pending|redeemed|cancelled|expired),
                     public_code, redeemed_at, redemption_method, redemption_station_id, metadata, created_at
tt_stations          id, event_id, name, slug, station_type, station_secret_hash, is_active, created_at
tt_intents           id, event_id, guest_pass_id, status (pending|station_tapped|awaiting_staff_confirmation|
                     redeemed|expired|cancelled), expires_at, station_id, created_at, tapped_at,
                     redeemed_at, ticket_unit_id, metadata
tt_redemptions       id, event_id, guest_pass_id, ticket_unit_id, method, station_id, redeemed_by,
                     redeemed_at, result, device_info, metadata
```

RLS: enabled on all tables, with permissive read/write for `anon` + `authenticated` **only on these `tt_*` tables** (test harness). Real production tables remain locked down. All meaningful logic happens inside SECURITY DEFINER RPCs that lock rows with `FOR UPDATE SKIP LOCKED` so race conditions are impossible.

### Server-side RPCs (atomic, all SECURITY DEFINER)

- `tt_seed_demo()` → creates/refreshes the demo event, station (with secret), guest pass, 5 unused units. Returns demo IDs + station URL.
- `tt_reset_demo()` → wipes only `tt_*` rows for the demo event; reseeds.
- `tt_add_units(pass_id, n)` → adds N fresh `unused` units.
- `tt_get_pass_state(pass_id)` → returns pass, counts (total/used/remaining), active intent, recent redemptions, manual code, station URL.
- `tt_create_intent(pass_id)` → creates pending intent (90s expiry). Rejects if remaining=0 or active intent exists.
- `tt_cancel_intent(intent_id)` → marks cancelled.
- `tt_tap_station(station_slug, station_secret, pass_id)` → validates secret hash, finds active intent, atomically locks one `unused` unit (FOR UPDATE SKIP LOCKED), behavior depends on `tap_station_mode`:
  - `auto_redeem` → mark unit redeemed, intent redeemed, log success.
  - `staff_confirm` → mark intent `awaiting_staff_confirmation`, hold a unit reservation via intent.ticket_unit_id (status `pending`).
- `tt_confirm_intent(intent_id)` → bartender confirms; finalizes the held unit → redeemed, logs.
- `tt_reject_intent(intent_id)` → releases held unit back to `unused`.
- `tt_redeem_qr(pass_id)` → atomic single-unit redemption (method=qr_scan).
- `tt_redeem_manual(manual_code)` → atomic single-unit redemption (method=manual_code).
- `tt_set_mode(mode)` → toggles event between `auto_redeem`/`staff_confirm`.

All redemption RPCs return `{ ok, result, remaining, used, total, unit_id? }`. When zero remain → `result='no_tickets_remaining'` and an entry is logged.

### Frontend routes (all new, none in nav)

- `/ticket-test` — control dashboard: status, counts, recent redemptions, buttons (open guest, open bartender, copy/open station URL, simulate QR, reset, add 5 units, switch mode). Big "TEST ENVIRONMENT — not linked to production" banner.
- `/ticket-test/guest` — pass display: remaining count, total/used, manual code, QR (encodes `pass_id`), "Use drink ticket" button, ready-to-tap state with 90s countdown, cancel.
- `/ticket-test/bartender` — pending queue (staff_confirm mode), recent redemptions, simulate-QR button, manual-code input, station selector display.
- `/ticket-test/station/:slug` — reads `?s=secret`, calls `tt_tap_station`, shows result ("Redeemed — 4 remaining", "Awaiting bartender", "No active drink ticket — press Use drink ticket first", "Expired", "No drink tickets remaining").
- `/ticket-test/scan` — minimal page that auto-calls `tt_redeem_qr` for the demo pass (simulates QR camera scan opening this URL).

All pages styled with **inline neutral styling** (plain Tailwind utility classes, mono/system fonts, neutral grays) so the test UI is visually distinct from Sera's editorial design and cannot be confused for production UI. No imports from `src/components/sera/*`, `src/components/home/*`, `src/components/invitation/*`.

### File additions

- `supabase/migrations/<ts>_ticket_test_harness.sql` — tables, RLS, RPCs.
- `src/pages/ticket-test/TicketTestDashboard.tsx`
- `src/pages/ticket-test/TicketTestGuest.tsx`
- `src/pages/ticket-test/TicketTestBartender.tsx`
- `src/pages/ticket-test/TicketTestStation.tsx`
- `src/pages/ticket-test/TicketTestScan.tsx`
- `src/pages/ticket-test/lib.ts` — wraps RPC calls, polling helpers, persists demo IDs in `localStorage` under `sera-tt-*`.
- `src/App.tsx` — add 5 routes only (no nav, no layout changes).

### How polling works

Guest page polls `tt_get_pass_state` every 2s while an intent is active or after a redemption to reflect updates from the station/bartender tab. Bartender page polls every 2s.

### Known limitations (called out in dashboard)

- Manual code is short and visible to anyone who opens guest URL — fine for test, not production.
- "Demo bartender" requires no auth on test routes; production bartender flow stays gated by existing `RoleRoute`.
- Station secret is stored hashed; raw secret is shown once on dashboard for copy.
- iOS NFC writing is out-of-scope; the station URL is the same one a sticker would write later.

### Test plan delivered after build

End-to-end checklist matching scenarios A–I in the brief.

# Sera Society — Unification Devlog

_Date: 2026-04-21_

## What was broken

1. **Schema drift** — three pages queried tables that don't exist:
   - `src/pages/ManageEvents.tsx` queried `guests`, `event_staff_roles`,
     `event_timeline_items`, `event_post_event_summaries`. The real tables
     are `event_guests`, `staff_roles`, `timeline_items`, `wrapped_summaries`.
   - `src/pages/Dashboard.tsx` queried `guests` (legacy).
   - `src/pages/CheckIn.tsx` queried `guests` and used non-existent
     `drink_tickets.ticket_code` / `drink_tickets.nfc_tag` columns.
2. **Wrong RPC name** — `supabase/functions/redeem-ticket/index.ts` invoked
   `redeem_event_ticket(p_code, p_method, p_redemption_point_id, p_payload)`,
   which does not exist. The real RPC is
   `public.redeem_ticket(_token text, _method text, _station_label text)`.
3. **Two competing organizer dashboards** — `pages/ManageEvents.tsx` (1422
   lines, broken schema) and `pages/ops/HostAdminDashboard.tsx` (canonical,
   recently rebuilt). The legacy file masked errors with `// @ts-nocheck`
   so no TS warning ever surfaced.
4. **Edge-function build errors** — `process-email-queue/index.ts` used
   `ReturnType<typeof createClient>` as a parameter type; the latest
   supabase-js types narrow this to `never` without a `Database` generic,
   so every `.from(...).insert(...)` / `.update(...)` failed type-checking.
5. **Bartender redeem flow was a dead end** — `src/lib/redemption.ts` and
   `BartenderPanel`/`GuestEventPage` sent a `code` field with `redemption_point_id`
   metadata; the function ignored most of that and the RPC didn't exist
   anyway. Result: every scan returned 500.
6. **Profile bootstrap gap** — `useAuthState` relied entirely on the
   `handle_new_user` trigger creating a profile. Any pre-trigger account
   (or any account created out-of-band) silently fell back to the `guest`
   role with no profile row.
7. **Stale legacy routes** — `/dashboard`, `/dashboard/events`,
   `/manage-events`, `/check-in` link in the public navbar. After login a
   user could land on `/dashboard` and hit a 500 / blank page.

## What was removed

- `src/pages/ManageEvents.tsx` — deleted (1422 lines, broken).
- `src/pages/Dashboard.tsx` — deleted (legacy, broken queries).
- The `/manage-events` route — replaced with a redirect to `/organizer`.
- The `/dashboard` and `/dashboard/*` routes — redirect to `/organizer`.
- The "Check-In" link in the public `Navbar` (it lives behind auth at
  `/check-in`, surfaced from the organizer dashboard instead).
- The "Check-In" link in the public `Footer` — replaced with "Sign in".

## What was unified

- **One organizer dashboard**: `src/pages/ops/HostAdminDashboard.tsx`
  (mounted at `/admin`, `/organizer`, `/ops/host`). Uses the canonical
  schema: `events`, `event_guests`, `drink_tickets`.
- **One bartender flow**: `src/pages/ops/BartenderPanel.tsx` →
  `src/lib/redemption.ts` → `supabase/functions/redeem-ticket` →
  `public.redeem_ticket(_token, _method, _station_label)` RPC.
- **One check-in flow**: rewritten `src/pages/CheckIn.tsx` queries
  `event_guests` + `checkins`, with proper duplicate-handling.
- **One auth resolver**: `src/lib/auth.ts::resolveUserRole` now creates
  a profile row on the fly if none exists, and routes by role through
  `landingPathForRole`.
- **Edge functions type-clean**: `process-email-queue` casts the supabase
  client to `any` (it was already untyped — just appease TS), and
  `redeem-ticket` calls the correct RPC with the correct argument names.

## What still remains (see TODO.md)

- Build and connect a guest invitation email flow (the
  `send-sera-email` function exists and supports the `invitation` template
  but is not invoked anywhere).
- Wire `wrapped_summaries` (post-event recap) — tables exist, no UI.
- Wire `event_messages` (host broadcasts) — tables exist, no UI.
- Wire `seating_tables` / `seating_assignments` — tables exist, no UI.
- Surface `staff_roles` in the organizer dashboard.
- Add automated tests for `redeem_ticket` happy/forbidden/double-redeem
  paths.
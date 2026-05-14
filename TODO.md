# Sera Society — Operational TODO

This file tracks **manual** steps and known gaps. Code-level work is in the
codebase + GitHub issues. See README for the full smoke test.

## 1. Supabase Auth (one-time setup)

- [ ] Disable public signup (`Auth → Providers → Email → Enable signups = OFF`).
      Access is invite-only via the access-request flow.
- [ ] Add redirect URLs (see README → "Supabase Auth — redirect URLs").
- [ ] Confirm `admin@serasociety.com` exists as an auth user. The
      `handle_new_user` trigger auto-promotes that email to `admin`.

## 2. Edge Function secrets (set in Cloud → Edge Functions → Secrets)

Already configured for the live project:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DB_URL`
- `LOVABLE_API_KEY`
- `RESEND_API_KEY` (Lovable connector — manage via Connectors only)
- `SERA_FROM_EMAIL`, `SERA_APP_URL`

If you rotate keys, update them in Cloud only — never in the repo.

## 3. Functional flows — current status

| Flow | Status |
|------|--------|
| Request access (`/request-access`) | ✅ Inserts into `access_requests`. |
| Admin review (`/admin/access-requests`) | ✅ Calls `review-access-request` edge function — invites the user, assigns role, sends approval/rejection email. |
| Login + role-based landing | ✅ `resolveUserRole` + `landingPathForRole`. |
| Organizer: create / list / delete events | ✅ |
| Organizer: add / edit / remove guests | ✅ |
| Organizer: copy RSVP link / copy pass link | ✅ |
| Organizer: automatic guest invitation email | ✅ Fires `send-sera-email` on add-guest; manual copy is fallback. |
| Organizer: resend invitation | ✅ |
| Organizer: issue single drink ticket | ✅ |
| Organizer: bulk issue tickets to all accepted guests | ✅ |
| Organizer: stats (live via realtime) | ✅ |
| Public RSVP page (`/rsvp/:token`) | ✅ Uses `submit_rsvp` RPC, no login. |
| Guest pass (`/pass/:token`) | ✅ Uses `get_guest_pass_by_token` RPC, no login. |
| Bartender QR / NFC / manual redeem | ✅ Atomic via `redeem-ticket` edge function → `redeem_ticket` RPC. |
| Bartender scan history | ✅ |
| Check-in (`/check-in`) | ✅ |
| Ticket-test harness (`/ticket-test/*`) | ✅ Isolated, not linked from public nav. |
| Event messages broadcast | ⚠️ Table exists, no UI. |
| Post-event wrapped summary | ⚠️ Table exists, no UI. |
| Seating | ⚠️ Tables exist, no UI. |

## 4. Smoke test

See README → "Production smoke test".

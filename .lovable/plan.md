
# Sera Society Production Readiness Pass

Scope: audit + targeted fixes only. No redesign. No framework change. Preserve brand, routes, and flows.

## 1. Repo + Security Cleanup
- Verify `.env` contents. If real (it currently contains the live `VITE_SUPABASE_URL` + publishable key), keep it (publishable anon key is safe to commit per Supabase guidance) but ensure `.gitignore` covers `.env.local`, `.env.*.local`. Document this in README.
- Confirm no service-role / private keys are anywhere in repo (`rg` sweep for `service_role`, `SUPABASE_SERVICE`, `RESEND_API_KEY=`).
- Remove/replace any stray `sera-society.lovable.app` marketing references; keep only as documented fallback.

## 2. Edge Functions CI Deploy
Update `.github/workflows/deploy-supabase.yml` to deploy all active functions:
- auth-email-hook
- process-email-queue
- send-sera-email
- review-access-request
- redeem-ticket
- generate-token (audit if active; deploy if so)
Keep `supabase db push`. No secrets in workflow.

Also update `.github/workflows/ci.yml` to run `npm run build`, `npm run lint`, `npm run test`.

## 3. Access Request Flow
- Search for any `/master/access-requests` references; replace with `/admin/access-requests`.
- Verify `RequestAccess.tsx` inserts into `access_requests` (RLS already allows anon insert).
- Verify `AdminAccessRequests.tsx` loads + uses `review-access-request` edge function.
- Confirm Supabase auto-confirm signup is OFF (invite-only). Document in README — no code change unless misconfigured.

## 4. Guest Invitation + RSVP
- Audit organizer "add guest" path → confirm it triggers `send-sera-email` with RSVP link.
- Verify `/rsvp/:token` (or equivalent) works without auth using `get_rsvp_by_token` / `submit_rsvp` RPCs (already exist).
- Mobile responsiveness check on RSVP page.

## 5. Guest Pass + Drink Tickets
- `/pass/:token` uses `get_guest_pass_by_token` RPC (exists). Verify gating: if `rsvp_status != accepted`, show RSVP prompt.
- Add empty-state when no tickets issued.
- Confirm QR encodes the ticket token (used by bartender scan).

## 6. Organizer Dashboard
- Audit `HostAdminDashboard.tsx`. Ensure it offers:
  - Issue ticket to single guest
  - Bulk issue to all accepted guests
  - Counts per guest (active/redeemed/void)
  - Void ticket
  - Copy guest pass link / RSVP link
  - Resend invitation
- Use `event_guest_id` so accountless guests work.

## 7. Bartender / Redemption
- `/ops/bartender` already uses `QrScanner` (fixed in earlier turn) + `redeem-ticket` edge function + `redeem_ticket` RPC (atomic).
- Verify "ready for next guest" reset and clear permission-denied UX exist.
- Verify scan history (added previously).

## 8. Ticket-Test Harness
- Already isolated under `/ticket-test/*`. Confirm not linked from public nav.

## 9. Tests
- Add/verify Vitest tests for `normalizeScannedTicketValue` (exists), redemption response mapping, RSVP helpers.

## 10. Documentation
Rewrite README sections:
- Accurate routes (`/admin/access-requests`, not `/master/...`)
- Vercel env vars (Production + Preview): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` only
- Supabase Auth redirect URLs: `https://serasociety.com`, `https://www.serasociety.com`, current Vercel preview wildcard, plus `/login`, `/ops`, `/organizer`, `/admin`
- Edge functions list (matches CI)
- Full smoke-test checklist: access request → approve → login → create event → add guest → email → RSVP → pass → issue ticket → scan → redeem → double-scan blocked
Update TODO accordingly; remove stale "not implemented" claims.

## Out of Scope
- Visual redesign
- New features beyond the gaps listed
- Migration changes (database schema is already correct for these flows)

## Deliverables
Summary at the end listing: files changed, bugs fixed, migrations (none expected), functions deployed by CI, manual test steps, remaining limitations.

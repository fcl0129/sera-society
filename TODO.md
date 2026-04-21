# Sera Society — Open Backend & Setup Items

## 1. Supabase Auth (Cloud → Auth → URL Configuration)

- [ ] **Disable** `Enable signups` so only invited / approved users can join.
      Approval flow goes through `access_requests` → `review-access-request`
      edge function → `auth.admin.inviteUserByEmail`.
- [ ] **Add redirect URLs**:
  - `https://sera-society.lovable.app/ops`
  - `https://sera-society.lovable.app/organizer`
  - `https://sera-society.lovable.app/admin`
  - `https://sera-society.lovable.app/login`
  - and the corresponding preview-URL equivalents.
- [ ] Confirm `admin@serasociety.com` exists as an auth user. The
      `handle_new_user` trigger and the client-side `resolveUserRole`
      both auto-promote that email to `admin`.

## 2. Required environment variables / secrets

These are already configured (verified via the project's secrets list):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_DB_URL`
- `LOVABLE_API_KEY`
- `RESEND_API_KEY` (Lovable connector — manage via Connectors only)
- `SERA_FROM_EMAIL`, `SERA_APP_URL`

If you swap email providers or rotate keys, update them in
**Cloud → Edge Functions → Secrets**, never in code.

## 3. Email flows

- ✅ `auth-email-hook` — handles signup / magic-link / recovery emails
  (Lovable Email queue).
- ✅ `send-sera-email` — branded transactional sender via Resend connector.
  Templates: `magic_link`, `access_approved`, `access_rejected`,
  `invitation`, `ticket_issued`. Currently called from
  `review-access-request` only.
- ⚠️ **Guest invitation emails are not yet sent automatically.** When the
  organizer adds a guest to `event_guests`, no email goes out. The RSVP
  link is generated but must be copied manually from the dashboard. To
  wire automatic sending, invoke `send-sera-email` with template
  `invitation` from the "add guest" handler in `HostAdminDashboard.tsx`.

## 4. Functional product flows — status

| Flow | Status |
|------|--------|
| Request access (`/request-access`) | ✅ Inserts into `access_requests`. |
| Admin review (`/admin/access-requests`) | ✅ Calls `review-access-request` edge function which assigns role + sends email. |
| Login + role-based landing | ✅ `resolveUserRole` + `landingPathForRole`. |
| Organizer: create / list / delete events | ✅ |
| Organizer: add / edit / remove guests | ✅ |
| Organizer: copy RSVP link | ✅ |
| Organizer: stats (live via realtime) | ✅ |
| Public RSVP page (`/rsvp/:token`) | ✅ Uses `submit_rsvp` RPC. |
| Bartender QR / NFC / manual redeem | ✅ Calls `redeem_ticket` RPC via edge function. |
| Check-in (`/check-in`) | ✅ Inserts into `checkins`. |
| Drink-ticket issuance (organizer side) | ⚠️ No UI yet — tickets must be inserted manually or via a future organizer action. |
| Event messages broadcast | ⚠️ Table exists, no UI. |
| Post-event wrapped summary | ⚠️ Table exists, no UI. |
| Seating | ⚠️ Tables exist, no UI. |

## 5. Manual smoke test checklist

1. Sign in as `admin@serasociety.com` → land on `/admin`.
2. Open `/admin/access-requests` → review a pending row → approve →
   confirm the user is invited and gets `organizer` (or chosen) role.
3. Sign in as the new organizer → land on `/organizer`.
4. Create an event → add a guest with your own email → copy RSVP link.
5. Open the RSVP link in incognito → accept with +1.
6. Switch back to organizer → confirm stats tiles update live.
7. Open `/check-in` → check the guest in → verify the row appears in
   `checkins`.
8. Insert a drink ticket manually for that guest (via DB or future UI):
   ```sql
   INSERT INTO drink_tickets (event_id, guest_id)
   VALUES ('<event_id>', '<guest_user_id>');
   ```
   Note the generated `token`.
9. Sign in as a bartender → open `/ops/bartender` → enter the token in
   manual lookup → confirm `Redeemed`. Try again → confirm `Already used`.
# Sera Society

Premium event platform built with **Vite + React 18 + TypeScript + Tailwind +
shadcn-style UI**, backed by **Lovable Cloud (Supabase)** for auth, database,
edge functions, and email queue.

> Brand note: always "Sera Society" or "Sera". Never abbreviate as "SS".

---

## Stack

- Vite 5 · React 18 · TypeScript 5 · Tailwind 3 · shadcn/ui
- Supabase (managed via Lovable Cloud) — Postgres + RLS, Auth, Edge Functions
- Resend (via Lovable connector) for transactional email
- Vercel for hosting

---

## Environment variables

Only **two** runtime env vars are read by the frontend:

| Var | Where | Notes |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | Vercel Production + Preview | Public Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Vercel Production + Preview | Anon publishable key — safe in client |

The committed `.env` contains the publishable URL + anon key only. **Never**
commit a service-role key, SMTP password, or `RESEND_API_KEY` — those live
exclusively in Supabase Edge Function secrets.

> Do **not** introduce `NEXT_PUBLIC_*` vars. This is a Vite app.

### Vercel setup

1. Project → Settings → Environment Variables → add both `VITE_*` vars to
   **Production** and **Preview**.
2. The included `vercel.json` rewrites all routes to `index.html` so deep
   links like `/admin/access-requests`, `/ops/bartender`, `/pass/<token>`
   survive a refresh.

---

## Supabase Auth — redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**, add:

**Site URL**
```
https://serasociety.com
```

**Additional redirect URLs**
```
https://serasociety.com
https://www.serasociety.com
https://serasociety.com/login
https://serasociety.com/ops
https://serasociety.com/organizer
https://serasociety.com/admin
https://*.vercel.app
```

(Add the current Vercel preview URL pattern explicitly if your team uses
non-wildcarded preview domains.)

**Disable public signups** (`Authentication → Providers → Email → Enable
signups = OFF`). Access is invite-only via the access-request flow.

---

## Edge Functions

All deployed automatically by `.github/workflows/deploy-supabase.yml` on
pushes to `main` that touch `supabase/**`:

| Function | Purpose |
|---|---|
| `auth-email-hook` | Renders branded auth emails (signup, magic-link, recovery) into the email queue |
| `process-email-queue` | Drains pgmq email queues; runs via pg_cron |
| `send-sera-email` | Branded transactional sender (invitations, ticket-issued, access-approved/rejected) |
| `review-access-request` | Approves/rejects access requests, invites the user, assigns role, sends email |
| `redeem-ticket` | Atomically redeems a drink ticket via the `redeem_ticket` RPC |
| `generate-token` | Token utilities |

Required Edge Function secrets (set in Cloud → Edge Functions → Secrets,
**never** in code):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`LOVABLE_API_KEY`, `RESEND_API_KEY` (managed by connector),
`SERA_FROM_EMAIL`, `SERA_APP_URL`.

---

## GitHub Actions

| Workflow | Trigger | Does |
|---|---|---|
| `.github/workflows/ci.yml` | every PR + push to `main` | merge-marker check, install, **build**, **lint**, **test** |
| `.github/workflows/deploy-supabase.yml` | push to `main` touching `supabase/**` | `supabase db push` + deploy all edge functions listed above |

Required Action secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`.

---

## Routes

Public:
- `/` — marketing landing
- `/platform`, `/about`, `/contact`, `/faq`, `/invitations`, `/event-pages`
- `/request-access` — access application form
- `/rsvp/:token` — public RSVP, no login required
- `/pass/:token` — guest pass + drink tickets, no login required
- `/login`

Authenticated:
- `/organizer` — host / admin event management dashboard
- `/admin` — same dashboard, admin-scoped
- `/admin/access-requests` — review pending access requests *(formerly `/master/access-requests` — old path removed)*
- `/ops` — ops landing
- `/ops/bartender` — QR scan + manual redemption
- `/ops/guest` — authenticated guest event view
- `/check-in` — guest check-in

Isolated test harness (not linked from public nav):
- `/ticket-test`, `/ticket-test/guest`, `/ticket-test/bartender`,
  `/ticket-test/station/:slug`, `/ticket-test/scan`

---

## Production smoke test

Run end-to-end after each release:

1. **Access request** — submit `/request-access` as a new email.
2. **Approve** — sign in as `admin@serasociety.com`, open
   `/admin/access-requests`, click **Approve**. The
   `review-access-request` edge function invites the user, assigns the
   `organizer` role, and sends the branded approval email.
3. **Login** — new organizer follows the magic-link/invite, lands on
   `/organizer`.
4. **Create event** — fill out a draft event in the organizer dashboard.
5. **Add guest** — add a guest with your own email. The dashboard fires
   `send-sera-email` (template `invitation`) automatically; the RSVP and
   pass links are also copyable as a fallback.
6. **RSVP** — open the RSVP link in incognito on a phone, accept (with +1
   if allowed). No login required.
7. **Pass** — open `/pass/:token`. Confirm the QR renders and the guest
   sees the empty-tickets state.
8. **Issue ticket** — back in the organizer dashboard, click "Issue
   ticket" for that guest (or "Issue to all accepted").
9. **Refresh pass** — confirm an active ticket appears.
10. **Bartender scan** — sign in as a bartender, open `/ops/bartender` on
    iPhone Safari, allow camera, scan the QR. Receipt shows ✅ Redeemed.
11. **Double-scan blocked** — scan the same QR again. Receipt shows
    "Already used" with the original timestamp.
12. **Manual lookup fallback** — paste the token into the manual field;
    confirm it returns `already_redeemed`.

If every step passes, ship.

---

## Local development

```bash
npm install
npm run dev      # http://localhost:8080
npm run lint
npm run test     # vitest
npm run build
```

Edge functions are deployed automatically by Lovable Cloud on every change
under `supabase/functions/**`. The CI workflow above is the source of
truth for production deploys from `main`.

---

## Security

- Only the publishable Supabase anon key ships in the client — its
  capabilities are constrained by RLS policies.
- Service-role keys, SMTP creds, and `RESEND_API_KEY` live exclusively in
  Supabase Edge Function secrets and never in this repo.
- `.gitignore` excludes `.env.local`, `.env.*.local`. CI also greps for
  merge markers before deploying.

# Welcome to your Lovable project

## Supabase deployment (Access Requests + Master Admin)

This project now includes:
- Access request form data in `public.access_requests`
- Owner notification setting in `public.app_settings`
- Master-only admin review page at `/master/access-requests`
- Queue-based email notification trigger on new access requests

### 1) Run the new migration in Supabase

Open **Supabase Dashboard → SQL Editor** and run:

```sql
-- Paste the full file:
-- supabase/migrations/20260416090000_access_requests.sql
```

### 2) Configure owner notification email

After migration, set your real mailbox:

```sql
update public.app_settings
set owner_notification_email = 'you@yourdomain.com'
where id = 1;
```

### 3) Make your user a master admin

In **Auth → Users → your user → app_metadata**, set:

```json
{
  "role": "master"
}
```

The app checks this role before granting access to `/master/access-requests`.

### 4) Ensure email queue processing is active

This project enqueues access-request emails into `transactional_emails`.
You must ensure the email queue worker/function is deployed and running:
- `supabase/functions/process-email-queue`

Also ensure required secrets are set in Supabase Edge Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`

### 5) Smoke test

1. Submit `/request-access`
2. Verify a row appears in `public.access_requests`
3. Log in as master and open `/master/access-requests`
4. Approve/reject a request
5. Verify email was queued/sent in `public.email_send_log`

## GitHub Actions automation

This repo now includes two workflows:
- `.github/workflows/ci.yml` — builds frontend on PRs and pushes to `main`
- `.github/workflows/deploy-supabase.yml` — pushes Supabase migrations + deploys edge functions on `main` changes under `supabase/**`

Set these GitHub Actions secrets:
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

### Avoid conflicts + failed deployments

Use this merge flow every time:
1. `git fetch origin`
2. `git checkout <your-branch>`
3. `git merge origin/main`
4. Resolve conflicts locally and remove all markers (`<<<<<<<`, `=======`, `>>>>>>>`)
5. Run CI locally if possible (`npm run build`)
6. Push branch and open/update PR
7. Merge only when CI + Vercel preview are green

The CI workflow now includes an explicit conflict-marker check so broken merges fail fast before deployment.

## Vercel setup (recommended hosting)

For this React + Vite app, Vercel is the recommended host for the website frontend.

### Required Vercel env vars
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Add them for both:
- **Production**
- **Preview**

### SPA routing on Vercel

This repo includes `vercel.json` with a rewrite to `index.html` so routes like
`/login`, `/dashboard`, and `/master/access-requests` work on page refresh.
It also pins Vercel build commands so dev dependencies (like `vite`) are
installed during deploy builds, and avoids strict lockfile resolution in CI/CD.

## Domain setup

### Where to host the domain?
- **Website hosting**: Vercel
- **Domain registration**: any registrar (Namecheap, GoDaddy, Porkbun, etc.)
- **DNS management**: either at your registrar or Cloudflare (both are fine)

### Suggested setup
1. Add domain in Vercel Project → Domains.
2. Set apex domain (`serasociety.com`) to Vercel.
3. Set `www.serasociety.com` and redirect it to apex (or the reverse).
4. In Supabase Auth settings, add your final production URL(s) to:
   - Site URL
   - Redirect URLs

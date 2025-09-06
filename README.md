
# Social Media AI Agent — MVP Onboarding

This is a baseline Next.js (App Router) + Supabase + Stripe project that implements:

- Superadmin **invite flow** (email → signup with token)
- Business account creation (Supabase Auth manages credentials)
- **Business info** form
- **Stripe subscription** checkout
- **Content preferences** form

> Production hardening (auth middleware, RBAC, secure email delivery, mapping Stripe customers to business IDs) is left as TODOs but the scaffolding is ready.

## Getting Started

1. Copy `.env.example` to `.env.local` and fill values.
2. In Supabase, run `supabase/schema.sql` in the SQL editor.
3. Install deps:
```bash
npm i
npm run dev
```
4. Open http://localhost:3000

### Invite Flow
- Visit `/admin` and send an invite. The server logs the invite link (replace with Resend/SMTP).
- Open the logged URL, set password, and complete onboarding.

### Stripe
- Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`.
- `POST /api/stripe/checkout` creates a subscription checkout session.

## Important Notes
- **Credentials** are stored in Supabase Auth (`auth.users`), not in your custom tables.
- You should add **middleware** to read the Supabase session and attach `user_id` to writes.
- Replace the mock email sender in `app/api/invites/create/route.ts` with Resend or SMTP.
- Tighten **RLS policies** to restrict access per user/tenant.

## Next Steps
- Add auth-protected routes and middleware.
- Link `auth.users.id` to `business_profiles.user_id` post sign-up.
- Store `stripe_customer_id` and map subscriptions in webhook.
- Build the Social Media Agent content generator + scheduler next.


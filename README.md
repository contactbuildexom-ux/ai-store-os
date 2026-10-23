# Buildexom Store Platform

## Admin and store URL patterns

Replace `{APP_ORIGIN}` with the deployed site origin (for example, `https://your-domain.example`). These are route patterns; the values in braces are placeholders.

| Purpose | URL |
| --- | --- |
| Sign-in (Super Admin or merchant) | `{APP_ORIGIN}/login` |
| Super Admin dashboard | `{APP_ORIGIN}/dashboard` |
| Super Admin dashboard sections | `{APP_ORIGIN}/dashboard/{section}` |
| Merchant sign-in / sign-up | `{APP_ORIGIN}/merchant/login` |
| Merchant store dashboard | `{APP_ORIGIN}/merchant/{storeId-or-slug}/dashboard` |
| Legacy store-admin dashboard | `{APP_ORIGIN}/store-admin/{storeSlug}` |
| Public storefront | `{APP_ORIGIN}/store/{storeSlug}` |

The merchant dashboard link is also returned as `dashboard_url` when a store is generated. A store may also be available at its configured subdomain.

## Access control

- The Super Admin dashboard checks authorization in its server layout. A valid signed admin session or a Supabase user whose `app_metadata.role` is `super_admin` is required. Knowing `/dashboard` or a section URL does not grant access.
- Super Admin API routes must independently authorize requests; the dashboard UI is not the security boundary.
- Merchant dashboards require a valid signed merchant session or a Supabase session belonging to the store owner. The store ID or slug in a URL is an identifier, not a password.
- Storefront URLs are public. Do not put confidential information in storefront content.
- Use strong, unique passwords and HTTPS in production. Keep the service-role key and setup secret server-side; never put them in `NEXT_PUBLIC_*` variables or share them in chat.

## Environment configuration

Configure these server-side environment variables in `.env.local` for local development and in the deployment provider for production:

- `ADMIN_SESSION_SECRET`: long, random signing secret for Super Admin sessions.
- `MERCHANT_SESSION_SECRET`: long, random signing secret for merchant sessions. If omitted, the app falls back to `ADMIN_SESSION_SECRET`, then `SUPABASE_SERVICE_ROLE_KEY`.
- `ADMIN_SETUP_SECRET`: one-time setup API authorization secret. Do not expose it to browser code.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`: required for the Supabase-backed deployment. The service-role key must remain private.

Generate independent random values for the secrets and rotate them deliberately. Rotating a session secret invalidates sessions signed with its previous value, requiring affected users to sign in again.

## Initial Super Admin setup

After configuring Supabase and `ADMIN_SETUP_SECRET`, create the initial Super Admin once by sending a server-side `POST` request to `{APP_ORIGIN}/api/admin/setup` with an `Authorization: Bearer <ADMIN_SETUP_SECRET>` header and a JSON body containing `email` and a unique password of 12–128 characters. The setup endpoint refuses to create the initial account again once one exists. Do not call this endpoint from browser code or place its secret in a public URL.

After setup, sign in at `{APP_ORIGIN}/login`; open the Super Admin dashboard at `{APP_ORIGIN}/dashboard`. Assign Super Admin access to Supabase users through trusted server-side `app_metadata` only.
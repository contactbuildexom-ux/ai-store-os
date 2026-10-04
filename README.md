# Buildexom AI Admin

Admin console built with Next.js App Router, Tailwind CSS, and Supabase Auth.

## Run locally

1. Run `npm install`, then `npm run dev` and open `http://localhost:3000`.
2. For local testing without Supabase, sign in with `admin@buildexom.com` / `123456`. Mock authentication is only enabled by the development server.
3. For Supabase authentication, copy `.env.example` to `.env.local`, set the Supabase URL and anon key, then create an administrator with trusted `app_metadata.role` set to `super_admin`. Never set this claim from client code or user-editable metadata.
4. To use the bootstrap admin credentials in `app/api/admin/setup/route.ts`, apply the Supabase migrations and set `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`, and `ADMIN_SETUP_SECRET` in `.env.local`. Call `POST /api/admin/setup` once with `Authorization: Bearer <ADMIN_SETUP_SECRET>`, then sign in through `/login`. Keep these secrets private; the setup endpoint is intentionally not available through a public GET request.

Dashboard routes validate the signed, HTTP-only bootstrap-admin session or a Supabase user with trusted `app_metadata.role` set to `super_admin`. Overview values and management rows are sample preview data; connect the platform data schema and authorization policies before using the tables for live administration.

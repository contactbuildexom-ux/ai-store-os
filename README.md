# Buildexom AI Admin

Admin console built with Next.js App Router, Tailwind CSS, and Supabase Auth.

## Run locally

1. Run `npm install`, then `npm run dev` and open `http://localhost:3000`.
2. For local testing without Supabase, sign in with `admin@buildexom.com` / `123456`. Mock authentication is only enabled by the development server.
3. For Supabase authentication, copy `.env.example` to `.env.local`, set the Supabase URL and anon key, then create an administrator with trusted `app_metadata.role` set to `super_admin`. Never set this claim from client code or user-editable metadata.

Dashboard routes use server-side authentication checks and Supabase cookie refresh when configured. Overview values and management rows are sample preview data; connect the platform data schema and authorization policies before using the tables for live administration.

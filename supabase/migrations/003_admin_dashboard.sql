-- Admin dashboard for binaadultcare.com
-- Run after 001 and 002 (Supabase → SQL Editor, or `supabase db push`).
--
-- Security model:
--   • Staff sign in with one Admin ID + password, set as ADMIN_USERNAME / ADMIN_PASSWORD
--     in Vercel. The /api/admin server function checks the signed session on every request
--     and is the only thing that reads or writes these tables (service-role key).
--   • All tables keep RLS on with no client policies, so nothing is readable or writable
--     with the public anon key. The browser never talks to the database directly.

-- ── Editable website content ──────────────────────────────────
-- One JSON document per section (settings, team, testimonials, vacancies,
-- gallery, services, faqs). Read at build time to produce the public site.
create table if not exists public.site_content (
  key         text primary key check (key in (
                'settings', 'team', 'testimonials', 'vacancies', 'gallery', 'services', 'faqs', 'meta')),
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);
alter table public.site_content enable row level security;
revoke all on table public.site_content from anon, authenticated;

-- ── Staff notes on every inbox item ───────────────────────────
alter table public.contact_submissions add column if not exists staff_notes text;
alter table public.job_applications   add column if not exists staff_notes text;
-- (visit_requests already has staff_notes)

-- ── Public bucket for photos uploaded in the dashboard ────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

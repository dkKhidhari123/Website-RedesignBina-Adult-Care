-- Visit requests and job applications from binaadultcare.com
-- Run after 001_contact_submissions.sql (Supabase → SQL Editor, or `supabase db push`).
--
-- Same security model as contact_submissions: RLS on, no policies, client roles revoked.
-- Only the server-side /api functions write (service-role key). Staff view rows in the
-- Supabase dashboard; resumes are in the PRIVATE "resumes" storage bucket.

create extension if not exists pgcrypto;

-- ── Visit requests ─────────────────────────────────────────────
-- A request is NOT a confirmed appointment. Staff update `status` after calling the family.
create table if not exists public.visit_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 2 and 120),
  email           text not null check (char_length(email) <= 254),
  phone           text not null check (char_length(phone) <= 40),
  care_type       text not null check (care_type in ('residential', 'home', 'unsure')),
  preferred_date  date not null,
  preferred_time  text not null check (char_length(preferred_time) <= 20),
  visitors        text not null default '1' check (visitors in ('1', '2', '3', '4', '5+')),
  message         text check (char_length(message) <= 2000),
  source_page     text check (char_length(source_page) <= 200),
  user_agent      text check (char_length(user_agent) <= 400),
  status          text not null default 'requested'
                    check (status in ('requested', 'confirmed', 'completed', 'cancelled')),
  staff_notes     text
);

create index if not exists visit_requests_created_at_idx on public.visit_requests (created_at desc);
alter table public.visit_requests enable row level security;
revoke all on table public.visit_requests from anon, authenticated;

-- ── Job applications ───────────────────────────────────────────
create table if not exists public.job_applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null check (char_length(name) between 2 and 120),
  email            text not null check (char_length(email) <= 254),
  phone            text not null check (char_length(phone) <= 40),
  position         text not null check (char_length(position) <= 120),
  experience       text check (char_length(experience) <= 40),
  message          text check (char_length(message) <= 3000),
  resume_path      text,
  resume_filename  text check (char_length(resume_filename) <= 150),
  source_page      text check (char_length(source_page) <= 200),
  user_agent       text check (char_length(user_agent) <= 400),
  status           text not null default 'new'
                     check (status in ('new', 'reviewing', 'interview', 'hired', 'closed'))
);

create index if not exists job_applications_created_at_idx on public.job_applications (created_at desc);
alter table public.job_applications enable row level security;
revoke all on table public.job_applications from anon, authenticated;

-- ── Private storage bucket for resumes ─────────────────────────
-- public = false and no storage policies → files are only reachable with the service-role
-- key or by signed-in project members in the dashboard.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  3145728,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

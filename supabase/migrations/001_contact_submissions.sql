-- Contact & visit requests submitted from binaadultcare.com
-- Run in Supabase → SQL Editor (or `supabase db push`).
--
-- Security model:
--   • Row Level Security is ON and there are NO policies, so the public `anon`
--     key and logged-in users can neither read nor write this table.
--   • Only the server-side /api/contact function writes here, using the
--     service-role key (which bypasses RLS) from a Vercel environment variable.
--   • Staff read submissions in the Supabase dashboard (Table Editor).

create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 2 and 120),
  email           text not null check (char_length(email) <= 254),
  phone           text check (char_length(phone) <= 40),
  inquiry_type    text not null check (inquiry_type in ('residential', 'home', 'unsure', 'general')),
  subject         text check (char_length(subject) <= 150),
  message         text not null check (char_length(message) between 1 and 4000),
  source_page     text check (char_length(source_page) <= 200),
  user_agent      text check (char_length(user_agent) <= 400),
  status          text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- Belt and braces: remove any default grants to client-facing roles.
revoke all on table public.contact_submissions from anon, authenticated;

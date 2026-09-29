-- =============================================================================
-- Shourya portfolio — backend schema
-- =============================================================================
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It creates the two tables the admin panel needs, the image bucket, and the
-- row-level security policies that keep the public site read-only.
--
-- Nothing here is a secret and nothing here needs to be committed to the site's
-- frontend bundle except the anon key, which lives in .env.local.
-- =============================================================================

-- ---------------------------------------------------------------- site copy --
create table if not exists public.site_content (
  id          text primary key default 'published',
  content     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

comment on table public.site_content is
  'One row holds the whole editable portfolio. The public site reads id = ''published''.';

-- ---------------------------------------------------------------- enquiries --
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  type        text not null default '',
  budget      text not null default '',
  message     text not null default '',
  read        boolean not null default false,
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_unread_idx on public.enquiries (read, archived);

-- ------------------------------------------------------------ security (RLS) --
alter table public.site_content enable row level security;
alter table public.enquiries     enable row level security;

-- Anyone may read the published document (that is how the site gets its copy).
drop policy if exists "site_content is public" on public.site_content;
create policy "site_content is public"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Only a signed-in admin may change it.
drop policy if exists "site_content admin write" on public.site_content;
create policy "site_content admin write"
  on public.site_content for all
  to authenticated
  using (true)
  with check (true);

-- Visitors may submit the contact form; nobody but an admin may read it.
drop policy if exists "enquiries public insert" on public.enquiries;
create policy "enquiries public insert"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "enquiries admin read" on public.enquiries;
create policy "enquiries admin read"
  on public.enquiries for select
  to authenticated
  using (true);

drop policy if exists "enquiries admin update" on public.enquiries;
create policy "enquiries admin update"
  on public.enquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "enquiries admin delete" on public.enquiries;
create policy "enquiries admin delete"
  on public.enquiries for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------ image storage --
-- Public bucket so the portfolio can serve images without a signed URL.
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

drop policy if exists "portfolio images are public" on storage.objects;
create policy "portfolio images are public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio');

drop policy if exists "portfolio images admin insert" on storage.objects;
create policy "portfolio images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio');

drop policy if exists "portfolio images admin update" on storage.objects;
create policy "portfolio images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio')
  with check (bucket_id = 'portfolio');

drop policy if exists "portfolio images admin delete" on storage.objects;
create policy "portfolio images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio');

-- =============================================================================
-- Still to do by hand:
--   1. Authentication → Users → Add user (email + password). Use a strong
--      password; this is the only credential that opens /admin.
--   2. Project Settings → API → copy Project URL and the anon/publishable key
--      into .env.local as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
--      Never put the service_role key in a VITE_ variable.
-- =============================================================================

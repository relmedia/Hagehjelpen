-- Hagehjelpen dashboard schema.
-- Run in the Supabase SQL editor. Public read access is limited to the content
-- the website renders; everything else requires an authenticated session.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- Content ---

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  body text,
  price_from integer,
  image_url text,
  image_alt text,
  "order" integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists mowers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  brand text,
  max_area integer,
  max_slope integer,
  boundary text,
  price integer,
  features jsonb default '[]'::jsonb,
  short_description text,
  body text,
  image_url text,
  image_alt text,
  "order" integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- For databaser som ble opprettet før boundary-kolonnen fantes.
alter table mowers add column if not exists boundary text;

create table if not exists price_tiers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  min_area integer,
  max_area integer,
  price integer,
  includes jsonb default '[]'::jsonb,
  note text,
  "order" integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists coverage_areas (
  id uuid primary key default gen_random_uuid(),
  postal_code text not null unique,
  place text not null,
  zone text not null default 'kjerne' check (zone in ('kjerne', 'utvidet')),
  travel_fee integer,
  note text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  place text,
  rating integer check (rating between 1 and 5),
  quote text not null,
  service text,
  published_at date,
  "order" integer default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  "order" integer default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  published_at date,
  excerpt text,
  cover_image_url text,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------ Leads ---

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service text not null,
  lawn_size text,
  lawn_area integer,
  mower text,
  address text,
  message text,
  image_count integer default 0,
  source text default 'kontaktskjema',
  status text not null default 'ny' check (status in ('ny', 'kontaktet', 'tilbud', 'vunnet', 'tapt')),
  note text,
  handled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_status_created_idx on leads (status, created_at desc);

-- ------------------------------------------------------------ Befaringer ----

create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  address text,
  postal_code text,
  lawn_area integer,
  service text not null default 'befaring',
  date date not null,
  time text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  cancel_token uuid not null default gen_random_uuid(),
  confirm_token uuid default gen_random_uuid(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists inspections_date_idx on inspections (date, time);

create table if not exists availability_days (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  is_closed boolean not null default false,
  slots jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------- Settings ---

create table if not exists settings (
  id text primary key default 'singleton',
  title text,
  tagline text,
  hero_heading text,
  hero_body text,
  phone text,
  email text,
  address text,
  org_number text,
  service_area text,
  hourly_rate integer,
  facebook_url text,
  instagram_url text,
  meta_description text,
  updated_at timestamptz default now()
);

create table if not exists email_settings (
  id text primary key default 'singleton',
  resend_api_key text,
  email_from text,
  lead_admin_email text,
  updated_at timestamptz default now()
);

-- -------------------------------------------------------------------- RLS ---

alter table services enable row level security;
alter table mowers enable row level security;
alter table price_tiers enable row level security;
alter table coverage_areas enable row level security;
alter table testimonials enable row level security;
alter table faq_items enable row level security;
alter table articles enable row level security;
alter table pages enable row level security;
alter table availability_days enable row level security;
alter table leads enable row level security;
alter table inspections enable row level security;
alter table settings enable row level security;
alter table email_settings enable row level security;

-- Content the website reads anonymously; the dashboard user may write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'services', 'mowers', 'price_tiers', 'coverage_areas', 'testimonials',
    'faq_items', 'articles', 'pages', 'availability_days', 'settings'
  ]
  loop
    execute format('drop policy if exists %I on %I', t || '_public_read', t);
    execute format(
      'create policy %I on %I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );
    execute format('drop policy if exists %I on %I', t || '_admin_all', t);
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true)',
      t || '_admin_all', t
    );
  end loop;
end $$;

-- Enquiries and befaringer: the website may insert, only the dashboard reads.
drop policy if exists leads_insert_public on leads;
create policy leads_insert_public on leads
  for insert to anon, authenticated with check (true);
drop policy if exists leads_admin_all on leads;
create policy leads_admin_all on leads
  for all to authenticated using (true) with check (true);

drop policy if exists inspections_insert_public on inspections;
create policy inspections_insert_public on inspections
  for insert to anon, authenticated with check (true);
drop policy if exists inspections_admin_all on inspections;
create policy inspections_admin_all on inspections
  for all to authenticated using (true) with check (true);

-- The Resend key never leaves the dashboard.
drop policy if exists email_settings_admin_all on email_settings;
create policy email_settings_admin_all on email_settings
  for all to authenticated using (true) with check (true);

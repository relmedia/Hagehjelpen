-- Trafikkstatistikk for forsiden i dashbordet.
--
-- Nettsiden sender ett kall til /api/track per sidevisning, og ett ekstra når
-- besøkende har vært på siden i 10 sekunder. Ingen informasjonskapsler brukes:
-- besøkende identifiseres med en hash av IP og nettleser som byttes hver dag,
-- så tallene er anonyme og kan ikke spores tilbake til en person.
--
-- Trygg å kjøre flere ganger.

create table if not exists page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- 'view'    = sidevisning
  -- 'engaged' = besøkende ble værende på siden
  -- 'section' = seksjon på forsiden ble sett (label = anker, f.eks. «priser»)
  -- 'action'  = verktøy ble brukt (label = f.eks. «skjema-sendt»)
  kind text not null default 'view',
  session_id text not null,
  visitor_id text not null,
  path text not null,
  -- Navn på seksjonen eller handlingen. Tom for vanlige sidevisninger.
  label text,
  referrer text,
  country text,
  city text
);

-- Nettsiden er én side med ankere, så seksjoner og verktøybruk måles i stedet
-- for undersider. Kolonnen og de to nye kind-verdiene kom etter første versjon.
alter table page_views add column if not exists label text;
alter table page_views drop constraint if exists page_views_kind_check;
alter table page_views add constraint page_views_kind_check
  check (kind in ('view', 'engaged', 'section', 'action'));

create index if not exists page_views_created_at_idx on page_views (created_at desc);
create index if not exists page_views_kind_created_at_idx on page_views (kind, created_at desc);
create index if not exists page_views_path_idx on page_views (path, created_at desc);
create index if not exists page_views_session_idx on page_views (session_id);
create index if not exists page_views_label_idx on page_views (kind, label, created_at desc);

alter table page_views enable row level security;

-- Nettsiden skriver anonymt. Rådataene kan bare leses av innloggede brukere,
-- og statistikken hentes uansett gjennom funksjonene lenger ned.
drop policy if exists page_views_public_insert on page_views;
create policy page_views_public_insert on page_views for insert to anon, authenticated with check (true);

drop policy if exists page_views_admin_read on page_views;
create policy page_views_admin_read on page_views for select to authenticated using (true);

grant insert on table page_views to anon;
grant select, insert on table page_views to authenticated;

-- Nøkkeltallene øverst på dashbordet. En økt regnes som engasjert når den har
-- mer enn én sidevisning, eller når besøkende ble værende lenge nok på én side.
create or replace function analytics_summary(from_ts timestamptz, to_ts timestamptz)
returns table (pageviews bigint, visitors bigint, sessions bigint, engaged_sessions bigint)
language sql
stable
as $$
  with scoped as (
    select pv.kind, pv.session_id, pv.visitor_id
    from page_views pv
    where pv.created_at >= from_ts and pv.created_at < to_ts
  ),
  per_session as (
    select
      s.session_id,
      count(*) filter (where s.kind = 'view') as views,
      bool_or(s.kind = 'engaged') as stayed
    from scoped s
    group by s.session_id
  )
  select
    (select count(*) from scoped s where s.kind = 'view'),
    (select count(distinct s.visitor_id) from scoped s),
    (select count(*) from per_session p where p.views > 0),
    (select count(*) from per_session p where p.stayed or p.views > 1);
$$;

-- Dagsserien bak trafikkgrafen. Døgnet regnes i norsk tid.
create or replace function analytics_daily(from_ts timestamptz, to_ts timestamptz)
returns table (day text, pageviews bigint, visitors bigint)
language sql
stable
as $$
  select
    to_char(pv.created_at at time zone 'Europe/Oslo', 'YYYY-MM-DD'),
    count(*) filter (where pv.kind = 'view'),
    count(distinct pv.visitor_id)
  from page_views pv
  where pv.created_at >= from_ts and pv.created_at < to_ts
  group by 1
  order by 1;
$$;

-- Beholdt for framtidige undersider. Forsiden er én side, så dashbordet viser
-- seksjoner (funksjonen under) i stedet.
create or replace function analytics_top_pages(from_ts timestamptz, to_ts timestamptz, max_rows integer default 6)
returns table (path text, views bigint, visitors bigint)
language sql
stable
as $$
  select pv.path, count(*), count(distinct pv.visitor_id)
  from page_views pv
  where pv.kind = 'view' and pv.created_at >= from_ts and pv.created_at < to_ts
  group by pv.path
  order by count(*) desc
  limit max_rows;
$$;

-- Hvor langt ned på forsiden folk kommer. Nettsiden sender én rad per seksjon
-- per økt, så «sessions» er antall økter som fikk se seksjonen.
create or replace function analytics_sections(from_ts timestamptz, to_ts timestamptz, max_rows integer default 20)
returns table (label text, sessions bigint, visitors bigint)
language sql
stable
as $$
  select pv.label, count(distinct pv.session_id), count(distinct pv.visitor_id)
  from page_views pv
  where pv.kind = 'section'
    and pv.label is not null
    and pv.created_at >= from_ts
    and pv.created_at < to_ts
  group by pv.label
  order by count(distinct pv.visitor_id) desc
  limit max_rows;
$$;

-- Bruk av verktøyene: kalkulator, dekningssjekk, produktvelger, skjema, telefon.
-- Også her teller vi én gang per økt.
create or replace function analytics_actions(from_ts timestamptz, to_ts timestamptz, max_rows integer default 20)
returns table (label text, sessions bigint, visitors bigint)
language sql
stable
as $$
  select pv.label, count(distinct pv.session_id), count(distinct pv.visitor_id)
  from page_views pv
  where pv.kind = 'action'
    and pv.label is not null
    and pv.created_at >= from_ts
    and pv.created_at < to_ts
  group by pv.label
  order by count(distinct pv.visitor_id) desc
  limit max_rows;
$$;

-- referrer = null betyr direkte trafikk. Dashbordet grupperer selv i søk,
-- sosiale medier og henvisninger.
create or replace function analytics_referrers(from_ts timestamptz, to_ts timestamptz)
returns table (referrer text, visitors bigint, views bigint)
language sql
stable
as $$
  select pv.referrer, count(distinct pv.visitor_id), count(*)
  from page_views pv
  where pv.kind = 'view' and pv.created_at >= from_ts and pv.created_at < to_ts
  group by pv.referrer
  order by count(distinct pv.visitor_id) desc;
$$;

create or replace function analytics_realtime(window_minutes integer default 30)
returns table (minute timestamptz, visitors bigint)
language sql
stable
as $$
  select date_trunc('minute', pv.created_at), count(distinct pv.visitor_id)
  from page_views pv
  where pv.created_at >= now() - make_interval(mins => window_minutes)
  group by 1
  order by 1;
$$;

create or replace function analytics_countries(from_ts timestamptz, to_ts timestamptz, max_rows integer default 6)
returns table (country text, visitors bigint, views bigint)
language sql
stable
as $$
  select pv.country, count(distinct pv.visitor_id), count(*)
  from page_views pv
  where pv.kind = 'view'
    and pv.country is not null
    and pv.created_at >= from_ts
    and pv.created_at < to_ts
  group by pv.country
  order by count(distinct pv.visitor_id) desc
  limit max_rows;
$$;

create or replace function analytics_cities(from_ts timestamptz, to_ts timestamptz, max_rows integer default 6)
returns table (city text, country text, visitors bigint, views bigint)
language sql
stable
as $$
  select pv.city, pv.country, count(distinct pv.visitor_id), count(*)
  from page_views pv
  where pv.kind = 'view'
    and pv.city is not null
    and pv.created_at >= from_ts
    and pv.created_at < to_ts
  group by pv.city, pv.country
  order by count(distinct pv.visitor_id) desc
  limit max_rows;
$$;

-- Statistikken skal bare leses av innloggede brukere i dashbordet, ikke av
-- nettsiden som skriver dataene.
do $$
declare
  fn text;
begin
  for fn in
    select format('%I(%s)', p.proname, pg_get_function_identity_arguments(p.oid))
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'analytics%'
  loop
    execute format('revoke execute on function public.%s from public', fn);
    execute format('grant execute on function public.%s to authenticated, service_role', fn);
  end loop;
end $$;

-- Rydding: kjør denne av og til, eller sett den opp som en cron-jobb i Supabase,
-- for å slippe å lagre gamle rådata lenger enn nødvendig.
--   delete from page_views where created_at < now() - interval '12 months';

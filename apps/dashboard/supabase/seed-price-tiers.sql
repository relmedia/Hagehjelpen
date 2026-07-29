-- Prisnivåene som ligger på forsiden i dag (InstallationPricing på hagehjelpen.no).
-- Kjør etter schema.sql. Trygg å kjøre flere ganger: nivåer som allerede finnes
-- med samme tittel røres ikke, så egne endringer blir stående.
--
-- Tittelen er teksten som vises øverst på priskortet. min_area og max_area
-- styrer hvilket alternativ som fylles inn i kontaktskjemaet når kunden klikker
-- «Bestill installasjon». Prisene er eks. mva.

with included as (
  select jsonb_build_array(
    'Gjennomgang av eiendommen sammen med deg før installasjon',
    'Installasjon av robotklipper og ladestasjon',
    'Kanttråd, plugger og skjøter',
    'Programmering av robotklipperen',
    'Kort gjennomgang av brukermanual og riktig bruk',
    'Etterkontroll og justering ved behov innen 2 uker',
    'Kjøring inntil 15 km'
  ) as items
),
tiers (title, min_area, max_area, price, featured, sort_order) as (
  values
    ('0 – 1000 m²', 0, 1000, 4000, false, 10),
    ('1000 – 2000 m²', 1000, 2000, 6750, true, 20),
    ('2000 m² og oppover', 2000, null::integer, 9250, false, 30)
)
insert into price_tiers (title, min_area, max_area, price, includes, featured, "order", active)
select t.title, t.min_area, t.max_area, t.price, i.items, t.featured, t.sort_order, true
from tiers t
cross join included i
where not exists (select 1 from price_tiers p where p.title = t.title);

-- Mellomnivået er «Mest valgt» på forsiden. Setningen retter opp rader som ble
-- lagt inn før featured-kolonnen fantes; etterpå styrer du merkelappen i
-- dashbordet, men merk at den settes tilbake hvis denne filen kjøres igjen.
update price_tiers set featured = true where title = '1000 – 2000 m²';

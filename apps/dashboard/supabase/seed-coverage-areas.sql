-- Dekningsområdene som ligger på forsiden i dag (CoverageCheck på hagehjelpen.no).
-- Kjør etter schema.sql. Trygg å kjøre flere ganger: områder som allerede finnes
-- med samme navn røres ikke, så egne endringer blir stående.
--
-- Postnummerintervallene er veiledende og regnet ut fra basen på Ræge. Sonen
-- styrer svaret kunden får: kjerne = kjøring inkludert, utvidet = kjøretillegg,
-- utenfor = vi tar oppdraget når det passer med andre installasjoner.

with areas (place, postal_code_from, postal_code_to, zone, sort_order) as (
  values
    ('Stavanger', 4001, 4049, 'kjerne', 10),
    ('Sola', 4050, 4069, 'kjerne', 20),
    ('Randaberg', 4070, 4079, 'kjerne', 30),
    ('Strand og Jørpeland', 4100, 4129, 'utvidet', 40),
    ('Ryfylke', 4130, 4199, 'utvidet', 50),
    ('Sauda og Suldal', 4200, 4299, 'utenfor', 60),
    ('Sandnes', 4300, 4329, 'kjerne', 70),
    ('Gjesdal og Ålgård', 4330, 4339, 'utvidet', 80),
    ('Time og Bryne', 4340, 4349, 'utvidet', 90),
    ('Klepp og Kvernaland', 4350, 4359, 'utvidet', 100),
    ('Hå', 4360, 4369, 'utvidet', 110),
    ('Eigersund og Dalane', 4370, 4399, 'utenfor', 120)
)
insert into coverage_areas (place, postal_code_from, postal_code_to, zone, "order", active)
select a.place, a.postal_code_from, a.postal_code_to, a.zone, a.sort_order, true
from areas a
where not exists (select 1 from coverage_areas c where c.place = a.place);

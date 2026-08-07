-- Online bestilling av befaring.
--
-- Tabellene «inspections» og «availability_days» ligger allerede i schema.sql.
-- Dette skriptet legger til vernet som trengs når hvem som helst kan bestille
-- fra nettsiden: to besøkende skal ikke kunne ta samme time.
--
-- Trygg å kjøre flere ganger.

-- Én aktiv befaring per dato og klokkeslett. Avbestilte timer holdes utenfor,
-- slik at tiden blir ledig igjen når noen avbestiller.
create unique index if not exists inspections_active_slot_idx
  on inspections (date, time)
  where status <> 'cancelled';

-- Avbestillingslenken i e-posten slår opp på token, så den må være rask og unik.
create unique index if not exists inspections_cancel_token_idx
  on inspections (cancel_token);

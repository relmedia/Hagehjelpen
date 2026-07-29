-- Robotklipperne som ligger på forsiden i dag (MowerAdvisor på hagehjelpen.no).
-- Kjør etter schema.sql. Trygg å kjøre flere ganger: rader matches på slug.
--
-- max_slope følger terrengkategoriene nettsiden bruker (flat ≈ 20 %,
-- kupert ≈ 35 %, bratte partier ≈ 45 %). Juster mot Husqvarnas datablad når
-- dere vil vise eksakte tall per modell. price står tom = «etter befaring»,
-- og image_url fylles inn fra bildebiblioteket i dashbordet.

insert into mowers (title, slug, brand, max_area, max_slope, boundary, short_description, "order", active)
values
  (
    'Automower® Aspire™ R6V', 'automower-aspire-r6v', 'Husqvarna', 600, 20,
    'Kabelfri – virtuell grense',
    'Kompakt klipper for små, oversiktlige hager og trange passasjer.',
    10, true
  ),
  (
    'Automower® 308V', 'automower-308v', 'Husqvarna', 800, 20,
    'Kabelfri – virtuell grense',
    'Enkel og driftssikker modell for vanlige villahager.',
    20, true
  ),
  (
    'Automower® 312V', 'automower-312v', 'Husqvarna', 1200, 20,
    'Kabelfri – virtuell grense',
    'Litt større kapasitet, fortsatt uten kanttråd rundt plenen.',
    30, true
  ),
  (
    'Automower® 305E NERA', 'automower-305e-nera', 'Husqvarna', 900, 35,
    'Kanttråd, kan oppgraderes til kabelfri (EPOS)',
    'Håndterer skråninger og delte soner i mellomstore hager.',
    40, true
  ),
  (
    'Automower® 405VE NERA', 'automower-405ve-nera', 'Husqvarna', 900, 35,
    'Kabelfri – virtuell grense',
    'Kabelfri løsning for hager med høydeforskjeller og flere soner.',
    50, true
  ),
  (
    'Automower® 310E NERA', 'automower-310e-nera', 'Husqvarna', 1500, 35,
    'Kanttråd, kan oppgraderes til kabelfri (EPOS)',
    'Robust valg for større, kuperte plener med hindringer.',
    60, true
  ),
  (
    'Automower® 410VE NERA', 'automower-410ve-nera', 'Husqvarna', 1500, 35,
    'Kabelfri – virtuell grense',
    'Systematisk klipping i store hager uten tråd i plenen.',
    70, true
  ),
  (
    'Automower® 320 NERA', 'automower-320-nera', 'Husqvarna', 3300, 45,
    'Kanttråd, kan oppgraderes til kabelfri (EPOS)',
    'Kraftig modell som takler bratte partier og krevende terreng.',
    80, true
  ),
  (
    'Automower® 430V NERA', 'automower-430v-nera', 'Husqvarna', 4800, 45,
    'Kabelfri – virtuell grense',
    'Toppmodell for store eiendommer, bakker og flere klippesoner.',
    90, true
  )
on conflict (slug) do update set
  title = excluded.title,
  brand = excluded.brand,
  max_area = excluded.max_area,
  max_slope = excluded.max_slope,
  boundary = excluded.boundary,
  short_description = excluded.short_description,
  "order" = excluded."order",
  active = excluded.active,
  updated_at = now();

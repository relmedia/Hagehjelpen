import { getSupabaseReadClient } from "./supabase";

export type Testimonial = {
  quote: string;
  name: string;
  location: string | null;
  service: string | null;
  /** Antall stjerner, 1–5. */
  rating: number;
};

/** Brukes hvis Supabase ikke er satt opp eller ikke svarer – samme innhold som
 *  `supabase/seed-testimonials.sql`. */
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Vi hadde prøvd å sette opp klipperen selv og ga opp etter to helger. Hagehjelpen var ferdig på en formiddag, og plenen har vært perfekt siden.",
    name: "Marius H.",
    location: "Sola",
    service: "Installasjon, 1200 m²",
    rating: 5,
  },
  {
    quote:
      "Grundig gjennomgang av hagen før de begynte, og de forklarte hvordan alt fungerte etterpå. Kom tilbake og justerte kanttråden uten ekstra kostnad.",
    name: "Ingrid B.",
    location: "Stavanger",
    service: "Installasjon, 700 m²",
    rating: 5,
  },
  {
    quote:
      "Klipperen kjørte seg fast i den samme bakken hver dag. De fant feilen med én gang og flyttet ladestasjonen. Rask og ryddig service.",
    name: "Tore K.",
    location: "Sandnes",
    service: "Feilsøking",
    rating: 5,
  },
  {
    quote:
      "Hagen vår har flere nivåer og mange blomsterbed. De satte opp en kabelfri løsning med virtuelle grenser, og viste oss hvordan vi selv kan justere dem i appen etterpå.",
    name: "Kari-Anne S.",
    location: "Randaberg",
    service: "Installasjon, 1800 m²",
    rating: 5,
  },
  {
    quote:
      "Befaringen var helt uforpliktende, akkurat som lovet. Vi fikk et skriftlig tilbud samme uke, med alt spesifisert – ingen overraskelser da regningen kom.",
    name: "Per Olav T.",
    location: "Bryne",
    service: "Befaring",
    rating: 5,
  },
  {
    quote:
      "Bestilte årlig service etter to sesonger. De byttet kniver, rengjorde sensorene og justerte ladestasjonen. Klipperen går som ny igjen.",
    name: "Hilde M.",
    location: "Stavanger",
    service: "Service, årlig sjekk",
    rating: 5,
  },
  {
    quote:
      "Installasjonen tok litt lengre tid enn avtalt fordi hagen var mer kronglete enn ventet, men de sto på til alt satt som det skulle og ga oss rabatt for ventetiden.",
    name: "Øyvind L.",
    location: "Sola",
    service: "Installasjon, 450 m²",
    rating: 4,
  },
  {
    quote:
      "Stor hage med mange hindre og to soner som måtte kobles sammen. Grundig planlegging på befaringen gjorde at selve installasjonen gikk overraskende raskt.",
    name: "Anne Grete F.",
    location: "Kvernaland",
    service: "Installasjon, 2400 m²",
    rating: 5,
  },
  {
    quote:
      "Klipperen mistet kontakten med ladestasjonen i samme hjørne av plenen hver gang. De fant en løs kontakt i kabelen på under en halvtime og fikset det på stedet.",
    name: "Jon Arne D.",
    location: "Randaberg",
    service: "Feilsøking",
    rating: 5,
  },
];

type TestimonialRow = {
  name: string;
  place: string | null;
  quote: string;
  service: string | null;
  rating: number | null;
};

/** Kundeomtalene på forsiden, hentet fra dashbordet. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return FALLBACK_TESTIMONIALS;

  const { data, error } = await supabase
    .from("testimonials")
    .select("name, place, quote, service, rating")
    .eq("published", true)
    .order("order", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK_TESTIMONIALS;

  return (data as TestimonialRow[]).map((row) => ({
    quote: row.quote,
    name: row.name,
    location: row.place,
    service: row.service,
    rating: row.rating ?? 5,
  }));
}

import { getSupabaseReadClient } from "./supabase";

export type FaqLink = { href: string; label: string };

export type FaqItem = {
  question: string;
  answer: string;
  link: FaqLink | null;
};

/** Noen svar peker videre til verktøyene på siden. Lenken styres av kategorien
 *  på spørsmålet, slik at den kan endres i dashbordet uten å røre koden.
 *  Kategorier som ikke står her gir et svar uten lenke. */
const CATEGORY_LINKS: Record<string, FaqLink> = {
  pris: { href: "#kalkulator", label: "Gå til prisberegneren" },
  modell: { href: "#velg-klipper", label: "Se hvilken modell som passer" },
  feilsoking: { href: "#feilsoking", label: "Se feilsøking" },
  dekning: { href: "#kalkulator", label: "Sjekk postnummeret ditt" },
};

/** Brukes hvis Supabase ikke er satt opp eller ikke svarer – samme innhold som
 *  `supabase/seed-faq-items.sql`. */
const FALLBACK_FAQS: FaqItem[] = [
  {
    question: "Hva koster det å få installert en robotgressklipper?",
    answer:
      "Installasjon koster fra 4 000 kr eks. mva for plener opptil 1000 m², 6 750 kr for 1000–2000 m² og 9 250 kr for plener over 2000 m². Innramming av mer enn to øyer og kjøring utover 15 km kommer i tillegg. Bruk prisberegneren over for et estimat på din hage.",
    link: CATEGORY_LINKS.pris,
  },
  {
    question: "Hvor lang tid tar selve installasjonen?",
    answer:
      "En vanlig villahage tar som regel noen timer. Store eller oppdelte hager med flere soner kan ta en hel dag. Vi går gjennom eiendommen sammen med deg før vi begynner, og du får beskjed hvis noe tar lengre tid enn planlagt.",
    link: null,
  },
  {
    question: "Må jeg ha kanttråd, eller finnes det kabelfrie løsninger?",
    answer:
      "Begge deler fungerer. Kanttråd er en trygg og rimelig løsning som passer i de fleste hager. Nyere modeller kan i stedet bruke virtuell grense, der klipperen navigerer med satellittsignal og en referansestasjon. Vi anbefaler løsningen som passer hagen din best.",
    link: CATEGORY_LINKS.modell,
  },
  {
    question: "Klarer klipperen bakker og skråninger?",
    answer:
      "Ja. Enklere modeller håndterer moderate skråninger, mens de kraftigere modellene tar bratte partier. Hvor bratt terrenget er, er en av de viktigste faktorene når vi velger modell, og vi måler det på befaringen.",
    link: null,
  },
  {
    question: "Er det trygt med barn og dyr i hagen?",
    answer:
      "Robotklipperne har løftesensor og kollisjonssensor som stopper knivene umiddelbart, i tillegg til stoppknapp og PIN-kode. Vi anbefaler likevel å sette klippetiden til tidspunkt der hagen ikke er i bruk, og å plukke opp leker og gjenstander før klipperen kjører.",
    link: null,
  },
  {
    question: "Klipper roboten når det regner?",
    answer:
      "De aller fleste modeller tåler regn fint og kan klippe i all slags vær. Ønsker du at den skal stå over de våteste dagene, setter vi opp klippeplanen slik at den tilpasser seg været.",
    link: null,
  },
  {
    question: "Trenger jeg strøm ute i hagen?",
    answer:
      "Ladestasjonen må ha et 230 V uttak i nærheten. Vi plasserer stasjonen der den fungerer best for klipperen, men montering av selve strømuttaket og kabelen er ikke inkludert i installasjonen – det må gjøres av elektriker.",
    link: null,
  },
  {
    question: "Hva gjør jeg hvis klipperen stopper eller går seg fast?",
    answer:
      "Mange feil løser seg med enkle grep, som å rengjøre sensorer eller justere klippehøyden. Vi har samlet de vanligste feilene og løsningene på siden, og innen to uker etter installasjon kommer vi tilbake og justerer uten ekstra kostnad. Blir den stående, ordner vi feilsøking på stedet.",
    link: CATEGORY_LINKS.feilsoking,
  },
  {
    question: "Hvilke områder dekker dere?",
    answer:
      "Vi holder til på Ræge og jobber daglig i Sola, Stavanger, Sandnes og Randaberg. Vi kjører også til resten av Jæren, men da kan det komme et kjøretillegg på 5 kr per km utover de første 15 kilometerne.",
    link: CATEGORY_LINKS.dekning,
  },
];

type FaqRow = {
  question: string;
  answer: string;
  category: string | null;
};

/** Spørsmålene i FAQ-seksjonen, hentet fra dashbordet. */
export async function getFaqItems(): Promise<FaqItem[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return FALLBACK_FAQS;

  const { data, error } = await supabase
    .from("faq_items")
    .select("question, answer, category")
    .eq("published", true)
    .order("order", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK_FAQS;

  return (data as FaqRow[]).map((row) => ({
    question: row.question,
    answer: row.answer,
    link: (row.category && CATEGORY_LINKS[row.category.toLowerCase()]) || null,
  }));
}

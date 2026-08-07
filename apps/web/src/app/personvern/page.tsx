import type { Metadata } from "next";
import Link from "next/link";
import { ConsentSettingsButton } from "@/components/ConsentSettingsButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Personvern og informasjonskapsler – Hagehjelpen",
  description:
    "Hvilke opplysninger Hagehjelpen samler inn, hva vi bruker dem til, hvor lenge vi lagrer dem og hvilke rettigheter du har.",
};

const SIST_OPPDATERT = "7. august 2026";

const LAGRING = [
  {
    navn: "hh-samtykke",
    type: "Informasjonskapsel",
    varighet: "12 måneder",
    kategori: "Nødvendig",
    formal: "Husker hva du har svart på spørsmålet om informasjonskapsler.",
  },
  {
    navn: "contact-prefill",
    type: "sessionStorage",
    varighet: "Til du lukker fanen",
    kategori: "Nødvendig",
    formal:
      "Tar med seg plenstørrelse og modell fra prisberegneren til kontaktskjemaet.",
  },
  {
    navn: "Cloudflare Turnstile",
    type: "Informasjonskapsel og lokal lagring",
    varighet: "Inntil 30 minutter",
    kategori: "Nødvendig",
    formal:
      "Skiller mennesker fra roboter i kontaktskjemaet, slik at vi slipper søppelhenvendelser.",
  },
  {
    navn: "hh-session",
    type: "sessionStorage",
    varighet: "Til du lukker fanen",
    kategori: "Statistikk",
    formal:
      "Gir besøket et tilfeldig nummer, slik at samme besøk ikke telles flere ganger.",
  },
] as const;

const UNDERLEVERANDORER = [
  { navn: "Vercel", rolle: "Drift av nettsiden" },
  { navn: "Supabase", rolle: "Database for henvendelser og statistikk" },
  { navn: "Resend", rolle: "Utsending av e-post" },
  { navn: "Cloudflare", rolle: "Robotsjekk i kontaktskjemaet" },
  { navn: "Norkart", rolle: "Flyfoto i plenmåleren" },
  { navn: "Kartverket (Geonorge)", rolle: "Adressesøk i prisberegneren" },
] as const;

const RETTIGHETER = [
  "Innsyn i hvilke opplysninger vi har om deg",
  "Retting av opplysninger som er feil eller ufullstendige",
  "Sletting av opplysninger vi ikke lenger trenger",
  "Begrensning av hvordan vi bruker opplysningene",
  "Å protestere mot behandlingen",
  "Å få opplysningene utlevert i et maskinlesbart format",
  "Å trekke tilbake et samtykke du har gitt",
] as const;

export default function Personvern() {
  return (
    <>
      <Header solid />

      <main className="bg-cream pb-24 pt-32 sm:pt-36">
        <article className="mx-auto max-w-3xl px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Personvern
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Personvern og informasjonskapsler
          </h1>
          <p className="mt-4 text-ink-soft">
            Her forklarer vi hvilke opplysninger vi samler inn når du bruker
            hagehjelpen.no, hva vi bruker dem til og hvilke valg du har. Sist
            oppdatert {SIST_OPPDATERT}.
          </p>

          <Seksjon tittel="Hvem er ansvarlig">
            <p>
              Hagehjelpen er ansvarlig for opplysningene som samles inn gjennom
              denne nettsiden. Har du spørsmål om personvern, eller vil du bruke
              rettighetene dine, tar du kontakt med oss:
            </p>
            <ul className="mt-4 space-y-1.5">
              <li>
                E-post:{" "}
                <a
                  href="mailto:post@hagehjelpen.no"
                  className="font-medium text-leaf-700 underline underline-offset-2"
                >
                  post@hagehjelpen.no
                </a>
              </li>
              <li>
                Telefon:{" "}
                <a
                  href="tel:+4741446371"
                  className="font-medium text-leaf-700 underline underline-offset-2"
                >
                  +47 414 46 371
                </a>
              </li>
              <li>Adresse: Ølbergvegen 101, 4053 Ræge</li>
            </ul>
          </Seksjon>

          <Seksjon tittel="Når du sender oss en henvendelse">
            <p>
              Bruker du kontaktskjemaet, lagrer vi navnet, telefonnummeret og
              e-postadressen din sammen med det du forteller om hagen: hvilken
              tjeneste du trenger, plenstørrelse, modell, meldingen din og
              eventuelle bilder du legger ved.
            </p>
            <p>
              Vi bruker opplysningene til å svare deg, gi et tilbud og
              gjennomføre oppdraget. Det rettslige grunnlaget er at behandlingen
              er nødvendig for å inngå eller oppfylle en avtale med deg, jf.
              personvernforordningen artikkel 6 nr. 1 bokstav b.
            </p>
            <p>
              Henvendelser som ikke fører til et oppdrag, sletter vi etter tolv
              måneder. Blir det et oppdrag, oppbevarer vi det som kreves av
              bokføringsloven i fem år etter regnskapsårets slutt.
            </p>
          </Seksjon>

          <Seksjon tittel="Når du bestiller befaring">
            <p>
              Bestiller du en befaring i kalenderen, lagrer vi navnet ditt,
              telefonnummeret, e-postadressen og adressen vi skal komme til,
              sammen med tidspunktet du valgte. Plenareal og melding er
              frivillig.
            </p>
            <p>
              Vi bruker opplysningene til å gjennomføre befaringen og gi deg et
              tilbud. Det rettslige grunnlaget er det samme som over: at
              behandlingen er nødvendig for å inngå en avtale med deg.
            </p>
            <p>
              Du får en e-post med en lenke du kan avbestille med når du vil.
              Avbestilte og gjennomførte befaringer sletter vi etter tolv
              måneder, med mindre de fører til et oppdrag vi må bokføre.
            </p>
          </Seksjon>

          <Seksjon tittel="Hva vi lagrer i nettleseren din">
            <p>
              Nødvendig lagring trenger vi for at siden skal fungere, og den kan
              du ikke slå av. Alt annet er avslått til du sier ja.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-xl border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-leaf-200 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="py-3 pr-4 font-semibold">Navn</th>
                    <th className="py-3 pr-4 font-semibold">Type</th>
                    <th className="py-3 pr-4 font-semibold">Varighet</th>
                    <th className="py-3 font-semibold">Formål</th>
                  </tr>
                </thead>
                <tbody>
                  {LAGRING.map((rad) => (
                    <tr key={rad.navn} className="border-b border-leaf-100 align-top">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-ink">{rad.navn}</span>
                        <span className="mt-1 block text-xs text-leaf-700">
                          {rad.kategori}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink-soft">{rad.type}</td>
                      <td className="py-3 pr-4 text-ink-soft">{rad.varighet}</td>
                      <td className="py-3 text-ink-soft">{rad.formal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6">
              <ConsentSettingsButton className="rounded-full bg-leaf-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600">
                Endre samtykket ditt
              </ConsentSettingsButton>
            </p>
          </Seksjon>

          <Seksjon tittel="Statistikk over besøket">
            <p>
              Sier du ja til statistikk, teller vi hvor mange som besøker siden,
              hvor langt ned folk kommer og om verktøyene blir brukt. Det hjelper
              oss å se hva som er nyttig og hva vi bør forbedre.
            </p>
            <p>
              Vi bruker ingen målingstjeneste fra andre, og vi lagrer verken
              IP-adressen eller informasjonskapsler til dette. Besøkende
              identifiseres med en kryptografisk kode som regnes ut av
              IP-adressen, nettleseren og dagens dato. Koden byttes hvert døgn og
              kan ikke regnes tilbake til en person. I tillegg lagrer vi land og
              by fra nettverket, samt hvilket nettsted du eventuelt kom fra.
            </p>
          </Seksjon>

          <Seksjon tittel="Kart og adressesøk">
            <p>
              Plenmåleren henter flyfoto fra Norkart, og adressesøket i
              prisberegneren spør Kartverket. Begge skjer først når du selv tar
              verktøyet i bruk, og de får bare vite hvilket område du ser på.
            </p>
            <p>
              Ellers bruker vi verken annonsenettverk, sporingspiksler eller
              innhold fra sosiale medier, og ingenting fra andre lastes inn av
              seg selv når du åpner siden.
            </p>
          </Seksjon>

          <Seksjon tittel="Hvem vi deler opplysninger med">
            <p>
              Vi selger aldri opplysninger videre. For å drive nettsiden bruker
              vi disse leverandørene, som behandler opplysninger på våre vegne:
            </p>
            <ul className="mt-4 space-y-1.5">
              {UNDERLEVERANDORER.map((leverandor) => (
                <li key={leverandor.navn}>
                  <span className="font-medium text-ink">{leverandor.navn}</span>{" "}
                  – {leverandor.rolle}
                </li>
              ))}
            </ul>
          </Seksjon>

          <Seksjon tittel="Rettighetene dine">
            <p>Du har rett til:</p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5">
              {RETTIGHETER.map((rettighet) => (
                <li key={rettighet}>{rettighet}</li>
              ))}
            </ul>
            <p className="mt-4">
              Ta kontakt på{" "}
              <a
                href="mailto:post@hagehjelpen.no"
                className="font-medium text-leaf-700 underline underline-offset-2"
              >
                post@hagehjelpen.no
              </a>{" "}
              , så svarer vi så raskt vi kan og senest innen en måned. Mener du
              at vi behandler opplysningene dine feil, kan du klage til
              Datatilsynet.
            </p>
          </Seksjon>

          <Seksjon tittel="Endringer">
            <p>
              Endrer vi hvordan vi bruker opplysninger, oppdaterer vi denne
              siden. Gjelder endringen noe du har samtykket til, spør vi deg på
              nytt.
            </p>
            <p className="mt-6">
              <Link
                href="/"
                className="font-medium text-leaf-700 underline underline-offset-2"
              >
                Tilbake til forsiden
              </Link>
            </p>
          </Seksjon>
        </article>
      </main>

      <Footer />
    </>
  );
}

function Seksjon({
  tittel,
  children,
}: {
  readonly tittel: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-leaf-100 pt-10">
      <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
        {tittel}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

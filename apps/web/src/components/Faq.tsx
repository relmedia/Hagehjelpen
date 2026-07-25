"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Hva koster det å få installert en robotgressklipper?",
    answer:
      "Installasjon koster fra 4 000 kr eks. mva for plener opptil 1000 m², 6 750 kr for 1000–2000 m² og 9 250 kr for plener over 2000 m². Innramming av mer enn to øyer og kjøring utover 15 km kommer i tillegg. Bruk prisberegneren over for et estimat på din hage.",
    link: { href: "#kalkulator", label: "Gå til prisberegneren" },
  },
  {
    question: "Hvor lang tid tar selve installasjonen?",
    answer:
      "En vanlig villahage tar som regel noen timer. Store eller oppdelte hager med flere soner kan ta en hel dag. Vi går gjennom eiendommen sammen med deg før vi begynner, og du får beskjed hvis noe tar lengre tid enn planlagt.",
  },
  {
    question: "Må jeg ha kanttråd, eller finnes det kabelfrie løsninger?",
    answer:
      "Begge deler fungerer. Kanttråd er en trygg og rimelig løsning som passer i de fleste hager. Nyere modeller kan i stedet bruke virtuell grense, der klipperen navigerer med satellittsignal og en referansestasjon. Vi anbefaler løsningen som passer hagen din best.",
    link: { href: "#velg-klipper", label: "Se hvilken modell som passer" },
  },
  {
    question: "Klarer klipperen bakker og skråninger?",
    answer:
      "Ja. Enklere modeller håndterer moderate skråninger, mens de kraftigere modellene tar bratte partier. Hvor bratt terrenget er, er en av de viktigste faktorene når vi velger modell, og vi måler det på befaringen.",
  },
  {
    question: "Er det trygt med barn og dyr i hagen?",
    answer:
      "Robotklipperne har løftesensor og kollisjonssensor som stopper knivene umiddelbart, i tillegg til stoppknapp og PIN-kode. Vi anbefaler likevel å sette klippetiden til tidspunkt der hagen ikke er i bruk, og å plukke opp leker og gjenstander før klipperen kjører.",
  },
  {
    question: "Klipper roboten når det regner?",
    answer:
      "De aller fleste modeller tåler regn fint og kan klippe i all slags vær. Ønsker du at den skal stå over de våteste dagene, setter vi opp klippeplanen slik at den tilpasser seg været.",
  },
  {
    question: "Trenger jeg strøm ute i hagen?",
    answer:
      "Ladestasjonen må ha et 230 V uttak i nærheten. Vi plasserer stasjonen der den fungerer best for klipperen, men montering av selve strømuttaket og kabelen er ikke inkludert i installasjonen – det må gjøres av elektriker.",
  },
  {
    question: "Hva gjør jeg hvis klipperen stopper eller går seg fast?",
    answer:
      "Mange feil løser seg med enkle grep, som å rengjøre sensorer eller justere klippehøyden. Vi har samlet de vanligste feilene og løsningene på siden, og innen to uker etter installasjon kommer vi tilbake og justerer uten ekstra kostnad. Blir den stående, ordner vi feilsøking på stedet.",
    link: { href: "#feilsoking", label: "Se feilsøking" },
  },
  {
    question: "Hvilke områder dekker dere?",
    answer:
      "Vi holder til på Ræge og jobber daglig i Sola, Stavanger, Sandnes og Randaberg. Vi kjører også til resten av Jæren, men da kan det komme et kjøretillegg på 5 kr per km utover de første 15 kilometerne.",
    link: { href: "#kalkulator", label: "Sjekk postnummeret ditt" },
  },
] as const;

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".faq-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      gsap.fromTo(
        ".faq-list",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: ".faq-list", start: "top 88%" },
        },
      );
    },
    { scope: sectionRef },
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section id="faq" ref={sectionRef} className="bg-white py-24 sm:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-4xl px-5">
        <div className="faq-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Spørsmål og svar
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Det kundene lurer mest på
          </h2>
          <p className="mt-4 text-ink-soft">
            Finner du ikke svaret? Ring oss på 414 46 371, så tar vi en prat om
            hagen din.
          </p>
        </div>

        <div className="faq-list gsap-reveal mt-14">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{item.answer}</p>
                  {"link" in item && item.link && (
                    <a
                      href={item.link.href}
                      className="mt-3 inline-flex items-center gap-1.5 font-semibold text-leaf-700 transition-colors hover:text-leaf-800"
                    >
                      {item.link.label}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

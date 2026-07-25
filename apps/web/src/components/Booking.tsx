"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Sett NEXT_PUBLIC_CAL_LINK til «brukernavn/arrangement» fra Cal.com for å
 *  vise kalenderen. Uten variabelen viser vi hvordan man booker manuelt. */
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

const STEPS = [
  {
    title: "Velg et tidspunkt",
    text: "Vi bruker 20–30 minutter på å gå gjennom hagen og hva du ønsker deg.",
  },
  {
    title: "Vi måler opp",
    text: "Vi ser på plenareal, høydeforskjeller, hindringer og hvor ladestasjonen kan stå.",
  },
  {
    title: "Du får et fastpristilbud",
    text: "Tilbudet er skriftlig og uforpliktende, og du vet nøyaktig hva som er inkludert.",
  },
] as const;

export function Booking() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".booking-heading",
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
        ".booking-panel",
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".booking-panel", start: "top 88%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="befaring" ref={sectionRef} className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="booking-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Befaring
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Bestill en gratis befaring
          </h2>
          <p className="mt-4 text-ink-soft">
            Vi kommer hjem til deg, ser på hagen og gir deg et uforpliktende
            tilbud på installasjonen.
          </p>
        </div>

        <div className="booking-panel gsap-reveal mt-14 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-leaf-100 bg-white p-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-display text-sm font-bold text-leaf-700">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-display font-semibold text-ink">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {step.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {CAL_LINK ? (
            <div className="overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-xl shadow-leaf-900/5">
              <iframe
                src={`https://cal.com/${CAL_LINK}?embed=true&layout=month_view&theme=light`}
                title="Bestill befaring med Hagehjelpen"
                loading="lazy"
                className="h-[680px] w-full border-0"
              />
            </div>
          ) : (
            <div className="flex flex-col justify-center rounded-3xl border border-leaf-100 bg-white p-8 shadow-xl shadow-leaf-900/5 sm:p-10">
              <h3 className="font-display text-2xl font-bold text-ink">
                Avtal tid direkte med oss
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Ring eller send skjemaet, så finner vi et tidspunkt som passer –
                også på kveldstid og i helgene. Vi svarer normalt innen 24 timer.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="tel:+4741446371"
                  className="rounded-full bg-leaf-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
                >
                  Ring 414 46 371
                </a>
                <a
                  href="#kontakt"
                  className="rounded-full border border-leaf-200 bg-white px-7 py-3.5 text-sm font-semibold text-leaf-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
                >
                  Send forespørsel
                </a>
              </div>

              <p className="mt-7 border-t border-leaf-100 pt-6 text-xs leading-relaxed text-ink-soft/70">
                Online booking er på vei. Legg inn Cal.com-lenken i
                miljøvariabelen NEXT_PUBLIC_CAL_LINK for å vise kalenderen her.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

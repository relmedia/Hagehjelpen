"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  {
    title: "Befaring og rådgivning",
    text: "Vi kommer hjem til deg, ser på hagen og anbefaler klipperen som passer best til størrelsen og formen på plenen din.",
  },
  {
    title: "Tilbud og planlegging",
    text: "Du får et tydelig estimat på pris og tidsbruk basert på eiendommens størrelse og hvor komplisert den er.",
  },
  {
    title: "Profesjonell installasjon",
    text: "Erfaren montør setter opp ladestasjon, definerer klippeområdet og konfigurerer klipperen for din hage.",
  },
  {
    title: "Perfekt plen – helt av seg selv",
    text: "Klipperen jobber stille i bakgrunnen og lader seg selv. Du nyter en nyklipt plen hver eneste dag.",
  },
];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".process-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      // Den vertikale linjen tegnes i takt med scrollingen
      gsap.fromTo(
        ".process-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".process-list",
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".process-step").forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 78%" },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="slik-fungerer-det"
      ref={sectionRef}
      className="py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="process-heading gsap-reveal max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Slik fungerer det
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Fra befaring til nyklipt plen på fire steg
          </h2>
        </div>

        <div className="process-list relative mt-16">
          {/* Bakgrunnslinje + animert linje */}
          <div className="absolute bottom-6 left-6 top-6 hidden w-px bg-leaf-100 sm:block" />
          <div className="process-line absolute bottom-6 left-6 top-6 hidden w-px origin-top bg-leaf-500 sm:block" />

          <ol className="space-y-12">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="process-step gsap-reveal relative flex gap-6 sm:gap-10"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-leaf-500 font-display text-lg font-bold text-white shadow-lg shadow-leaf-500/30">
                  {index + 1}
                </div>
                <div className="max-w-xl pt-1.5">
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

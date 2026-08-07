"use client";

import { useRef } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  {
    title: "Velg et tidspunkt",
    text: "Du ser hvilke dager vi er i området, og velger den timen som passer deg best.",
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

          <BookingCalendar />
        </div>
      </div>
    </section>
  );
}

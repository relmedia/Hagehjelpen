"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const ISSUES = [
  {
    title: "Batteriproblemer",
    text: "Lader ikke klipperen? Sjekk tilkoblinger og ladestasjon. Vi finner om det er kontakt, kabel eller batteri som må byttes.",
    icon: (
      <>
        <rect x="2" y="7" width="18" height="12" rx="2" />
        <path d="M22 11v4" strokeLinecap="round" />
        <path d="M6 11h4M6 15h8" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Sensorfeil",
    text: "Sensorer styrer navigasjonen. Vi rengjør, kalibrerer og tester dem slik at klipperen finner veien trygt igjen.",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    title: "Kutteproblemer",
    text: "Slitte eller skadde kniver gir dårlig klipp. Vi bytter kniver og sjekker at klipperen kutter jevnt over hele plenen.",
    icon: (
      <path
        d="M4 20c4-8 8-12 16-16M8 16l2 2M14 10l2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Programvareoppdateringer",
    text: "Feil kan skyldes utdatert firmware. Vi oppdaterer programvaren og kontrollerer at alt fungerer som det skal.",
    icon: (
      <>
        <path d="M12 3v3M12 18v3" strokeLinecap="round" />
        <path
          d="M6.5 6.5 8.6 8.6M15.4 15.4l2.1 2.1M3 12h3M18 12h3M6.5 17.5l2.1-2.1M15.4 8.6l2.1-2.1"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
  },
];

export function Feilsoking() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".feilsoking-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      ScrollTrigger.batch(".feilsoking-card", {
        start: "top 85%",
        once: true,
        onEnter: (cards) =>
          gsap.fromTo(
            cards,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
              overwrite: true,
            },
          ),
      });

      gsap.fromTo(
        ".feilsoking-cta",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".feilsoking-cta", start: "top 85%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="feilsoking"
      ref={sectionRef}
      className="border-y border-leaf-100 bg-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="feilsoking-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Feilsøking
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Få robotgressklipperen i gang igjen
          </h2>
          <p className="mt-4 text-ink-soft">
            Har klipperen stoppet opp eller viser feil? Våre teknikere hjelper
            deg med lading, sensorer, kniver og programvare – raskt og
            pålitelig.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {ISSUES.map((issue) => (
            <article
              key={issue.title}
              className="feilsoking-card gsap-reveal rounded-2xl border border-leaf-100 bg-cream p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-800 text-leaf-200">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  {issue.icon}
                </svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {issue.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {issue.text}
              </p>
            </article>
          ))}
        </div>

        <div className="feilsoking-cta gsap-reveal mt-14 rounded-3xl bg-gradient-to-br from-leaf-800 to-leaf-950 px-8 py-10 text-white shadow-xl shadow-leaf-900/20 sm:px-12 sm:py-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h3 className="font-display text-2xl font-semibold">
                Kontakt oss – vi er her for å hjelpe
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-leaf-100/85">
                Ring, send e-post eller bruk kontaktskjemaet nedenfor. Vi tar
                oss av feilsøkingen og får klipperen tilbake på jobb så raskt
                som mulig.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href="tel:+4741446371"
                className="inline-flex items-center justify-center rounded-full bg-leaf-400 px-6 py-3.5 text-sm font-semibold text-leaf-950 transition-colors hover:bg-leaf-300"
              >
                Ring +47 414 46 371
              </a>
              <a
                href="#kontakt"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Gå til kontakt
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

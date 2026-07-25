"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function Cta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".cta-panel",
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="kontakt" ref={sectionRef} className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="cta-panel gsap-reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-500 to-leaf-700 px-8 py-16 text-center text-white shadow-2xl shadow-leaf-700/30 sm:px-16 sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-leaf-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-leaf-900/25 blur-3xl" />

          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            Trenger du hjelp med din robotgressklipper?
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-leaf-50/90">
            Kontakt oss for mer informasjon, eller be om en uforpliktende
            befaring. Vi hjelper deg med å finne riktig elektrisk klipper til
            din hage.
          </p>
          <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:post@hagehjelpen.no"
              className="rounded-full bg-white px-8 py-4 font-semibold text-leaf-700 shadow-lg transition-transform hover:scale-105"
            >
              Kontakt oss
            </a>
            <a
              href="tel:+4700000000"
              className="rounded-full border border-white/40 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Ring oss
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

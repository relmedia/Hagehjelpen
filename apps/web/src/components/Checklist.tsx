"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const CHECKLIST = [
  {
    title: "Utendørs strømuttak",
    text: "Pass på at det finnes strømuttak tilgjengelig der du ønsker ladestasjonen plassert.",
  },
  {
    title: "Nyklipt gress før montering",
    text: "Gresset bør være klippet på forhånd, slik at robotklipperen får optimale forhold fra start.",
  },
  {
    title: "Ryddig og jevnt underlag",
    text: "Fjern eventuelle hindringer og ujevnheter i plenen før montøren kommer.",
  },
];

export function Checklist() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".checklist-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );

      gsap.fromTo(
        ".checklist-item",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".checklist-items", start: "top 75%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="huskeliste"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-leaf-950 to-leaf-800 py-24 text-white sm:py-32"
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-leaf-400/15 blur-3xl" />

      <div className="mx-auto max-w-6xl px-5">
        <div className="checklist-heading gsap-reveal max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-300">
            Huskeliste
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Før montering av robotklipper
          </h2>
          <p className="mt-4 text-leaf-100/80">
            Tre enkle forberedelser som gjør installasjonen rask og problemfri.
          </p>
        </div>

        <div className="checklist-items mt-14 grid gap-6 md:grid-cols-3">
          {CHECKLIST.map((item) => (
            <div
              key={item.title}
              className="checklist-item gsap-reveal rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-400 text-leaf-950">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="m5 13 4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-leaf-100/75">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <a
          href="#kontakt"
          className="checklist-item gsap-reveal mt-12 inline-block rounded-full bg-leaf-400 px-8 py-4 font-semibold text-leaf-950 shadow-xl shadow-leaf-400/20 transition-colors hover:bg-leaf-300"
        >
          Be om befaring
        </a>
      </div>
    </section>
  );
}

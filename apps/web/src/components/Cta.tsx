"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ContactForm } from "./ContactForm";

const CONTACT_ITEMS = [
  {
    label: "Telefon",
    value: "+47 414 46 371",
    href: "tel:+4741446371",
  },
  {
    label: "E-post",
    value: "post@hagehjelpen.no",
    href: "mailto:post@hagehjelpen.no",
  },
  {
    label: "Adresse",
    value: "Ølbergvegen 101, 4053 Ræge",
    href: "https://www.google.com/maps/search/?api=1&query=%C3%98lbergvegen%20101%2C%204053%20R%C3%A6ge",
  },
];

export function Cta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".cta-heading",
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
        ".cta-grid",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".cta-grid", start: "top 80%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section id="kontakt" ref={sectionRef} className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="cta-heading gsap-reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Kontakt
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Kontakt oss for hjelp med installasjon eller feilsøking
          </h2>
          <p className="mt-4 text-ink-soft">
            Fyll ut skjemaet, så tar vi kontakt innen 24 timer. Du kan også
            ringe eller sende e-post direkte.
          </p>
        </div>

        <div className="cta-grid gsap-reveal mt-14 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-leaf-100 bg-white p-8 shadow-xl shadow-leaf-900/5 sm:p-10">
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-leaf-500 to-leaf-700 p-8 text-white shadow-xl shadow-leaf-700/25">
              <h3 className="font-display text-xl font-semibold">
                Kontaktinformasjon
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-leaf-50/90">
                Vi hjelper deg med befaring, installasjon og feilsøking av
                robotgressklippere i Rogaland.
              </p>
              <ul className="mt-6 space-y-4">
                {CONTACT_ITEMS.map((item) => (
                  <li key={item.label}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-leaf-100/70">
                      {item.label}
                    </p>
                    <a
                      href={item.href}
                      target={item.label === "Adresse" ? "_blank" : undefined}
                      rel={
                        item.label === "Adresse" ? "noopener noreferrer" : undefined
                      }
                      className="mt-1 block text-sm font-medium transition-colors hover:text-leaf-100"
                    >
                      {item.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-leaf-100 bg-cream p-6">
              <h4 className="font-display font-semibold text-ink">
                Rask hjelp ved feil?
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Beskriv problemet i skjemaet og velg «Feilsøking», eller ring
                oss direkte for raskere respons.
              </p>
              <a
                href="tel:+4741446371"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-leaf-600 transition-colors hover:text-leaf-700"
              >
                Ring nå
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14m0 0-6-6m6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

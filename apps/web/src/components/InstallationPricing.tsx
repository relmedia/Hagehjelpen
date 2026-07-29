"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { sendContactPrefill } from "@/lib/contact-prefill";
import type { PricePlan } from "@/lib/prices";

const EXCLUDED = [
  "Montering av strømuttak og kabel",
  "Fjerning av hinder i hagen før montering",
  "Utjevning av underlag",
  "Kjøring ut over 15 km: pristillegg 5 kr/km + evt. bompassering",
  "Innramming av mer enn 2 «øyer» (f.eks. blomsterbed): 250 kr/stk",
] as const;

function kr(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function InstallationPricing({ plans }: { plans: PricePlan[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".pricing-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      ScrollTrigger.batch(".pricing-card", {
        start: "top 85%",
        once: true,
        onEnter: (cards) =>
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.12,
              ease: "power3.out",
              overwrite: true,
            },
          ),
      });

      gsap.fromTo(
        ".pricing-excluded",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pricing-excluded", start: "top 88%" },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="installasjon"
      ref={sectionRef}
      className="bg-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="pricing-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Installasjon
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Priser på robotgressklipper-installasjon
          </h2>
          <p className="mt-4 text-ink-soft">
            Opplev friheten med en robotgressklipper. Vi installerer raskt og
            trygt – skreddersydd til størrelsen på plenen din.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.title}
              className={`pricing-card gsap-reveal relative flex flex-col rounded-3xl border p-8 transition-shadow ${
                plan.featured
                  ? "border-leaf-400 bg-gradient-to-b from-leaf-50 to-white shadow-xl shadow-leaf-900/10 ring-1 ring-leaf-400/40"
                  : "border-leaf-100 bg-cream hover:shadow-lg hover:shadow-leaf-900/5"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-leaf-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  Mest valgt
                </span>
              )}

              <p className="text-sm font-semibold uppercase tracking-wider text-leaf-600">
                {plan.title}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-ink">
                  {plan.price === null ? "Etter befaring" : `${kr(plan.price)},-`}
                </span>
              </div>
              {plan.price !== null && (
                <p className="mt-1 text-sm text-ink-soft">eks. mva</p>
              )}
              {plan.note && (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{plan.note}</p>
              )}

              <ul className="mt-8 flex-1 space-y-3">
                {plan.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-leaf-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M5 12l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#kontakt"
                onClick={() =>
                  sendContactPrefill({
                    service: "installasjon",
                    lawnSize: plan.lawnSize,
                  })
                }
                className={`mt-8 block rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all ${
                  plan.featured
                    ? "bg-leaf-500 text-white shadow-lg shadow-leaf-500/25 hover:bg-leaf-600"
                    : "border border-leaf-200 bg-white text-leaf-700 hover:border-leaf-400 hover:bg-leaf-50"
                }`}
              >
                Bestill installasjon
              </a>
            </article>
          ))}
        </div>

        <div className="pricing-excluded gsap-reveal mt-10 rounded-2xl border border-leaf-100 bg-cream px-6 py-7 sm:px-8">
          <h3 className="font-display text-lg font-semibold text-ink">
            Dette følger ikke med i installasjonen
          </h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {EXCLUDED.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

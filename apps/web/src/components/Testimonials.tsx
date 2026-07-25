"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Eksempelomtaler – bytt ut med ekte sitater før lansering. */
const TESTIMONIALS = [
  {
    quote:
      "Vi hadde prøvd å sette opp klipperen selv og ga opp etter to helger. Hagehjelpen var ferdig på en formiddag, og plenen har vært perfekt siden.",
    name: "Marius H.",
    location: "Sola",
    service: "Installasjon, 1200 m²",
  },
  {
    quote:
      "Grundig gjennomgang av hagen før de begynte, og de forklarte hvordan alt fungerte etterpå. Kom tilbake og justerte kanttråden uten ekstra kostnad.",
    name: "Ingrid B.",
    location: "Stavanger",
    service: "Installasjon, 700 m²",
  },
  {
    quote:
      "Klipperen kjørte seg fast i den samme bakken hver dag. De fant feilen med én gang og flyttet ladestasjonen. Rask og ryddig service.",
    name: "Tore K.",
    location: "Sandnes",
    service: "Feilsøking",
  },
] as const;

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 av 5 stjerner">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-leaf-500"
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4l1.11-6.47L2.6 9.35l6.5-.95L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".testimonial-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      ScrollTrigger.batch(".testimonial-card", {
        start: "top 88%",
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
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="omtaler"
      ref={sectionRef}
      className="bg-gradient-to-b from-cream to-leaf-50 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="testimonial-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Kundeomtaler
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Hva kundene våre sier
          </h2>
          <p className="mt-4 text-ink-soft">
            Vi jobber i hager på Nord-Jæren hver uke. Her er noen av
            tilbakemeldingene vi får.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="testimonial-card gsap-reveal flex flex-col rounded-3xl border border-leaf-100 bg-white p-8 shadow-sm"
            >
              <Stars />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">
                «{item.quote}»
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-leaf-100 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 font-display text-sm font-bold text-leaf-700">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {item.name}, {item.location}
                  </span>
                  <span className="block text-xs text-ink-soft/70">
                    {item.service}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

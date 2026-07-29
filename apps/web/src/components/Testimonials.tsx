"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Testimonial } from "@/lib/testimonials";

function Stars({ rating }: { rating: number }) {
  const filled = Math.min(Math.max(Math.round(rating), 1), 5);

  return (
    <div className="flex gap-0.5" aria-label={`${filled} av 5 stjerner`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={index < filled ? "text-leaf-500" : "text-leaf-100"}
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4l1.11-6.47L2.6 9.35l6.5-.95L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials({ items }: { items: Testimonial[] }) {
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
          {items.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="testimonial-card gsap-reveal flex flex-col rounded-3xl border border-leaf-100 bg-white p-8 shadow-sm"
            >
              <Stars rating={item.rating} />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-soft">
                «{item.quote}»
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-leaf-100 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-100 font-display text-sm font-bold text-leaf-700">
                  {item.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {item.location ? `${item.name}, ${item.location}` : item.name}
                  </span>
                  {item.service && (
                    <span className="block text-xs text-ink-soft/70">
                      {item.service}
                    </span>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

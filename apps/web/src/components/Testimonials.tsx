"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

const arrowButtonClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-leaf-200 bg-white text-ink-soft shadow-sm transition-colors hover:border-leaf-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // 8px slingringsmonn så avrunding ikke låser en knapp som ser ferdig ut.
    setCanScrollLeft(track.scrollLeft > 8);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, items.length]);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".testimonial-card");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.85;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

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
        <div className="testimonial-heading gsap-reveal flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="max-w-2xl">
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Forrige omtaler"
              className={arrowButtonClass}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Flere omtaler"
              className={arrowButtonClass}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={updateScrollState}
          role="group"
          aria-label="Kundeomtaler – bla med piltastene eller sveip"
          tabIndex={0}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 outline-none"
        >
          {items.map((item, index) => (
            <figure
              key={`${item.name}-${index}`}
              className="testimonial-card gsap-reveal flex w-[82%] shrink-0 snap-start flex-col rounded-3xl border border-leaf-100 bg-white p-8 shadow-sm sm:w-[46%] lg:w-[31%]"
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

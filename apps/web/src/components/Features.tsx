"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const FEATURES = [
  {
    title: "Helt stillegående",
    text: "Elektrisk drift gjør klipperen så stille at den kan jobbe om natten – uten å forstyrre deg eller naboene.",
    icon: (
      <path d="M12 4v16M8 8v8M4 10v4M16 8v8M20 10v4" strokeLinecap="round" />
    ),
  },
  {
    title: "Null utslipp",
    text: "Ingen bensin, ingen eksos. Robotklipperen går på strøm og lader seg selv på ladestasjonen.",
    icon: (
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Styr alt fra mobilen",
    text: "Start, stopp og planlegg klippingen fra appen – uansett hvor du er.",
    icon: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Klipper i all slags vær",
    text: "Moderne robotklippere jobber trygt i både regn og solskinn, dag etter dag.",
    icon: (
      <path
        d="M17 18a4 4 0 0 0 0-8 6 6 0 0 0-11.3-1A4.5 4.5 0 0 0 6.5 18H17ZM9 21l1-2m3 2 1-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Tettere og grønnere plen",
    text: "Hyppig klipping med skarpe kniver gir en jevn, tett og frodig plen uten gressavklipp å rake.",
    icon: (
      <path
        d="M12 21v-8m0 0c0-4 3-7 7-7-1 4-3 7-7 7Zm0 0c0-4-3-7-7-7 1 4 3 7 7 7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Trygg og sikker drift",
    text: "Innebygde sensorer stopper knivene ved løft og styrer klipperen rundt hindringer.",
    icon: (
      <path
        d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Zm-3 9 2 2 4-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".features-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      // Kortene animeres inn i puljer etter hvert som de kommer til syne
      ScrollTrigger.batch(".feature-card", {
        start: "top 85%",
        once: true,
        onEnter: (cards) =>
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true },
          ),
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="fordeler" ref={sectionRef} className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="features-heading gsap-reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Fordeler
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Hvorfor velge en elektrisk robotgressklipper?
          </h2>
          <p className="mt-4 text-ink-soft">
            Vårt mål er å gjøre vedlikehold av plenen uanstrengt og effektivt –
            for både huseiere og bedrifter.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="feature-card gsap-reveal group rounded-2xl border border-leaf-100 bg-cream p-7 transition-shadow hover:shadow-xl hover:shadow-leaf-900/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-500 text-white transition-colors group-hover:bg-leaf-600">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

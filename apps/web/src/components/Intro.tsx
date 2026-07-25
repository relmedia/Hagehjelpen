"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export function Intro() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".intro-text",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );

      gsap.fromTo(
        ".intro-card",
        { opacity: 0, x: 60, rotate: 2 },
        {
          opacity: 1,
          x: 0,
          rotate: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
          },
        },
      );

      // Rolig zoom-ut på bildet mens kortet passerer gjennom viewporten.
      // Vi holder oss over scale 1 slik at object-cover aldri slipper kantene.
      gsap.fromTo(
        ".intro-photo",
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
        <div>
          <p className="intro-text gsap-reveal text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Velkommen til Hagehjelpen
          </p>
          <h2 className="intro-text gsap-reveal mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Få robotklipperen ferdig installert av en erfaren montør – og unngå
            unødvendige problemer
          </h2>
          <p className="intro-text gsap-reveal mt-6 leading-relaxed text-ink-soft">
            Når man skal montere ny robotklipper må man gå grundig til verks.
            Ingen hager er like, derfor vil tidsbruken for montering og
            installasjon variere fra gang til gang.
          </p>
          <p className="intro-text gsap-reveal mt-4 leading-relaxed text-ink-soft">
            Om ønskelig kommer vi hjem til deg på befaring og vurderer hvilken
            elektrisk klipper du bør velge. Størrelsen på eiendommen og hvor
            komplisert den er, gir oss grunnlaget for et godt estimat på både
            pris og tidspunkt for installasjon.
          </p>
          <a
            href="#kontakt"
            className="intro-text gsap-reveal mt-8 inline-flex items-center gap-2 font-semibold text-leaf-600 transition-colors hover:text-leaf-700"
          >
            Be om befaring
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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

        <div className="intro-card gsap-reveal relative overflow-hidden rounded-3xl bg-leaf-950 shadow-2xl shadow-leaf-900/25">
          <Image
            src="/hage-installasjon.jpg"
            alt="Ferdig installert robotgressklipper som klipper plenen i en hage"
            fill
            sizes="(max-width: 1024px) 100vw, 528px"
            className="intro-photo object-cover"
          />
          {/* Mørk gradient i toppen holder teksten lesbar og lar plenen
              med klipperen stå fritt i nedre halvdel av bildet */}
          <div className="absolute inset-0 bg-gradient-to-b from-leaf-950 via-leaf-950/75 to-leaf-950/5" />
          <div className="relative p-10 pb-56 sm:pb-64">
            <p className="font-display text-xl font-semibold text-white">
              Skreddersydd for din hage
            </p>
            <p className="mt-3 text-sm leading-relaxed text-leaf-100/80">
              Vi kartlegger plenen, planlegger klippeområdet og monterer
              ladestasjonen der den fungerer best – slik at klipperen jobber
              optimalt fra dag én.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Gratis befaring", "Prisestimat", "Ferdig montert"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-leaf-400/40 bg-leaf-400/10 px-3 py-1 text-xs font-medium text-leaf-200 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

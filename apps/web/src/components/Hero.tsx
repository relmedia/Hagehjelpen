"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Mower } from "./Mower";

/**
 * Bakkelinjen som en myk bølge, så plenen ikke ligger snorrett. To sinuser med
 * ulik frekvens gjør at dumpene ikke gjentar seg like tydelig.
 */
function lawnBaseline(x: number, base: number) {
  const t = (x / 1440) * Math.PI * 2;
  return base + Math.sin(t * 3) * 7 + Math.sin(t * 7 + 1.1) * 2.2;
}

/** Deterministisk "tilfeldig" gress slik at server og klient rendrer likt. */
function buildGrassBlades(seed: number, base: number) {
  return Array.from({ length: 160 }, (_, i) => {
    const x = i * 9 + ((i * seed) % 5);
    const baseline = Number(lawnBaseline(x, base).toFixed(2));
    const h = 10 + ((i * 37 + seed) % 11);
    const lean = ((i * 53 + seed * 13) % 9) - 4;
    const tipX = x + lean;
    return `M${x} ${baseline} Q${tipX} ${baseline - h} ${tipX + 2} ${baseline - h - 3} Q${tipX + 3} ${baseline - h + 2} ${x + 7} ${baseline} Z`;
  }).join(" ");
}

/** Selve plenflaten, med samme bølgede overkant som gresstustene står i. */
function buildLawnBody(base: number) {
  const top: string[] = [];
  for (let x = 0; x <= 1440; x += 16) {
    top.push(`${x} ${lawnBaseline(x, base).toFixed(2)}`);
  }
  return `M${top[0]} L${top.slice(1).join(" L")} L1440 140 L0 140 Z`;
}

const GRASS_BACK = buildGrassBlades(7, 26);
const GRASS_FRONT = buildGrassBlades(3, 24);
const LAWN_BODY = buildLawnBody(24);

/** Klipperens avstand inn fra kanten av innholdskolonnen (tilsvarer `left-5`/`px-5`). */
const MOWER_INSET = 20;

/** Hjulradius delt på klipperens bredde (28,6 × 1,3 av 340 i Mower-viewBoxen). */
const WHEEL_RADIUS_RATIO = 0.109;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Intro-sekvens ved sidelast
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".hero-glow",
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" },
        )
        .fromTo(
          ".hero-item",
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
          0.15,
        )
        .fromTo(
          ".hero-mower",
          { opacity: 0, x: -90 },
          { opacity: 1, x: 0, duration: 1, ease: "power2.out" },
          0.5,
        );

      const mowerEl = () =>
        sectionRef.current?.querySelector<HTMLElement>(".hero-mower") ?? null;

      /** Strekningen fra startposisjonen til klipperen står inntil høyre kant av innholdskolonnen. */
      const mowerTravel = () => {
        const el = mowerEl();
        const column = el?.parentElement;
        if (!el || !column) return 0;
        return (
          column.getBoundingClientRect().width -
          MOWER_INSET * 2 -
          el.getBoundingClientRect().width
        );
      };

      /** Rotasjonen som gjør at hjulet triller strekningen uten å skli. */
      const wheelSpin = () => {
        const width = mowerEl()?.getBoundingClientRect().width ?? 0;
        if (!width) return 0;
        return (mowerTravel() / (2 * Math.PI * WHEEL_RADIUS_RATIO * width)) * 360;
      };

      // Klipperen kjører hele veien til høyre kant mens hero-seksjonen står låst.
      // Først når den er framme slipper pinningen og siden ruller videre nedover.
      let stopTimeout: ReturnType<typeof setTimeout>;
      const drive = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          // Header-en leser sluttpunktet herfra, så den bytter utseende akkurat
          // når pinningen slipper
          id: "hero-pin",
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // Pinningen må regnes ut før parallaksen under, som starter der den slutter
          refreshPriority: 1,
          // Gresset flyr kun opp mens klipperen faktisk beveger seg
          onUpdate: () => {
            mowerEl()?.classList.add("is-moving");
            clearTimeout(stopTimeout);
            stopTimeout = setTimeout(() => {
              mowerEl()?.classList.remove("is-moving");
            }, 200);
          },
        },
      });

      // xPercent (ikke x) holder seg unna intro-animasjonen, som eier x
      drive
        .to(
          ".hero-mower",
          {
            xPercent: () => {
              const width = mowerEl()?.getBoundingClientRect().width ?? 0;
              return width ? (mowerTravel() / width) * 100 : 0;
            },
          },
          0,
        )
        .to(
          ".mower-wheel",
          { rotation: wheelSpin, transformOrigin: "50% 50%" },
          0,
        );

      // Lett dupping som om klipperen kjører over ujevn plen
      gsap.to(".hero-mower", {
        y: -2.5,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Innholdet glir rolig oppover (parallakse) først etter at pinningen slipper
      gsap.to(".hero-content", {
        yPercent: -18,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          start: () => drive.scrollTrigger?.end ?? 0,
          end: () => (drive.scrollTrigger?.end ?? 0) + window.innerHeight * 0.7,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col overflow-hidden bg-gradient-to-b from-leaf-950 via-leaf-900 to-leaf-800 text-white"
    >
      {/* Limegrønn glød bak innholdet */}
      <div
        className="hero-glow gsap-reveal pointer-events-none absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(132,207,69,0.35) 0%, rgba(132,207,69,0.08) 55%, transparent 75%)",
        }}
      />

      <div className="hero-content relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-48 pt-36 text-center">
        <p className="hero-item gsap-reveal rounded-full border border-leaf-400/40 bg-leaf-400/10 px-4 py-1.5 text-sm font-medium tracking-wide text-leaf-200">
          100 % elektrisk · Stillegående · Utslippsfri
        </p>

        <h1 className="hero-item gsap-reveal mt-8 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl">
          Få en perfekt plen{" "}
          <span className="bg-gradient-to-r from-leaf-300 to-leaf-400 bg-clip-text text-transparent">
            uten anstrengelse
          </span>
        </h1>

        <p className="hero-item gsap-reveal mt-6 max-w-2xl text-lg leading-relaxed text-leaf-100/85 sm:text-xl">
          Vi leverer og installerer elektriske robotgressklippere for huseiere
          og bedrifter. Enkel installasjon av erfaren montør sikrer en perfekt
          plen – helt uten besvær.
        </p>

        <div className="hero-item gsap-reveal mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#kontakt"
            className="rounded-full bg-leaf-400 px-8 py-4 font-semibold text-leaf-950 shadow-xl shadow-leaf-400/25 transition-all hover:bg-leaf-300"
          >
            Få et tilbud
          </a>
          <a
            href="#slik-fungerer-det"
            className="rounded-full border border-white/25 px-8 py-4 font-semibold text-white transition-colors hover:border-leaf-300 hover:text-leaf-200"
          >
            Slik fungerer det
          </a>
        </div>
      </div>

      {/* Plen med robotklipper som kjører når man scroller */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        {/* Grønn gressplen */}
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="absolute bottom-0 block h-28 w-full sm:h-40"
          aria-hidden
        >
          <defs>
            <linearGradient id="hero-lawn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5ea92c" />
              <stop offset="100%" stopColor="#2c5214" />
            </linearGradient>
          </defs>
          <path d={GRASS_BACK} fill="#35660f" />
          <path d={GRASS_FRONT} fill="#4c901c" />
          <path d={LAWN_BODY} fill="url(#hero-lawn)" />
        </svg>

        {/* Samme kolonne som innholdet (max-w-6xl + px-5) slik at klipperen starter innenfor sidebredden */}
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl">
          {/* Samme retning som i logoen: hjulenden ligger bakerst når den kjører mot høyre */}
          <div className="hero-mower gsap-reveal absolute bottom-[5.1rem] left-5 w-40 sm:bottom-[6.2rem] sm:w-56">
            <Mower className="w-full" />
          </div>
        </div>

        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="relative block h-16 w-full sm:h-24"
          aria-hidden
        >
          <path
            d="M0 60 C240 20 480 90 720 60 C960 30 1200 80 1440 50 L1440 120 L0 120 Z"
            fill="#f7f9f2"
          />
        </svg>
      </div>
    </section>
  );
}

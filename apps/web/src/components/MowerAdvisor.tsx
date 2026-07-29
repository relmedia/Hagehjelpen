"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lawnSizeFromArea, sendContactPrefill } from "@/lib/contact-prefill";
import type { MowerModel, Terrain } from "@/lib/mowers";

const TERRAIN_OPTIONS: {
  value: Terrain;
  label: string;
  hint: string;
  rank: number;
}[] = [
  { value: "flat", label: "Flat hage", hint: "Opptil ca. 20 % helling", rank: 0 },
  { value: "kupert", label: "Kupert", hint: "Ca. 20–35 % helling", rank: 1 },
  { value: "bratt", label: "Bratte partier", hint: "Over 35 % helling", rank: 2 },
];

function rankOf(terrain: Terrain) {
  return TERRAIN_OPTIONS.find((option) => option.value === terrain)?.rank ?? 0;
}

function kr(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function MowerAdvisor({ models }: { models: MowerModel[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [area, setArea] = useState(800);
  const [terrain, setTerrain] = useState<Terrain>("flat");

  useGSAP(
    () => {
      gsap.fromTo(
        ".advisor-heading",
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
        ".advisor-panel",
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".advisor-panel", start: "top 85%" },
        },
      );
    },
    { scope: sectionRef },
  );

  const wanted = rankOf(terrain);
  const matches = models
    .filter((model) => model.area >= area && rankOf(model.terrain) >= wanted)
    .sort((a, b) => a.area - b.area)
    .slice(0, 3);

  function handleSendToForm(model: MowerModel) {
    const terrainLabel = TERRAIN_OPTIONS.find(
      (option) => option.value === terrain,
    )?.label.toLowerCase();

    sendContactPrefill({
      service: "installasjon",
      lawnSize: lawnSizeFromArea(area),
      mower: "husqvarna",
      message: `Jeg er interessert i ${model.name}. Hagen er ca. ${kr(area)} m² og ${terrainLabel}.`,
    });
  }

  return (
    <section id="velg-klipper" ref={sectionRef} className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="advisor-heading gsap-reveal mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Produktvelger
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Hvilken klipper passer hagen din?
          </h2>
          <p className="mt-4 text-ink-soft">
            Fortell oss hvor stor plenen er og hvor kupert terrenget er, så
            foreslår vi modellene som passer.
          </p>
        </div>

        <div className="advisor-panel gsap-reveal mt-16 overflow-hidden rounded-3xl border border-leaf-100 bg-cream">
          <div className="grid gap-8 border-b border-leaf-100 bg-white p-8 md:grid-cols-2 sm:p-10">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="advisor-area" className="text-sm font-medium text-ink">
                  Størrelse på plenen
                </label>
                <span className="font-display text-lg font-bold text-leaf-700">
                  {kr(area)} m²
                </span>
              </div>
              <input
                id="advisor-area"
                type="range"
                min={100}
                max={5000}
                step={100}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-leaf-100 accent-leaf-500 outline-none focus-visible:ring-2 focus-visible:ring-leaf-400/40"
              />
              <div className="mt-2 flex justify-between text-xs text-ink-soft/70">
                <span>100 m²</span>
                <span>5000 m²</span>
              </div>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-ink">
                Hvor bratt er hagen?
              </legend>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {TERRAIN_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-center transition-colors ${
                      terrain === option.value
                        ? "border-leaf-500 bg-leaf-500 text-white"
                        : "border-leaf-100 bg-white text-ink-soft hover:border-leaf-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="terrain"
                      value={option.value}
                      checked={terrain === option.value}
                      onChange={() => setTerrain(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span
                      className={`mt-0.5 block text-xs ${
                        terrain === option.value ? "text-white/75" : "text-ink-soft/70"
                      }`}
                    >
                      {option.hint}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="p-8 sm:p-10">
            {matches.length > 0 ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-leaf-600">
                  Vår anbefaling
                </p>
                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  {matches.map((model, index) => (
                    <article
                      key={model.slug}
                      className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
                        index === 0
                          ? "border-leaf-400 shadow-lg shadow-leaf-900/5 ring-1 ring-leaf-400/30"
                          : "border-leaf-100"
                      }`}
                    >
                      {index === 0 && (
                        <span className="absolute -top-3 left-6 rounded-full bg-leaf-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                          Best match
                        </span>
                      )}
                      {model.image && (
                        <div className="mb-5 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-cream">
                          <Image
                            src={model.image}
                            alt={model.imageAlt ?? model.name}
                            width={360}
                            height={240}
                            sizes="(min-width: 1024px) 20rem, 100vw"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <h3 className="font-display text-lg font-bold text-ink">
                        {model.name}
                      </h3>
                      {model.summary && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                          {model.summary}
                        </p>
                      )}
                      <dl className="mt-5 space-y-2 border-t border-leaf-100 pt-4 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink-soft">Klippeareal</dt>
                          <dd className="font-medium text-ink">
                            Opptil {kr(model.area)} m²
                          </dd>
                        </div>
                        {model.install && (
                          <div className="flex justify-between gap-3">
                            <dt className="shrink-0 text-ink-soft">Grense</dt>
                            <dd className="text-right font-medium text-ink">
                              {model.install}
                            </dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-auto pt-6">
                        <a
                          href="#kontakt"
                          onClick={() => handleSendToForm(model)}
                          className={`block rounded-full px-5 py-3 text-center text-sm font-semibold transition-all ${
                            index === 0
                              ? "bg-leaf-500 text-white shadow-lg shadow-leaf-500/25 hover:bg-leaf-600"
                              : "border border-leaf-200 bg-white text-leaf-700 hover:border-leaf-400 hover:bg-leaf-50"
                          }`}
                        >
                          Be om tilbud
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-leaf-200 bg-white p-8 text-center">
                <h3 className="font-display text-lg font-bold text-ink">
                  Her setter vi sammen en løsning for deg
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                  Hagen din er større eller mer krevende enn standardmodellene
                  dekker. Ofte løser vi det med flere klippere eller en modell
                  fra proffserien.
                </p>
                <a
                  href="#kontakt"
                  className="mt-6 inline-block rounded-full bg-leaf-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
                >
                  Snakk med oss
                </a>
              </div>
            )}

            <p className="mt-7 text-xs leading-relaxed text-ink-soft/70">
              Anbefalingen er veiledende. Hindringer, smale passasjer og
              underlag påvirker valget – vi bekrefter modell og løsning på
              befaring.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

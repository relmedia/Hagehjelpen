"use client";

import { FormEvent, useRef, useState } from "react";
import { sendContactPrefill } from "@/lib/contact-prefill";
import { CoverageMap } from "./CoverageMap";

type Zone = "kjerne" | "utvidet" | "utenfor";

type Area = {
  from: number;
  to: number;
  name: string;
  zone: Zone;
};

/** Postnummerintervaller rundt basen på Ræge. Brukes bare til en veiledende
 *  indikasjon – eksakt kjøretillegg bekreftes når vi tar kontakt. */
const AREAS: Area[] = [
  { from: 4001, to: 4049, name: "Stavanger", zone: "kjerne" },
  { from: 4050, to: 4069, name: "Sola", zone: "kjerne" },
  { from: 4070, to: 4079, name: "Randaberg", zone: "kjerne" },
  { from: 4100, to: 4129, name: "Strand og Jørpeland", zone: "utvidet" },
  { from: 4130, to: 4199, name: "Ryfylke", zone: "utvidet" },
  { from: 4200, to: 4299, name: "Sauda og Suldal", zone: "utenfor" },
  { from: 4300, to: 4329, name: "Sandnes", zone: "kjerne" },
  { from: 4330, to: 4339, name: "Gjesdal og Ålgård", zone: "utvidet" },
  { from: 4340, to: 4349, name: "Time og Bryne", zone: "utvidet" },
  { from: 4350, to: 4359, name: "Klepp og Kvernaland", zone: "utvidet" },
  { from: 4360, to: 4369, name: "Hå", zone: "utvidet" },
  { from: 4370, to: 4399, name: "Eigersund og Dalane", zone: "utenfor" },
];

const ZONE_STYLES: Record<Zone, { card: string; dot: string; title: string }> = {
  kjerne: {
    card: "border-leaf-300 bg-leaf-50",
    dot: "bg-leaf-500",
    title: "text-leaf-800",
  },
  utvidet: {
    card: "border-amber-200 bg-amber-50",
    dot: "bg-amber-500",
    title: "text-amber-900",
  },
  utenfor: {
    card: "border-leaf-100 bg-cream",
    dot: "bg-ink-soft/40",
    title: "text-ink",
  },
};

type Result = {
  zone: Zone;
  code: string;
  name?: string;
};

function lookup(code: number): Area | undefined {
  return AREAS.find((area) => code >= area.from && code <= area.to);
}

export function CoverageCheck() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function handleClear() {
    setValue("");
    setResult(null);
    setError("");
    inputRef.current?.focus();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const digits = value.replace(/\D/g, "");

    if (digits.length !== 4) {
      setResult(null);
      setError("Skriv inn et norsk postnummer med fire siffer.");
      return;
    }

    const area = lookup(Number(digits));
    setError("");
    setResult({
      code: digits,
      name: area?.name,
      zone: area?.zone ?? "utenfor",
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-leaf-100 bg-white shadow-xl shadow-leaf-900/5">
      <div className="p-8 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-leaf-600">
          Dekningsområde
        </p>
        <h3 className="mt-3 font-display text-2xl font-bold text-ink">
          Kjører vi til deg?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Vi holder til på Ræge og dekker Sola, Stavanger, Sandnes, Randaberg og
          resten av Jæren. Sjekk postnummeret ditt.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <label htmlFor="coverage-postcode" className="sr-only">
            Postnummer
          </label>
          <div className="group relative">
            <input
              id="coverage-postcode"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={4}
              autoComplete="postal-code"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="4053"
              className="w-32 rounded-xl border border-leaf-100 bg-white py-3 pl-4 pr-9 text-sm tracking-[0.2em] text-ink outline-none transition-shadow placeholder:tracking-[0.2em] placeholder:text-ink-soft/40 focus:border-leaf-400 focus:ring-2 focus:ring-leaf-400/20"
            />

            {/* Krysset er alltid synlig på berøringsskjermer, men holder seg
                unna til man peker på feltet der hover finnes. */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Tøm postnummeret"
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-soft/50 transition duration-150 hover:bg-leaf-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400/40 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-xl bg-leaf-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-leaf-600"
          >
            Sjekk
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div
            role="status"
            className={`mt-5 rounded-2xl border p-5 ${ZONE_STYLES[result.zone].card}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${ZONE_STYLES[result.zone].dot}`}
              />
              <p
                className={`font-display font-semibold ${ZONE_STYLES[result.zone].title}`}
              >
                {result.zone === "kjerne" && `Ja – vi dekker ${result.name}`}
                {result.zone === "utvidet" && `Vi kjører gjerne til ${result.name}`}
                {result.zone === "utenfor" && "Litt utenfor vanlig kjørerute"}
              </p>
            </div>

            <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
              {result.zone === "kjerne" && (
                <>
                  Postnummer {result.code} ligger i kjerneområdet vårt. Kjøring er
                  inkludert i installasjonsprisen, og vi er som regel hos deg
                  innen kort tid.
                </>
              )}
              {result.zone === "utvidet" && (
                <>
                  Postnummer {result.code} ligger utenfor de første 15 kilometerne
                  fra Ræge. Da kommer et kjøretillegg på 5 kr/km utover 15 km, i
                  tillegg til eventuell bompassering. Vi bekrefter summen før vi
                  setter i gang.
                </>
              )}
              {result.zone === "utenfor" && (
                <>
                  Postnummer {result.code} ligger utenfor området vi dekker til
                  vanlig. Ta gjerne kontakt likevel – vi tar oppdrag lenger unna
                  når vi kan sette opp flere installasjoner i samme tur.
                </>
              )}
            </p>

            <a
              href="#kontakt"
              onClick={() =>
                sendContactPrefill({
                  service: result.zone === "utenfor" ? "usikker" : "befaring",
                })
              }
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700 transition-colors hover:text-leaf-800"
            >
              {result.zone === "utenfor" ? "Spør oss likevel" : "Be om befaring"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}

        <p className="mt-5 text-xs leading-relaxed text-ink-soft/70">
          Sjekken er veiledende. Endelig kjøretillegg bekrefter vi når vi avtaler
          befaring.
        </p>
      </div>

      <div className="relative mt-4 min-h-72 flex-1 overflow-hidden">
        <CoverageMap activeZone={result?.zone} activeName={result?.name} />
      </div>
    </div>
  );
}

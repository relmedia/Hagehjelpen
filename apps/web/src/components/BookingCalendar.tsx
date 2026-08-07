"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Turnstile } from "@/components/Turnstile";
import {
  formatLongDate,
  formatMonth,
  monthGrid,
  parseIsoDate,
  WEEKDAY_LABELS,
} from "@/lib/dates";
import { sendContactPrefill } from "@/lib/contact-prefill";
import { trackAction } from "@/lib/track";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type BookingDay = {
  date: string;
  slots: string[];
};

type Details = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  lawnArea: string;
  message: string;
};

const EMPTY_DETAILS: Details = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  postalCode: "",
  lawnArea: "",
  message: "",
};

const inputClass =
  "peer w-full rounded-xl border border-leaf-100 bg-white px-4 pb-2 pt-6 text-sm text-ink outline-none transition-shadow placeholder:text-transparent focus:border-leaf-400 focus:ring-2 focus:ring-leaf-400/20 focus:placeholder:text-ink-soft/40";

const floatLabelClass =
  "pointer-events-none absolute left-4 top-2 text-xs font-medium text-ink-soft/70 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-leaf-700";

const floatLabelBlockClass =
  "pointer-events-none absolute left-4 top-2 text-xs font-medium text-ink-soft/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-leaf-700";

const primaryButton =
  "rounded-full bg-leaf-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "rounded-full border border-leaf-200 bg-white px-7 py-3.5 text-sm font-semibold text-leaf-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50";

function Panel({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-leaf-100 bg-white p-8 shadow-xl shadow-leaf-900/5 sm:p-10">
      {children}
    </div>
  );
}

/** Reserveløsningen: ring eller bruk kontaktskjemaet. Vises når ingen dager er
 *  åpnet, når tidene ikke kan hentes, og som utfyllende valg under kalenderen. */
function ContactFallback({ intro }: { readonly intro: string }) {
  return (
    <>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{intro}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="tel:+4741446371" className={primaryButton}>
          Ring 414 46 371
        </a>
        <a
          href="#kontakt"
          onClick={() => sendContactPrefill({ service: "befaring" })}
          className={secondaryButton}
        >
          Send forespørsel
        </a>
      </div>
    </>
  );
}

export function BookingCalendar() {
  const [days, setDays] = useState<BookingDay[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [step, setStep] = useState<"tid" | "detaljer" | "ferdig">("tid");
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileRound, setTurnstileRound] = useState(0);

  const [month, setMonth] = useState<{ year: number; month: number } | null>(null);

  async function loadDays(): Promise<BookingDay[] | null> {
    try {
      const res = await fetch("/api/booking/slots", { cache: "no-store" });
      if (!res.ok) throw new Error("Kunne ikke hente tider.");
      const data = (await res.json()) as { days?: BookingDay[] };
      return data.days ?? [];
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadDays().then((result) => {
      if (cancelled) return;
      if (result === null) {
        setLoadFailed(true);
        setDays([]);
        return;
      }
      setDays(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const slotsByDate = useMemo(
    () => new Map((days ?? []).map((day) => [day.date, day.slots])),
    [days],
  );

  // Kalenderen åpner på den første måneden som har ledige dager, og lar deg
  // bare bla mellom månedene der det faktisk finnes noe å velge.
  const bounds = useMemo(() => {
    if (!days?.length) return null;
    const first = parseIsoDate(days[0].date);
    const last = parseIsoDate(days[days.length - 1].date);
    if (!first || !last) return null;
    return {
      first: { year: first.getFullYear(), month: first.getMonth() },
      last: { year: last.getFullYear(), month: last.getMonth() },
    };
  }, [days]);

  useEffect(() => {
    if (bounds && !month) setMonth(bounds.first);
  }, [bounds, month]);

  const shownMonth = month ?? bounds?.first ?? null;

  const grid = useMemo(
    () => (shownMonth ? monthGrid(shownMonth.year, shownMonth.month) : []),
    [shownMonth],
  );

  const asIndex = (value: { year: number; month: number }) => value.year * 12 + value.month;
  const canGoBack = Boolean(shownMonth && bounds && asIndex(shownMonth) > asIndex(bounds.first));
  const canGoForward = Boolean(shownMonth && bounds && asIndex(shownMonth) < asIndex(bounds.last));

  function stepMonth(direction: -1 | 1) {
    if (!shownMonth) return;
    const next = new Date(shownMonth.year, shownMonth.month + direction, 1);
    setMonth({ year: next.getFullYear(), month: next.getMonth() });
  }

  function pickDate(value: string) {
    setDate(value);
    setTime("");
    setError("");
  }

  function resetTurnstile() {
    setTurnstileToken(null);
    setTurnstileRound((round) => round + 1);
  }

  function goToDetails() {
    if (!date || !time) return;
    setStep("detaljer");
    setError("");
    trackAction("befaring-tid-valgt");
  }

  /** Når en time blir tatt mens skjemaet fylles ut, henter vi ferske tider og
   *  sender kunden tilbake til kalenderen i stedet for å bare vise en feil. */
  async function backToCalendarWithFreshSlots(message: string) {
    const fresh = await loadDays();
    if (fresh) {
      setDays(fresh);
      setTime("");
      if (!fresh.some((day) => day.date === date)) setDate("");
    }
    setStep("tid");
    setError(message);
    setStatus("error");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    if (
      !details.firstName.trim() ||
      !details.lastName.trim() ||
      !details.phone.trim() ||
      !details.email.trim() ||
      !details.address.trim()
    ) {
      setError("Fyll ut alle obligatoriske felt.");
      setStatus("error");
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Vent til robotsjekken er ferdig, og prøv igjen.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, date, time, turnstileToken }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string; slotTaken?: boolean };

      if (!res.ok) {
        resetTurnstile();

        if (data.slotTaken) {
          await backToCalendarWithFreshSlots(
            data.error ?? "Tidspunktet ble dessverre tatt. Velg et annet.",
          );
          return;
        }

        setError(data.error ?? "Noe gikk galt. Prøv igjen.");
        setStatus("error");
        return;
      }

      setStatus("idle");
      setStep("ferdig");
      trackAction("befaring-bestilt");
    } catch {
      setError("Kunne ikke sende bestillingen. Sjekk nettverket og prøv igjen.");
      setStatus("error");
      resetTurnstile();
    }
  }

  function bookAnother() {
    setDetails(EMPTY_DETAILS);
    setDate("");
    setTime("");
    setStep("tid");
    setStatus("idle");
    resetTurnstile();
    loadDays().then((fresh) => fresh && setDays(fresh));
  }

  if (days === null) {
    return (
      <Panel>
        <p className="text-sm text-ink-soft">Henter ledige tider …</p>
      </Panel>
    );
  }

  if (step === "ferdig") {
    return (
      <div className="rounded-3xl border border-leaf-200 bg-leaf-50 px-8 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf-500 text-white">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <h3 className="mt-5 font-display text-xl font-semibold text-ink">
          Tiden er reservert!
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Vi har satt av {formatLongDate(date).toLowerCase()} kl. {time} til deg. Du får en
          e-post med kvittering nå, og en bekreftelse fra oss innen 24 timer.
        </p>
        <button type="button" onClick={bookAnother} className={`mt-6 ${secondaryButton}`}>
          Bestill en ny befaring
        </button>
      </div>
    );
  }

  if (!days.length) {
    return (
      <Panel>
        <h3 className="font-display text-2xl font-bold text-ink">
          {loadFailed ? "Kalenderen er utilgjengelig" : "Avtal tid direkte med oss"}
        </h3>
        <ContactFallback
          intro={
            loadFailed
              ? "Vi får ikke hentet de ledige tidene akkurat nå. Ring oss, så finner vi et tidspunkt sammen."
              : "Det er ingen ledige tider i kalenderen akkurat nå. Ring eller send skjemaet, så finner vi et tidspunkt som passer – også på kveldstid og i helgene."
          }
        />
      </Panel>
    );
  }

  const slots = slotsByDate.get(date) ?? [];

  return (
    <Panel>
      {step === "tid" ? (
        <>
          <h3 className="font-display text-2xl font-bold text-ink">Velg dag og tidspunkt</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Grønne datoer er ledige. Befaringen tar 20–30 minutter og koster ingenting.
          </p>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => stepMonth(-1)}
                disabled={!canGoBack}
                aria-label="Forrige måned"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-leaf-100 text-ink-soft transition-colors hover:border-leaf-300 hover:text-leaf-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M12.5 4.2 6.7 10l5.8 5.8 1.2-1.3L9.2 10l4.5-4.5z" />
                </svg>
              </button>
              <p aria-live="polite" className="font-display text-base font-semibold text-ink">
                {shownMonth ? formatMonth(shownMonth.year, shownMonth.month) : ""}
              </p>
              <button
                type="button"
                onClick={() => stepMonth(1)}
                disabled={!canGoForward}
                aria-label="Neste måned"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-leaf-100 text-ink-soft transition-colors hover:border-leaf-300 hover:text-leaf-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path d="M7.5 4.2 6.3 5.5 10.8 10l-4.5 4.5 1.2 1.3L13.3 10z" />
                </svg>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <span
                  key={label}
                  className="pb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft/60"
                >
                  {label}
                </span>
              ))}

              {grid.flat().map((cell, index) => {
                if (!cell) return <span key={`tom-${index}`} />;

                const open = slotsByDate.has(cell);
                const day = parseIsoDate(cell)?.getDate();

                return (
                  <button
                    key={cell}
                    type="button"
                    disabled={!open}
                    aria-pressed={date === cell}
                    aria-label={`${formatLongDate(cell)}${open ? "" : " – ingen ledige tider"}`}
                    onClick={() => pickDate(cell)}
                    className={`flex h-10 items-center justify-center rounded-xl text-sm transition-colors ${
                      date === cell
                        ? "bg-leaf-500 font-semibold text-white"
                        : open
                          ? "bg-leaf-50 font-medium text-leaf-800 hover:bg-leaf-100"
                          : "text-ink-soft/30"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {date && (
            <div className="mt-7 border-t border-leaf-100 pt-6">
              <p className="text-sm font-medium text-ink">
                Ledige tider {formatLongDate(date).toLowerCase()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={time === slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                      time === slot
                        ? "border-leaf-500 bg-leaf-500 text-white"
                        : "border-leaf-200 bg-white text-leaf-700 hover:border-leaf-400 hover:bg-leaf-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={goToDetails} disabled={!date || !time} className={primaryButton}>
              Fortsett
            </button>
            <a href="tel:+4741446371" className={secondaryButton}>
              Ring i stedet
            </a>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <h3 className="font-display text-2xl font-bold text-ink">Hvem kommer vi til?</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {formatLongDate(date)} kl. {time}.{" "}
            <button
              type="button"
              onClick={() => setStep("tid")}
              className="font-semibold text-leaf-700 underline underline-offset-2 hover:text-leaf-600"
            >
              Bytt tidspunkt
            </button>
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <input
                id="befaring-fornavn"
                value={details.firstName}
                onChange={(event) => setDetails({ ...details, firstName: event.target.value })}
                placeholder="Ola"
                autoComplete="given-name"
                required
                className={inputClass}
              />
              <label htmlFor="befaring-fornavn" className={floatLabelClass}>
                Fornavn *
              </label>
            </div>

            <div className="relative">
              <input
                id="befaring-etternavn"
                value={details.lastName}
                onChange={(event) => setDetails({ ...details, lastName: event.target.value })}
                placeholder="Nordmann"
                autoComplete="family-name"
                required
                className={inputClass}
              />
              <label htmlFor="befaring-etternavn" className={floatLabelClass}>
                Etternavn *
              </label>
            </div>

            <div className="relative">
              <input
                id="befaring-telefon"
                type="tel"
                value={details.phone}
                onChange={(event) => setDetails({ ...details, phone: event.target.value })}
                placeholder="+47 000 00 000"
                autoComplete="tel"
                required
                className={inputClass}
              />
              <label htmlFor="befaring-telefon" className={floatLabelClass}>
                Telefon *
              </label>
            </div>

            <div className="relative">
              <input
                id="befaring-epost"
                type="email"
                value={details.email}
                onChange={(event) => setDetails({ ...details, email: event.target.value })}
                placeholder="ola@eksempel.no"
                autoComplete="email"
                required
                className={inputClass}
              />
              <label htmlFor="befaring-epost" className={floatLabelClass}>
                E-post *
              </label>
            </div>

            <div className="relative sm:col-span-2">
              <input
                id="befaring-adresse"
                value={details.address}
                onChange={(event) => setDetails({ ...details, address: event.target.value })}
                placeholder="Ølbergvegen 101"
                autoComplete="street-address"
                required
                className={inputClass}
              />
              <label htmlFor="befaring-adresse" className={floatLabelClass}>
                Adressen vi skal til *
              </label>
            </div>

            <div className="relative">
              <input
                id="befaring-postnummer"
                inputMode="numeric"
                maxLength={4}
                value={details.postalCode}
                onChange={(event) =>
                  setDetails({
                    ...details,
                    postalCode: event.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="4053"
                autoComplete="postal-code"
                className={inputClass}
              />
              <label htmlFor="befaring-postnummer" className={floatLabelClass}>
                Postnummer
              </label>
            </div>

            <div className="relative">
              <input
                id="befaring-plen"
                inputMode="numeric"
                value={details.lawnArea}
                onChange={(event) =>
                  setDetails({ ...details, lawnArea: event.target.value.replace(/\D/g, "") })
                }
                placeholder="800"
                className={inputClass}
              />
              <label htmlFor="befaring-plen" className={floatLabelClass}>
                Plenareal i m²
              </label>
            </div>

            <div className="relative sm:col-span-2">
              <textarea
                id="befaring-melding"
                rows={3}
                value={details.message}
                onChange={(event) => setDetails({ ...details, message: event.target.value })}
                placeholder="Fortell gjerne litt om hagen …"
                className={`${inputClass} resize-y`}
              />
              <label htmlFor="befaring-melding" className={floatLabelBlockClass}>
                Melding
              </label>
            </div>
          </div>

          {TURNSTILE_SITE_KEY && (
            <Turnstile
              key={turnstileRound}
              siteKey={TURNSTILE_SITE_KEY}
              onToken={setTurnstileToken}
              onError={() =>
                setError("Robotsjekken kunne ikke lastes. Last siden på nytt, eller ring oss.")
              }
              className="mt-4 min-h-16.25"
            />
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={status === "loading"} className={primaryButton}>
              {status === "loading" ? "Reserverer …" : "Bestill befaring"}
            </button>
            <button type="button" onClick={() => setStep("tid")} className={secondaryButton}>
              Tilbake
            </button>
          </div>

          <p className="mt-6 border-t border-leaf-100 pt-6 text-xs leading-relaxed text-ink-soft/70">
            Befaringen er gratis og uforpliktende. Felter merket med * er obligatoriske, og du
            kan avbestille når som helst med lenken i e-posten.
          </p>
        </form>
      )}
    </Panel>
  );
}

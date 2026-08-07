"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSENT_SETTINGS_EVENT,
  type ConsentCategories,
  FULL_CONSENT,
  NO_CONSENT,
  writeConsent,
} from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

type Category = {
  key: keyof ConsentCategories | "nodvendige";
  navn: string;
  beskrivelse: string;
  detaljer: string;
};

const CATEGORIES: readonly Category[] = [
  {
    key: "nodvendige",
    navn: "Nødvendige",
    beskrivelse: "Kan ikke slås av",
    detaljer:
      "Holder siden trygg og skjemaet i orden: spamsjekken fra Cloudflare Turnstile, verdiene du tar med deg fra prisberegneren til kontaktskjemaet, og selve dette samtykket. Uten dem virker ikke siden som den skal.",
  },
  {
    key: "statistikk",
    navn: "Statistikk",
    beskrivelse: "Hjelper oss å forbedre siden",
    detaljer:
      "Vår egen besøksmåling teller hvor mange som er innom, hvor langt ned på siden folk kommer og om verktøyene blir brukt. Tallene er anonyme, og vi deler dem ikke med noen.",
  },
] as const;

export function CookieConsent() {
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>(NO_CONSENT);

  // Cookien finnes bare i nettleseren, så banneret kan først vises etter at
  // siden er hydrert. Ellers ville det blinket forbi for dem som har svart.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const open = () => {
      setDraft(consent ? { statistikk: consent.statistikk } : NO_CONSENT);
      setSettingsOpen(true);
    };

    window.addEventListener(CONSENT_SETTINGS_EVENT, open);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, open);
  }, [consent]);

  const save = (categories: ConsentCategories) => {
    writeConsent(categories);
    setSettingsOpen(false);
  };

  const showBanner = mounted && !consent;

  return (
    <>
      {showBanner && (
        <aside
          aria-labelledby="samtykke-tittel"
          className="animate-sheet-in fixed inset-x-0 bottom-0 z-90 px-3 pb-3 sm:px-5 sm:pb-5"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-leaf-100 bg-white p-5 shadow-2xl shadow-ink/15 sm:p-6">
            <h2
              id="samtykke-tittel"
              className="font-display text-lg font-bold text-ink"
            >
              Vi bruker informasjonskapsler
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Noen er nødvendige for at siden skal fungere. Besøksstatistikk
              samler vi bare inn hvis du sier ja. Du kan endre valget når som
              helst nederst på siden.{" "}
              <Link
                href="/personvern"
                className="font-medium text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
              >
                Les personvernerklæringen
              </Link>
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => save(FULL_CONSENT)}
                className="rounded-full bg-leaf-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
              >
                Godta alle
              </button>
              <button
                type="button"
                onClick={() => save(NO_CONSENT)}
                className="rounded-full border border-leaf-200 bg-white px-6 py-3 text-sm font-semibold text-leaf-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
              >
                Bare nødvendige
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(NO_CONSENT);
                  setSettingsOpen(true);
                }}
                className="rounded-full px-6 py-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-leaf-50 hover:text-ink sm:ml-auto"
              >
                Tilpass
              </button>
            </div>
          </div>
        </aside>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="border-b border-leaf-100 px-6 pb-5 pt-6 sm:px-8">
            <DialogTitle>Informasjonskapsler</DialogTitle>
            <DialogDescription>
              Velg hva vi får lagre i nettleseren din. Nødvendige kan ikke slås
              av, resten bestemmer du over – og du kan ombestemme deg når som
              helst.
            </DialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
            <ul className="space-y-4">
              {CATEGORIES.map((category) => {
                const key = category.key;
                const checked = key === "nodvendige" ? true : draft[key];

                return (
                  <li
                    key={key}
                    className="rounded-2xl border border-leaf-100 bg-cream/60 p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-semibold text-ink">
                          {category.navn}
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-leaf-700">
                          {category.beskrivelse}
                        </p>
                      </div>
                      <Switch
                        checked={checked}
                        disabled={key === "nodvendige"}
                        aria-label={category.navn}
                        onCheckedChange={(value) => {
                          if (key === "nodvendige") return;
                          setDraft((current) => ({ ...current, [key]: value }));
                        }}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {category.detaljer}
                    </p>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-xs leading-relaxed text-ink-soft/70">
              Vi lagrer valget ditt i tolv måneder og spør på nytt etter det.{" "}
              <Link
                href="/personvern"
                className="underline underline-offset-2 hover:text-ink"
              >
                Se hva vi lagrer og hvorfor
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-leaf-100 px-6 py-5 sm:flex-row-reverse sm:px-8">
            <button
              type="button"
              onClick={() => save(draft)}
              className="rounded-full bg-leaf-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
            >
              Lagre valg
            </button>
            <button
              type="button"
              onClick={() => save(FULL_CONSENT)}
              className="rounded-full border border-leaf-200 bg-white px-6 py-3 text-sm font-semibold text-leaf-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
            >
              Godta alle
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

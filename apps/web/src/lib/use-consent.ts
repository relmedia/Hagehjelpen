"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_CHANGED_EVENT, type Consent, readConsent } from "@/lib/consent";

// Snapshotet må være det samme objektet mellom rendringer, ellers går React i
// løkke. Derfor leser vi cookien én gang og oppdaterer bare ved endring.
let snapshot: Consent | null | undefined;

function getSnapshot(): Consent | null {
  if (snapshot === undefined) snapshot = readConsent();
  return snapshot;
}

function subscribe(onStoreChange: () => void): () => void {
  const handle = () => {
    snapshot = readConsent();
    onStoreChange();
  };

  window.addEventListener(CONSENT_CHANGED_EVENT, handle);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handle);
}

/** null så lenge besøkende ikke har tatt stilling – og under serverrendring,
 *  siden vi ikke vet noe om nettleseren der. */
export function useConsent(): Consent | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

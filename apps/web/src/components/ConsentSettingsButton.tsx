"use client";

import { openConsentSettings } from "@/lib/consent";

/** Samtykket skal være like enkelt å trekke tilbake som å gi, så denne knappen
 *  ligger både i bunnteksten og i personvernerklæringen. */
export function ConsentSettingsButton({
  className,
  children = "Endre samtykke",
}: {
  readonly className?: string;
  readonly children?: React.ReactNode;
}) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}

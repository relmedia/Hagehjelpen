import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { formatLongDate } from "@/lib/dates";
import { cancelInspection, findInspectionByToken } from "@/lib/cancel-inspection";

export const metadata: Metadata = {
  title: "Avbestill befaring – Hagehjelpen",
  description: "Avbestill den avtalte befaringen din.",
  robots: { index: false, follow: false },
};

// Avbestillingen slår opp i databasen hver gang, så siden kan ikke caches.
export const dynamic = "force-dynamic";

function Skall({ children }: { readonly children: React.ReactNode }) {
  return (
    <>
      <Header solid />
      <main className="bg-cream pb-24 pt-32 sm:pt-36">
        <div className="mx-auto max-w-xl px-5">
          <div className="rounded-3xl border border-leaf-100 bg-white p-8 shadow-xl shadow-leaf-900/5 sm:p-10">
            {children}
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            <Link href="/" className="font-medium text-leaf-700 underline underline-offset-2">
              Tilbake til forsiden
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Beskjed({ tittel, tekst }: { readonly tittel: string; readonly tekst: string }) {
  return (
    <Skall>
      <h1 className="font-display text-2xl font-bold text-ink">{tittel}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{tekst}</p>
      <a
        href="tel:+4741446371"
        className="mt-7 inline-block rounded-full bg-leaf-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
      >
        Ring 414 46 371
      </a>
    </Skall>
  );
}

export default async function AvbestillBefaring({
  searchParams,
}: {
  readonly searchParams: Promise<{ token?: string; avbestilt?: string }>;
}) {
  const { token = "", avbestilt } = await searchParams;
  const inspection = await findInspectionByToken(token);

  if (!inspection) {
    return (
      <Beskjed
        tittel="Fant ikke befaringen"
        tekst="Lenken er ugyldig eller utløpt. Ring oss, så finner vi ut av det sammen."
      />
    );
  }

  if (inspection.status === "cancelled") {
    return (
      <Beskjed
        tittel={avbestilt ? "Befaringen er avbestilt" : "Denne befaringen er allerede avbestilt"}
        tekst={
          avbestilt
            ? `Vi har fjernet ${formatLongDate(inspection.date).toLowerCase()} kl. ${inspection.time} fra kalenderen. Vil du avtale en ny tid, er det bare å bestille på nytt eller ringe oss.`
            : "Du trenger ikke gjøre noe mer. Vil du avtale en ny tid, kan du bestille på nytt på forsiden."
        }
      />
    );
  }

  async function avbestill() {
    "use server";
    await cancelInspection(token);
    redirect(`/befaring/avbestill?token=${encodeURIComponent(token)}&avbestilt=1`);
  }

  return (
    <Skall>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-leaf-600">Befaring</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        Vil du avbestille befaringen?
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Vi har satt av tiden under til deg. Avbestiller du, blir tidspunktet ledig for andre.
      </p>

      <dl className="mt-6 space-y-2 rounded-2xl border border-leaf-100 bg-cream/60 p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Dato</dt>
          <dd className="text-right font-medium text-ink">{formatLongDate(inspection.date)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Klokkeslett</dt>
          <dd className="text-right font-medium text-ink">{inspection.time}</dd>
        </div>
        {inspection.address && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Adresse</dt>
            <dd className="text-right font-medium text-ink">{inspection.address}</dd>
          </div>
        )}
      </dl>

      <form action={avbestill} className="mt-7 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-leaf-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-leaf-500/25 transition-colors hover:bg-leaf-600"
        >
          Ja, avbestill befaringen
        </button>
        <Link
          href="/"
          className="rounded-full border border-leaf-200 bg-white px-7 py-3.5 text-sm font-semibold text-leaf-700 transition-colors hover:border-leaf-400 hover:bg-leaf-50"
        >
          Nei, behold tiden
        </Link>
      </form>
    </Skall>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ConsentSettingsButton } from "@/components/ConsentSettingsButton";

// Bunnteksten står også på undersider, så snarveiene må peke på forsiden.
const SNARVEIER = [
  { href: "/#fordeler", navn: "Fordeler" },
  { href: "/#slik-fungerer-det", navn: "Slik fungerer det" },
  { href: "/#installasjon", navn: "Installasjon og priser" },
  { href: "/#kalkulator", navn: "Prisberegner" },
  { href: "/#velg-klipper", navn: "Velg riktig klipper" },
  { href: "/#huskeliste", navn: "Huskeliste før montering" },
  { href: "/#feilsoking", navn: "Feilsøking" },
  { href: "/#faq", navn: "Spørsmål og svar" },
  { href: "/#befaring", navn: "Bestill befaring" },
  { href: "/#kontakt", navn: "Kontakt" },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-white/80">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3">
        <div>
          <Image
            src="/logo.svg"
            alt="Hagehjelpen – plen og hagetjenester"
            width={277}
            height={234}
            className="h-14 w-auto brightness-0 invert"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Vi gjør vedlikehold av plenen uanstrengt og effektivt for både
            huseiere og bedrifter – med elektriske robotgressklippere.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white">Snarveier</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SNARVEIER.map((snarvei) => (
              <li key={snarvei.href}>
                <a href={snarvei.href} className="transition-colors hover:text-leaf-300">
                  {snarvei.navn}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white">Kontakt</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href="mailto:post@hagehjelpen.no"
                className="transition-colors hover:text-leaf-300"
              >
                post@hagehjelpen.no
              </a>
            </li>
            <li>
              <a href="tel:+47 414 46 371" className="transition-colors hover:text-leaf-300">
               +47 414 46 371
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=%C3%98lbergvegen%20101%2C%204053%20R%C3%A6ge"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-leaf-300"
              >
                Ølbergvegen 101, 4053 Ræge
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-6 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Hagehjelpen. Alle rettigheter reservert.</p>
          <Link href="/personvern" className="transition-colors hover:text-leaf-300">
            Personvern og informasjonskapsler
          </Link>
          <ConsentSettingsButton className="transition-colors hover:text-leaf-300" />
          <p className="sm:ml-auto">Plen og hagetjenester</p>
        </div>
      </div>
    </footer>
  );
}

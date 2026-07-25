import Image from "next/image";

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
            <li>
              <a href="#fordeler" className="transition-colors hover:text-leaf-300">
                Fordeler
              </a>
            </li>
            <li>
              <a
                href="#slik-fungerer-det"
                className="transition-colors hover:text-leaf-300"
              >
                Slik fungerer det
              </a>
            </li>
            <li>
              <a href="#installasjon" className="transition-colors hover:text-leaf-300">
                Installasjon og priser
              </a>
            </li>
            <li>
              <a href="#kalkulator" className="transition-colors hover:text-leaf-300">
                Prisberegner
              </a>
            </li>
            <li>
              <a href="#velg-klipper" className="transition-colors hover:text-leaf-300">
                Velg riktig klipper
              </a>
            </li>
            <li>
              <a href="#huskeliste" className="transition-colors hover:text-leaf-300">
                Huskeliste før montering
              </a>
            </li>
            <li>
              <a href="#feilsoking" className="transition-colors hover:text-leaf-300">
                Feilsøking
              </a>
            </li>
            <li>
              <a href="#faq" className="transition-colors hover:text-leaf-300">
                Spørsmål og svar
              </a>
            </li>
            <li>
              <a href="#befaring" className="transition-colors hover:text-leaf-300">
                Book befaring
              </a>
            </li>
            <li>
              <a href="#kontakt" className="transition-colors hover:text-leaf-300">
                Kontakt
              </a>
            </li>
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Hagehjelpen. Alle rettigheter reservert.</p>
          <p>Plen og hagetjenester</p>
        </div>
      </div>
    </footer>
  );
}

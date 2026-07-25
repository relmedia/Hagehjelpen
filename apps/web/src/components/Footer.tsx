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
              <a href="#huskeliste" className="transition-colors hover:text-leaf-300">
                Huskeliste før montering
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
              <a href="tel:+4700000000" className="transition-colors hover:text-leaf-300">
                +47 00 00 00 00
              </a>
            </li>
            <li>Norge</li>
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

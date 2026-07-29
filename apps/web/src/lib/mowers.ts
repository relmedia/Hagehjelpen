import fs from "node:fs";
import path from "node:path";

import { getSupabaseReadClient } from "./supabase";

export type Terrain = "flat" | "kupert" | "bratt";

export type MowerModel = {
  slug: string;
  name: string;
  area: number;
  terrain: Terrain;
  install: string;
  summary: string;
  image: string | null;
  imageAlt: string | null;
};

/** Terrengkategoriene i produktvelgeren, oversatt fra maks helling i prosent. */
function terrainFromSlope(slope: number | null): Terrain {
  if (slope === null) return "flat";
  if (slope > 35) return "bratt";
  if (slope > 20) return "kupert";
  return "flat";
}

const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

/** Offisielle produktbilder kan legges i `public/klippere/<slug>.<webp|png|jpg>`.
 *  Vi sjekker at filen finnes, slik at kort uten bilde ikke gir brutte lenker. */
function localImage(slug: string): string | null {
  // Slugen kommer fra databasen, så vi tillater bare enkle filnavn.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const directory = path.join(process.cwd(), "public", "klippere");
  for (const extension of IMAGE_EXTENSIONS) {
    const file = `${slug}.${extension}`;
    if (fs.existsSync(path.join(directory, file))) {
      return `/klippere/${file}`;
    }
  }
  return null;
}

/** Modellene vi viser hvis Supabase ikke er satt opp eller ikke svarer.
 *  Klippeareal og modellnavn følger Husqvarnas egen serieoversikt, og slug er
 *  den samme som i `supabase/seed-mowers.sql`. */
const FALLBACK_MOWERS: Omit<MowerModel, "image" | "imageAlt">[] = [
  {
    slug: "automower-aspire-r6v",
    name: "Automower® Aspire™ R6V",
    area: 600,
    terrain: "flat",
    install: "Kabelfri – virtuell grense",
    summary: "Kompakt klipper for små, oversiktlige hager og trange passasjer.",
  },
  {
    slug: "automower-308v",
    name: "Automower® 308V",
    area: 800,
    terrain: "flat",
    install: "Kabelfri – virtuell grense",
    summary: "Enkel og driftssikker modell for vanlige villahager.",
  },
  {
    slug: "automower-312v",
    name: "Automower® 312V",
    area: 1200,
    terrain: "flat",
    install: "Kabelfri – virtuell grense",
    summary: "Litt større kapasitet, fortsatt uten kanttråd rundt plenen.",
  },
  {
    slug: "automower-305e-nera",
    name: "Automower® 305E NERA",
    area: 900,
    terrain: "kupert",
    install: "Kanttråd, kan oppgraderes til kabelfri (EPOS)",
    summary: "Håndterer skråninger og delte soner i mellomstore hager.",
  },
  {
    slug: "automower-405ve-nera",
    name: "Automower® 405VE NERA",
    area: 900,
    terrain: "kupert",
    install: "Kabelfri – virtuell grense",
    summary: "Kabelfri løsning for hager med høydeforskjeller og flere soner.",
  },
  {
    slug: "automower-310e-nera",
    name: "Automower® 310E NERA",
    area: 1500,
    terrain: "kupert",
    install: "Kanttråd, kan oppgraderes til kabelfri (EPOS)",
    summary: "Robust valg for større, kuperte plener med hindringer.",
  },
  {
    slug: "automower-410ve-nera",
    name: "Automower® 410VE NERA",
    area: 1500,
    terrain: "kupert",
    install: "Kabelfri – virtuell grense",
    summary: "Systematisk klipping i store hager uten tråd i plenen.",
  },
  {
    slug: "automower-320-nera",
    name: "Automower® 320 NERA",
    area: 3300,
    terrain: "bratt",
    install: "Kanttråd, kan oppgraderes til kabelfri (EPOS)",
    summary: "Kraftig modell som takler bratte partier og krevende terreng.",
  },
  {
    slug: "automower-430v-nera",
    name: "Automower® 430V NERA",
    area: 4800,
    terrain: "bratt",
    install: "Kabelfri – virtuell grense",
    summary: "Toppmodell for store eiendommer, bakker og flere klippesoner.",
  },
];

function withLocalImages(models: Omit<MowerModel, "image" | "imageAlt">[]): MowerModel[] {
  return models.map((model) => ({
    ...model,
    image: localImage(model.slug),
    imageAlt: null,
  }));
}

type MowerRow = {
  slug: string;
  title: string;
  max_area: number | null;
  max_slope: number | null;
  boundary: string | null;
  short_description: string | null;
  image_url: string | null;
  image_alt: string | null;
};

/** Modellene i produktvelgeren, hentet fra dashbordet. */
export async function getMowerModels(): Promise<MowerModel[]> {
  const supabase = getSupabaseReadClient();
  if (!supabase) return withLocalImages(FALLBACK_MOWERS);

  const { data, error } = await supabase
    .from("mowers")
    .select("slug, title, max_area, max_slope, boundary, short_description, image_url, image_alt")
    .eq("active", true)
    .order("order", { ascending: true });

  if (error || !data || data.length === 0) return withLocalImages(FALLBACK_MOWERS);

  return (data as MowerRow[])
    .filter((row) => row.max_area !== null)
    .map((row) => ({
      slug: row.slug,
      name: row.title,
      area: row.max_area as number,
      terrain: terrainFromSlope(row.max_slope),
      install: row.boundary ?? "",
      summary: row.short_description ?? "",
      image: row.image_url ?? localImage(row.slug),
      imageAlt: row.image_alt,
    }));
}

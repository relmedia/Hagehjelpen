/** Adressesøk mot Kartverkets åpne API (ingen nøkkel nødvendig). */
export type GeonorgeAddress = {
  adressetekst: string;
  postnummer: string;
  poststed: string;
  representasjonspunkt: { lat: number; lon: number };
};

/** Ølbergvegen 101, 4053 Ræge – der Hagehjelpen kjører fra. */
export const BASE_POINT = { lat: 58.8716, lon: 5.5877 };

/** Veien går sjelden rett fram, så luftlinjen får et påslag. */
const ROAD_FACTOR = 1.25;

export async function searchAddresses(term: string, signal?: AbortSignal) {
  const res = await fetch(
    `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(
      term,
    )}&treffPerSide=5&filtrer=adresser.adressetekst,adresser.postnummer,adresser.poststed,adresser.representasjonspunkt`,
    { signal },
  );

  const data = (await res.json()) as { adresser?: GeonorgeAddress[] };
  return data.adresser ?? [];
}

/**
 * Nærmeste adresse til et koordinat. GPS-en bommer gjerne noen titalls meter,
 * så vi søker i en liten radius og velger treffet som ligger nærmest.
 */
export async function findNearestAddress(
  point: { lat: number; lon: number },
  signal?: AbortSignal,
) {
  const res = await fetch(
    `https://ws.geonorge.no/adresser/v1/punktsok?lat=${point.lat}&lon=${point.lon}&radius=300&treffPerSide=20&filtrer=adresser.adressetekst,adresser.postnummer,adresser.poststed,adresser.representasjonspunkt`,
    { signal },
  );

  const data = (await res.json()) as { adresser?: GeonorgeAddress[] };
  return (data.adresser ?? []).reduce<GeonorgeAddress | undefined>(
    (nearest, candidate) =>
      !nearest ||
      haversineKm(point, candidate.representasjonspunkt) <
        haversineKm(point, nearest.representasjonspunkt)
        ? candidate
        : nearest,
    undefined,
  );
}

/** Kartverket skriver poststed med versaler («RÆGE»); vi vil ha «Ræge». */
export function formatPlace(place: string) {
  return place
    .toLocaleLowerCase("no")
    .replace(/(^|[\s\-/])(\p{L})/gu, (_, prefix: string, letter: string) =>
      prefix + letter.toLocaleUpperCase("no"),
    );
}

/** Full adresse på én linje: «Ølbergvegen 101, 4053 Ræge». */
export function formatAddress(address: GeonorgeAddress) {
  return [
    address.adressetekst,
    `${address.postnummer} ${formatPlace(address.poststed)}`,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function haversineKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
) {
  const radius = 6371;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLon = rad(to.lon - from.lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLon / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateDrivingKm(lat: number, lon: number) {
  return Math.round(haversineKm(BASE_POINT, { lat, lon }) * ROAD_FACTOR);
}

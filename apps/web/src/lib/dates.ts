/** Datoer sendes som «ÅÅÅÅ-MM-DD». Klokkeslett midt på dagen gjør at datoen
 *  ikke hopper et døgn når strengen tolkes i en annen tidssone. */
export function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** «Mandag 10. august 2026» */
export function formatLongDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return capitalize(
    date.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
}

/** «man. 10. aug.» – kort nok til å stå i en knapp. */
export function formatShortDate(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return date.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** «August 2026» */
export function formatMonth(year: number, month: number): string {
  return capitalize(
    new Date(year, month, 1).toLocaleDateString("nb-NO", {
      month: "long",
      year: "numeric",
    }),
  );
}

/** Ukene i en måned, mandag først, med tomme ruter der måneden ikke rekker. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  );
}

export const WEEKDAY_LABELS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"] as const;

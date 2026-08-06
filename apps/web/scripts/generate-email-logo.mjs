import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

// E-postklienter viser ikke SVG, så logoen i malene er en PNG med fast bredde.
// Den rendres i dobbel størrelse for skjermer med høy oppløsning.
const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(publicDir, "logo.svg"));

await sharp(svg, { density: 600 })
  .resize({ width: 320, fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(join(publicDir, "logo-email.png"));

console.log("logo-email.png generert.");

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");
const svg = readFileSync(join(appDir, "icon.svg"));

const render = (size) =>
  sharp(svg, { density: 300 }).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

await render(32).png().toFile(join(appDir, "icon.png"));
await render(180).png().toFile(join(appDir, "apple-icon.png"));
await render(32).png().toFile(join(appDir, "favicon.png"));

console.log("Favicon PNG-er generert.");

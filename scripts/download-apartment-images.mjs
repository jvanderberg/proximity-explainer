import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dataPath = join(root, "app", "generated", "character-collage.ts");
const outDir = join(root, "public", "apartment-images");
const cacheDir = join(root, ".cache", "apartment-images");

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const baseUrlArg = process.argv.find((arg) => arg.startsWith("--base-url="));
const timeoutArg = process.argv.find((arg) => arg.startsWith("--timeout="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;
const baseUrl = baseUrlArg?.slice("--base-url=".length);
const timeout = timeoutArg?.slice("--timeout=".length) ?? "6";
const streetviewOnly = process.argv.includes("--streetview-only");

mkdirSync(outDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

const source = readFileSync(dataPath, "utf8");
const json = source.match(/export const EMBEDDED_APARTMENTS = (.*) as const;/s)?.[1];
if (!json) throw new Error(`Could not parse ${dataPath}`);

const buildings = JSON.parse(json).slice(0, limit);
const photoUrl = (pin) => {
  if (baseUrl) return `${baseUrl.replace(/\/$/, "")}/${pin}.jpg`;
  return `https://prodassets.cookcountyassessoril.gov/s3fs-public/pin_detail/${pin.slice(0, 3)}-${pin.slice(3, 5)}/${pin.slice(5, 8)}/${pin}_AA.jpg`;
};
const pageUrl = (pin) => `https://www.cookcountyassessoril.gov/pin/${pin}`;
const streetviewUrl = (address) =>
  `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(`${address} OAK PARK IL 60302`)}&key=AIzaSyAntV-l6TDPCzvwcMAW2jCI7Rxq3cCV5jk&secret=LSUZUsV1HZZQuKyfJsYkpee4WaY=`;

let downloaded = 0;
let converted = 0;
let failed = 0;
let skipped = 0;

const browser = streetviewOnly ? null : await chromium.launch({ headless: true });
const page = browser
  ? await browser.newPage({
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    })
  : null;

for (const building of buildings) {
  const jpg = join(cacheDir, `${building.pin}.jpg`);
  const webp = join(outDir, `${building.pin}.webp`);
  const wanted = photoUrl(building.pin);
  if (existsSync(webp)) {
    skipped += 1;
    continue;
  }

  try {
    if (streetviewOnly) {
      const curl = spawnSync("curl", ["--fail", "--location", "--max-time", timeout, "--silent", "--show-error", "--output", jpg, streetviewUrl(building.address)], {
        stdio: "pipe",
        encoding: "utf8",
      });
      if (curl.status !== 0) throw new Error(curl.stderr);
    } else {
      const responsePromise = page.waitForResponse(
        (response) =>
          response.status() === 200 &&
          (response.url() === wanted ||
            (response.url().includes("/pin_detail/") && response.url().includes(`${building.pin}_`)) ||
            response.url().includes("maps.googleapis.com/maps/api/streetview")),
        { timeout: Number(timeout) * 1000 }
      );
      await page.goto(pageUrl(building.pin), { waitUntil: "domcontentloaded", timeout: 30000 });
      const response = await responsePromise;
      writeFileSync(jpg, await response.body());
    }
  } catch {
    failed += 1;
    rmSync(jpg, { force: true });
    console.error(`download failed: ${building.pin} ${building.address}`);
    continue;
  }
  downloaded += 1;

  const cwebp = spawnSync("cwebp", ["-quiet", "-resize", "900", "0", "-q", "68", "-metadata", "none", jpg, "-o", webp], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (cwebp.status !== 0) {
    failed += 1;
    rmSync(webp, { force: true });
    console.error(`convert failed: ${building.pin} ${building.address}`);
    continue;
  }
  converted += 1;
}

await browser?.close();
console.log(`skipped ${skipped}, downloaded ${downloaded}, converted ${converted}, failed ${failed}`);

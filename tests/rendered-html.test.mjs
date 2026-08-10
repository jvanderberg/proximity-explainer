// Sanity checks on the static export: key machine-generated numbers must appear.
import { test } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "out", "index.html"), "utf8");

test("headline counts from the pipeline are rendered", () => {
  assert.match(html, /2,332/); // multi-family buildings
  assert.match(html, /9,596/); // single-family homes
  assert.match(html, /965/); // embedded buildings
  assert.match(html, /1,367/); // corridor buildings
});

test("key results are rendered", () => {
  assert.match(html, /−3\.2%/); // corridor sanity check, ring design
  assert.match(html, /\+1\.2%/); // embedded 0-100 ft, whole-village model
  assert.match(html, /\+0\.9%/); // ring embedded 0-100 ft
  assert.match(html, /7,990/); // ring sample
});

test("map geometry is rendered", () => {
  assert.match(html, /class="village"/);
  assert.ok((html.match(/circle/g) ?? []).length > 2000, "building dots present");
});

test("links to paper, map, and repo exist", () => {
  assert.match(html, /op-mf-proximity\/outputs\/paper\.html/);
  assert.match(html, /op-mf-proximity\/outputs\/map\.html/);
  assert.match(html, /github\.com\/jvanderberg\/op-mf-proximity/);
});

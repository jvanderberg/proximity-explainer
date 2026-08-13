import { chromium } from "playwright";

const url = process.argv[2] ?? "https://www.cookcountyassessoril.gov/pin/16074090060000";

const headed = process.argv.includes("--headed");
const browser = await chromium.launch({ headless: !headed });
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
});
const responses = [];

page.on("response", async (response) => {
  const request = response.request();
  const type = request.resourceType();
  const contentType = response.headers()["content-type"] ?? "";
  if (type === "image" || contentType.startsWith("image/")) {
    responses.push({ status: response.status(), type, contentType, url: response.url() });
  }
});

await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
await page.screenshot({ path: ".cache/assessor-probe.png", fullPage: true });

const images = await page.$$eval("img", (nodes) =>
  nodes.map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    className: img.className,
  }))
);

console.log(JSON.stringify({ title: await page.title(), url: page.url(), images, imageResponses: responses }, null, 2));
await browser.close();

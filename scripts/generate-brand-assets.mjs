// Generates every brand asset from code so they stay consistent and re-runnable:
//   src/app/icon.png, src/app/apple-icon.png, src/app/favicon.ico
//   public/icons/icon-{192,512}.png, public/icons/maskable-512.png
//   public/og/<page>.jpg (1200x630 share cards)
//   public/brand/martinmx-logo-white@2x.png (email wordmark)
//
// Usage: node scripts/generate-brand-assets.mjs
// Needs network for Google Fonts (Kanit/Archivo) and Playwright's Chromium.
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
// Inline as data URIs: Chromium won't load file:// assets into a setContent() page.
const mime = { ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const dataUrl = async (p) =>
  `data:${mime[path.extname(p)]};base64,${(await fs.readFile(path.join(root, p))).toString("base64")}`;

const BRAND = "#338e00";
const VOLT = "#5fd400";
const INK = "#0b0b0b";

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700&family=Kanit:ital,wght@1,800;1,900&display=block" rel="stylesheet">`;

/** Square "MX" monogram in the brand display face. `pad` leaves room for maskable safe zones. */
function iconHtml(size, { pad = 0.08, radius = 0.18 } = {}) {
  const inner = size * (1 - pad * 2);
  return `<!doctype html><html><head>${fonts}<style>
    html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
    .tile{width:${size}px;height:${size}px;display:grid;place-items:center;background:${BRAND};border-radius:${radius * size}px;overflow:hidden}
    .mx{font-family:Kanit;font-style:italic;font-weight:900;color:#fff;font-size:${inner * 0.62}px;letter-spacing:-0.04em;line-height:1;transform:translate(-2%,-3%)}
  </style></head><body><div class="tile"><span class="mx">MX</span></div></body></html>`;
}

const pages = [
  { slug: "home", eyebrow: "Martin, Michigan · Off US-131", title: ["This is", "motocross."], photo: "public/photos/roost-292.jpg", pos: "70% 40%" },
  { slug: "schedule", eyebrow: "Ride calendar", title: ["Schedule", "& track status"], photo: "public/photos/roost-yellow.jpg", pos: "60% 40%" },
  { slug: "track-info", eyebrow: "Hours · Gear · Waivers · Rules", title: ["Know before", "you go."], photo: "public/photos/roost-green.jpg", pos: "60% 35%" },
  { slug: "register", eyebrow: "Practice days & memberships", title: ["Get on", "the gate list."], photo: "public/photos/hero-bw.jpg", pos: "25% 30%" },
  { slug: "sponsors", eyebrow: "Our partners", title: ["Backed by", "the best."], photo: "public/photos/roost-495.jpg", pos: "60% 35%" },
  { slug: "gallery", eyebrow: "From the track", title: ["Roost", "& repeat."], photo: "public/photos/rider-red.jpg", pos: "60% 45%" },
  { slug: "hiring", eyebrow: "Now hiring", title: ["Work", "the track."], photo: "public/media/gallery/strapi-main-1.jpg", pos: "50% 60%" },
  { slug: "contact", eyebrow: "1479 12th St · Martin, MI", title: ["Get in", "touch."], photo: "public/media/gallery/strapi-main-3.jpg", pos: "50% 60%" },
];

async function ogHtml({ eyebrow, title, photo, pos }) {
  return `<!doctype html><html><head>${fonts}<style>
    *{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;background:${INK};overflow:hidden}
    .photo{position:absolute;inset:0;background:url('${await dataUrl(photo)}') ${pos}/cover no-repeat}
    .shade{position:absolute;inset:0;background:linear-gradient(90deg,${INK} 0%,rgba(11,11,11,.92) 38%,rgba(11,11,11,.35) 70%,rgba(11,11,11,.15) 100%),linear-gradient(0deg,rgba(11,11,11,.85),transparent 45%)}
    .bar{position:absolute;left:0;top:0;bottom:0;width:14px;background:${VOLT}}
    .wrap{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
    .logo{height:40px;width:auto;display:block;align-self:flex-start}
    .eyebrow{font-family:Archivo;font-weight:700;font-size:20px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.78);display:flex;align-items:center;gap:18px}
    .eyebrow:before{content:"";width:48px;height:2px;background:${VOLT}}
    h1{margin:22px 0 0;font-family:Kanit;font-style:italic;font-weight:900;text-transform:uppercase;line-height:.86;letter-spacing:-.02em;font-size:118px;color:#fff}
    h1 span{display:block;color:${VOLT}}
    .foot{font-family:Archivo;font-weight:500;font-size:22px;color:rgba(255,255,255,.7);letter-spacing:.04em}
  </style></head><body>
    <div class="photo"></div><div class="shade"></div><div class="bar"></div>
    <div class="wrap">
      <img class="logo" src="${await dataUrl("public/brand/martinmx-logo-white.svg")}">
      <div><div class="eyebrow">${eyebrow}</div><h1>${title[0]}<span>${title[1]}</span></h1></div>
      <div class="foot">martinmxpark.com</div>
    </div></body></html>`;
}

/** Minimal ICO writer: embeds PNG frames directly (supported by every modern browser). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const browser = await chromium.launch();
const page = await browser.newPage();

async function renderIcon(size, opts, out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size, opts), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.screenshot({ omitBackground: true, type: "png" });
  if (out) await fs.writeFile(path.join(root, out), data);
  return data;
}

await fs.mkdir(path.join(root, "public/icons"), { recursive: true });
await fs.mkdir(path.join(root, "public/og"), { recursive: true });

await renderIcon(512, {}, "src/app/icon.png");
await renderIcon(180, { radius: 0 }, "src/app/apple-icon.png"); // iOS rounds corners itself
await renderIcon(192, {}, "public/icons/icon-192.png");
await renderIcon(512, {}, "public/icons/icon-512.png");
await renderIcon(512, { pad: 0.2, radius: 0 }, "public/icons/maskable-512.png");
const icoFrames = [];
for (const size of [16, 32, 48]) icoFrames.push({ size, data: await renderIcon(size, { pad: 0.02, radius: 0.12 }) });
await fs.writeFile(path.join(root, "src/app/favicon.ico"), buildIco(icoFrames));

// PNG wordmark for email (Gmail and Outlook don't render SVG). 2x for retina at 220px wide.
await page.setViewportSize({ width: 440, height: 57 });
await page.setContent(
  `<html><body style="margin:0;background:transparent"><img src="${await dataUrl("public/brand/martinmx-logo-white.svg")}" style="width:440px;height:57px;display:block"></body></html>`,
);
await page.screenshot({ path: path.join(root, "public/brand/martinmx-logo-white@2x.png"), omitBackground: true });

await page.setViewportSize({ width: 1200, height: 630 });
for (const p of pages) {
  await page.setContent(await ogHtml(p), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, `public/og/${p.slug}.jpg`), type: "jpeg", quality: 86 });
}

await browser.close();
console.log(`icons + ${pages.length} share cards written`);

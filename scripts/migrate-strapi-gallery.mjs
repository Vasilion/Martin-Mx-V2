// One-time: move the Strapi/Cloudinary gallery into S3 and the owner-editable gallery doc.
// Usage: MARTIN_TABLE=martin-mx node scripts/migrate-strapi-gallery.mjs [--write]
// Reads .strapi-export/martin-galleries.json. Without --write it only uploads and prints.
// With --write it prepends the photos to CONFIG/gallery (keeps anything already there).
import fs from "node:fs/promises";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const BUCKET = "martin-mx-media";
const BASE = "https://martin-mx-media.s3.amazonaws.com/public";
const write = process.argv.includes("--write");
const s3 = new S3Client({ region: "us-east-1" });

const exp = JSON.parse(await fs.readFile(".strapi-export/martin-galleries.json", "utf8"));
const images = exp.data.flatMap((g) => g.attributes.images?.data ?? []);
console.log(`${images.length} images in the Strapi gallery`);

const out = [];
for (const [i, img] of images.entries()) {
  const a = img.attributes;
  const res = await fetch(a.url);
  if (!res.ok) {
    console.log(`  skip ${a.name}: ${res.status}`);
    continue;
  }
  const input = Buffer.from(await res.arrayBuffer());
  const { data, info } = await sharp(input).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const key = `public/gallery/strapi-${img.id}.webp`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: data, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
  out.push({ id: `strapi-${img.id}`, src: `${BASE}/${key.slice(7)}`, alt: a.alternativeText || "Rider at Martin MX Park", width: info.width, height: info.height, featured: false });
  console.log(`  ${i + 1}/${images.length} ${a.name} ${Math.round(input.length / 1024)}KB -> ${Math.round(data.length / 1024)}KB`);
}

if (write) {
  const table = process.env.MARTIN_TABLE;
  if (!table) throw new Error("Set MARTIN_TABLE");
  const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }), { marshallOptions: { removeUndefinedValues: true } });
  const cur = await db.send(new GetCommand({ TableName: table, Key: { pk: "CONFIG", sk: "gallery" } }));
  // No saved gallery yet: start from the site's default featured photos (mirrors content.ts).
  const seed = [
    ["/photos/roost-495.jpg", "Young rider #495 roosting through deep sand", 1600, 1200],
    ["/photos/roost-yellow.jpg", "Rider on a yellow bike blasting a roost in a corner", 1400, 934],
    ["/media/gallery/strapi-gallery-9.jpg", "Rider whipping over a jump against the sky", 1000, 1000],
    ["/photos/roost-green.jpg", "Rider #10 on a green bike throwing dirt off a berm", 1400, 933],
    ["/media/gallery/strapi-gallery-4.jpg", "Rider airborne over the tree line", 1000, 1000],
    ["/photos/rider-red.jpg", "Rider leaning a red bike through a flat corner", 1600, 1200],
  ].map(([src, alt, width, height], i) => ({ id: `seed-${i}`, src, alt, width, height, featured: true }));
  const existing = cur.Item?.value?.items ?? seed;
  const ids = new Set(existing.map((x) => x.id));
  const items = [...existing, ...out.filter((x) => !ids.has(x.id))].slice(0, 300);
  await db.send(new PutCommand({ TableName: table, Item: { pk: "CONFIG", sk: "gallery", value: { items }, updatedAt: new Date().toISOString() } }));
  console.log(`CONFIG/gallery now has ${items.length} photos`);
}

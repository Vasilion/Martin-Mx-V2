import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MEDIA_BASE_URL } from "@/lib/media";

const BUCKET = process.env.MEDIA_BUCKET ?? "martin-mx-media";
let s3: S3Client | null = null;

export const uploadKinds = {
  image: { types: ["image/webp", "image/jpeg", "image/png"], maxBytes: 8 * 1024 * 1024 },
  pdf: { types: ["application/pdf"], maxBytes: 15 * 1024 * 1024 },
} as const;
export type UploadKind = keyof typeof uploadKinds;

const ext: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };

/**
 * A 5-minute presigned PUT into public/<folder>/. The signature pins the content type
 * and length, so the browser can only upload exactly what it declared.
 */
export async function presignUpload(folder: string, contentType: string, size: number, kind: UploadKind) {
  const rule = uploadKinds[kind];
  if (!(rule.types as readonly string[]).includes(contentType)) throw new Error("That file type isn't supported.");
  if (size <= 0 || size > rule.maxBytes) throw new Error(`Files must be under ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`);
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
  const key = `public/${safeFolder}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID()}.${ext[contentType]}`;
  s3 ??= new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType, ContentLength: size, CacheControl: "public, max-age=31536000, immutable" }),
    { expiresIn: 300 },
  );
  return { uploadUrl, publicUrl: `${MEDIA_BASE_URL}/${key.slice("public/".length)}` };
}

"use client";

import { createUpload } from "@/app/admin/actions";

/**
 * Shrinks a photo in the browser before upload: phones produce 4-12 MB images, the site
 * never needs more than ~2000px. WebP keeps logo transparency and is small for photos.
 */
export async function resizeImage(file: File, maxEdge = 2000): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  const source = bitmap ?? (await loadViaImg(file));
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(source as CanvasImageSource, 0, 0, width, height);
  bitmap?.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process that image."))), "image/webp", 0.85),
  );
  // Safari < 16 can't encode WebP and silently returns PNG; fall back to JPEG for photos.
  if (blob.type !== "image/webp") {
    const jpeg = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't process that image."))), "image/jpeg", 0.85),
    );
    return { blob: jpeg, width, height };
  }
  return { blob, width, height };
}

function loadViaImg(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file isn't an image this browser can read. Try a JPEG or PNG."));
    img.src = URL.createObjectURL(file);
  });
}

/** Presign on the server, then PUT straight to S3. Returns the public URL. */
export async function uploadBlob(blob: Blob, folder: string, kind: "image" | "pdf"): Promise<string> {
  const res = await createUpload({ folder, contentType: blob.type, size: blob.size, kind });
  if (!res.ok) throw new Error(res.error);
  const put = await fetch(res.uploadUrl, { method: "PUT", body: blob, headers: { "content-type": blob.type } });
  if (!put.ok) throw new Error("Upload failed. Check your connection and try again.");
  return res.publicUrl;
}

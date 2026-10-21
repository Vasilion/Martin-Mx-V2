/**
 * Public media lives in S3 (bucket martin-mx-media, prefix public/), so emails and
 * uploads load no matter where the site itself is hosted.
 */
export const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL ?? "https://martin-mx-media.s3.amazonaws.com/public";

export const emailLogoUrl = `${MEDIA_BASE_URL}/email/martinmx-logo-white@2x.png`;

/** Uploaded media (S3) is already resized on upload, so skip Next's optimizer for it. */
export function isRemote(src: string) {
  return /^https?:\/\//.test(src);
}

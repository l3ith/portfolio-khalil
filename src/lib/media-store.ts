import { COMPRESSIBLE_TYPES, optimizeImage } from "@/lib/compress";
import { newKey, publicUrl, putObject } from "@/lib/r2";

// Bucket layout:
//   originals/  untouched uploads of compressible images (kept for re-encoding later)
//   images/     optimised images served on the site
//   media/      videos, GIFs, SVGs — stored as-is

export const ALLOWED_TYPES = [
  ...COMPRESSIBLE_TYPES,
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/ogg",
];

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export const isCompressible = (contentType: string) => COMPRESSIBLE_TYPES.includes(contentType);

/** Optimise an original already stored at `originalKey` and return the public URL to use. */
export async function storeOptimized(original: Buffer, contentType: string, originalKey: string) {
  const optimized = await optimizeImage(original, contentType);
  if (!optimized) return { url: publicUrl(originalKey), optimized: null };
  const name = originalKey.split("/").pop()!.replace(/^[0-9a-f-]{36}-/, "");
  const key = newKey("images", name, optimized.ext);
  await putObject(key, optimized.data, optimized.contentType);
  return { url: publicUrl(key), optimized };
}

/** Full pipeline for a file held in memory (used by the migration script). */
export async function storeMedia(data: Buffer, filename: string, contentType: string) {
  if (isCompressible(contentType)) {
    const originalKey = newKey("originals", filename);
    await putObject(originalKey, data, contentType);
    return await storeOptimized(data, contentType, originalKey);
  }
  const key = newKey("media", filename);
  await putObject(key, data, contentType);
  return { url: publicUrl(key), optimized: null };
}

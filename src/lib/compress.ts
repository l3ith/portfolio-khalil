import sharp from "sharp";

// Adaptive WebP compression.
// 1. Auto-rotate (EXIF) and downscale to MAX_EDGE on the long side (never upscale).
// 2. Binary-search the lowest WebP quality whose SSIM against the resized
//    source stays >= TARGET_SSIM. Detailed photos keep a high quality, flat
//    images compress much harder — quality is always guaranteed, not size.

const MAX_EDGE = 2560;
const COMPARE_EDGE = 1600; // SSIM is measured at this size (speed vs. accuracy)
const TARGET_SSIM = 0.985;
const Q_MIN = 55;
const Q_MAX = 92;

export const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"];

export type OptimizedImage = {
  data: Buffer;
  contentType: string;
  ext: string;
  width: number;
  height: number;
  quality: number | null; // null = original kept as-is
  ssim: number;
};

async function lumaAt(input: Buffer, width: number, height: number) {
  return await sharp(input)
    .resize(width, height, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .greyscale()
    .raw()
    .toBuffer();
}

// Mean SSIM over 8×8 windows (stride 4) on 8-bit luma.
function ssim(a: Buffer, b: Buffer, width: number, height: number) {
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const W = 8;
  const STEP = 4;
  const n = W * W;
  let total = 0;
  let count = 0;
  for (let y = 0; y + W <= height; y += STEP) {
    for (let x = 0; x + W <= width; x += STEP) {
      let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
      for (let j = 0; j < W; j++) {
        let i = (y + j) * width + x;
        for (let k = 0; k < W; k++, i++) {
          const va = a[i];
          const vb = b[i];
          sa += va;
          sb += vb;
          saa += va * va;
          sbb += vb * vb;
          sab += va * vb;
        }
      }
      const ma = sa / n;
      const mb = sb / n;
      const va = saa / n - ma * ma;
      const vb = sbb / n - mb * mb;
      const cov = sab / n - ma * mb;
      total += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      count++;
    }
  }
  return count ? total / count : 1;
}

/** Returns null when the file should be stored untouched (animated, unsupported type). */
export async function optimizeImage(input: Buffer, contentType: string): Promise<OptimizedImage | null> {
  if (!COMPRESSIBLE_TYPES.includes(contentType)) return null;

  const meta = await sharp(input, { failOn: "none" }).metadata();
  if ((meta.pages ?? 1) > 1) return null; // animated WebP/AVIF: keep the animation

  const base = await sharp(input, { failOn: "none" })
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .png({ compressionLevel: 1 }) // lossless intermediate
    .toBuffer({ resolveWithObject: true });
  const { width, height } = base.info;
  const resized = Math.max(width, height) < Math.max(meta.width ?? 0, meta.height ?? 0);

  const scale = Math.min(1, COMPARE_EDGE / Math.max(width, height));
  const cw = Math.max(8, Math.round(width * scale));
  const ch = Math.max(8, Math.round(height * scale));
  const reference = await lumaAt(base.data, cw, ch);

  const encode = (quality: number) =>
    sharp(base.data).webp({ quality, alphaQuality: 90, effort: 5, smartSubsample: true }).toBuffer();
  const score = async (data: Buffer) => ssim(reference, await lumaAt(data, cw, ch), cw, ch);

  // Fallback is Q_MAX even if it misses the target (e.g. heavy noise / grain).
  const maxData = await encode(Q_MAX);
  let best = { data: maxData, quality: Q_MAX, ssim: await score(maxData) };
  let lo = Q_MIN;
  let hi = Q_MAX - 1;
  while (lo <= hi) {
    const q = Math.floor((lo + hi) / 2);
    const data = await encode(q);
    const s = await score(data);
    if (s >= TARGET_SSIM) {
      best = { data, quality: q, ssim: s };
      hi = q - 1;
    } else {
      lo = q + 1;
    }
  }

  // An already-optimised web image that didn't need resizing: keep it if smaller.
  const webFriendly = contentType === "image/jpeg" || contentType === "image/webp";
  if (webFriendly && !resized && input.length <= best.data.length) {
    return {
      data: input,
      contentType,
      ext: contentType === "image/jpeg" ? "jpg" : "webp",
      width,
      height,
      quality: null,
      ssim: 1,
    };
  }

  return { data: best.data, contentType: "image/webp", ext: "webp", width, height, quality: best.quality, ssim: best.ssim };
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image as PDFImage,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import sharp from "sharp";
import { isVideo } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// ── oklch → hex ──────────────────────────────────────────────────────────────
function oklchToHex(l: number, c: number, h: number): string {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lv = l_ ** 3, mv = m_ ** 3, sv = s_ ** 3;

  const toSRGB = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;

  const r = toSRGB(Math.max(0, Math.min(1, +4.0767416621 * lv - 3.3077115913 * mv + 0.2309699292 * sv)));
  const g = toSRGB(Math.max(0, Math.min(1, -1.2684380046 * lv + 2.6097574011 * mv - 0.3413193965 * sv)));
  const bv = toSRGB(Math.max(0, Math.min(1, -0.0041960863 * lv - 0.7034186147 * mv + 1.6956202966 * sv)));

  const hex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(bv)}`;
}

function accentHex(value: string | null | undefined): string {
  if (!value) return oklchToHex(0.78, 0.17, 75);
  const v = value.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  if (/^\d+(\.\d+)?$/.test(v)) return oklchToHex(0.78, 0.17, parseFloat(v));
  const m = v.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (m) return oklchToHex(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  return "#d4b483";
}

// ── strip HTML to plain text ──────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
  },
  coverPage: {
    backgroundColor: "#0a0a0a",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  coverInner: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  coverLabel: {
    fontSize: 8,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "#555555",
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 28,
    letterSpacing: 6,
    textTransform: "uppercase",
    color: "#f0eee8",
    marginBottom: 8,
  },
  coverSub: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#555555",
    marginTop: 16,
  },
  meta: {
    fontSize: 7.5,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#888888",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#0a0a0a",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  rule: {
    height: 2,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#666666",
  },
  infoValue: {
    fontSize: 8.5,
    color: "#222222",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 9.5,
    lineHeight: 1.65,
    color: "#333333",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 7,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: "#aaaaaa",
    marginBottom: 8,
    marginTop: 4,
  },
  creditsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 8,
    paddingTop: 10,
    borderTop: "0.5px solid #e0e0e0",
  },
  creditRole: {
    fontSize: 6.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#999999",
    marginBottom: 2,
  },
  creditName: {
    fontSize: 8.5,
    color: "#333333",
  },
  pageNum: {
    position: "absolute",
    bottom: 20,
    right: 44,
    fontSize: 7,
    letterSpacing: 1.5,
    color: "#bbbbbb",
    textTransform: "uppercase",
  },
});

// ── types ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProjectData = any;
type SketchData = Awaited<ReturnType<typeof fetchSketches>>[number];
type Encoded = { src: { data: Buffer; format: "jpg" }; ratio: number };
type GalleryImg = Encoded & { caption?: string };

// ── image compression ─────────────────────────────────────────────────────────
// react-pdf only embeds JPEG/PNG, so every image is re-encoded to JPEG.
// Levels go from best to smallest; the first one whose rendered PDF fits
// under MAX_PDF_BYTES is kept.
const MAX_PDF_BYTES = 15 * 1000 * 1000;
const SAFETY_BYTES = 500 * 1000; // fonts, text and PDF structure
const LEVELS = [
  { edge: 2000, quality: 82 },
  { edge: 1600, quality: 76 },
  { edge: 1400, quality: 70 },
  { edge: 1200, quality: 65 },
  { edge: 1000, quality: 60 },
  { edge: 850, quality: 55 },
  { edge: 700, quality: 50 },
  { edge: 560, quality: 45 },
  { edge: 440, quality: 40 },
];
type Level = (typeof LEVELS)[number];

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    })
  );
}

async function downloadAll(urls: string[], origin: string): Promise<Map<string, Buffer>> {
  const map = new Map<string, Buffer>();
  await mapLimit([...new Set(urls)], 6, async (url) => {
    try {
      const res = await fetch(new URL(url, origin)); // relative paths = /public files
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      map.set(url, Buffer.from(await res.arrayBuffer()));
    } catch (err) {
      console.warn("PDF export: image skipped", url, err);
    }
  });
  return map;
}

async function encodeAll(originals: Map<string, Buffer>, level: Level): Promise<Map<string, Encoded>> {
  const map = new Map<string, Encoded>();
  await mapLimit([...originals], 4, async ([url, buf]) => {
    try {
      const { data, info } = await sharp(buf)
        .rotate()
        .resize(level.edge, level.edge, { fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: level.quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
      map.set(url, { src: { data, format: "jpg" }, ratio: info.width / info.height });
    } catch (err) {
      console.warn("PDF export: image not decodable", url, err);
    }
  });
  return map;
}

function totalBytes(images: Map<string, Encoded>) {
  let n = 0;
  for (const img of images.values()) n += img.src.data.length;
  return n;
}

// ── media references ──────────────────────────────────────────────────────────
const usable = (url: unknown): url is string =>
  typeof url === "string" && url.length > 0 && !isVideo(url);

function thumbRef(project: ProjectData): string | null {
  return [project.thumbnailUrl, project.renderUrl, project.sketchUrl].find(usable) ?? null;
}

function galleryRefs(project: ProjectData): { url: string; caption?: string }[] {
  return [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...project.images.map((img: any) => ({ url: img.url, caption: img.labelEn || undefined })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...project.carousels.flatMap((c: any) => c.images as any[]).map((img: any) => ({
      url: img.url,
      caption: img.caption || undefined,
    })),
  ].filter((img) => usable(img.url));
}

// ── Gallery grid (2 columns) ──────────────────────────────────────────────────
// natural = keep each image's own aspect ratio (sketchbook) instead of 16:9 crops.
function GalleryGrid({
  images,
  colW,
  gap,
  natural = false,
}: {
  images: GalleryImg[];
  colW: number;
  gap: number;
  natural?: boolean;
}) {
  const rows: GalleryImg[][] = [];
  for (let i = 0; i < images.length; i += 2) rows.push(images.slice(i, i + 2));

  return React.createElement(
    View,
    { style: { marginBottom: 16 } },
    ...rows.map((row, ri) =>
      React.createElement(
        View,
        { key: ri, wrap: false, style: { flexDirection: "row", alignItems: "flex-start", gap, marginBottom: gap } },
        ...row.map((img, ii) =>
          React.createElement(
            View,
            { key: ii, style: { width: colW } },
            React.createElement(PDFImage, {
              src: img.src,
              style: { width: colW, height: natural ? colW / img.ratio : (colW * 9) / 16, objectFit: "cover" },
            }),
            img.caption
              ? React.createElement(
                  Text,
                  { style: { fontSize: 6.5, color: "#aaaaaa", letterSpacing: 1, marginTop: 3 } },
                  img.caption
                )
              : null
          )
        )
      )
    )
  );
}

// ── Project page ──────────────────────────────────────────────────────────────
function ProjectPage({
  project,
  index,
  total,
  images,
}: {
  project: ProjectData;
  index: number;
  total: number;
  images: Map<string, Encoded>;
}) {
  const accent = accentHex(project.accent);
  const description = stripHtml(project.descriptionEn);
  const contentWidth = 507; // A4 595pt − 2×44pt padding
  const gap = 6;
  const colW = (contentWidth - gap) / 2;

  const galleryImages: GalleryImg[] = galleryRefs(project).flatMap(({ url, caption }) => {
    const enc = images.get(url);
    return enc ? [{ ...enc, caption }] : [];
  });

  const thumbUrl = thumbRef(project);
  const thumb = thumbUrl ? images.get(thumbUrl) : undefined;

  return React.createElement(
    Page,
    { size: "A4", style: S.page },
    React.createElement(Text, { style: S.meta }, `${project.code}  ·  ${project.category.nameEn}  ·  ${project.year}`),
    React.createElement(View, { style: { ...S.rule, backgroundColor: accent } }),
    React.createElement(Text, { style: S.title }, project.titleEn),
    React.createElement(Text, { style: S.subtitle }, project.subtitleEn),
    React.createElement(
      View,
      { style: S.infoRow },
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: S.infoLabel }, "Client"),
        React.createElement(Text, { style: S.infoValue }, project.client || "—")
      ),
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: S.infoLabel }, "Role"),
        React.createElement(Text, { style: S.infoValue }, project.role || "—")
      ),
      React.createElement(
        View,
        null,
        React.createElement(Text, { style: S.infoLabel }, "Year"),
        React.createElement(Text, { style: S.infoValue }, String(project.year ?? "—"))
      )
    ),
    description && description !== "—"
      ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: S.sectionLabel }, "Description"),
          React.createElement(Text, { style: S.description }, description)
        )
      : null,
    thumb
      ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: S.sectionLabel }, "Thumbnail"),
          React.createElement(PDFImage, {
            src: thumb.src,
            style: { width: contentWidth, height: (contentWidth * 9) / 16, objectFit: "cover", marginBottom: 16 },
          })
        )
      : null,
    galleryImages.length > 0
      ? React.createElement(
          View,
          null,
          React.createElement(
            Text,
            { style: S.sectionLabel },
            `Gallery  ·  ${galleryImages.length} image${galleryImages.length !== 1 ? "s" : ""}`
          ),
          React.createElement(GalleryGrid, { images: galleryImages, colW, gap })
        )
      : null,
    project.credits.length > 0
      ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: S.sectionLabel }, "Credits"),
          React.createElement(
            View,
            { style: S.creditsRow },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...project.credits.map((cr: any) =>
              React.createElement(
                View,
                { key: cr.id, style: { minWidth: 120 } },
                React.createElement(Text, { style: S.creditRole }, cr.roleEn),
                React.createElement(Text, { style: S.creditName }, cr.name)
              )
            )
          )
        )
      : null,
    React.createElement(
      Text,
      { style: S.pageNum },
      `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`
    )
  );
}

// ── Sketchbook page(s) ────────────────────────────────────────────────────────
function SketchbookPage({ items, images }: { items: SketchData[]; images: Map<string, Encoded> }) {
  const contentWidth = 507;
  const gap = 8;
  const colW = (contentWidth - gap) / 2;
  const sketches: GalleryImg[] = items.flatMap((it) => {
    const enc = images.get(it.imageUrl);
    return enc ? [{ ...enc, caption: it.titleEn || undefined }] : [];
  });

  return React.createElement(
    Page,
    { size: "A4", style: S.page },
    React.createElement(Text, { style: S.meta }, `Sketchbook  ·  Free work  ·  ${sketches.length} entries`),
    React.createElement(View, { style: { ...S.rule, backgroundColor: "#0a0a0a" } }),
    React.createElement(Text, { style: { ...S.title, marginBottom: 16 } }, "Sketchbook"),
    React.createElement(GalleryGrid, { images: sketches, colW, gap, natural: true })
  );
}

// ── Cover page ────────────────────────────────────────────────────────────────
function CoverPage({ count }: { count: number }) {
  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  return React.createElement(
    Page,
    { size: "A4", style: { ...S.page, ...S.coverPage } },
    React.createElement(
      View,
      { style: S.coverInner },
      React.createElement(Text, { style: S.coverLabel }, "Portfolio"),
      React.createElement(Text, { style: S.coverTitle }, "Projects"),
      React.createElement(
        Text,
        { style: { ...S.coverLabel, marginBottom: 0, marginTop: 24 } },
        `${count} project${count !== 1 ? "s" : ""}`
      ),
      React.createElement(Text, { style: S.coverSub }, date)
    )
  );
}

// ── Document ──────────────────────────────────────────────────────────────────
function PortfolioPDF({
  projects,
  sketches,
  images,
}: {
  projects: ProjectData[];
  sketches: SketchData[];
  images: Map<string, Encoded>;
}) {
  const hasSketches = sketches.some((s) => images.has(s.imageUrl));
  return React.createElement(
    Document,
    { title: "Portfolio — Projects", author: "Khalil" },
    React.createElement(CoverPage, { count: projects.length }),
    ...projects.map((p, i) =>
      React.createElement(ProjectPage, { key: p.id, project: p, index: i, total: projects.length, images })
    ),
    hasSketches ? React.createElement(SketchbookPage, { items: sketches, images }) : null
  );
}

// ── Data fetch ────────────────────────────────────────────────────────────────
// Same selection and order as the public site: published projects by `order`,
// then the sketchbook by `order`.
async function fetchProjects(): Promise<ProjectData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).project.findMany({
    where: { published: true },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      carousels: {
        orderBy: { position: "asc" },
        include: { images: { orderBy: { order: "asc" } } },
      },
      credits: { orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });
}

async function fetchSketches() {
  return db.sketchbookItem.findMany({ orderBy: { order: "asc" } });
}

// Re-encode images at decreasing levels until the whole PDF fits in MAX_PDF_BYTES.
async function renderPdf(projects: ProjectData[], sketches: SketchData[], origin: string): Promise<Buffer> {
  const urls = [
    ...projects.flatMap((p) => [thumbRef(p), ...galleryRefs(p).map((g) => g.url)]),
    ...sketches.map((s) => s.imageUrl),
  ].filter(usable);
  const originals = await downloadAll(urls, origin);

  let pdf: Buffer | null = null;
  for (const [i, level] of LEVELS.entries()) {
    const isLast = i === LEVELS.length - 1;
    const images = await encodeAll(originals, level);
    // No need to render when the images alone already exceed the budget.
    if (!isLast && totalBytes(images) > MAX_PDF_BYTES - SAFETY_BYTES) continue;
    pdf = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(PortfolioPDF, { projects, sketches, images }) as any
    );
    if (pdf.length <= MAX_PDF_BYTES) {
      console.info(`PDF export: ${(pdf.length / 1e6).toFixed(1)} MB at edge ${level.edge}px / q${level.quality}`);
      break;
    }
  }
  return pdf!;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const [projects, sketches] = await Promise.all([fetchProjects(), fetchSketches()]);
    const nodeBuffer = await renderPdf(projects, sketches, new URL(req.url).origin);
    const buffer = nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    ) as ArrayBuffer;

    const filename = `portfolio-projects-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

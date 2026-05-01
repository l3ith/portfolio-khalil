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
type GalleryImg = { url: string; caption?: string };

// ── Gallery grid (2 columns) ──────────────────────────────────────────────────
function GalleryGrid({ images, colW, gap }: { images: GalleryImg[]; colW: number; gap: number }) {
  const rows: GalleryImg[][] = [];
  for (let i = 0; i < images.length; i += 2) rows.push(images.slice(i, i + 2));

  return React.createElement(
    View,
    { style: { marginBottom: 16 } },
    ...rows.map((row, ri) =>
      React.createElement(
        View,
        { key: ri, style: { flexDirection: "row", gap, marginBottom: gap } },
        ...row.map((img, ii) =>
          React.createElement(
            View,
            { key: ii, style: { width: colW } },
            React.createElement(PDFImage, {
              src: img.url,
              style: { width: colW, height: (colW * 9) / 16, objectFit: "cover" },
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
function ProjectPage({ project, index, total }: { project: ProjectData; index: number; total: number }) {
  const accent = accentHex(project.accent);
  const description = stripHtml(project.descriptionEn);
  const contentWidth = 507; // A4 595pt − 2×44pt padding
  const gap = 6;
  const colW = (contentWidth - gap) / 2;

  const galleryImages: GalleryImg[] = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...project.images
      .filter((img: any) => img.url)
      .map((img: any) => ({ url: img.url as string, caption: (img.labelEn || undefined) as string | undefined })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...project.carousels
      .flatMap((c: any) => c.images as any[])
      .filter((img: any) => img.url)
      .map((img: any) => ({ url: img.url as string, caption: (img.caption || undefined) as string | undefined })),
  ];

  const thumb = project.thumbnailUrl || project.renderUrl || project.sketchUrl;

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
        React.createElement(Text, { style: S.infoLabel }, "Status"),
        React.createElement(Text, { style: S.infoValue }, project.published ? "Published" : "Draft")
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
            src: thumb,
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
function PortfolioPDF({ projects }: { projects: ProjectData[] }) {
  return React.createElement(
    Document,
    { title: "Portfolio — Projects", author: "Khalil" },
    React.createElement(CoverPage, { count: projects.length }),
    ...projects.map((p, i) =>
      React.createElement(ProjectPage, { key: p.id, project: p, index: i, total: projects.length })
    )
  );
}

// ── Data fetch ────────────────────────────────────────────────────────────────
async function fetchProjects(): Promise<ProjectData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any).project.findMany({
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

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const projects = await fetchProjects();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeBuffer = await renderToBuffer(
      React.createElement(PortfolioPDF, { projects }) as any
    );
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

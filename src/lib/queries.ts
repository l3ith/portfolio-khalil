import { db } from "@/lib/db";
import type { Lang } from "@/lib/lang";
import type { Project } from "@/lib/data";

function pick(lang: Lang, en: string, fr: string) {
  return lang === "fr" ? fr || en : en;
}

export async function fetchProjects(lang: Lang): Promise<Project[]> {
  const rows = await db.project.findMany({
    where: { published: true },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      credits: { orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });
  return rows.map((p) => ({
    id: p.slug,
    code: p.code,
    title: pick(lang, p.titleEn, p.titleFr),
    subtitle: pick(lang, p.subtitleEn, p.subtitleFr),
    category: pick(lang, p.category.nameEn, p.category.nameFr) as Project["category"],
    year: p.year,
    client: p.client,
    role: p.role,
    description: pick(lang, p.descriptionEn, p.descriptionFr),
    accent: p.accent,
    palette: ["#0a0a0a", "#f0eee8", "#5a5a5a"],
    sketchLabel: p.sketchLabel ?? "",
    renderLabel: p.renderLabel ?? "",
    sketchUrl: p.sketchUrl ?? null,
    renderUrl: p.renderUrl ?? null,
    thumbnailUrl: p.thumbnailUrl ?? null,
    thumbnailX: p.thumbnailX,
    thumbnailY: p.thumbnailY,
    wipePosition: p.wipePosition,
    gallery: p.images.map((g) => ({
      ratio: g.ratio,
      label: pick(lang, g.labelEn, g.labelFr),
      url: g.url || null,
    })),
    credits: p.credits.map((c) => [pick(lang, c.roleEn, c.roleFr), c.name] as [string, string]),
  }));
}

export async function fetchProject(slug: string, lang: Lang): Promise<Project | null> {
  const p = await db.project.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      credits: { orderBy: { order: "asc" } },
    },
  });
  if (!p) return null;
  return {
    id: p.slug,
    code: p.code,
    title: pick(lang, p.titleEn, p.titleFr),
    subtitle: pick(lang, p.subtitleEn, p.subtitleFr),
    category: pick(lang, p.category.nameEn, p.category.nameFr) as Project["category"],
    year: p.year,
    client: p.client,
    role: p.role,
    description: pick(lang, p.descriptionEn, p.descriptionFr),
    accent: p.accent,
    palette: ["#0a0a0a", "#f0eee8", "#5a5a5a"],
    sketchLabel: p.sketchLabel ?? "",
    renderLabel: p.renderLabel ?? "",
    sketchUrl: p.sketchUrl ?? null,
    renderUrl: p.renderUrl ?? null,
    thumbnailUrl: p.thumbnailUrl ?? null,
    thumbnailX: p.thumbnailX,
    thumbnailY: p.thumbnailY,
    wipePosition: p.wipePosition,
    gallery: p.images.map((g) => ({
      ratio: g.ratio,
      label: pick(lang, g.labelEn, g.labelFr),
      url: g.url || null,
    })),
    credits: p.credits.map((c) => [pick(lang, c.roleEn, c.roleFr), c.name] as [string, string]),
  };
}

export async function fetchAbout(lang: Lang) {
  const a = await db.about.findFirst({
    include: { timeline: { orderBy: { order: "asc" } } },
  });
  if (!a)
    return { bio: [] as string[], timeline: [] as [string, string, string][], portraitUrl: null };
  const bio = (lang === "fr" ? a.bioFr || a.bioEn : a.bioEn).split("\n\n").filter(Boolean);
  const timeline = a.timeline.map(
    (t) => [t.period, pick(lang, t.roleEn, t.roleFr), t.place] as [string, string, string],
  );
  return { bio, timeline, portraitUrl: a.portraitUrl };
}

// Migrate every stored media URL (Vercel Blob, /uploads, external) to Cloudflare R2,
// compressing images on the way. Dry-run by default:
//   npx tsx scripts/migrate-to-r2.ts            → report only
//   npx tsx scripts/migrate-to-r2.ts --apply    → upload + rewrite the database
// A JSON mapping old → new URL is written to scripts/ for rollback.
import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";
import { isR2Url } from "../src/lib/r2";
import { ALLOWED_TYPES, storeMedia } from "../src/lib/media-store";

const APPLY = process.argv.includes("--apply");

type Ref = { model: string; id: string; field: string; url: string };

const EXT_TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif",
  gif: "image/gif", svg: "image/svg+xml", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  mkv: "video/x-matroska",
};

async function collectRefs(): Promise<Ref[]> {
  const refs: Ref[] = [];
  const add = (model: string, id: string, field: string, url: string | null) => {
    if (url && url.trim()) refs.push({ model, id, field, url: url.trim() });
  };
  for (const p of await db.project.findMany({ select: { id: true, sketchUrl: true, renderUrl: true, thumbnailUrl: true } })) {
    add("project", p.id, "sketchUrl", p.sketchUrl);
    add("project", p.id, "renderUrl", p.renderUrl);
    add("project", p.id, "thumbnailUrl", p.thumbnailUrl);
  }
  for (const i of await db.projectImage.findMany({ select: { id: true, url: true } })) add("projectImage", i.id, "url", i.url);
  for (const i of await db.projectCarouselImage.findMany({ select: { id: true, url: true } })) add("projectCarouselImage", i.id, "url", i.url);
  for (const i of await db.sketchbookItem.findMany({ select: { id: true, imageUrl: true } })) add("sketchbookItem", i.id, "imageUrl", i.imageUrl);
  for (const a of await db.about.findMany({ select: { id: true, portraitUrl: true } })) add("about", a.id, "portraitUrl", a.portraitUrl);
  for (const s of await db.setting.findMany({ select: { id: true, logoUrl: true } })) add("setting", s.id, "logoUrl", s.logoUrl);
  return refs;
}

async function load(url: string): Promise<{ data: Buffer; contentType: string; filename: string } | string> {
  const clean = url.split("?")[0];
  const filename = decodeURIComponent(clean.split("/").pop() || "file");
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (url.startsWith("/")) {
    const file = path.join(process.cwd(), "public", clean);
    if (!existsSync(file)) return `missing local file public${clean}`;
    return { data: readFileSync(file), contentType: EXT_TYPES[ext] ?? "", filename };
  }
  if (!/^https?:\/\//.test(url)) return "unsupported URL";
  const res = await fetch(url);
  if (!res.ok) return `HTTP ${res.status}`;
  const header = res.headers.get("content-type")?.split(";")[0] ?? "";
  const contentType = ALLOWED_TYPES.includes(header) ? header : EXT_TYPES[ext] ?? header;
  return { data: Buffer.from(await res.arrayBuffer()), contentType, filename };
}

async function updateRef(ref: Ref, url: string) {
  const data = { [ref.field]: url };
  const where = { id: ref.id };
  switch (ref.model) {
    case "project": return db.project.update({ where, data });
    case "projectImage": return db.projectImage.update({ where, data });
    case "projectCarouselImage": return db.projectCarouselImage.update({ where, data });
    case "sketchbookItem": return db.sketchbookItem.update({ where, data });
    case "about": return db.about.update({ where, data });
    case "setting": return db.setting.update({ where, data });
  }
}

async function main() {
  const refs = await collectRefs();
  const pending = refs.filter((r) => !isR2Url(r.url));
  const urls = [...new Set(pending.map((r) => r.url))];
  console.log(`${refs.length} media references, ${refs.length - pending.length} already on R2, ${urls.length} distinct URLs to migrate`);
  console.log(APPLY ? "Mode: APPLY\n" : "Mode: dry-run (pass --apply to migrate)\n");

  const mapping: Record<string, string> = {};
  // Saved after every file so a crash mid-run still leaves a usable rollback map
  const mappingFile = path.join("scripts", `r2-migration-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  let before = 0;
  let after = 0;
  for (const [n, url] of urls.entries()) {
    const label = `[${n + 1}/${urls.length}] ${url.length > 90 ? `…${url.slice(-87)}` : url}`;
    const loaded = await load(url);
    if (typeof loaded === "string") {
      console.log(`${label}\n    SKIP: ${loaded}`);
      continue;
    }
    if (!ALLOWED_TYPES.includes(loaded.contentType)) {
      console.log(`${label}\n    SKIP: unsupported type "${loaded.contentType}"`);
      continue;
    }
    if (!APPLY) {
      console.log(`${label}\n    ok ${(loaded.data.length / 1024).toFixed(0)} KB ${loaded.contentType}`);
      before += loaded.data.length;
      continue;
    }
    const { url: newUrl, optimized } = await storeMedia(loaded.data, loaded.filename, loaded.contentType);
    const size = optimized?.data.length ?? loaded.data.length;
    before += loaded.data.length;
    after += size;
    mapping[url] = newUrl;
    for (const ref of pending.filter((r) => r.url === url)) await updateRef(ref, newUrl);
    writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    const detail = optimized?.quality ? ` q=${optimized.quality} ssim=${optimized.ssim.toFixed(4)}` : "";
    console.log(`${label}\n    → ${newUrl}\n    ${(loaded.data.length / 1024).toFixed(0)} KB → ${(size / 1024).toFixed(0)} KB${detail}`);
  }

  console.log(`\nTotal: ${(before / 1048576).toFixed(1)} MB${APPLY ? ` → ${(after / 1048576).toFixed(1)} MB` : ""}`);
  if (APPLY && Object.keys(mapping).length) console.log(`Mapping saved to ${mappingFile}`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});

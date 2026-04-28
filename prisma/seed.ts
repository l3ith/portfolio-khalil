import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PROJECTS, TIMELINE, BIO } from "../src/lib/data";
import { autoFr } from "../src/lib/translate";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const CATEGORIES: { slug: string; nameEn: string; order: number }[] = [
  { slug: "concept", nameEn: "Concept", order: 1 },
  { slug: "series", nameEn: "Series", order: 2 },
  { slug: "race", nameEn: "Race", order: 3 },
  { slug: "film", nameEn: "Film", order: 4 },
];

async function main() {
  console.log("· Wiping existing data...");
  await db.projectImage.deleteMany();
  await db.projectCredit.deleteMany();
  await db.project.deleteMany();
  await db.category.deleteMany();
  await db.timeline.deleteMany();
  await db.about.deleteMany();

  console.log("· Seeding categories...");
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const nameFr = await autoFr(c.nameEn);
    const created = await db.category.create({
      data: { slug: c.slug, nameEn: c.nameEn, nameFr, order: c.order },
    });
    catMap.set(c.nameEn, created.id);
  }

  console.log("· Seeding projects (with auto-translation, ~30s)...");
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const categoryId = catMap.get(p.category);
    if (!categoryId) continue;

    const titleFr = await autoFr(p.title);
    const subtitleFr = await autoFr(p.subtitle);
    const descriptionFr = await autoFr(p.description);

    const created = await db.project.create({
      data: {
        slug: p.id,
        code: p.code,
        titleEn: p.title,
        titleFr,
        subtitleEn: p.subtitle,
        subtitleFr,
        descriptionEn: p.description,
        descriptionFr,
        year: p.year,
        client: p.client,
        role: p.role,
        accent: p.accent,
        published: true,
        featured: true,
        order: i,
        categoryId,
        sketchLabel: p.sketchLabel,
        renderLabel: p.renderLabel,
      },
    });

    for (let g = 0; g < p.gallery.length; g++) {
      const item = p.gallery[g];
      const labelFr = await autoFr(item.label);
      await db.projectImage.create({
        data: {
          projectId: created.id,
          url: `/uploads/${p.id}-${g + 1}.jpg`,
          ratio: item.ratio,
          labelEn: item.label,
          labelFr,
          order: g,
        },
      });
    }

    for (let c = 0; c < p.credits.length; c++) {
      const [role, name] = p.credits[c];
      const roleFr = await autoFr(role);
      await db.projectCredit.create({
        data: {
          projectId: created.id,
          roleEn: role,
          roleFr,
          name,
          order: c,
        },
      });
    }

    console.log(`  ✓ ${p.code} ${p.title}`);
  }

  console.log("· Seeding about + timeline...");
  const bioEn = BIO.join("\n\n");
  const bioFr = await autoFr(bioEn);
  const about = await db.about.create({ data: { bioEn, bioFr } });
  for (let i = 0; i < TIMELINE.length; i++) {
    const [period, role, place] = TIMELINE[i];
    const roleFr = await autoFr(role);
    await db.timeline.create({
      data: {
        aboutId: about.id,
        period,
        roleEn: role,
        roleFr,
        place,
        order: i,
      },
    });
  }

  console.log("· Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

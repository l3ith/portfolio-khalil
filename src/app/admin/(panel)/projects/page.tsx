import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  adminInputStyle,
  adminLabelStyle,
  adminButtonStyle,
  adminPageHeader,
} from "@/components/admin/ui";
import { ProjectsList } from "@/components/admin/AdminLists";

export const dynamic = "force-dynamic";

async function createProject(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!code || !slug || !title || !categoryId) return;
  const created = await db.project.create({
    data: {
      code,
      slug,
      titleEn: title,
      titleFr: title,
      subtitleEn: "—",
      subtitleFr: "—",
      descriptionEn: "—",
      descriptionFr: "—",
      year: String(formData.get("year") ?? "").trim() || new Date().getFullYear().toString(),
      client: "—",
      role: "—",
      accent: "75",
      categoryId,
    },
  });
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${created.id}`);
}

async function deleteProjectById(id: string) {
  "use server";
  await db.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
}

async function reorderProjects(ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) => db.project.update({ where: { id }, data: { order: index } })),
  );
  revalidatePath("/admin/projects");
}

export default async function ProjectsPage() {
  const [rows, categories] = await Promise.all([
    db.project.findMany({ include: { category: true }, orderBy: { order: "asc" } }),
    db.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const projects = rows.map((p) => ({
    id: p.id,
    code: p.code,
    slug: p.slug,
    titleEn: p.titleEn,
    category: p.category.nameEn,
    year: p.year,
    published: p.published,
    featured: p.featured,
  }));

  return (
    <div>
      {adminPageHeader("Projects", `${projects.length} entries`)}

      {categories.length === 0 ? (
        <div
          style={{
            marginTop: 32,
            padding: 32,
            border: "1px dashed var(--rule)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 12,
            }}
          >
            · You need a category first
          </div>
          <Link href="/admin/categories" style={{ color: "var(--accent)" }}>
            Create a category →
          </Link>
        </div>
      ) : (
        <section style={{ marginTop: 32 }}>
          <h2
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "0 0 16px",
            }}
          >
            · New project
          </h2>
          <form
            action={createProject}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              border: "1px solid var(--rule)",
              padding: 20,
            }}
          >
            <label>
              <div style={adminLabelStyle}>Code</div>
              <input name="code" required style={adminInputStyle} placeholder="07" />
            </label>
            <label>
              <div style={adminLabelStyle}>Slug</div>
              <input name="slug" required style={adminInputStyle} placeholder="project-slug" />
            </label>
            <label>
              <div style={adminLabelStyle}>Year</div>
              <input name="year" style={adminInputStyle} placeholder="2026" />
            </label>
            <label>
              <div style={adminLabelStyle}>Category</div>
              <select name="categoryId" required style={adminInputStyle}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={adminLabelStyle}>Title</div>
              <input name="title" required style={adminInputStyle} />
            </label>
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={adminButtonStyle}>
                Create + edit details →
              </button>
            </div>
          </form>
        </section>
      )}

      <section style={{ marginTop: 40 }}>
        <h2
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--muted)",
            margin: "0 0 16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>· All projects</span>
          <span style={{ opacity: 0.5 }}>Drag to reorder</span>
        </h2>
        {projects.length === 0 ? (
          <div
            style={{
              padding: 32,
              border: "1px dashed var(--rule)",
              textAlign: "center",
              color: "var(--muted)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            No projects yet.
          </div>
        ) : (
          <ProjectsList
            projects={projects}
            onReorder={reorderProjects}
            onDelete={deleteProjectById}
          />
        )}
      </section>
    </div>
  );
}

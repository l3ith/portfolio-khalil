import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  adminInputStyle,
  adminLabelStyle,
  adminButtonStyle,
  adminPageHeader,
} from "@/components/admin/ui";
import { CategoriesList } from "@/components/admin/CategoriesList";

export const dynamic = "force-dynamic";

async function createCategory(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  if (!slug || !name) return;
  await db.category.create({ data: { slug, nameEn: name, nameFr: name, order } });
  revalidatePath("/admin/categories");
}

async function deleteCategoryById(id: string) {
  "use server";
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

async function reorderCategories(ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) => db.category.update({ where: { id }, data: { order: index } })),
  );
  revalidatePath("/admin/categories");
}

export default async function CategoriesPage() {
  const rows = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { projects: true } } },
  });
  const categories = rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    order: c.order,
    projectCount: c._count.projects,
  }));

  return (
    <div>
      {adminPageHeader("Categories", `${categories.length} entries`)}

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
          · New category
        </h2>
        <form
          action={createCategory}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 100px auto",
            gap: 12,
            alignItems: "end",
            border: "1px solid var(--rule)",
            padding: 20,
          }}
        >
          <label>
            <div style={adminLabelStyle}>Slug</div>
            <input name="slug" required style={adminInputStyle} placeholder="concept" />
          </label>
          <label>
            <div style={adminLabelStyle}>Name</div>
            <input name="name" required style={adminInputStyle} placeholder="Concept" />
          </label>
          <label>
            <div style={adminLabelStyle}>Order</div>
            <input name="order" type="number" defaultValue={0} style={adminInputStyle} />
          </label>
          <button type="submit" style={adminButtonStyle}>
            Create
          </button>
        </form>
      </section>

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
          <span>· All categories</span>
          <span style={{ opacity: 0.5 }}>Drag to reorder</span>
        </h2>
        {categories.length === 0 ? (
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
            No categories — create one above.
          </div>
        ) : (
          <CategoriesList
            categories={categories}
            onReorder={reorderCategories}
            onDelete={deleteCategoryById}
          />
        )}
      </section>
    </div>
  );
}

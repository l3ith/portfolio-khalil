import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  adminButtonStyle,
  adminInputStyle,
  adminLabelStyle,
  adminPageHeader,
} from "@/components/admin/ui";
import { SketchbookList } from "@/components/admin/SketchbookList";

export const dynamic = "force-dynamic";

async function addItem(formData: FormData) {
  "use server";
  const url = String(formData.get("imageUrl") ?? "").trim();
  if (!url) return;
  const ratio = String(formData.get("ratio") ?? "4/3").trim() || "4/3";
  const titleEn = String(formData.get("title") ?? "").trim();
  const noteEn = String(formData.get("note") ?? "").trim();
  const last = await db.sketchbookItem.findFirst({ orderBy: { order: "desc" } });
  const order = (last?.order ?? -1) + 1;
  await db.sketchbookItem.create({
    data: {
      imageUrl: url,
      ratio,
      titleEn,
      titleFr: titleEn,
      noteEn,
      noteFr: noteEn,
      order,
    },
  });
  revalidatePath("/admin/sketchbook");
  revalidatePath("/sketchbook");
}

async function removeItem(id: string) {
  "use server";
  await db.sketchbookItem.delete({ where: { id } });
  revalidatePath("/admin/sketchbook");
  revalidatePath("/sketchbook");
}

async function reorderItems(ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) => db.sketchbookItem.update({ where: { id }, data: { order: index } })),
  );
  revalidatePath("/admin/sketchbook");
  revalidatePath("/sketchbook");
}

async function saveItemPosition(id: string, x: number, y: number) {
  "use server";
  const cx = Math.max(0, Math.min(100, Math.round(x)));
  const cy = Math.max(0, Math.min(100, Math.round(y)));
  await db.sketchbookItem.update({ where: { id }, data: { posX: cx, posY: cy } });
  revalidatePath("/admin/sketchbook");
  revalidatePath("/sketchbook");
}

async function replaceItem(id: string, url: string) {
  "use server";
  await db.sketchbookItem.update({ where: { id }, data: { imageUrl: url } });
  revalidatePath("/admin/sketchbook");
  revalidatePath("/sketchbook");
}

export default async function SketchbookAdminPage() {
  const items = await db.sketchbookItem.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      {adminPageHeader("Sketchbook / Free work", "Standalone renders, sketches, isolated studies")}

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
          · Add a new item
        </h2>
        <form
          action={addItem}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 2fr auto",
            gap: 12,
            border: "1px solid var(--rule)",
            padding: 16,
            alignItems: "end",
          }}
        >
          <ImageUploader
            name="imageUrl"
            ratioName="ratio"
            label="Image (drop or click — ratio detected automatically)"
            height={120}
          />
          <label>
            <div style={adminLabelStyle}>Title (optional)</div>
            <input name="title" style={adminInputStyle} />
          </label>
          <label>
            <div style={adminLabelStyle}>Short note (optional)</div>
            <input name="note" style={adminInputStyle} />
          </label>
          <button type="submit" style={adminButtonStyle}>
            Add to sketchbook
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
          }}
        >
          · {items.length} item{items.length === 1 ? "" : "s"} (drag to reorder)
        </h2>
        <SketchbookList
          items={items.map((i) => ({
            id: i.id,
            imageUrl: i.imageUrl,
            ratio: i.ratio,
            titleEn: i.titleEn,
            order: i.order,
            posX: i.posX,
            posY: i.posY,
          }))}
          onReorder={reorderItems}
          onDelete={removeItem}
          onPosition={saveItemPosition}
          onReplace={replaceItem}
        />
      </section>
    </div>
  );
}

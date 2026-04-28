import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { GalleryList, CreditsList } from "@/components/admin/AdminLists";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ThumbnailPositioner } from "@/components/admin/ThumbnailPositioner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { autoFr } from "@/lib/translate";
import {
  adminInputStyle,
  adminLabelStyle,
  adminButtonStyle,
  adminPageHeader,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function updateProject(id: string, formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  await db.project.update({
    where: { id },
    data: {
      code: String(formData.get("code") ?? "").trim(),
      slug,
      titleEn: title,
      titleFr: title,
      subtitleEn: subtitle,
      subtitleFr: subtitle,
      descriptionEn: description,
      descriptionFr: description,
      year: String(formData.get("year") ?? "").trim(),
      client: String(formData.get("client") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim(),
      accent: String(formData.get("accent") ?? "75").trim(),
      sketchLabel: String(formData.get("sketchLabel") ?? "").trim() || null,
      renderLabel: String(formData.get("renderLabel") ?? "").trim() || null,
      sketchUrl: String(formData.get("sketchUrl") ?? "").trim() || null,
      renderUrl: String(formData.get("renderUrl") ?? "").trim() || null,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || null,
      wipePosition: Number(formData.get("wipePosition") ?? 0),
      categoryId: String(formData.get("categoryId") ?? ""),
      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",
      order: Number(formData.get("order") ?? 0),
    },
  });
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/work");
  revalidatePath(`/work/${slug}`);
}

async function addImage(projectId: string, formData: FormData) {
  "use server";
  const url = String(formData.get("url") ?? "").trim();
  const ratio = String(formData.get("ratio") ?? "16/9").trim();
  const label = String(formData.get("label") ?? "").trim() || "Untitled";
  const lastImage = await db.projectImage.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });
  const order = (lastImage?.order ?? -1) + 1;
  if (!url) return;
  await db.projectImage.create({
    data: { projectId, url, ratio, labelEn: label, labelFr: label, order },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function removeImage(projectId: string, formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await db.projectImage.delete({ where: { id } });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function removeImageById(projectId: string, id: string) {
  "use server";
  await db.projectImage.delete({ where: { id } });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function reorderImages(projectId: string, ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) =>
      db.projectImage.update({ where: { id }, data: { order: index } }),
    ),
  );
  revalidatePath(`/admin/projects/${projectId}`);
}

async function saveSketchUrl(projectId: string, slug: string, url: string) {
  "use server";
  await db.project.update({ where: { id: projectId }, data: { sketchUrl: url || null } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/work/${slug}`);
}

async function saveRenderUrl(projectId: string, slug: string, url: string) {
  "use server";
  await db.project.update({ where: { id: projectId }, data: { renderUrl: url || null } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/work/${slug}`);
}

async function saveThumbnailUrl(projectId: string, slug: string, url: string) {
  "use server";
  await db.project.update({ where: { id: projectId }, data: { thumbnailUrl: url || null } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/work`);
  revalidatePath(`/work/${slug}`);
}

async function saveThumbnailPosition(projectId: string, slug: string, x: number, y: number) {
  "use server";
  const cx = Math.max(0, Math.min(100, Math.round(x)));
  const cy = Math.max(0, Math.min(100, Math.round(y)));
  await db.project.update({ where: { id: projectId }, data: { thumbnailX: cx, thumbnailY: cy } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/`);
  revalidatePath(`/work`);
  revalidatePath(`/work/${slug}`);
}

async function addCredit(projectId: string, formData: FormData) {
  "use server";
  const role = String(formData.get("role") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  if (!role || !name) return;
  await db.projectCredit.create({
    data: { projectId, roleEn: role, roleFr: role, name, order },
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function removeCredit(projectId: string, formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await db.projectCredit.delete({ where: { id } });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function removeCreditById(projectId: string, id: string) {
  "use server";
  await db.projectCredit.delete({ where: { id } });
  revalidatePath(`/admin/projects/${projectId}`);
}

async function reorderCredits(projectId: string, ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) =>
      db.projectCredit.update({ where: { id }, data: { order: index } }),
    ),
  );
  revalidatePath(`/admin/projects/${projectId}`);
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    db.project.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        credits: { orderBy: { order: "asc" } },
        category: true,
      },
    }),
    db.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!project) notFound();

  const updateAction = updateProject.bind(null, id);
  const addImageAction = addImage.bind(null, id);
  const addCreditAction = addCredit.bind(null, id);
  const removeImageByIdAction = removeImageById.bind(null, id);
  const reorderImagesAction = reorderImages.bind(null, id);
  const removeCreditByIdAction = removeCreditById.bind(null, id);
  const reorderCreditsAction = reorderCredits.bind(null, id);
  const saveSketchAction = saveSketchUrl.bind(null, id, project.slug);
  const saveRenderAction = saveRenderUrl.bind(null, id, project.slug);
  const saveThumbnailAction = saveThumbnailUrl.bind(null, id, project.slug);
  const saveThumbnailPositionAction = saveThumbnailPosition.bind(null, id, project.slug);

  async function deleteAndBack() {
    "use server";
    await db.project.delete({ where: { id } });
    redirect("/admin/projects");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {adminPageHeader(project.titleEn, `${project.code} · ${project.category?.nameEn ?? ""}`)}
        <Link
          href="/admin/projects"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          ← Back
        </Link>
      </div>

      <form action={updateAction} style={{ marginTop: 32 }}>
        <Section title="Identification">
          <Grid cols={4}>
            <Field name="code" label="Code" defaultValue={project.code} required />
            <Field name="slug" label="Slug" defaultValue={project.slug} required />
            <Field name="year" label="Year" defaultValue={project.year} />
            <SelectField
              name="categoryId"
              label="Category"
              defaultValue={project.categoryId}
              options={categories.map((c) => ({ value: c.id, label: c.nameEn }))}
            />
          </Grid>
        </Section>

        <Section title="Title & subtitle">
          <Grid cols={1}>
            <Field name="title" label="Title" defaultValue={project.titleEn} required />
            <Field name="subtitle" label="Subtitle" defaultValue={project.subtitleEn} />
          </Grid>
        </Section>

        <Section title="Description">
          <RichTextEditor
            name="description"
            label="Project description (rich text · Behance-style)"
            help="Format with B/I, headings, lists, links, quotes — Ctrl+Z to undo"
            defaultValue={project.descriptionEn}
            minHeight={320}
          />
        </Section>

        <Section title="Production">
          <Grid cols={3}>
            <Field name="client" label="Client" defaultValue={project.client} />
            <Field name="role" label="Role" defaultValue={project.role} />
            <Field name="accent" label="Accent (OKLCH hue)" defaultValue={project.accent} />
            <Field name="sketchLabel" label="Sketch label" defaultValue={project.sketchLabel ?? ""} />
            <Field name="renderLabel" label="Render label" defaultValue={project.renderLabel ?? ""} />
            <Field name="order" label="Order" type="number" defaultValue={String(project.order)} />
          </Grid>
        </Section>

        <Section title="Thumbnail">
          <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 16 }}>
            <ImageUploader
              name="thumbnailUrl"
              label="Cover image (shown on /work grid — recommend 4:3, ≥ 800×600)"
              defaultValue={project.thumbnailUrl}
              height={180}
              onChange={saveThumbnailAction}
            />
            {project.thumbnailUrl && (
              <ThumbnailPositioner
                url={project.thumbnailUrl}
                initialX={project.thumbnailX}
                initialY={project.thumbnailY}
                onChange={saveThumbnailPositionAction}
              />
            )}
          </div>
        </Section>

        <Section title="Sketch · Render slider">
          <Grid cols={2}>
            <ImageUploader
              name="sketchUrl"
              label="Sketch image (left of slider)"
              defaultValue={project.sketchUrl}
              height={180}
              onChange={saveSketchAction}
            />
            <ImageUploader
              name="renderUrl"
              label="Render image (right of slider)"
              defaultValue={project.renderUrl}
              height={180}
              onChange={saveRenderAction}
            />
          </Grid>
          <div style={{ marginTop: 16 }}>
            <SelectField
              name="wipePosition"
              label="Position in gallery"
              defaultValue={String(project.wipePosition)}
              options={[
                { value: "0", label: "Before all images" },
                ...project.images.map((_, i) => ({
                  value: String(i + 1),
                  label: `After image ${i + 1}`,
                })),
              ]}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            · Drag &amp; drop or click to upload. The slider is draggable on the public page.
          </div>
        </Section>

        <Section title="Visibility">
          <div style={{ display: "flex", gap: 24 }}>
            <Checkbox name="published" label="Published" defaultChecked={project.published} />
            <Checkbox name="featured" label="Featured" defaultChecked={project.featured} />
          </div>
        </Section>

        <div style={{ marginTop: 24 }}>
          <button type="submit" style={adminButtonStyle}>
            Save changes
          </button>
        </div>
      </form>

      <Section title={`Gallery (${project.images.length})`}>
        <form
          action={addImageAction}
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 100px 2fr auto",
            gap: 12,
            border: "1px solid var(--rule)",
            padding: 16,
            marginBottom: 16,
            alignItems: "end",
          }}
        >
          <ImageUploader name="url" label="Image (drop or click)" height={120} />
          <Field name="ratio" label="Ratio" defaultValue="16/9" />
          <Field name="label" label="Label" />
          <button type="submit" style={adminButtonStyle}>
            Add
          </button>
        </form>
        <GalleryList
          images={project.images.map((i) => ({
            id: i.id,
            url: i.url,
            ratio: i.ratio,
            labelEn: i.labelEn,
            order: i.order,
          }))}
          onReorder={reorderImagesAction}
          onDelete={removeImageByIdAction}
        />
      </Section>

      <Section title={`Credits (${project.credits.length})`}>
        <form
          action={addCreditAction}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 80px auto",
            gap: 12,
            border: "1px solid var(--rule)",
            padding: 16,
            marginBottom: 16,
            alignItems: "end",
          }}
        >
          <Field name="role" label="Role" required />
          <Field name="name" label="Name" required />
          <Field name="order" label="Order" type="number" defaultValue="0" />
          <button type="submit" style={adminButtonStyle}>
            Add
          </button>
        </form>
        <CreditsList
          credits={project.credits.map((c) => ({
            id: c.id,
            roleEn: c.roleEn,
            name: c.name,
            order: c.order,
          }))}
          onReorder={reorderCreditsAction}
          onDelete={removeCreditByIdAction}
        />
      </Section>

      <Section title="Danger zone">
        <form action={deleteAndBack}>
          <button
            type="submit"
            style={{
              ...adminButtonStyle,
              background: "transparent",
              color: "#d92020",
              borderColor: "#d92020",
            }}
          >
            Delete project permanently
          </button>
        </form>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
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
        · {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        style={adminInputStyle}
      />
    </label>
  );
}

function TextareaField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={6}
        style={{ ...adminInputStyle, resize: "vertical" }}
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <select name={name} defaultValue={defaultValue} style={adminInputStyle}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--fg)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

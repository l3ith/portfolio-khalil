import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { TimelineList } from "@/components/admin/AdminLists";
import { autoFr } from "@/lib/translate";
import {
  adminInputStyle,
  adminLabelStyle,
  adminButtonStyle,
  adminPageHeader,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

async function ensureAbout() {
  const existing = await db.about.findFirst();
  if (existing) return existing;
  return db.about.create({ data: { bioFr: "", bioEn: "" } });
}

async function saveAbout(formData: FormData) {
  "use server";
  const about = await ensureAbout();
  const bio = String(formData.get("bio") ?? "");
  await db.about.update({
    where: { id: about.id },
    data: {
      bioEn: bio,
      bioFr: bio,
      portraitUrl: String(formData.get("portraitUrl") ?? "").trim() || null,
    },
  });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

async function addTimeline(formData: FormData) {
  "use server";
  const about = await ensureAbout();
  const period = String(formData.get("period") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const place = String(formData.get("place") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  if (!period || !role || !place) return;
  await db.timeline.create({
    data: { aboutId: about.id, period, roleEn: role, roleFr: role, place, order },
  });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

async function removeTimeline(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await db.timeline.delete({ where: { id } });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

async function removeTimelineById(id: string) {
  "use server";
  await db.timeline.delete({ where: { id } });
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

async function reorderTimeline(ids: string[]) {
  "use server";
  await db.$transaction(
    ids.map((id, index) => db.timeline.update({ where: { id }, data: { order: index } })),
  );
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export default async function AboutAdminPage() {
  const about = await ensureAbout();
  const timeline = await db.timeline.findMany({
    where: { aboutId: about.id },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      {adminPageHeader("About", "Bio · timeline · portrait")}

      <form action={saveAbout} style={{ marginTop: 32 }}>
        <Section title="Profile">
          <label>
            <div style={adminLabelStyle}>Portrait URL</div>
            <input
              name="portraitUrl"
              defaultValue={about.portraitUrl ?? ""}
              placeholder="/uploads/portrait.jpg"
              style={adminInputStyle}
            />
          </label>
        </Section>

        <Section title="Biography">
          <label>
            <div style={adminLabelStyle}>Bio</div>
            <textarea
              name="bio"
              defaultValue={about.bioEn}
              rows={10}
              style={{ ...adminInputStyle, resize: "vertical" }}
            />
          </label>
        </Section>

        <button type="submit" style={{ ...adminButtonStyle, marginTop: 24 }}>
          Save profile
        </button>
      </form>

      <Section title={`Timeline (${timeline.length})`}>
        <form
          action={addTimeline}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 80px auto",
            gap: 12,
            border: "1px solid var(--rule)",
            padding: 16,
            marginBottom: 16,
            alignItems: "end",
          }}
        >
          <Field name="period" label="Period" placeholder="2024 — 2025" required />
          <Field name="role" label="Role" required />
          <Field name="place" label="Place" required />
          <Field name="order" label="Order" type="number" defaultValue="0" />
          <button type="submit" style={adminButtonStyle}>
            Add
          </button>
        </form>
        <TimelineList
          items={timeline.map((t) => ({
            id: t.id,
            period: t.period,
            roleEn: t.roleEn,
            place: t.place,
            order: t.order,
          }))}
          onReorder={reorderTimeline}
          onDelete={removeTimelineById}
        />
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

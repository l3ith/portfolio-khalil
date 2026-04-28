import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { autoFr, autoEn } from "@/lib/translate";
import {
  adminInputStyle,
  adminLabelStyle,
  adminButtonStyle,
  adminPageHeader,
} from "@/components/admin/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const dynamic = "force-dynamic";

const FONT_OPTIONS = [
  "Space Grotesk",
  "Inter",
  "JetBrains Mono",
  "Plus Jakarta Sans",
  "DM Sans",
  "Manrope",
  "IBM Plex Sans",
  "IBM Plex Mono",
  "Fira Code",
  "Geist",
  "Geist Mono",
  "Playfair Display",
  "Cormorant Garamond",
  "Syne",
];

async function ensureSetting() {
  const existing = await db.setting.findFirst();
  if (existing) return existing;
  return db.setting.create({ data: {} });
}

async function saveMeta(formData: FormData) {
  "use server";
  const s = await ensureSetting();
  const title = String(formData.get("siteTitle") ?? "");
  const tagline = String(formData.get("siteTagline") ?? "");
  const meta = String(formData.get("metaDescription") ?? "");
  await db.setting.update({
    where: { id: s.id },
    data: {
      siteTitleEn: title,
      siteTitleFr: title,
      siteTaglineEn: tagline,
      siteTaglineFr: tagline,
      metaDescriptionEn: meta,
      metaDescriptionFr: meta,
      email: String(formData.get("email") ?? ""),
      location: String(formData.get("location") ?? ""),
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

async function saveBranding(formData: FormData) {
  "use server";
  const s = await ensureSetting();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  await db.setting.update({
    where: { id: s.id },
    data: { logoUrl: logoUrl || null },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

async function saveTheme(formData: FormData) {
  "use server";
  const s = await ensureSetting();
  await db.setting.update({
    where: { id: s.id },
    data: {
      bgLight: String(formData.get("bgLight") ?? ""),
      fgLight: String(formData.get("fgLight") ?? ""),
      mutedLight: String(formData.get("mutedLight") ?? ""),
      bgDark: String(formData.get("bgDark") ?? ""),
      fgDark: String(formData.get("fgDark") ?? ""),
      mutedDark: String(formData.get("mutedDark") ?? ""),
      accentL: Number(formData.get("accentL") ?? 0.78),
      accentC: Number(formData.get("accentC") ?? 0.17),
      accentH: Number(formData.get("accentH") ?? 75),
      fontDisplay: String(formData.get("fontDisplay") ?? "Space Grotesk"),
      fontMono: String(formData.get("fontMono") ?? "JetBrains Mono"),
      fontBody: String(formData.get("fontBody") ?? "Inter"),
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export default async function SettingsPage() {
  const s = await ensureSetting();

  return (
    <div>
      {adminPageHeader("Settings", "Site meta · theme · typography")}

      <form action={saveMeta} style={{ marginTop: 32 }}>
        <Section title="Site meta">
          <Grid cols={2}>
            <Field name="siteTitle" label="Title" defaultValue={s.siteTitleEn} />
            <Field name="siteTagline" label="Tagline" defaultValue={s.siteTaglineEn} />
            <Field
              name="metaDescription"
              label="Meta description"
              defaultValue={s.metaDescriptionEn}
            />
            <Field name="email" label="Public email" defaultValue={s.email} />
            <Field name="location" label="Location" defaultValue={s.location} />
          </Grid>
        </Section>

        <button type="submit" style={{ ...adminButtonStyle, marginTop: 24 }}>
          Save site meta
        </button>
      </form>

      <form action={saveBranding} style={{ marginTop: 56 }}>
        <Section title="Branding · Logo">
          <div style={{ maxWidth: 320 }}>
            <ImageUploader
              name="logoUrl"
              label="Header logo (replaces the KHALIL text — use a transparent PNG/SVG)"
              defaultValue={s.logoUrl}
              height={120}
            />
          </div>
        </Section>
        <button type="submit" style={{ ...adminButtonStyle, marginTop: 24 }}>
          Save logo
        </button>
      </form>

      <form action={saveTheme} style={{ marginTop: 56 }}>
        <Section title="Theme · Light palette">
          <Grid cols={3}>
            <ColorField name="bgLight" label="Background" defaultValue={s.bgLight} />
            <ColorField name="fgLight" label="Foreground" defaultValue={s.fgLight} />
            <Field name="mutedLight" label="Muted (text)" defaultValue={s.mutedLight} />
          </Grid>
        </Section>

        <Section title="Theme · Dark palette">
          <Grid cols={3}>
            <ColorField name="bgDark" label="Background" defaultValue={s.bgDark} />
            <ColorField name="fgDark" label="Foreground" defaultValue={s.fgDark} />
            <Field name="mutedDark" label="Muted (text)" defaultValue={s.mutedDark} />
          </Grid>
        </Section>

        <Section title="Theme · Accent (OKLCH)">
          <Grid cols={3}>
            <Field
              name="accentL"
              label="Lightness (0–1)"
              type="number"
              step="0.01"
              defaultValue={String(s.accentL)}
            />
            <Field
              name="accentC"
              label="Chroma (0–0.4)"
              type="number"
              step="0.01"
              defaultValue={String(s.accentC)}
            />
            <Field
              name="accentH"
              label="Hue (0–360)"
              type="number"
              step="1"
              defaultValue={String(s.accentH)}
            />
          </Grid>
          <div
            style={{
              marginTop: 16,
              padding: 12,
              border: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                height: 24,
                background: `oklch(${s.accentL} ${s.accentC} ${s.accentH})`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Current accent · oklch({s.accentL} {s.accentC} {s.accentH})
            </span>
          </div>
        </Section>

        <Section title="Typography">
          <Grid cols={3}>
            <SelectField
              name="fontDisplay"
              label="Display (headings)"
              defaultValue={s.fontDisplay}
              options={FONT_OPTIONS}
            />
            <SelectField
              name="fontMono"
              label="Mono (UI / numerals)"
              defaultValue={s.fontMono}
              options={FONT_OPTIONS}
            />
            <SelectField
              name="fontBody"
              label="Body"
              defaultValue={s.fontBody}
              options={FONT_OPTIONS}
            />
          </Grid>
          <div style={{ marginTop: 16, padding: 16, border: "1px solid var(--rule)" }}>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              · Live preview (current saved fonts)
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: 32,
                fontWeight: 300,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
              }}
            >
              Display · {s.fontDisplay}
            </div>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 13,
                marginTop: 8,
                color: "var(--muted)",
              }}
            >
              MONO · 01 / 26 · {s.fontMono}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 16,
                fontWeight: 300,
                marginTop: 8,
              }}
            >
              Body — A grand tourer reimagined for the post-combustion era. ({s.fontBody})
            </div>
          </div>
        </Section>

        <button type="submit" style={{ ...adminButtonStyle, marginTop: 24 }}>
          Save theme
        </button>
      </form>
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
  step,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  step?: string;
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        style={adminInputStyle}
      />
    </label>
  );
}

function ColorField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <div
          aria-hidden
          style={{
            width: 38,
            border: "1px solid var(--rule)",
            background: defaultValue,
            flexShrink: 0,
          }}
        />
        <input name={name} defaultValue={defaultValue} style={adminInputStyle} />
      </div>
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
  options: string[];
}) {
  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
      <select name={name} defaultValue={defaultValue} style={adminInputStyle}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

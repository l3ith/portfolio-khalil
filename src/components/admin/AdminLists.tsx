"use client";

import Link from "next/link";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import { adminButtonStyle } from "@/components/admin/ui";

const rowBase = {
  display: "grid",
  gap: 16,
  alignItems: "center",
  padding: "14px 16px",
  borderBottom: "1px solid var(--rule)",
  fontFamily: "var(--font-inter)",
  fontSize: 14,
  fontWeight: 300,
} as const;

const headerBase = {
  display: "grid",
  gap: 16,
  padding: "12px 16px",
  background: "rgba(0,0,0,0.02)",
  borderBottom: "1px solid var(--rule)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: "var(--muted)",
} as const;

const dangerBtn = {
  ...adminButtonStyle,
  background: "transparent",
  color: "#d92020",
  borderColor: "#d92020",
  padding: "6px 10px",
  fontSize: 10,
};

type Project = {
  id: string;
  code: string;
  slug: string;
  titleEn: string;
  category: string;
  year: string;
  published: boolean;
  featured: boolean;
};

export function ProjectsList({
  projects,
  onReorder,
  onDelete,
}: {
  projects: Project[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const cols = "32px 60px 1fr 140px 80px 120px auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <div style={{ ...headerBase, gridTemplateColumns: cols }}>
        <span></span>
        <span>Code</span>
        <span>Title</span>
        <span>Category</span>
        <span>Year</span>
        <span>Status</span>
        <span></span>
      </div>
      <SortableList
        items={projects}
        onReorder={onReorder}
        renderItem={(p, handle) => (
          <div style={{ ...rowBase, gridTemplateColumns: cols }}>
            <DragHandle handle={handle} />
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }}>
              {p.code}
            </span>
            <Link href={`/admin/projects/${p.id}`} style={{ color: "var(--fg)" }}>
              <strong style={{ fontWeight: 500 }}>{p.titleEn}</strong>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>/{p.slug}</div>
            </Link>
            <span>{p.category}</span>
            <span>{p.year}</span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: p.published ? "var(--accent)" : "var(--muted)",
              }}
            >
              {p.published ? "Published" : "Draft"}
              {p.featured && " · Feat."}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/admin/projects/${p.id}`}
                style={{
                  ...adminButtonStyle,
                  background: "transparent",
                  color: "var(--fg)",
                  padding: "6px 10px",
                  fontSize: 10,
                  textDecoration: "none",
                }}
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete project "${p.titleEn}"?`)) onDelete(p.id);
                }}
                style={dangerBtn}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

type Img = { id: string; url: string; ratio: string; labelEn: string; order: number };

export function GalleryList({
  images,
  onReorder,
  onDelete,
}: {
  images: Img[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  if (images.length === 0) return null;
  const cols = "32px 60px 80px 1fr 1fr auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <SortableList
        items={images}
        onReorder={onReorder}
        renderItem={(img, handle) => (
          <div style={{ ...rowBase, gridTemplateColumns: cols }}>
            <DragHandle handle={handle} />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {img.order}
            </span>
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11 }}>
              {img.ratio}
            </span>
            <span style={{ fontSize: 13 }}>{img.labelEn}</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{img.url}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove this image?")) onDelete(img.id);
              }}
              style={dangerBtn}
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

type Credit = { id: string; roleEn: string; name: string; order: number };

export function CreditsList({
  credits,
  onReorder,
  onDelete,
}: {
  credits: Credit[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  if (credits.length === 0) return null;
  const cols = "32px 60px 1fr 1fr auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <SortableList
        items={credits}
        onReorder={onReorder}
        renderItem={(cr, handle) => (
          <div style={{ ...rowBase, gridTemplateColumns: cols }}>
            <DragHandle handle={handle} />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {cr.order}
            </span>
            <span style={{ fontSize: 13 }}>{cr.roleEn}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{cr.name}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove this credit?")) onDelete(cr.id);
              }}
              style={dangerBtn}
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

type TimelineItem = {
  id: string;
  period: string;
  roleEn: string;
  place: string;
  order: number;
};

export function TimelineList({
  items,
  onReorder,
  onDelete,
}: {
  items: TimelineItem[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  if (items.length === 0) return null;
  const cols = "32px 60px 1fr 1fr 1fr auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <SortableList
        items={items}
        onReorder={onReorder}
        renderItem={(t, handle) => (
          <div style={{ ...rowBase, gridTemplateColumns: cols }}>
            <DragHandle handle={handle} />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {t.order}
            </span>
            <span style={{ fontSize: 13 }}>{t.period}</span>
            <span style={{ fontSize: 13 }}>{t.roleEn}</span>
            <span style={{ fontSize: 13 }}>{t.place}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove this entry?")) onDelete(t.id);
              }}
              style={dangerBtn}
            >
              Remove
            </button>
          </div>
        )}
      />
    </div>
  );
}

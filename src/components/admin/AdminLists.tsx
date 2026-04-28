"use client";

import Link from "next/link";
import { useState } from "react";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/SortableList";
import { ThumbnailPositioner } from "@/components/admin/ThumbnailPositioner";
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

type Img = {
  id: string;
  url: string;
  ratio: string;
  labelEn: string;
  order: number;
  posX?: number;
  posY?: number;
};

export function GalleryList({
  images,
  onReorder,
  onDelete,
  onPosition,
}: {
  images: Img[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPosition?: (id: string, x: number, y: number) => Promise<void>;
}) {
  if (images.length === 0) return null;
  const cols = "32px 56px 60px 80px 1fr auto auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <SortableList
        items={images}
        onReorder={onReorder}
        renderItem={(img, handle) => (
          <GalleryRow
            img={img}
            handle={handle}
            cols={cols}
            onDelete={onDelete}
            onPosition={onPosition}
          />
        )}
      />
    </div>
  );
}

function GalleryRow({
  img,
  handle,
  cols,
  onDelete,
  onPosition,
}: {
  img: Img;
  handle: DragHandleProps;
  cols: string;
  onDelete: (id: string) => Promise<void>;
  onPosition?: (id: string, x: number, y: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ ...rowBase, gridTemplateColumns: cols }}>
        <DragHandle handle={handle} />
        <img
          src={img.url}
          alt=""
          loading="lazy"
          style={{
            width: 56,
            height: 40,
            objectFit: "cover",
            objectPosition: `${img.posX ?? 50}% ${img.posY ?? 50}%`,
            background: "rgba(10,10,10,0.06)",
            border: "1px solid var(--rule)",
            display: "block",
          }}
        />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              #{img.order}
            </span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                color: "var(--muted)",
              }}
            >
              {img.ratio}
            </span>
            <span
              style={{
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={img.labelEn}
            >
              {img.labelEn}
            </span>
        {onPosition && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              padding: "6px 10px",
              border: "1px solid var(--rule)",
              background: open ? "var(--fg)" : "transparent",
              color: open ? "var(--bg)" : "var(--fg)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {open ? "Close" : "Position"}
          </button>
        )}
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
      {open && onPosition && (
        <div style={{ padding: "16px 24px 20px", borderTop: "1px solid var(--rule)", background: "rgba(10,10,10,0.02)" }}>
          <div style={{ maxWidth: 360 }}>
            <ThumbnailPositioner
              url={img.url}
              initialX={img.posX ?? 50}
              initialY={img.posY ?? 50}
              ratio={img.ratio}
              onChange={(x, y) => onPosition(img.id, x, y)}
            />
          </div>
        </div>
      )}
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

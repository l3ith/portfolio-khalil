"use client";

import { SortableList, DragHandle } from "@/components/admin/SortableList";
import { adminButtonStyle } from "@/components/admin/ui";

type Cat = {
  id: string;
  slug: string;
  nameEn: string;
  order: number;
  projectCount: number;
};

export function CategoriesList({
  categories,
  onReorder,
  onDelete,
}: {
  categories: Cat[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "32px 1fr 2fr 80px 100px auto",
          gap: 16,
          padding: "12px 16px",
          background: "rgba(0,0,0,0.02)",
          borderBottom: "1px solid var(--rule)",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span></span>
        <span>Slug</span>
        <span>Name</span>
        <span>Order</span>
        <span>Projects</span>
        <span></span>
      </div>

      <SortableList
        items={categories}
        onReorder={onReorder}
        renderItem={(c, handle) => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 2fr 80px 100px auto",
              gap: 16,
              alignItems: "center",
              padding: "14px 16px",
              borderBottom: "1px solid var(--rule)",
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              fontWeight: 300,
            }}
          >
            <DragHandle handle={handle} />
            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }}>
              {c.slug}
            </span>
            <span>{c.nameEn}</span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              {c.order}
            </span>
            <span>{c.projectCount}</span>
            <button
              type="button"
              onClick={() => {
                if (c.projectCount > 0) return;
                if (!confirm(`Delete category "${c.nameEn}"?`)) return;
                onDelete(c.id);
              }}
              disabled={c.projectCount > 0}
              style={{
                ...adminButtonStyle,
                background: "transparent",
                color: c.projectCount > 0 ? "var(--muted)" : "#d92020",
                borderColor: c.projectCount > 0 ? "var(--rule)" : "#d92020",
                padding: "6px 10px",
                fontSize: 10,
                opacity: c.projectCount > 0 ? 0.5 : 1,
                cursor: c.projectCount > 0 ? "not-allowed" : "pointer",
              }}
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}

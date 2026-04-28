"use client";

import { useState } from "react";
import { SortableList, DragHandle, type DragHandleProps } from "@/components/admin/SortableList";
import { ThumbnailPositioner } from "@/components/admin/ThumbnailPositioner";

type Item = {
  id: string;
  imageUrl: string;
  ratio: string;
  titleEn: string;
  order: number;
  posX: number;
  posY: number;
};

const rowBase: React.CSSProperties = {
  display: "grid",
  gap: 16,
  alignItems: "center",
  padding: "14px 16px",
  borderBottom: "1px solid var(--rule)",
  fontFamily: "var(--font-inter)",
  fontSize: 14,
  fontWeight: 300,
};

const dangerBtn: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid var(--rule)",
  background: "transparent",
  color: "var(--muted)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export function SketchbookList({
  items,
  onReorder,
  onDelete,
  onPosition,
}: {
  items: Item[];
  onReorder: (ids: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPosition: (id: string, x: number, y: number) => Promise<void>;
}) {
  if (items.length === 0)
    return (
      <div
        style={{
          border: "1px dashed var(--rule)",
          padding: 32,
          textAlign: "center",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Empty — add your first sketch above.
      </div>
    );

  const cols = "32px 56px 60px 80px 1fr auto auto";
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <SortableList
        items={items}
        onReorder={onReorder}
        renderItem={(it, handle) => (
          <Row it={it} handle={handle} cols={cols} onDelete={onDelete} onPosition={onPosition} />
        )}
      />
    </div>
  );
}

function Row({
  it,
  handle,
  cols,
  onDelete,
  onPosition,
}: {
  it: Item;
  handle: DragHandleProps;
  cols: string;
  onDelete: (id: string) => Promise<void>;
  onPosition: (id: string, x: number, y: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ ...rowBase, gridTemplateColumns: cols }}>
        <DragHandle handle={handle} />
        <img
          src={it.imageUrl}
          alt=""
          loading="lazy"
          style={{
            width: 56,
            height: 40,
            objectFit: "cover",
            objectPosition: `${it.posX}% ${it.posY}%`,
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
          #{it.order}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          {it.ratio}
        </span>
        <span
          style={{
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={it.titleEn || "(no title)"}
        >
          {it.titleEn || <span style={{ color: "var(--muted)" }}>(no title)</span>}
        </span>
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
        <button
          type="button"
          onClick={() => {
            if (confirm("Remove this sketch?")) onDelete(it.id);
          }}
          style={dangerBtn}
        >
          Remove
        </button>
      </div>
      {open && (
        <div
          style={{
            padding: "16px 24px 20px",
            borderTop: "1px solid var(--rule)",
            background: "rgba(10,10,10,0.02)",
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <ThumbnailPositioner
              url={it.imageUrl}
              initialX={it.posX}
              initialY={it.posY}
              ratio={it.ratio}
              onChange={(x, y) => onPosition(it.id, x, y)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

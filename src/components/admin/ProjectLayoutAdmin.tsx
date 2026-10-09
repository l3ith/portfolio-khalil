"use client";

import { useState, useTransition } from "react";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { adminButtonStyle, adminInputStyle, adminLabelStyle } from "@/components/admin/ui";
import { isVideo } from "@/lib/media";
import { PdfJoinToggle } from "@/components/admin/PdfJoinToggle";

type Plate = { id: string; url: string; label: string; pdfJoinPrev: boolean };

type TextBlock = {
  id: string;
  position: number;
  order: number;
  body: string;
  width: string;
  align: string;
};

type LayoutItem =
  | { id: string; kind: "plate"; index: number; plate: Plate }
  | { id: string; kind: "text"; block: TextBlock };

const WIDTHS = [
  { value: "narrow", label: "Narrow (720px)" },
  { value: "wide", label: "Wide (1080px)" },
  { value: "full", label: "Full width" },
];

const ALIGNS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "32px 72px 1fr auto",
  gap: 16,
  alignItems: "center",
  padding: "10px 16px",
  borderBottom: "1px solid var(--rule)",
  fontFamily: "var(--font-inter)",
  fontSize: 14,
  fontWeight: 300,
} as const;

const tagStyle = {
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: "var(--muted)",
};

const smallBtn = { ...adminButtonStyle, padding: "6px 10px", fontSize: 10 };

const dangerBtn = {
  ...smallBtn,
  background: "transparent",
  color: "#d92020",
  borderColor: "#d92020",
};

// Interleave text blocks with plates: blocks at position N come right after plate N.
// Blocks pointing past the last plate (e.g. after a plate was deleted) fall to the end.
function buildLayout(plates: Plate[], blocks: TextBlock[]): LayoutItem[] {
  const sorted = [...blocks].sort((a, b) => a.position - b.position || a.order - b.order);
  const items: LayoutItem[] = [];
  const pushBlocksAt = (pos: number) => {
    for (const b of sorted) {
      if (b.position === pos || (pos === plates.length && b.position > pos)) {
        items.push({ id: b.id, kind: "text", block: b });
      }
    }
  };
  pushBlocksAt(0);
  plates.forEach((plate, i) => {
    items.push({ id: plate.id, kind: "plate", index: i, plate });
    pushBlocksAt(i + 1);
  });
  return items;
}

function preview(html: string) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "(empty)";
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export function ProjectLayoutAdmin({
  plates,
  blocks,
  onReorder,
  onAdd,
  onSave,
  onDelete,
  onPdfJoin,
}: {
  plates: Plate[];
  blocks: TextBlock[];
  onReorder: (ids: string[]) => Promise<void>;
  onAdd: () => Promise<void>;
  onSave: (blockId: string, formData: FormData) => Promise<void>;
  onDelete: (blockId: string) => Promise<void>;
  onPdfJoin: (imageId: string, join: boolean) => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const items = buildLayout(plates, blocks);

  return (
    <div>
      <div style={{ ...tagStyle, marginBottom: 12 }}>
        · Drag text blocks (and plates) with ⋮⋮ to place them anywhere between the gallery plates.
        PDF ⤒ same page = printed on the same PDF page as the image before it.
      </div>
      <div style={{ border: "1px solid var(--rule)" }}>
        {items.length === 0 && (
          <div style={{ ...tagStyle, padding: 16 }}>No plates or text blocks yet.</div>
        )}
        <SortableList
          items={items}
          onReorder={onReorder}
          renderItem={(item, handle) =>
            item.kind === "plate" ? (
              <div style={{ ...rowStyle, background: "rgba(10,10,10,0.02)" }}>
                <DragHandle handle={handle} />
                <div style={{ width: 72, height: 44, overflow: "hidden", background: "rgba(10,10,10,0.06)" }}>
                  {item.plate.url &&
                    (isVideo(item.plate.url) ? (
                      <video src={item.plate.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src={item.plate.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ))}
                </div>
                <div>
                  <span style={tagStyle}>Plate {String(item.index + 1).padStart(2, "0")}</span>
                  {item.plate.label && <span style={{ marginLeft: 12 }}>{item.plate.label}</span>}
                </div>
                <PdfJoinToggle
                  initial={item.plate.pdfJoinPrev}
                  onChange={(join) => onPdfJoin(item.plate.id, join)}
                />
              </div>
            ) : (
              <div style={{ borderBottom: "1px solid var(--rule)" }}>
                <div style={{ ...rowStyle, borderBottom: 0, borderLeft: "2px solid var(--fg)" }}>
                  <DragHandle handle={handle} />
                  <span style={{ ...tagStyle, color: "var(--fg)" }}>¶ Text</span>
                  <div>
                    <div>{preview(item.block.body)}</div>
                    <div style={{ ...tagStyle, marginTop: 4 }}>
                      {item.block.width} · {item.block.align}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={smallBtn}
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                    >
                      {openId === item.id ? "Close" : "Edit"}
                    </button>
                    <button
                      type="button"
                      style={dangerBtn}
                      disabled={pending}
                      onClick={() => {
                        if (!window.confirm("Delete this text block?")) return;
                        startTransition(() => onDelete(item.id));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {openId === item.id && (
                  <TextBlockForm block={item.block} onSave={onSave} onDone={() => setOpenId(null)} />
                )}
              </div>
            )
          }
        />
      </div>
      <button
        type="button"
        style={{ ...adminButtonStyle, marginTop: 16 }}
        disabled={pending}
        onClick={() => startTransition(() => onAdd())}
      >
        + Add text block
      </button>
    </div>
  );
}

function TextBlockForm({
  block,
  onSave,
  onDone,
}: {
  block: TextBlock;
  onSave: (blockId: string, formData: FormData) => Promise<void>;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await onSave(block.id, formData);
          onDone();
        })
      }
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Unique name: RichTextEditor syncs its hidden input via a document-wide name lookup */}
      <RichTextEditor name={`body-${block.id}`} defaultValue={block.body} minHeight={180} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
        <label>
          <div style={adminLabelStyle}>Width</div>
          <select name="width" defaultValue={block.width} style={adminInputStyle}>
            {WIDTHS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div style={adminLabelStyle}>Block alignment</div>
          <select name="align" defaultValue={block.align} style={adminInputStyle}>
            {ALIGNS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" style={adminButtonStyle} disabled={pending}>
          {pending ? "Saving…" : "Save block"}
        </button>
      </div>
    </form>
  );
}

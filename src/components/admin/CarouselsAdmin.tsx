"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  adminButtonStyle,
  adminInputStyle,
  adminLabelStyle,
} from "@/components/admin/ui";

type CarouselImage = {
  id: string;
  url: string;
  ratio: string;
  caption: string;
  posX: number;
  posY: number;
  order: number;
};

type Carousel = {
  id: string;
  position: number;
  ratio: string;
  titleEn: string;
  images: CarouselImage[];
};

type SlotOption = { value: string; label: string };

export function CarouselsAdmin({
  carousels,
  galleryCount,
  onAdd,
  onRemove,
  onPosition,
  onAddImage,
  onRemoveImage,
}: {
  carousels: Carousel[];
  galleryCount: number;
  onAdd: (formData: FormData) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onPosition: (id: string, position: number) => Promise<void>;
  onAddImage: (carouselId: string, formData: FormData) => Promise<void>;
  onRemoveImage: (id: string) => Promise<void>;
}) {
  const slotOptions: SlotOption[] = [
    { value: "0", label: "Before all gallery images" },
    ...Array.from({ length: galleryCount }, (_, i) => ({
      value: String(i + 1),
      label: `After gallery image ${i + 1}`,
    })),
  ];

  return (
    <div>
      <form
        action={onAdd}
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr auto",
          gap: 12,
          border: "1px solid var(--rule)",
          padding: 16,
          alignItems: "end",
          marginBottom: 24,
        }}
      >
        <label>
          <div style={adminLabelStyle}>Carousel title (optional)</div>
          <input name="title" style={adminInputStyle} placeholder="e.g. Studio shoot" />
        </label>
        <label>
          <div style={adminLabelStyle}>Position (where it sits in the project flow)</div>
          <select name="position" defaultValue="0" style={adminInputStyle}>
            {slotOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <div style={adminLabelStyle}>Aspect ratio (frames)</div>
          <select name="ratio" defaultValue="16/9" style={adminInputStyle}>
            <option value="16/9">16:9 — wide</option>
            <option value="4/3">4:3 — classic</option>
            <option value="3/2">3:2 — photo</option>
            <option value="1/1">1:1 — square</option>
            <option value="9/16">9:16 — portrait</option>
          </select>
        </label>
        <button type="submit" style={adminButtonStyle}>
          Add carousel
        </button>
      </form>

      {carousels.length === 0 ? (
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
          No carousels yet — add one above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {carousels.map((c) => (
            <CarouselBlock
              key={c.id}
              c={c}
              slotOptions={slotOptions}
              onRemove={onRemove}
              onPosition={onPosition}
              onAddImage={onAddImage}
              onRemoveImage={onRemoveImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarouselBlock({
  c,
  slotOptions,
  onRemove,
  onPosition,
  onAddImage,
  onRemoveImage,
}: {
  c: Carousel;
  slotOptions: SlotOption[];
  onRemove: (id: string) => Promise<void>;
  onPosition: (id: string, position: number) => Promise<void>;
  onAddImage: (carouselId: string, formData: FormData) => Promise<void>;
  onRemoveImage: (id: string) => Promise<void>;
}) {
  const [pos, setPos] = useState(String(c.position));
  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 16px",
          background: "rgba(10,10,10,0.04)",
          borderBottom: "1px solid var(--rule)",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: 16,
            fontWeight: 500,
            flex: 1,
            minWidth: 200,
          }}
        >
          {c.titleEn || <span style={{ color: "var(--muted)" }}>(untitled carousel)</span>}
          <span
            style={{
              marginLeft: 12,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            · {c.images.length} frame{c.images.length === 1 ? "" : "s"} · {c.ratio}
          </span>
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Position
          <select
            value={pos}
            onChange={async (e) => {
              const v = e.target.value;
              setPos(v);
              await onPosition(c.id, Number(v));
            }}
            style={{ ...adminInputStyle, width: "auto" }}
          >
            {slotOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete this carousel and all its images?")) onRemove(c.id);
          }}
          style={{
            padding: "6px 14px",
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--muted)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Delete carousel
        </button>
      </div>

      <form
        action={onAddImage.bind(null, c.id)}
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr auto",
          gap: 12,
          padding: 16,
          alignItems: "end",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <ImageUploader
          name="url"
          ratioName="ratio"
          label="Frame image (drop or click)"
          height={100}
        />
        <label>
          <div style={adminLabelStyle}>Caption (optional)</div>
          <input name="caption" style={adminInputStyle} />
        </label>
        <button type="submit" style={adminButtonStyle}>
          Add frame
        </button>
      </form>

      {c.images.length > 0 && (
        <div>
          {c.images.map((img) => (
            <div
              key={img.id}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 60px 1fr auto",
                gap: 16,
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <img
                src={img.url}
                alt=""
                loading="lazy"
                style={{
                  width: 56,
                  height: 40,
                  objectFit: "cover",
                  objectPosition: `${img.posX}% ${img.posY}%`,
                  border: "1px solid var(--rule)",
                  background: "rgba(10,10,10,0.06)",
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
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={img.caption || "(no caption)"}
              >
                {img.caption || <span style={{ color: "var(--muted)" }}>(no caption)</span>}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Remove this frame?")) onRemoveImage(img.id);
                }}
                style={{
                  padding: "6px 14px",
                  border: "1px solid var(--rule)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

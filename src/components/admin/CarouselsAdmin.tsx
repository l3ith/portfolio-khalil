"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ThumbnailPositioner } from "@/components/admin/ThumbnailPositioner";
import { ReplaceImageButton } from "@/components/admin/ReplaceImageButton";
import { isVideo } from "@/lib/media";
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
  onImagePosition,
  onReplaceImage,
}: {
  carousels: Carousel[];
  galleryCount: number;
  onAdd: (formData: FormData) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onPosition: (id: string, position: number) => Promise<void>;
  onAddImage: (carouselId: string, formData: FormData) => Promise<void>;
  onRemoveImage: (id: string) => Promise<void>;
  onImagePosition: (imageId: string, x: number, y: number) => Promise<void>;
  onReplaceImage?: (imageId: string, url: string) => Promise<void>;
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
              onImagePosition={onImagePosition}
              onReplaceImage={onReplaceImage}
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
  onImagePosition,
  onReplaceImage,
}: {
  c: Carousel;
  slotOptions: SlotOption[];
  onRemove: (id: string) => Promise<void>;
  onPosition: (id: string, position: number) => Promise<void>;
  onAddImage: (carouselId: string, formData: FormData) => Promise<void>;
  onRemoveImage: (id: string) => Promise<void>;
  onImagePosition: (imageId: string, x: number, y: number) => Promise<void>;
  onReplaceImage?: (imageId: string, url: string) => Promise<void>;
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
            <FrameRow
              key={img.id}
              img={img}
              ratio={c.ratio}
              onRemove={onRemoveImage}
              onPosition={onImagePosition}
              onReplace={onReplaceImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FrameRow({
  img,
  ratio,
  onRemove,
  onPosition,
  onReplace,
}: {
  img: CarouselImage;
  ratio: string;
  onRemove: (id: string) => Promise<void>;
  onPosition: (imageId: string, x: number, y: number) => Promise<void>;
  onReplace?: (imageId: string, url: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--rule)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: onReplace ? "56px 60px 1fr auto auto auto" : "56px 60px 1fr auto auto",
          gap: 16,
          alignItems: "center",
          padding: "10px 16px",
        }}
      >
        {isVideo(img.url) ? (
          <video
            src={img.url}
            muted
            playsInline
            preload="metadata"
            style={{
              width: 56,
              height: 40,
              objectFit: "cover",
              objectPosition: `${img.posX}% ${img.posY}%`,
              border: "1px solid var(--rule)",
              background: "rgba(10,10,10,0.06)",
            }}
          />
        ) : (
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
        )}
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          #{img.order} · {img.posX}%/{img.posY}%
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
        {onReplace && (
          <ReplaceImageButton onReplace={(url) => onReplace(img.id, url)} />
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm("Remove this frame?")) onRemove(img.id);
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
      {open && (
        <div
          style={{
            padding: "16px 16px 20px",
            background: "rgba(10,10,10,0.02)",
            borderTop: "1px solid var(--rule)",
          }}
        >
          <PrecisePositioner
            url={img.url}
            ratio={ratio}
            initialX={img.posX}
            initialY={img.posY}
            onChange={(x, y) => onPosition(img.id, x, y)}
          />
        </div>
      )}
    </div>
  );
}

function PrecisePositioner({
  url,
  ratio,
  initialX,
  initialY,
  onChange,
}: {
  url: string;
  ratio: string;
  initialX: number;
  initialY: number;
  onChange: (x: number, y: number) => Promise<void> | void;
}) {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [busy, setBusy] = useState(false);
  const commit = async (nx: number, ny: number) => {
    setBusy(true);
    try {
      await onChange(nx, ny);
    } finally {
      setBusy(false);
    }
  };
  const nudge = (dx: number, dy: number) => {
    const nx = Math.max(0, Math.min(100, x + dx));
    const ny = Math.max(0, Math.min(100, y + dy));
    setX(nx);
    setY(ny);
    commit(nx, ny);
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 360px) 1fr", gap: 24 }}>
      <ThumbnailPositioner
        url={url}
        ratio={ratio}
        initialX={x}
        initialY={y}
        onChange={async (nx, ny) => {
          setX(nx);
          setY(ny);
          await commit(nx, ny);
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Precise · X {x}% / Y {y}% {busy ? "· saving…" : ""}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            X
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={x}
            onChange={(e) => setX(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            onBlur={() => commit(x, y)}
            style={{
              width: 80,
              padding: "6px 10px",
              border: "1px solid var(--rule)",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            onMouseUp={() => commit(x, y)}
            onTouchEnd={() => commit(x, y)}
            onKeyUp={() => commit(x, y)}
            style={{ flex: 1 }}
          />
          <NudgeBtns onLeft={() => nudge(-1, 0)} onRight={() => nudge(1, 0)} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            Y
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={y}
            onChange={(e) => setY(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            onBlur={() => commit(x, y)}
            style={{
              width: 80,
              padding: "6px 10px",
              border: "1px solid var(--rule)",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            onMouseUp={() => commit(x, y)}
            onTouchEnd={() => commit(x, y)}
            onKeyUp={() => commit(x, y)}
            style={{ flex: 1 }}
          />
          <NudgeBtns onLeft={() => nudge(0, -1)} onRight={() => nudge(0, 1)} vertical />
        </label>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => {
              setX(50);
              setY(50);
              commit(50, 50);
            }}
            style={smallBtn}
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => {
              setX(0);
              commit(0, y);
            }}
            style={smallBtn}
          >
            Snap left
          </button>
          <button
            type="button"
            onClick={() => {
              setX(100);
              commit(100, y);
            }}
            style={smallBtn}
          >
            Snap right
          </button>
          <button
            type="button"
            onClick={() => {
              setY(0);
              commit(x, 0);
            }}
            style={smallBtn}
          >
            Snap top
          </button>
          <button
            type="button"
            onClick={() => {
              setY(100);
              commit(x, 100);
            }}
            style={smallBtn}
          >
            Snap bottom
          </button>
        </div>
      </div>
    </div>
  );
}

function NudgeBtns({
  onLeft,
  onRight,
  vertical = false,
}: {
  onLeft: () => void;
  onRight: () => void;
  vertical?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button type="button" onClick={onLeft} style={nudgeBtn} aria-label={vertical ? "Up" : "Left"}>
        {vertical ? "↑" : "←"}
      </button>
      <button type="button" onClick={onRight} style={nudgeBtn} aria-label={vertical ? "Down" : "Right"}>
        {vertical ? "↓" : "→"}
      </button>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  padding: "4px 10px",
  border: "1px solid var(--rule)",
  background: "transparent",
  color: "var(--fg)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const nudgeBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  border: "1px solid var(--rule)",
  background: "transparent",
  color: "var(--fg)",
  fontFamily: "var(--font-jetbrains-mono)",
  fontSize: 13,
  cursor: "pointer",
};

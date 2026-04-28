"use client";

import { useRef, useState } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function ThumbnailPositioner({
  url,
  initialX,
  initialY,
  onChange,
  ratio = "4/3",
}: {
  url: string;
  initialX: number;
  initialY: number;
  onChange: (x: number, y: number) => Promise<void> | void;
  ratio?: string;
}) {
  const [x, setX] = useState(clamp(initialX));
  const [y, setY] = useState(clamp(initialY));
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const startRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startRef.current = { mx: e.clientX, my: e.clientY, px: x, py: y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startRef.current.mx) / rect.width) * 100;
    const dy = ((e.clientY - startRef.current.my) / rect.height) * 100;
    setX(clamp(startRef.current.px - dx));
    setY(clamp(startRef.current.py - dy));
  };

  const onPointerUp = async (e: React.PointerEvent) => {
    if (!dragging) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    setBusy(true);
    try {
      await onChange(Math.round(x), Math.round(y));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setX(50);
    setY(50);
    setBusy(true);
    try {
      await onChange(50, 50);
    } finally {
      setBusy(false);
    }
  };

  if (!url) return null;

  return (
    <div>
      <div style={adminLabelStyle}>Focal point — drag the image to position</div>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: ratio,
          overflow: "hidden",
          border: "1px solid var(--rule)",
          background: "rgba(10,10,10,0.04)",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <img
          src={url}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${x}% ${y}%`,
            pointerEvents: "none",
            opacity: busy ? 0.7 : 1,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: `${y}%`,
            left: `${x}%`,
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            border: "1px solid rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            mixBlendMode: "difference",
            pointerEvents: "none",
            transition: dragging ? "none" : "top 200ms, left 200ms",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span>
          X · {Math.round(x)}% / Y · {Math.round(y)}%
          {busy ? " · saving…" : ""}
        </span>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "4px 10px",
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--muted)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

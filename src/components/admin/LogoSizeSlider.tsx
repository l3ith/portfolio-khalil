"use client";

import { useState } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

export function LogoSizeSlider({
  initialHeight,
  logoUrl,
  onChange,
  min = 16,
  max = 120,
}: {
  initialHeight: number;
  logoUrl: string | null;
  onChange: (height: number) => Promise<void> | void;
  min?: number;
  max?: number;
}) {
  const [h, setH] = useState(initialHeight);
  const [busy, setBusy] = useState(false);

  const commit = async (value: number) => {
    setBusy(true);
    try {
      await onChange(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={adminLabelStyle}>Logo height ({h} px)</div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={h}
          onChange={(e) => setH(Number(e.target.value))}
          onMouseUp={() => commit(h)}
          onTouchEnd={() => commit(h)}
          onKeyUp={() => commit(h)}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          min={min}
          max={max}
          value={h}
          onChange={(e) => setH(Number(e.target.value))}
          onBlur={() => commit(h)}
          style={{
            width: 70,
            padding: "6px 8px",
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--fg)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 12,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            width: 80,
          }}
        >
          {busy ? "saving…" : "auto-save"}
        </span>
      </div>
      {logoUrl && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid var(--rule)",
            background: "rgba(10,10,10,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Preview
          </span>
          <img
            src={logoUrl}
            alt="Logo preview"
            style={{ height: h, width: "auto", display: "block" }}
          />
        </div>
      )}
    </div>
  );
}

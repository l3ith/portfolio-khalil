"use client";

import { useState } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

function hexToHue(hex: string): number {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!m) return 0;
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return (h + 360) % 360;
}

function hueToPickerHex(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  const c = 1;
  const x = 1 - Math.abs(((h / 60) % 2) - 1);
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = 0.4;
  const to = (v: number) =>
    Math.round((v * 0.6 + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function AccentHuePicker({
  name,
  label,
  help,
  defaultValue,
}: {
  name: string;
  label?: string;
  help?: string;
  defaultValue: string;
}) {
  const initial = Number(defaultValue) || 75;
  const [hue, setHue] = useState<number>(((initial % 360) + 360) % 360);

  return (
    <div>
      {label && <div style={adminLabelStyle}>{label}</div>}
      {help && (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 6,
            opacity: 0.85,
          }}
        >
          {help}
        </div>
      )}
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        <div
          aria-hidden
          title="Live preview of the project accent color"
          style={{
            width: 56,
            border: "1px solid var(--rule)",
            background: `oklch(0.78 0.17 ${hue})`,
            flexShrink: 0,
          }}
        />
        <input
          type="color"
          aria-label="Pick a color — hue is extracted automatically"
          title="Pick any color — only the hue is saved"
          value={hueToPickerHex(hue)}
          onChange={(e) => setHue(hexToHue(e.target.value))}
          style={{
            width: 56,
            padding: 0,
            border: "1px solid var(--rule)",
            background: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            style={{
              width: "100%",
              height: 28,
              border: "1px solid var(--rule)",
              background:
                "linear-gradient(to right, oklch(0.78 0.17 0), oklch(0.78 0.17 60), oklch(0.78 0.17 120), oklch(0.78 0.17 180), oklch(0.78 0.17 240), oklch(0.78 0.17 300), oklch(0.78 0.17 360))",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Hue {hue}° — oklch(0.78 0.17 {hue})
          </div>
        </div>
      </div>
      <input type="hidden" name={name} value={String(hue)} readOnly />
    </div>
  );
}

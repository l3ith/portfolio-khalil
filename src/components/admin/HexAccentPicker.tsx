"use client";

import { useState } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

const HEX_RE = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

function expand(hex: string): string {
  if (hex.length === 4) {
    return (
      "#" +
      hex
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }
  return hex;
}

function legacyHueToHex(hue: number): string {
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

function normalize(value: string): string {
  if (!value) return "#a3c0ff";
  const v = value.trim();
  if (HEX_RE.test(v)) return expand(v.startsWith("#") ? v : "#" + v);
  if (/^\d+(\.\d+)?$/.test(v)) return legacyHueToHex(Number(v));
  return "#a3c0ff";
}

function hexToRgb(hex: string): [number, number, number] {
  const v = expand(hex.startsWith("#") ? hex : "#" + hex);
  return [
    parseInt(v.slice(1, 3), 16),
    parseInt(v.slice(3, 5), 16),
    parseInt(v.slice(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function HexAccentPicker({
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
  const initial = normalize(defaultValue);
  const [committed, setCommitted] = useState<string>(initial);
  const [draft, setDraft] = useState<string>(initial);
  const dirty = draft.toLowerCase() !== committed.toLowerCase();
  const [r, g, b] = hexToRgb(draft);

  const setRgb = (rr: number, gg: number, bb: number) => {
    setDraft(rgbToHex(rr, gg, bb));
  };

  const apply = () => setCommitted(draft);
  const reset = () => setDraft(committed);

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
            marginBottom: 8,
            opacity: 0.85,
          }}
        >
          {help}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto 1fr auto auto",
          gap: 10,
          alignItems: "stretch",
        }}
      >
        <div
          aria-hidden
          title={`Currently applied: ${committed}`}
          style={{
            width: 56,
            border: "1px solid var(--rule)",
            background: committed,
          }}
        />
        <input
          type="color"
          aria-label="Color picker"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{
            width: 56,
            padding: 0,
            border: "1px solid var(--rule)",
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          aria-label="HEX value"
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (HEX_RE.test(v) || v === "" || v === "#") setDraft(v);
            else if (HEX_RE.test("#" + v)) setDraft("#" + v);
          }}
          style={{
            padding: "0 12px",
            border: "1px solid var(--rule)",
            background: "transparent",
            color: "var(--fg)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        />
        <button
          type="button"
          onClick={apply}
          disabled={!dirty}
          title="Apply color"
          aria-label="Apply selected color"
          style={{
            width: 44,
            border: "1px solid var(--rule)",
            background: dirty ? "var(--fg)" : "transparent",
            color: dirty ? "var(--bg)" : "var(--muted)",
            cursor: dirty ? "pointer" : "default",
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          ✓
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!dirty}
          title="Cancel — revert to applied color"
          aria-label="Cancel color change"
          style={{
            width: 44,
            border: "1px solid var(--rule)",
            background: "transparent",
            color: dirty ? "var(--fg)" : "var(--muted)",
            cursor: dirty ? "pointer" : "default",
            fontSize: 18,
          }}
        >
          ✕
        </button>
      </div>
      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: 10,
          alignItems: "center",
        }}
      >
        {(["R", "G", "B"] as const).map((channel, i) => (
          <label
            key={channel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            <span style={{ width: 14 }}>{channel}</span>
            <input
              type="number"
              min={0}
              max={255}
              value={[r, g, b][i]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                if (i === 0) setRgb(v, g, b);
                if (i === 1) setRgb(r, v, b);
                if (i === 2) setRgb(r, g, v);
              }}
              style={{
                flex: 1,
                padding: "4px 8px",
                border: "1px solid var(--rule)",
                background: "transparent",
                color: "var(--fg)",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
              }}
            />
          </label>
        ))}
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: dirty ? "var(--accent)" : "var(--muted)",
            opacity: 0.85,
          }}
        >
          {dirty ? "Unsaved · click ✓" : "Applied"}
        </span>
      </div>
      <input type="hidden" name={name} value={committed} readOnly />
    </div>
  );
}

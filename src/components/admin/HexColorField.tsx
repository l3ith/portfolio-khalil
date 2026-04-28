"use client";

import { useState } from "react";
import { adminInputStyle, adminLabelStyle } from "@/components/admin/ui";

const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function expandShortHex(hex: string): string {
  if (hex.length !== 4) return hex;
  return (
    "#" +
    hex
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")
  );
}

export function HexColorField({
  name,
  label,
  help,
  defaultValue,
}: {
  name: string;
  label: string;
  help?: string;
  defaultValue: string;
}) {
  const [v, setV] = useState(defaultValue);
  const isHex = HEX_RE.test(v);

  return (
    <label>
      <div style={adminLabelStyle}>{label}</div>
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
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={isHex ? (v.length === 4 ? expandShortHex(v) : v) : "#888888"}
          onChange={(e) => setV(e.target.value)}
          style={{
            width: 44,
            padding: 0,
            border: "1px solid var(--rule)",
            background: "transparent",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          name={name}
          value={v}
          onChange={(e) => setV(e.target.value.trim())}
          style={adminInputStyle}
        />
      </div>
    </label>
  );
}

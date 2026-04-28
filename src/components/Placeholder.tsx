import type { CSSProperties } from "react";

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type Props = {
  label?: string;
  ratio?: string;
  variant?: "stripes" | "schematic" | "solid";
  tone?: "auto" | "dark" | "light";
  accent?: string | null;
  className?: string;
  style?: CSSProperties;
  showCorners?: boolean;
  showLabel?: boolean;
  meta?: string | null;
  src?: string | null;
};

export function Placeholder({
  label = "PLACEHOLDER",
  ratio = "16/9",
  variant = "stripes",
  tone = "auto",
  accent = null,
  className = "",
  style = {},
  showCorners = true,
  showLabel = true,
  meta = null,
  src = null,
}: Props) {
  const isDark = tone === "dark";
  const fg = isDark ? "rgba(240,238,232,0.92)" : "rgba(10,10,10,0.86)";
  const bg = isDark ? "#0a0a0a" : "#dcdad3";
  const stripe = isDark ? "rgba(240,238,232,0.04)" : "rgba(10,10,10,0.05)";
  const trim = accent || (isDark ? "rgba(240,238,232,0.5)" : "rgba(10,10,10,0.5)");
  const seed = hashString(label);
  const angle = (seed % 4) * 45;

  return (
    <div
      className={`ph ${className}`}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: ratio === "auto" ? undefined : ratio,
        background: bg,
        overflow: "hidden",
        ...style,
      }}
      data-placeholder
    >
      {src ? (
        <img
          src={src}
          alt={label}
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <>
          {variant === "stripes" && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(${angle}deg, ${stripe} 0, ${stripe} 1px, transparent 1px, transparent 14px)`,
              }}
            />
          )}
          {variant === "schematic" && <SchematicPattern fg={fg} seed={seed} />}
        </>
      )}
      {showCorners && (
        <>
          <Crosshair pos="tl" color={fg} />
          <Crosshair pos="tr" color={fg} />
          <Crosshair pos="bl" color={fg} />
          <Crosshair pos="br" color={fg} />
        </>
      )}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "3px 8px",
          background: trim,
          color: "#0a0a0a",
          fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        REF · {String(seed).slice(0, 4).padStart(4, "0")}
      </div>
      {showLabel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: fg,
            textAlign: "center",
            padding: "0 24px",
            gap: 6,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 10,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              opacity: 0.55,
            }}
          >
            VISUAL · {ratio.replace("/", ":")}
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
              maxWidth: "80%",
              lineHeight: 1.4,
            }}
          >
            {label}
          </div>
          {meta && (
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                fontSize: 9,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                opacity: 0.4,
                marginTop: 4,
              }}
            >
              {meta}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Crosshair({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const map: Record<string, CSSProperties> = {
    tl: { top: 8, left: 8 },
    tr: { top: 8, right: 8 },
    bl: { bottom: 8, left: 8 },
    br: { bottom: 8, right: 8 },
  };
  const p = map[pos];
  return (
    <div aria-hidden style={{ position: "absolute", ...p, width: 10, height: 10, opacity: 0.5 }}>
      <div style={{ position: "absolute", inset: 0, top: "50%", height: 1, background: color }} />
      <div style={{ position: "absolute", inset: 0, left: "50%", width: 1, background: color }} />
    </div>
  );
}

function SchematicPattern({ fg, seed }: { fg: string; seed: number }) {
  const lines = [];
  const count = 5 + (seed % 4);
  for (let i = 0; i < count; i++) {
    const y = 20 + ((seed * (i + 1)) % 60);
    const x1 = 5 + ((seed * (i + 2)) % 30);
    const x2 = 60 + ((seed * (i + 3)) % 35);
    lines.push(
      <line
        key={i}
        x1={`${x1}%`}
        y1={`${y}%`}
        x2={`${x2}%`}
        y2={`${y + ((seed * (i + 1)) % 8) - 4}%`}
        stroke={fg}
        strokeWidth="0.5"
        opacity={0.4}
      />
    );
  }
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      preserveAspectRatio="none"
    >
      {lines}
      <line x1="0" y1="62%" x2="100%" y2="62%" stroke={fg} strokeWidth="0.5" opacity={0.25} />
    </svg>
  );
}

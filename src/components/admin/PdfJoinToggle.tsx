"use client";

import { useState, useTransition } from "react";

// PDF export: when on, the image is printed on the same PDF page as the image
// just before it in the project flow (stacked, same width) instead of its own page.
export function PdfJoinToggle({
  initial,
  onChange,
}: {
  initial: boolean;
  onChange: (join: boolean) => Promise<void>;
}) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="PDF export: print this image on the same page as the image before it"
      onClick={() => {
        const next = !on;
        setOn(next);
        startTransition(async () => {
          try {
            await onChange(next);
          } catch {
            setOn(!next);
          }
        });
      }}
      style={{
        padding: "6px 10px",
        border: "1px solid var(--rule)",
        background: on ? "var(--fg)" : "transparent",
        color: on ? "var(--bg)" : "var(--muted)",
        fontFamily: "var(--font-jetbrains-mono)",
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        cursor: "pointer",
        opacity: pending ? 0.6 : 1,
      }}
    >
      {on ? "PDF ⤒ same page" : "PDF · own page"}
    </button>
  );
}

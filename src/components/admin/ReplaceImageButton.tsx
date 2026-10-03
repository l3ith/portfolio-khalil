"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload-client";

export function ReplaceImageButton({
  onReplace,
}: {
  onReplace: (url: string) => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      await onReplace(await uploadFile(file));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        style={{
          padding: "6px 10px",
          border: "1px solid var(--rule)",
          background: "transparent",
          color: busy ? "var(--muted)" : "var(--fg)",
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: busy ? "default" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "…" : "Replace"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,.gif"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

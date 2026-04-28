"use client";

import { useRef, useState } from "react";
import { adminLabelStyle } from "@/components/admin/ui";

export function ImageUploader({
  name,
  label,
  defaultValue,
  onChange,
  height = 140,
}: {
  name: string;
  label?: string;
  defaultValue?: string | null;
  onChange?: (url: string) => void;
  height?: number;
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
      onChange?.(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void upload(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void upload(f);
  };

  return (
    <div>
      {label && <div style={adminLabelStyle}>{label}</div>}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          position: "relative",
          height,
          border: `1px dashed ${dragOver ? "var(--accent)" : "var(--rule)"}`,
          background: dragOver ? "rgba(0,0,0,0.04)" : "rgba(10,10,10,0.02)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: "border-color 200ms, background 200ms",
        }}
      >
        {url ? (
          <>
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: busy ? 0.5 : 1,
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUrl("");
                onChange?.("");
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                padding: "4px 10px",
                background: "rgba(0,0,0,0.7)",
                color: "#f0eee8",
                border: "1px solid rgba(240,238,232,0.3)",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Replace
            </button>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {busy ? "Uploading…" : error ? error : "Drop file here · or click"}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ display: "none" }}
      />
      <input type="hidden" name={name} value={url} />
    </div>
  );
}

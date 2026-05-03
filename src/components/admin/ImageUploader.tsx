"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { adminLabelStyle } from "@/components/admin/ui";
import { isVideo } from "@/lib/media";

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function reduceRatio(w: number, h: number): string {
  if (!w || !h) return "16/9";
  const g = gcd(Math.round(w), Math.round(h));
  return `${Math.round(w) / g}/${Math.round(h) / g}`;
}

export function ImageUploader({
  name,
  ratioName,
  label,
  defaultValue,
  onChange,
  height = 140,
}: {
  name: string;
  ratioName?: string;
  label?: string;
  defaultValue?: string | null;
  onChange?: (url: string) => void;
  height?: number;
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [ratio, setRatio] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const blob = await upload(`uploads/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: file.type || undefined,
      });
      setUrl(blob.url);
      onChange?.(blob.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void doUpload(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void doUpload(f);
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
            {isVideo(url) ? (
              <video
                src={url}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (v.videoWidth && v.videoHeight) {
                    setRatio(reduceRatio(v.videoWidth, v.videoHeight));
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: busy ? 0.5 : 1,
                }}
              />
            ) : (
              <img
                src={url}
                alt=""
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setRatio(reduceRatio(img.naturalWidth, img.naturalHeight));
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: busy ? 0.5 : 1,
                }}
              />
            )}
            {busy && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#f0eee8",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                Replacing…
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                padding: "3px 8px",
                background: "rgba(0,0,0,0.55)",
                color: "rgba(240,238,232,0.85)",
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                pointerEvents: "none",
              }}
            >
              Drop or click anywhere to change
            </div>
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 6,
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                title="Pick a new file to replace this image"
                style={{
                  padding: "4px 10px",
                  background: "rgba(0,0,0,0.72)",
                  color: "#f0eee8",
                  border: "1px solid rgba(240,238,232,0.3)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUrl("");
                  onChange?.("");
                }}
                title="Remove the image entirely"
                aria-label="Remove image"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(0,0,0,0.72)",
                  color: "#f0eee8",
                  border: "1px solid rgba(240,238,232,0.3)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: 14,
                  cursor: "pointer",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
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
        accept="image/*,video/*,.gif"
        onChange={onPick}
        style={{ display: "none" }}
      />
      <input type="hidden" name={name} value={url} />
      {ratioName && <input type="hidden" name={ratioName} value={ratio} />}
    </div>
  );
}

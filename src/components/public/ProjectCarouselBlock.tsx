"use client";

import { useEffect, useRef, useState } from "react";

type Image = {
  id: string;
  url: string;
  ratio: string;
  caption: string;
  posX: number;
  posY: number;
};

export function ProjectCarouselBlock({
  title,
  ratio,
  images,
  accent,
}: {
  title: string;
  ratio: string;
  images: Image[];
  accent: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const target = track.children[active] as HTMLElement | undefined;
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  }, [active]);

  if (images.length === 0) return null;

  const next = () => setActive((a) => (a + 1) % images.length);
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);

  return (
    <div
      style={{
        margin: "32px 0",
        border: "1px solid var(--rule)",
        borderLeft: `2px solid ${accent}`,
      }}
    >
      {title && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--rule)",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          · {title} · {String(images.length).padStart(2, "0")} frames
        </div>
      )}

      <div style={{ position: "relative" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
          }}
        >
          {images.map((img) => (
            <figure
              key={img.id}
              style={{
                margin: 0,
                flex: "0 0 100%",
                scrollSnapAlign: "start",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: ratio,
                  background: "rgba(10,10,10,0.04)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${img.posX}% ${img.posY}%`,
                  }}
                />
              </div>
              {img.caption && (
                <figcaption
                  style={{
                    padding: "10px 20px",
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    color: "var(--muted)",
                    fontWeight: 300,
                  }}
                >
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="Previous" style={navBtn("left", accent)}>
              ‹
            </button>
            <button type="button" onClick={next} aria-label="Next" style={navBtn("right", accent)}>
              ›
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 6,
                padding: "4px 10px",
                background: "rgba(0,0,0,0.55)",
                pointerEvents: "none",
              }}
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === active ? 24 : 6,
                    height: 2,
                    background: i === active ? accent : "rgba(240,238,232,0.45)",
                    transition: "width 320ms, background 320ms",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function navBtn(side: "left" | "right", accent: string): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 12,
    width: 40,
    height: 40,
    background: "rgba(0,0,0,0.55)",
    color: "#f0eee8",
    border: `1px solid ${accent}`,
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties;
}

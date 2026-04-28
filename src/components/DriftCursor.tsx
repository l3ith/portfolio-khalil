"use client";

import { useEffect, useRef } from "react";

export function DriftCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ x: -100, y: -100, rx: -100, ry: -100 });

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    document.body.classList.add("has-cursor");

    const onMove = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;
    };

    const onLeave = () => {
      stateRef.current.x = -100;
      stateRef.current.y = -100;
    };

    let raf: number;
    const loop = () => {
      const s = stateRef.current;
      const ease = 0.18;
      s.rx += (s.x - s.rx) * ease;
      s.ry += (s.y - s.ry) * ease;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${s.x - 3}px, ${s.y - 3}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${s.rx - 18}px, ${s.ry - 18}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="drift-dot" />
      <div ref={ringRef} className="drift-ring" />
    </>
  );
}

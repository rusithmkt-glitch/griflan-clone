"use client";

import { useEffect, useRef } from "react";
import "./CursorTag.css";

export default function CursorTag({ text, color, ink, active = true }) {
  const ref = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let seen = false;
    let last = 0;

    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const k = 1 - Math.exp(-10.5 * dt);
      x += (tx - x) * k;
      y += (ty - y) * k;
      el.style.transform = `translate3d(${x + 18}px, ${y + 22}px, 0)`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }
    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function move(e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        x = tx;
        y = ty;
        seen = true;
      }
      if (activeRef.current) start();
    }
    window.addEventListener("pointermove", move);
    if (activeRef.current) start();
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const line = text + "  ·  ";
  return (
    <div
      ref={ref}
      className={`cursor-tag ${active ? "is-active" : ""}`}
      style={{ "--tag-bg": color, "--tag-ink": ink }}
      aria-hidden="true"
    >
      <div className="marquee">
        <div className="marquee-track" style={{ "--marquee-duration": "12s" }}>
          <span>{line}</span>
          <span>{line}</span>
        </div>
      </div>
    </div>
  );
}
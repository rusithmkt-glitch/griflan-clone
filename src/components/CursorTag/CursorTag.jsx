"use client";

import { useEffect, useRef } from "react";
import "./CursorTag.css";

export default function CursorTag({ text, color, ink, active = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let seen = false;

    function move(e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        x = tx;
        y = ty;
        seen = true;
      }
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x + 18}px, ${y + 22}px, 0)`;
    }
    window.addEventListener("pointermove", move);
    loop();
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
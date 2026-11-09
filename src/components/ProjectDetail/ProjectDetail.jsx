"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import projects from "@/data/projects";
import { getCopy } from "@/data/projectCopy";
import { getMasonry } from "@/lib/projectArt";
import CursorTag from "@/components/CursorTag/CursorTag";
import Globe from "@/components/Globe/Globe";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import { useSite } from "@/components/SiteChrome/SiteContext";
import "./ProjectDetail.css";

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export default function ProjectDetail({ project }) {
  const [tiles, setTiles] = useState(null);
  const [cursorOn, setCursorOn] = useState(false);
  const rootRef = useRef(null);
  const { openContact } = useSite();
  const copy = getCopy(project.slug);
  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];
  const bandInk =
    ratio(project.accent, project.bg) >= ratio(project.accent, project.ink) ? project.bg : project.ink;

  useEffect(() => {
    let alive = true;
    getMasonry(project).then((t) => alive && setTiles(t));
    return () => {
      alive = false;
    };
  }, [project]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tiles, project.slug]);

  const vars = {
    "--p-accent": project.accent,
    "--p-bg": project.bg,
    "--p-ink": project.ink,
  };

  return (
    <div className="pd" ref={rootRef} style={vars}>
      <SmoothScroll />
      <Globe />
      <CursorTag
        text={project.services.join("  ·  ")}
        color={project.accent}
        ink={bandInk}
        active={cursorOn}
      />

      <header className="pd-hero">
        <p className="pd-kicker reveal">
          <span className="pd-dot" /> {project.category} · {copy.year}
        </p>
        <h1 className="pd-title reveal">{project.wordmark || project.title}</h1>
        <p className="pd-tagline reveal">{project.tagline}</p>
        <div className="pd-meta reveal">
          <span>{copy.role}</span>
          <span className="pd-meta-sep" />
          <span>{project.services.length} disciplines</span>
        </div>
        <span className="pd-scrollcue" aria-hidden="true">
          Scroll
          <i />
        </span>
      </header>

      <section className="pd-overview">
        <div className="pd-overview-side reveal">
          <h2>Overview</h2>
          <ul className="pd-services">
            {project.services.map((s, i) => (
              <li key={s}>
                <em>{String(i + 1).padStart(2, "0")}</em>
                {s}
              </li>
            ))}
          </ul>
          <button className="pd-brief" onClick={openContact}>
            Start something like this →
          </button>
        </div>
        <div className="pd-overview-body">
          {copy.summary.map((para, i) => (
            <p key={i} className="pd-lede reveal">
              {para}
            </p>
          ))}
          <div className="pd-palette reveal">
            {project.palette.map((hex) => (
              <span key={hex} className="pd-swatch" style={{ background: hex }} title={hex}>
                <b>{hex}</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        className="pd-work"
        onPointerEnter={() => setCursorOn(true)}
        onPointerLeave={() => setCursorOn(false)}
      >
        <div className="pd-work-head reveal">
          <h2>Selected artefacts</h2>
          <span className="pd-count">
            {tiles ? String(tiles.length).padStart(2, "0") : "…"} pieces
          </span>
        </div>
        <div className="pd-masonry">
          {(tiles || []).map((t) => (
            <figure key={t.index} className="pd-tile reveal">
              <img src={t.src} width={t.w} height={t.h} alt={`${project.title} — ${t.caption}`} loading="lazy" />
              <figcaption>
                <em>{String(t.index).padStart(2, "0")}</em>
                {t.caption}
              </figcaption>
            </figure>
          ))}
          {!tiles && <div className="pd-loading">Developing the board…</div>}
        </div>
      </section>

      <section className="pd-band" style={{ background: project.accent, color: bandInk }}>
        <p className="pd-quote reveal">“{project.tagline}”</p>
        <div className="pd-stats reveal">
          {copy.stats.map(([v, k]) => (
            <div key={k} className="pd-stat">
              <b>{v}</b>
              <span>{k}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="pd-next">
        <Link href="/" className="pd-back">
          ← Back to the floor
        </Link>
        <Link href={`/projects/${next.slug}`} className="pd-next-link" style={{ "--n-accent": next.accent }}>
          <span className="pd-next-kicker">Next project</span>
          <span className="pd-next-title">{next.wordmark || next.title}</span>
          <span className="pd-next-cat">{next.category}</span>
        </Link>
      </footer>
    </div>
  );
}
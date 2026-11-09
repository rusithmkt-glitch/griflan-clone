"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import projects from "@/data/projects";
import Mascot from "@/components/Mascot/Mascot";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import { useSite } from "@/components/SiteChrome/SiteContext";
import "./about.css";

const capabilities = [
  {
    n: "01",
    title: "Brand Identity",
    body: "Strategy, naming, wordmarks, colour and type systems that survive contact with the real world.",
    items: ["Positioning", "Visual identity", "Guidelines", "Packaging"],
  },
  {
    n: "02",
    title: "Web & E-commerce",
    body: "Sites and storefronts that load fast, read clearly and convert without shouting.",
    items: ["Design & build", "Storefronts", "CMS", "Accessibility"],
  },
  {
    n: "03",
    title: "Motion & Film",
    body: "Launch films, product motion and identity kinetics that give a brand a pulse.",
    items: ["Launch films", "Motion systems", "3D & CGI", "Sound"],
  },
  {
    n: "04",
    title: "Design Systems",
    body: "Component libraries and tokens that let a hundred hands ship one coherent brand.",
    items: ["Tokens", "Components", "Docs", "Governance"],
  },
];

const process = [
  ["Listen", "A week of questions. We audit the category, the customer and the cupboard full of old logos."],
  ["Distill", "One idea, said plainly. Everything that doesn't serve it gets cut."],
  ["Build", "Identity, site and motion designed together, in the open, with weekly working sessions."],
  ["Ship", "Files, systems and a launch plan. We stay through go-live and the first quarter after."],
];

export default function AboutPage() {
  const { openContact } = useSite();
  const rootRef = useRef(null);

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
  }, []);

  const marquee = "Branding  ·  Web  ·  Motion  ·  E-commerce  ·  Design Systems  ·  ";

  return (
    <div className="about" ref={rootRef}>
      <SmoothScroll />
      <header className="about-hero">
        <div className="about-mascot">
          <Mascot />
        </div>
        <p className="about-kicker reveal">The studio · Est. 2019</p>
        <h1 className="about-title reveal">
          Crafting brands<br />
          that <em>hit hard.</em>
        </h1>
        <p className="about-lede reveal">
          Griflan Labs is a small, senior studio for branding, web and motion. We take a business
          from unclear to unmistakable — then build the site, the system and the film that carry it.
        </p>
        <div className="about-hero-cta reveal">
          <button className="about-cta" onClick={openContact}>
            Start A Project
          </button>
          <Link href="/" className="about-ghost">
            Fly the work floor →
          </Link>
        </div>
      </header>

      <div className="about-marquee" aria-hidden="true">
        <div className="marquee">
          <div className="marquee-track" style={{ "--marquee-duration": "26s" }}>
            <span>{marquee}</span>
            <span>{marquee}</span>
          </div>
        </div>
      </div>

      <section className="about-caps">
        <h2 className="about-h2 reveal">What we do</h2>
        <div className="about-cap-grid">
          {capabilities.map((c) => (
            <article key={c.n} className="about-cap reveal">
              <em>{c.n}</em>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <ul>
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="about-process">
        <h2 className="about-h2 reveal">How we work</h2>
        <ol className="about-steps">
          {process.map(([t, b], i) => (
            <li key={t} className="reveal">
              <span className="about-step-n">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-clients">
        <h2 className="about-h2 reveal">Recent partners</h2>
        <div className="about-client-grid reveal">
          {projects.map((p) => (
            <Link key={p.slug} href={`/projects/${p.slug}`} className="about-client" style={{ "--c-accent": p.accent }}>
              {p.wordmark || p.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="about-stats reveal">
        {[
          ["2019", "Founded"],
          ["60+", "Brands shipped"],
          ["12", "Design awards"],
          ["3", "Studios, one team"],
        ].map(([v, k]) => (
          <div key={k} className="about-stat">
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </section>

      <footer className="about-footer">
        <h2 className="reveal">
          Have something<br />worth <em>making?</em>
        </h2>
        <button className="about-cta reveal" onClick={openContact}>
          Start A Project
        </button>
        <p className="about-foot-note">hello@griflanlabs.studio · Melbourne / Lisbon / Remote</p>
      </footer>
    </div>
  );
}
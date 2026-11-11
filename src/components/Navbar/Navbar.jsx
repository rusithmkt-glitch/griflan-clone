"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import projects from "@/data/projects";
import Mascot from "@/components/Mascot/Mascot";
import { useSite } from "@/components/SiteChrome/SiteContext";
import "./Navbar.css";

function Brand() {
  return (
    <span className="brand-text">
      Scale<em>Beyond</em>
    </span>
  );
}

export default function Navbar({
  variant = "full",
  project = null,
  sticky = false,
  collapse = true,
}) {
  const { openContact } = useSite();
  const pathname = usePathname();
  const [switcher, setSwitcher] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    setSwitcher(false);
  }, [pathname]);

  useEffect(() => {
    if (!sticky || !collapse) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky, collapse]);

  useEffect(() => {
    if (!switcher) return;
    function down(e) {
      if (!switcherRef.current?.contains(e.target)) setSwitcher(false);
    }
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, [switcher]);

  const compact = variant === "compact" || (sticky && collapse && scrolled);

  if (compact) {
    return (
      <header className="navbar navbar-compact">
        <nav className="compact-side compact-left">
          <Link href="/" className={pathname === "/" ? "is-current" : ""}>
            Home
          </Link>
          <Link
            href="/about"
            className={pathname === "/about" ? "is-current" : ""}
          >
            About
          </Link>
        </nav>

        <div className="compact-pill">
          <Link
            href="/"
            className="compact-brand"
            aria-label="Griflan Labs home"
          >
            <Brand />
          </Link>
          {project && (
            <div className="compact-project" ref={switcherRef}>
              <button
                className="compact-project-btn"
                onClick={() => setSwitcher((s) => !s)}
                aria-expanded={switcher}
                aria-haspopup="listbox"
              >
                <span>{project.title}</span>
                <svg viewBox="0 0 16 16" className="funnel" aria-hidden="true">
                  <path
                    d="M2 3h12l-4.5 5.5V13L6.5 14V8.5L2 3z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              {switcher && (
                <div
                  className="switcher"
                  role="listbox"
                  aria-label="Jump to project"
                >
                  {projects.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className={`switcher-item ${p.slug === project.slug ? "is-current" : ""}`}
                      role="option"
                      aria-selected={p.slug === project.slug}
                    >
                      <span
                        className="switcher-dot"
                        style={{ background: p.accent }}
                      />
                      <span className="switcher-name">{p.title}</span>
                      <span className="switcher-cat">{p.category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <button className="compact-cta" onClick={openContact}>
            Start A Project
          </button>
        </div>

        <nav className="compact-side compact-right">
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Insta
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            Link
          </a>
        </nav>
      </header>
    );
  }

  return (
    <header className={`navbar navbar-full ${sticky ? "is-sticky" : ""}`}>
      <Link
        href="/"
        className={`cell cell-home ${pathname === "/" ? "is-current" : ""}`}
      >
        Home
      </Link>
      <Link
        href="/about"
        className={`cell cell-about ${pathname === "/about" ? "is-current" : ""}`}
      >
        About
      </Link>
      <div className="cell cell-services-top" aria-hidden="true" />
      <div className="cell cell-brand">
        <Link href="/" aria-label="Griflan Labs home">
          <Brand />
        </Link>
      </div>
      <div className="cell cell-tagline-top" aria-hidden="true" />
      <a
        className="cell cell-insta"
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
      >
        Insta
      </a>
      <a
        className="cell cell-link"
        href="https://linkedin.com"
        target="_blank"
        rel="noreferrer"
      >
        Link
      </a>

      <div className="cell cell-mascot">
        <Mascot />
      </div>
      <div className="cell cell-services">Branding + Web + Marketing</div>
      <div className="cell cell-services-bottom" aria-hidden="true" />
      <div className="cell cell-tagline">Crafting Brands That Drive Sales</div>
      <div className="cell cell-tagline-bottom" aria-hidden="true" />
      <button className="cell cell-cta" onClick={openContact}>
        Start A Project
      </button>
    </header>
  );
}

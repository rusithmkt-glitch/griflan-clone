"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Gallery3D from "@/components/Gallery3D/Gallery3D";
import Ticker from "@/components/Ticker/Ticker";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import { useSite } from "@/components/SiteChrome/SiteContext";
import "./home.css";

// World units the camera advances per pixel of scroll. Lenis already smooths the
// scroll position, so this maps a wheel notch to a comfortable glide; the
// recentering loop below makes the total travel unbounded.
const FLY_SCALE = 0.06;
const MOBILE_FLY_SCALE = 0.045;

export default function Home() {
  const router = useRouter();
  const { lenisRef } = useSite();
  const [leaving, setLeaving] = useState(false);
  // Unbounded forward travel (world units) shared with the globe's render loop.
  const flyRef = useRef(0);

  const open = useCallback(
    (slug) => {
      setLeaving(true);
      window.setTimeout(() => router.push(`/projects/${slug}`), 420);
    },
    [router],
  );

  useEffect(() => {
    document.documentElement.classList.add("home-infinite");
    const mobile = window.matchMedia("(max-width: 760px)");
    let origin = null;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      let y = window.scrollY;
      if (origin === null) origin = y;

      const lenis = lenisRef.current;
      const margin = window.innerHeight * 0.75;
      // Seamless recentering: when the scroll nears either end of the spacer,
      // jump it back toward the middle and shift the origin by the same amount,
      // so the camera's travel stays continuous. The scroll never reaches a hard
      // end, making the flyover infinite in both directions.
      if (lenis && !lenis.isStopped) {
        if (y > max - margin) {
          const d = -Math.round(max / 2);
          origin += d;
          y += d;
          lenis.scrollTo(y, { immediate: true });
        } else if (y < margin) {
          const d = Math.round(max / 2);
          origin += d;
          y += d;
          lenis.scrollTo(y, { immediate: true });
        }
      }
      const scale = mobile.matches ? MOBILE_FLY_SCALE : FLY_SCALE;
      flyRef.current += (y - origin) * scale;
      origin = y;
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("home-infinite");
    };
  }, [lenisRef]);

  return (
    <main className="home">
      <SmoothScroll />

      <section className="globe-section">
        <Gallery3D onOpen={open} flyRef={flyRef} />
        <Ticker />
      </section>

      <div className="scroll-spacer" aria-hidden="true" />

      <div className={`home-veil ${leaving ? "is-on" : ""}`} aria-hidden="true" />
    </main>
  );
}
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/SiteChrome/SiteContext";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  const { lenisRef } = useSite();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    if (lenisRef) lenisRef.current = lenis;

    // Update ScrollTrigger when Lenis scrolls
    lenis.on("scroll", ScrollTrigger.update);

    // Connect Lenis to GSAP
    const update = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // Disable GSAP's automatic lag smoothing
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      if (lenisRef && lenisRef.current === lenis) lenisRef.current = null;
    };
  }, [lenisRef]);

  return null;
}

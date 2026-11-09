"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Gallery3D from "@/components/Gallery3D/Gallery3D";
import Ticker from "@/components/Ticker/Ticker";
import "./home.css";

export default function Home() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const open = useCallback(
    (slug) => {
      setLeaving(true);
      window.setTimeout(() => router.push(`/projects/${slug}`), 420);
    },
    [router],
  );

  return (
    <main className="home">
      <Gallery3D onOpen={open} />
      <Ticker />
      <div className={`home-veil ${leaving ? "is-on" : ""}`} aria-hidden="true" />
    </main>
  );
}
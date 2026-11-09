"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import ContactOverlay from "@/components/ContactOverlay/ContactOverlay";
import { SiteContext } from "./SiteContext";
import { getProject } from "@/data/projects";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const value = useMemo(() => ({ openContact }), [openContact]);

  const isProject = pathname.startsWith("/projects/");
  const project = isProject ? getProject(pathname.split("/")[2]) : null;
  const isHome = pathname === "/";

  return (
    <SiteContext.Provider value={value}>
      <Navbar
        variant={isProject ? "compact" : "full"}
        project={project}
        sticky={!isHome && !isProject}
      />
      {children}
      <ContactOverlay open={contactOpen} onClose={closeContact} />
      <div className="grain" aria-hidden="true" />
    </SiteContext.Provider>
  );
}
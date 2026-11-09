"use client";

import { createContext, useContext } from "react";

export const SiteContext = createContext({ openContact: () => {} });

export function useSite() {
  return useContext(SiteContext);
}
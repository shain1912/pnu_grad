"use client";

import type { ReactNode } from "react";
import { useSmoothScroll } from "@/lib/useSmoothScroll";
import "./bymonolog.css";
import Nav from "./sections/Nav";
import Footer from "./sections/Footer";

/**
 * Per-variant shell shared by every bymonolog route (P1–P5).
 * Sticky top nav (no left sidebar) + dark grain field + page content + footer.
 * Lenis smooth scroll, NO snap, NO stack deck (retired).
 */
export default function Shell({ children }: { children: ReactNode }) {
  useSmoothScroll();

  return (
    <div
      className="mono-root mono-page"
      style={{
        ["--page-accent" as string]: "#C9A227",
        ["--page-accent-text" as string]: "#0E0E0F",
      }}
    >
      <div className="mono-grain" aria-hidden />
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

"use client";

import { useSmoothScroll } from "@/lib/useSmoothScroll";
import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";
import "../tresmares.css";

const pageStyle = {
  "--page-accent": "#E2231A",
  "--page-accent-text": "#FFFFFF",
};

/**
 * Per-variant shell used by every tresmares page. Provides the smooth scroll
 * (Lenis, NO snap / NO stack deck), the sticky top nav, and the shared footer.
 * Pages drop their 3–4 sections in as `children`.
 */
export default function Shell({ children }) {
  useSmoothScroll();

  return (
    <div className="tm" style={pageStyle}>
      <SiteNav />
      <main className="tm-main">{children}</main>
      <SiteFooter />
    </div>
  );
}

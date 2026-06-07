"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "@phosphor-icons/react";
import { overview, heroVideo } from "@/lib/content";

export default function Hero() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        yPercent: 120,
        opacity: 0,
        stagger: 0.12,
        duration: 1.05,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from([".tm-hero__eyebrow", ".tm-hero__meta", ".tm-hero__para"], {
        opacity: 0,
        y: 18,
        stagger: 0.1,
        duration: 0.9,
        delay: 0.6,
        ease: "power2.out",
      });

      // the framed media slot wipes in (clip reveal) on load
      gsap.from(".tm-hero__visual", {
        clipPath: "inset(0 0 100% 0)",
        duration: 1.2,
        ease: "power3.out",
        delay: 0.35,
      });

      // gentle parallax drift on the video as the hero scrolls away
      gsap.to(".tm-hero__video", {
        yPercent: -8,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="top" className="tm-hero">
      <div className="tm-hero__grid">
        <div className="tm-hero__left">
          <div className="tm-hero__eyebrow">
            <span className="tm-nav__mark" aria-hidden />
            <p className="tm-label">{overview.badge}</p>
          </div>

          <h1 className="tm-hero__headline">
            <span className="tm-hero__linewrap">
              <span className="hero-line">Arise PNU,</span>
            </span>
            <span className="tm-hero__linewrap">
              <span className="hero-line hero-line--ko">같이</span>
            </span>
            <span className="tm-hero__linewrap">
              <span className="hero-line hero-line--ko hero-line--accent">
                더 높게
              </span>
            </span>
          </h1>

          <div className="tm-hero__meta">
            <span className="tm-hero__org">{overview.org}</span>
            <span className="tm-hero__role">{overview.role}</span>
          </div>
        </div>

        <div className="tm-hero__right">
          <figure className="tm-hero__visual">
            {/* Hero video fills the framed media slot (replaces the old SVG line-art) */}
            <video
              className="tm-hero__video"
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            />
            <span className="tm-hero__videowash" aria-hidden />

            <div className="tm-hero__para">
              <p>{overview.lead}</p>
              <a href="#vision" className="tm-underlink">
                추진 내러티브 보기
              </a>
            </div>

            <figcaption className="tm-hero__visual-tag">
              AX Trajectory · 2025—2027
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="tm-hero__scroll" aria-hidden>
        <ArrowDown size={14} weight="bold" />
        Scroll
      </div>
    </section>
  );
}

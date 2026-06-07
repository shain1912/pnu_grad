"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@phosphor-icons/react";
import { brandAssets, overview, contact, qrLink } from "@/lib/content";

/** Shared footer for every tresmares page (Contact + signature + QR). */
export default function SiteFooter() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".tm-close__statement", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tm-close", start: "top 80%" },
      });
      gsap.from(".tm-foot__row", {
        opacity: 0,
        y: 18,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".tm-foot", start: "top 90%" },
      });
      gsap.fromTo(
        ".tm-wordmark span",
        { xPercent: -6 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={scope} className="tm-close">
      <div className="tm-shell">
        <p className="tm-label tm-close__eyebrow">{overview.sloganKo}</p>
        <h2 className="tm-close__statement">
          Arise PNU, <span className="is-red tw-nowrap">같이 더 높게.</span>
        </h2>

        <dl className="tm-foot">
          <div className="tm-foot__row">
            <dt>Organization</dt>
            <dd>
              {overview.orgEn}
              <br />
              {overview.org}
            </dd>
          </div>
          <div className="tm-foot__row">
            <dt>Address</dt>
            <dd>{contact.address}</dd>
          </div>
          <div className="tm-foot__row">
            <dt>Contact</dt>
            <dd>
              <a href={`tel:${contact.phone.replace(/-/g, "")}`}>
                {contact.phone}
              </a>
              <br />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </dd>
          </div>
          <div className="tm-foot__row">
            <dt>Hours</dt>
            <dd>{contact.hours}</dd>
          </div>
          <div className="tm-foot__row">
            <dt>외부 보기</dt>
            <dd>
              <a
                href={qrLink}
                target="_blank"
                rel="noopener noreferrer"
                className="tm-foot__qr"
              >
                {qrLink.replace(/^https?:\/\//, "")}
                <ArrowUpRight size={13} weight="bold" aria-hidden />
              </a>
            </dd>
          </div>
        </dl>
      </div>

      <div className="tm-wordmark" aria-hidden>
        <span>ARISE PNU</span>
      </div>

      <div className="tm-shell tm-footer__bar">
        <span className="tm-footer__brand">
          {/* Real PNU signature lockup — sits in a light chip on the ink footer. */}
          <span className="tm-footer__sig">
            <Image
              src={brandAssets.signature}
              alt="부산대학교 시그니처"
              width={1350}
              height={340}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </span>
          <span>{overview.badge}</span>
        </span>
        <span className="tm-footer__wordmark">
          <Image
            src={brandAssets.wordmarkKr}
            alt="부산대학교 국문 워드마크"
            width={1200}
            height={300}
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </span>
        <span>© {new Date().getFullYear()} ARISE PNU. All rights reserved.</span>
      </div>
    </footer>
  );
}

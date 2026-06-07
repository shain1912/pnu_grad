"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react";
import { brandAssets, overview, nav, qrLink } from "@/lib/content";

const ROOT = "/tresmares";

/** Sticky top-nav shared by every tresmares page (NO left sidebar). */
export default function SiteNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    const href = `${ROOT}${path}`;
    if (path === "") return pathname === ROOT || pathname === `${ROOT}/`;
    if (path.startsWith("/data")) return pathname.startsWith(`${ROOT}/data`);
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="tm-nav">
      <div className="tm-shell tm-nav__inner">
        <Link href={ROOT} className="tm-nav__brand">
          {/* Real PNU symbol — .jpg has a white bg, sits on the light theme. */}
          <span className="tm-nav__logo">
            <Image
              src={brandAssets.symbolColor}
              alt="부산대학교 심볼"
              width={152}
              height={146}
              priority
            />
          </span>
          <span className="tm-nav__brandtext tw-nowrap">{overview.brand}</span>
        </Link>

        <nav className="tm-nav__links" aria-label="주요 내비게이션">
          {nav.map((l) => {
            const star = "star" in l && l.star === true;
            return (
              <Link
                key={l.path}
                href={`${ROOT}${l.path}`}
                className={`tm-nav__link${
                  isActive(l.path) ? " is-current" : ""
                }${star ? " tm-nav__link--star" : ""}`}
                aria-current={isActive(l.path) ? "page" : undefined}
              >
                {l.label}
                {star && <span aria-hidden> ★</span>}
              </Link>
            );
          })}
          <a
            href={qrLink}
            className="tm-nav__qr"
            target="_blank"
            rel="noopener noreferrer"
          >
            QR · 외부보기
            <ArrowUpRight size={12} weight="bold" aria-hidden />
          </a>
        </nav>
      </div>
    </header>
  );
}

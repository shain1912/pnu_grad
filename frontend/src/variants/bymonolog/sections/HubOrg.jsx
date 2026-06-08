"use client";

import { useRef } from "react";
import { CubeFocus } from "@phosphor-icons/react";
import { hub } from "@/lib/content";
import { useReveal } from "@/lib/scroll";
import { useCountUp } from "./gradMotion";

function parseQuota(value) {
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  if (!m) return null;
  return { pre: m[1], n: Number(m[2].replace(/,/g, "")), post: m[3] };
}

/**
 * P3 학사조직 — AI대학 (ADP+X). 4-QUADRANT 다이어그램(D·A·P·X) + 중앙 AX 허브.
 * launch/quota는 상단 메타 + quota count-up으로 강조. Light useReveal entrance.
 * Renders on a CREAM alternation slide → 모든 색은 token-driven.
 */
export default function HubOrg() {
  const root = useRef(null);
  useReveal(root);
  useCountUp(root);

  const quota = parseQuota(hub.org.quota);

  return (
    <section ref={root} className="mono-section" aria-label="AI대학 ADP+X 모델">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mono-label !text-[var(--gold)]" data-reveal>
              학사조직 / ORG · ADP+X
            </span>
            <h2
              className="mt-3 flex items-center gap-3 text-balance font-heavy text-3xl uppercase leading-[0.98] tracking-tight text-[var(--text)] md:text-5xl"
              data-reveal
              style={{ wordBreak: "keep-all" }}
            >
              <span className="hub-icon shrink-0" aria-hidden>
                <CubeFocus size={20} weight="duotone" />
              </span>
              {hub.org.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" data-reveal>
            <span className="rounded-full border border-[rgba(201,162,39,0.4)] px-3 py-1 font-mono text-xs tracking-wider text-[var(--gold)] tw-nowrap">
              {hub.org.launch}
            </span>
            <span className="rounded-full border border-[rgba(201,162,39,0.4)] px-3 py-1 font-mono text-xs tracking-wider text-[var(--gold)] tw-nowrap">
              {quota ? (
                <>
                  {quota.pre}
                  <span className="hub-count" data-count={quota.n}>
                    0
                  </span>
                  {quota.post}
                </>
              ) : (
                hub.org.quota
              )}
            </span>
          </div>
        </div>

        {/* ── 4-QUADRANT D·A·P·X ──────────────────────────────── */}
        <div className="hub-quad mt-10" data-reveal>
          {hub.org.frame.map((f) => (
            <article key={f.k} className="hub-quad__cell">
              <span className="hub-quad__k">{f.k}</span>
              <span
                className="hub-quad__name"
                style={{ wordBreak: "keep-all" }}
              >
                {f.name}
              </span>
              <p className="hub-quad__body" style={{ wordBreak: "keep-all" }}>
                {f.body}
              </p>
            </article>
          ))}
          {/* central AX hub badge on the cross-seam */}
          <div className="hub-quad__hub" aria-hidden>
            <b>AX</b>
            <span>HUB</span>
          </div>
        </div>

        <p
          className="mt-5 max-w-3xl text-balance text-xs leading-relaxed text-[var(--muted)]"
          data-reveal
          style={{ wordBreak: "keep-all" }}
        >
          {hub.org.note} · {hub.org.majorsNote}
        </p>
      </div>
    </section>
  );
}

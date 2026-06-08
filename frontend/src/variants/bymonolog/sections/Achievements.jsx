"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy } from "@phosphor-icons/react";
import { achievements } from "@/lib/content";

const [topAward, ...restHeadline] = achievements.headline;

export default function Achievements() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const scope = self.selector;

      gsap.from(scope(".robo-card"), {
        clipPath: "inset(0 0 100% 0)",
        scale: 1.06,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".robo-card")[0], start: "top 82%" },
      });

      gsap.from(scope(".robo-mission"), {
        opacity: 0,
        scale: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "back.out(2)",
        scrollTrigger: { trigger: scope(".robo-card")[0], start: "top 70%" },
      });

      gsap.from(scope(".ach-item"), {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".ach-grid")[0], start: "top 80%" },
      });

      gsap.from(scope(".ach-list-item"), {
        opacity: 0,
        x: -20,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: scope(".ach-list")[0], start: "top 84%" },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="mono-section">
      <div className="mono-section__inner">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <span className="mono-label">성과 / ACHIEVEMENTS</span>
          <span className="mono-label">2025 — 2026</span>
        </div>

        <h2 className="mt-5 max-w-3xl font-heavy text-4xl uppercase leading-[0.95] tracking-tight text-[var(--text)] md:text-6xl">
          세계가 주목한 성과
        </h2>

        {/* Flagship award hero + headline stats */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Top-award hero card — bold accent graphic blocks stand in for imagery */}
          <div
            className="robo-card relative flex min-h-[420px] flex-col justify-between p-9 md:p-12"
            style={{
              background:
                "radial-gradient(130% 120% at 85% 0%, rgba(201,162,39,0.32) 0%, rgba(26,26,27,0) 52%), linear-gradient(155deg, #20201d 0%, #0e0e0f 100%)",
              border: "1px solid rgba(201,162,39,0.4)",
              color: "#edede8",
              "--text": "#edede8",
              "--metal": "#cfcdc4",
              "--muted": "#b8b8b2",
            }}
          >
            {/* accent graphic block — abstract "podium" bars */}
            <div
              className="pointer-events-none absolute bottom-0 right-0 flex items-end gap-2 p-9 opacity-[0.18] md:p-12"
              aria-hidden
            >
              <span className="block h-24 w-8 rounded-t bg-[var(--gold)] md:h-32 md:w-12" />
              <span className="block h-40 w-8 rounded-t bg-[var(--gold)] md:h-56 md:w-12" />
              <span className="block h-16 w-8 rounded-t bg-[var(--gold)] md:h-24 md:w-12" />
            </div>

            <div className="relative flex items-center justify-between">
              <Trophy
                size={48}
                weight="fill"
                className="text-[var(--gold)]"
                aria-hidden
              />
              <span className="mono-label text-[var(--gold)]">
                AI 혁신 부문 · 2025
              </span>
            </div>

            <div className="relative">
              <h3 className="font-heavy text-5xl uppercase leading-[0.9] tracking-tight text-[var(--text)] md:text-7xl">
                {topAward.value}
              </h3>
              <p className="mt-4 max-w-md text-lg text-[var(--metal)] md:text-xl">
                {topAward.label}
              </p>
            </div>
          </div>

          {/* 3 headline stats — bigger numerals, gradient accents */}
          <div className="ach-grid grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1">
            {restHeadline.map((h) => (
              <div
                key={h.value}
                className="ach-item relative flex flex-col justify-center overflow-hidden rounded-2xl border border-[var(--hairline)] p-7"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,162,39,0.08) 0%, var(--surface) 60%)",
                }}
              >
                <span className="font-heavy text-5xl uppercase leading-none tracking-tight text-[var(--gold)] md:text-6xl">
                  {h.value}
                </span>
                <span className="mt-3 text-sm text-[var(--metal)]">
                  {h.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5 list achievements + timeline, two columns to stay compact */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ul className="ach-list grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)]">
            {achievements.list.map((item, i) => (
              <li
                key={item}
                className="ach-list-item flex items-start gap-4 bg-[var(--surface)] p-5"
              >
                <span className="font-mono text-xl md:text-2xl font-heavy text-[var(--gold)] shrink-0">
                  0{i + 1}
                </span>
                <p className="text-lg md:text-xl font-medium leading-relaxed text-[var(--text)]">
                  {item}
                </p>
              </li>
            ))}
          </ul>

          {/* Dated milestone timeline */}
          <div className="ach-timeline">
            <span className="mono-label">마일스톤 / TIMELINE</span>
            <div className="relative mt-6 pl-6">
              <div className="absolute left-[3px] top-1 bottom-1 w-px bg-[var(--hairline)]" />
              <ul className="flex flex-col gap-6">
                {achievements.timeline.map((ev) => (
                  <li key={ev.date} className="ach-list-item relative">
                    <span className="absolute -left-6 top-1.5 h-2 w-2 rounded-full bg-[var(--gold)] ring-4 ring-[var(--bg)]" />
                    <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-4">
                      <span className="font-mono text-xs tracking-wider text-[var(--gold)] tabular-nums">
                        {ev.date}
                      </span>
                      <h4 className="text-base font-medium text-[var(--text)]">
                        {ev.title}
                      </h4>
                    </div>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--metal)]">
                      {ev.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

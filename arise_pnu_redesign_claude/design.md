# ARISE PNU — Design System & Reference Analysis (시안별)

> Build-ready design spec for `arise_pnu_redesign_claude`. Five renditions of the
> **부산대학교 AI 거점대학육성사업단 (ARISE PNU)** "사업 소개" page, each faithful to one
> reference site. Every variant renders the *same* content (single source of truth:
> `src/lib/content.ts`, transcribed from `arise_about.md`) in that reference's distinct
> visual + motion language.
>
> Methodology: one analyst teammate per reference read the captured scroll screenshots
> in `E:/arise2/ref/` (contact-sheet montage + hero / mid / end keyframes) and estimated
> palettes, fonts, grids, and ScrollTrigger choreography directly from the pixels. Where
> the earlier root `design.md` mis-stated a palette, the screenshot reading wins —
> notably **Tresmares is monochrome + red (not navy/cyan)** and **Cura Climate is
> terracotta/bone/carbon (not emerald green)**.

## Shared architecture (all variants)

- **Stack**: Next.js 16 (App Router, RSC) · React 19 · TypeScript · Tailwind CSS v4 (`@tailwindcss/postcss`) · GSAP 3.15 + ScrollTrigger · Lenis smooth scroll · `@phosphor-icons/react`.
- **Routes**: `/` = hub linking the five; `/bymonolog`, `/yale`, `/tresmares`, `/curaclimate`, `/daangn` = full About pages.
- **Isolation**: each variant owns `src/app/<slug>/` (its `page.tsx`, a `Client.tsx` client root, colocated components + a `<slug>.css` for variant-only styles). No variant edits another's files or the shared `globals.css`.
- **Smooth scroll**: each variant's client root calls `useLenis()` (`src/lib/useLenis.ts`), which registers ScrollTrigger, drives Lenis from the GSAP ticker, and reverts on unmount. All GSAP runs in a `"use client"` component inside `useEffect` + `gsap.context()` with `ctx.revert()` cleanup.
- **Typography**: Korean base = Pretendard (CDN). Display faces loaded in `globals.css` and exposed as Tailwind utilities: `font-display` (Archivo), `font-serif` (Newsreader/Nanum Myeongjo), `font-grotesk` (Space Grotesk), `font-heavy` (Black Han Sans), `font-jakarta` (Plus Jakarta Sans), `font-rounded` (Jua), `font-myeongjo`, `font-dohyeon`, `font-mono` (JetBrains Mono).
- **Accessibility**: gate all motion behind `prefers-reduced-motion`; ship a readable static layout when reduced. WCAG AA contrast on all text and CTAs. Content text is verbatim from `content.ts` — no lorem, no invented numbers.
- **Color discipline**: one accent locked per variant (see each section); the page selection color follows `--page-accent` set on the variant root.

---

## bymonolog
- **Vibe**: Cinematic, editorial dark-luxe studio — moody charcoal stages punctuated by oversized custom-display typography and rare bursts of full-bleed photography; quietly confident, agency-grade.
- **Color palette**:
  - `#0E0E0F` — bg (near-black charcoal, the dominant canvas)
  - `#1A1A1B` — surface (slightly lifted dark panels / footer)
  - `#EDEDE8` — text (warm off-white headlines & body)
  - `#8A8A85` — muted (grey caption text, secondary labels)
  - `#B9B6AC` — neutral metallic (the giant wordmark fill); ARISE adds one warm accent `#C9A227` (prestige gold) as the single color jolt
  - `#F4F1EC` — light-section bg (the one inverted cream gallery section mid-scroll)
- **Typography**: Display = heavy wide grotesque, UPPERCASE, tight tracking (~-0.02em), enormous (hero word bleeds full-width) → use `font-display`/`font-heavy`. Body = clean neutral sans ~16-18px, line-height ~1.5. Labels = uppercase mono ~11-12px, tracked (~0.08em), muted → `font-mono`.
- **Layout & grid**: Asymmetric, stage-like. Sticky top nav (left wordmark / center menu / right pill CTA). Hero: short centered paragraph floating mid-stage + colossal wordmark bleeding off both edges at the bottom. Manifesto split (small stat bottom-left + large statement right). One deliberate dark→light→dark cream gallery for editorial pacing. Dark footer stack with rising white "smoke" gradient.
- **Signature visual devices**: film grain/noise over dark stages; soft spotlight bloom behind the hero word; type-over-image overlap; pill CTAs; hairline dividers under stats; footer fog gradient.
- **Scroll / GSAP choreography**:
  - Hero wordmark scrub-scale + parallax + bloom on load: `gsap.to('.hero-word',{scale:1.04,yPercent:-8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:0.6}})`; hero copy `from {y:24,opacity:0}` on load.
  - Manifesto line-by-line masked reveal: `from('.line',{yPercent:110,stagger:0.06,duration:0.9,ease:'power4.out'})` at `start:'top 70%'`.
  - **Signature moment — pinned split-reveal**: pin a section, scrub a wordmark so two halves slide apart (`xPercent ±30`) to reveal a centered figure/photo between them. `timeline({scrollTrigger:{start:'top top',end:'+=120%',scrub:true,pin:true}})`.
  - Client/logo batch fade-in; light-gallery parallax + count-up; case-study clip-path/scale reveal.
- **Translation to ARISE PNU**:
  - **Hero**: the Korean slogan "Arise PNU, 같이 더 높게" as the colossal bleeding wordmark on charcoal with a dim spotlight bloom; short subline floats mid-stage; scrub-scale + parallax.
  - **4 identity axes**: manifesto line-stagger — four masked heavy uppercase lines wipe up sequentially.
  - **Key metrics**: borrow the inverted cream section — large count-up numbers, muted labels, hairline dividers, two-up grid.
  - **A.U.R.A 2.0 (8/22/47)** — **carry the signature scroll moment here**: pin + split the "A.U.R.A 2.0" wordmark apart on scrub to reveal 8/22/47 between the halves.
  - **Funding (7) + roadmap (2025-2027)**: pinned horizontal-pan/timeline scrub; the active **2026** node enlarges/brightens. RoboCup 2025 as a clip-path photo card.
  - **Contact**: dark footer with rising white-smoke gradient, Services/Contact columns, pill CTA "같이 더 높게".

---

## Yale (Institutional Heritage Editorial)
- **Vibe**: Quietly authoritative academic publishing — generous white space, a single confident serif headline, dense justified body columns, one electric blue as the only color event. Reads like a prestige university-press annual report.
- **Color palette**:
  - `#FFFFFF` — bg (paper-white, dominant)
  - `#14181F` — text (near-black ink, very high contrast, not pure #000)
  - `#6B7178` — muted (eyebrow/caption gray)
  - `#0E1FE3` — accent electric blue (italic accent word, links, full-bleed feature panels)
  - `#F4F5F7` — surface (light-gray section/card fill)
  - `#D8DBDF` — rule (hairline borders/dividers)
- **Typography**: Display = high-contrast transitional/Didone serif (Yale Typeface / Times-Didot family), regular weight, tight tracking, with a contrasting *italic* accent word; hero ~88-120px, stacked 3 lines → `font-serif`/`font-myeongjo` (Korean). Body = serif at ~15-16px, justified, multi-column, leading ~1.6. Eyebrow = sans uppercase ~11-12px tracked.
- **Layout & grid**: 12-col with wide margins; hero = centered single-axis headline flanked by two narrow justified columns (asymmetric editorial framing). News/editorial card grid on gray surface; centered pull-quote; section-divider row of uppercase labels separated by vertical hairline rules (numbered "01/02/03"); arc/circle process diagram with labeled baseline nodes.
- **Signature visual devices**: 1px hairline rules everywhere; lone italic serif word as brand gesture; one full-bleed electric-blue feature spread with white serif over tilted floating card mockups; numbered phase labels; justified body columns as texture.
- **Scroll / GSAP choreography** (restrained — motion serves reading):
  - Hero headline stagger-in: `from('.hero-line',{yPercent:120,opacity:0,stagger:0.08,ease:'power3.out'})`; columns `from {opacity:0,y:24,delay:0.4}`.
  - Sticky shrinking nav past hero (toggle `.is-compact` via ScrollTrigger).
  - Section eyebrow + rule wipe: `from('.rule',{scaleX:0,transformOrigin:'left',ease:'power2.out',scrollTrigger:{start:'top 75%'}})`.
  - Editorial cards `ScrollTrigger.batch` fade-up.
  - **Signature moment — blue feature spread**: pinned overlap reveal of floating cards with parallax (`pin:true,end:'+=120%',scrub:true`); cards `from {y:80,rotation:±,opacity:0,stagger:0.1}`.
  - Process arc: draw-SVG-style stroke reveal scrubbed; node labels fade sequentially.
- **Translation to ARISE PNU**:
  - **Hero**: slogan as large serif headline with "더 높게" in italic-blue accent; flank with two narrow justified columns (mission L / program summary R).
  - **4 identity axes**: numbered uppercase-sans label row separated by vertical rules ("01 SELECTED | 02 REGION | 03 MILESTONE | 04 RANK"), one-line serif descriptor each; rule-wipe on enter.
  - **Key metrics**: 4-up grid on light-gray surface — big serif number + small sans eyebrow label; count-up.
  - **Funding (7)**: editorial table — left serif item name, right-aligned value, hairline rule per row; rows fade-up.
  - **A.U.R.A 2.0 (8/22/47) + RoboCup 2025** — **signature moment**: full-bleed electric-blue feature spread, white serif "A.U.R.A 2.0" over tilted floating cards (8/22/47 + RoboCup), pinned scrubbed reveal.
  - **Roadmap (2025-2027)**: process-arc adapted into a horizontal three-node timeline with drawn connecting stroke; labels fade left→right on scrub.
  - **Contact**: quiet white section, centered serif heading + eyebrow-labeled contact lines over a top hairline rule.

---

## Tresmares (Premium Corporate Finance)
- **Vibe**: Austere editorial finance — vast white space, grayscale mountain/botanical photography, and a single jolt of arterial red; restrained, gallery-like rather than corporate-glossy.
- **Color palette** (honest read: monochrome white→black with a **red** accent — NO navy/cyan):
  - `#FFFFFF` — bg (near-white canvas, dominant)
  - `#0E0E10` — text (near-black headlines/body)
  - `#8A8A8C` — muted (secondary copy, ghosted heading text, labels)
  - `#E2231A` — accent (signature electric red; metric numbers, floating blocks, mark)
  - `#B5B5B7` — surface tint (gray section panels)
  - `#E6E6E6` — hairline borders (1px bento dividers)
- **Typography**: Display = **serif** (Times/Tiempos-like, high-contrast transitional) — hero ~120-160px, metric numbers ~64-80px (the load-bearing surprise; NOT a geometric sans) → `font-serif`. Body = neutral grotesque sans ~16-18px, narrow measure → Pretendard/`font-jakarta`. Labels = sans ALL-CAPS ~11-12px tracked, muted.
- **Layout & grid**: 12-col, very wide margins. Hero = left-anchored oversized headline + grayscale photo bleeding off right + small mid-right paragraph with underlined link. Metrics = 2×2 hairline bento of big-number cells (label / huge red number / caption). Solutions = pinned left vertical nav (active black / rest gray) + giant ghosted serif watermark word + right-edge stacked metric labels + floating red rectangles over botanical photo. Closing = centered serif statement over a row of small grayscale thumbnails + thin legal footer.
- **Signature visual devices**: hairline-divided big-number bento with red numerals; floating flat-red rectangles overlapping imagery; ghosted oversized watermark words; full-bleed desaturated photography as texture; pinned scrolling category nav; negative space as design element.
- **Scroll / GSAP choreography**:
  - Hero lines rise on load: `from('.hero-line',{yPercent:120,opacity:0,stagger:0.12,ease:'power3.out'})`.
  - Mountain image parallax: `to('.hero-img',{yPercent:-15})` scrubbed over hero.
  - Metric count-up + fade as bento enters (`start:'top 70%'`, `from('.metric-num',{opacity:0,y:24,stagger:0.15})`).
  - **Signature moment — pinned Solutions**: left nav pinned while right content scrolls (`pin:'.solutions-nav',end:'+=300%',scrub:true`); active item swaps gray→black per panel; red blocks scale in (`scaleX:0→1,transformOrigin:'left'`); ghosted watermark slow horizontal drift.
- **Translation to ARISE PNU**:
  - **Hero**: oversized serif stacked "Arise PNU, / 같이 / 더 높게" left-anchored, grayscale PNU/lab image off the right, short tagline + underlined "About" link; swap Tresmares red for the ARISE accent (keep red `#E2231A` as the variant's locked jolt).
  - **4 identity axes**: the pinned-left-nav Solutions pattern — 4 axes listed vertically (active black / rest muted), each scrolling a right panel with a ghosted oversized axis word + copy + one floating accent block.
  - **Key metrics as big-number bento**: 2×2 (or 4-up) hairline bento — ₩3,111억 / 58명 / 424명 / QS 473위 — small-caps label + huge accent numeral + caption + count-up. The most direct 1:1 port.
  - **Funding (7)**: financial-style horizontal allocation bar (stacked segments) + hairline list of 7 line-items with right-aligned values; segments animate width on scrub.
  - **A.U.R.A 2.0 (8/22/47) + RoboCup 2025**: small bento trio of accent big-numbers beside an editorial achievement card with a B&W photo treatment.
  - **Roadmap / budget growth — signature alt**: an **SVG path-draw growth line** (`stroke-dashoffset` len→0, scrubbed) with year/milestone labels fading at each node. Close on a centered serif statement over a thumbnail photo row + thin footer.

---

## Cura Climate (Industrial Climate Tech)
- **Vibe**: Confident editorial industrial-tech — terracotta warmth meets carbon-black gravity, crisp Swiss typography, tactile cement/rubble photography. Serious climate engineering presented like a premium product launch. (Honest read: terracotta/bone/carbon — NOT emerald green.)
- **Color palette**:
  - `#F4F2ED` — bg bone white (hero + light sections)
  - `#C75B3D` — accent terracotta / burnt orange (hero gradient block, CTAs, full-bleed panels)
  - `#1A1714` — text near-black charcoal (on light)
  - `#171513` — surface carbon black (full-bleed dark section, rubble backdrop)
  - `#D6EBC9` — accent-soft pale mint/sage (footer panel + oversized wordmark sections)
  - `#8C857C` muted warm grey; `#3D1E18` deep oxblood (secondary dark panel)
- **Typography**: Display = tight heavy grotesk (Neue Haas / Söhne feel), weight ~600-700, tight leading (~0.95-1.0), sentence case, period-terminated, ragged left → `font-grotesk`/`font-display`. Body = humanist grotesk 400, leading ~1.4, narrow measure (~38-45ch). Labels = uppercase grotesk ~11-12px tracked, often in a mint pill badge. Hero `clamp(48px→96px)`.
- **Layout & grid**: 12-col, generous margins; full-bleed colored/photographic panels alternate with white editorial sections. Hero = left headline over white + terracotta gradient block bottom-left (intro + pill CTA) + floating cutout rubble images escaping right. Dark split block (headline L / justified body + outlined CTA R). Partners bento (intro cell + 3-4 col logo grid, hairline rules). News 2-card row with category pills. Footer = pale-mint full-bleed with enormous "CURA" wordmark bleeding off both edges.
- **Signature visual devices**: oversized outline/ghost wordmark clipped at viewport edges; cutout cement-rubble photography floating free over color fields (no card frame); rounded-full pill badges (accent-tinted); alternating full-bleed mono-color panels (terracotta/carbon/oxblood/mint) as dividers; thin hairline grid in the bento; data-as-prose (big statistic as emphasized inline copy, not charts).
- **Scroll / GSAP choreography**:
  - Hero rubble parallax: per-rock `data-speed` y from -60 to -160, `rotation:6`, scrubbed over hero.
  - Oversized wordmark horizontal drift: `fromTo('.ghost-word',{xPercent:-8},{xPercent:8,ease:'none',scrub:1})`.
  - Pinned color-panel headline reveal: each full-bleed panel pins briefly (`pin:true,end:'+=60%',scrub:true`) while heading clip-reveals up (`clip-path inset(100% 0 0 0)→inset(0)`) + word stagger.
  - Split-block staggered entrance (`from('.split > *',{y:40,autoAlpha:0,stagger:0.12,start:'top 75%'})`).
  - Bento cascade with 2D grid stagger.
- **Translation to ARISE PNU**:
  - **Hero**: slogan as tight left-aligned display over bone-white + terracotta gradient block bottom-left (sub-slogan + pill CTA) + floating cutout campus/robot imagery escaping the block.
  - **4 identity axes**: pinned full-bleed color-panel sequence — each axis its own mono-color band (terracotta/carbon/oxblood/mint), clip-reveal headline + descriptor, one panel per pin.
  - **Key metrics**: data-as-prose — oversized numerals inline in a short justified paragraph in a dark split section, each figure count-up on enter.
  - **Funding (7)**: Partners-style bento/hairline grid — 7 cells with category pill + amount, 2D-stagger cascade.
  - **A.U.R.A 2.0 (8/22/47)**: process framework — 3 sequential pinned steps where each label + number (8→22→47) translates/scales into place on scrub.
  - **Roadmap 2025-2027 — signature moment**: scrubbed progress timeline — pin the section, drive a horizontal track; 2025/2026/2027 markers + milestone cards translate in along a progress line whose width animates `0%→100%` on scrub, with a giant ghost-word ("ARISE") drifting behind. RoboCup 2025 as a news 2-card row before it; contact closes on a pale-mint footer with edge-bleed "ARISE PNU" wordmark.

---

## Daangn (Friendly Consumer)
- **Vibe**: Warm, neighborly, human-first editorial calm — full-bleed lifestyle photography on a clean off-white canvas, one signature carrot-orange accent doing all the emotional work. Trustworthy community brand, not techy.
- **Color palette**:
  - `#F8F6F2` — bg warm off-white/paper (large empty canvas between sections)
  - `#FFFFFF` — surface (metric panels, cards); footer band `#F2F2F4`
  - `#1A1A1A` — text near-black ink
  - `#8A8A8A` muted grey (captions/sub-copy); dates `#9CA3AF`
  - `#FF6F0F` — accent Daangn carrot orange (wordmark, headline highlight, key phrases)
  - `#FFE9D6` — accent-soft pale orange wash (blocks/illustration backdrops)
- **Typography**: Headlines = friendly rounded-leaning heavy sans (Pretendard Bold/ExtraBold; rounded variant for the wordmark) → `font-rounded` for the wordmark, Pretendard bold for headlines. Body = same family Regular, line-height 1.7-1.8. Warmth from photography + orange, not the type. Giant bold numerals as focal graphics. Hero H1 `clamp(40-64px)`; giant metric numerals 64-96px.
- **Layout & grid**: mobile-first single column, centered max-width ~1100-1200px, very generous vertical whitespace. Border-radius scale: cards/images `rounded-2xl` (16-24px), metric panels ~16px, thumbs ~12px — nothing sharp. Compositions: hero (H1 top-left + full-bleed rounded lifestyle image), mission (centered paragraph w/ orange-highlighted phrases + horizontal row of 5 rounded photo cards), alternating two-up text/portrait pairs, metrics (headline + large white number panels), press/award grid of colorful rounded cards with dates, light-grey footer band.
- **Signature visual devices**: fully rounded photo cards as primary unit; warm documentary photography (no heavy filters); orange wordmark + selective orange phrase-highlighting in black copy; large bold numerals as hero graphics; horizontal multi-card photo strip; soft pale-orange color blocks.
- **Scroll / GSAP choreography**:
  - Section entrance fade-up (`from {y:32,opacity:0,ease:'power3.out',start:'top 80%'}`).
  - Photo-strip left→right stagger (`stagger:0.12`).
  - Springy card hover (`scale:1.03`, `ease:'elastic.out(1,0.6)'` or CSS `cubic-bezier(.34,1.56,.64,1)`).
  - **Signature moment — count-up metrics**: numbers tween 0→target when each white panel enters (`snap:{val:1}`, panel fades-up first).
  - Hero image reveal (scale 1.06→1, optional scrub parallax).
  - Alternating text/photo reveal (text `x:-24`, photo `x:24`, opacity 0→1). Pale-orange band = natural spot for a looping illustration on scroll-in.
- **Translation to ARISE PNU**:
  - **Hero**: top-left bold H1 "Arise PNU, 같이 더 높게" with orange-highlighted "더 높게", then a full-bleed `rounded-2xl` campus/robotics image scaling in (1.06→1). Warm off-white canvas, one PNU-orange accent.
  - **4 identity axes**: alternating two-up pattern OR a horizontal 4-card rounded strip with left→right stagger — friendly photo + label + one-line description.
  - **Key metrics**: row of large white `rounded-2xl` number panels (mirroring "2,000만+"), scroll-triggered count-up (₩ / 위 handled in onUpdate) + fade-up.
  - **Funding (7)**: clean rounded-card list/grid on white; staggered fade-up; pale-orange `#FFE9D6` block behind the section header.
  - **A.U.R.A 2.0 (8/22/47)**: compact trio of orange-highlighted big numerals in one rounded panel, count-up; can host the illustrated character moment in a pale-orange band.
  - **Achievements (RoboCup 2025) + roadmap**: colorful press/award rounded-card grid (date labels, staggered entrance) for achievements; roadmap as a friendly horizontal **stepper** of rounded nodes connected by a line, steps fading/sliding in sequentially. Light-grey footer band (links + social).

---

### Per-variant locked accent (selection color + single jolt)
| Variant | Theme | Accent | Canvas |
|---|---|---|---|
| bymonolog | dark | `#C9A227` gold | `#0E0E0F` |
| yale | light | `#0E1FE3` electric blue | `#FFFFFF` |
| tresmares | light | `#E2231A` red | `#FFFFFF` |
| curaclimate | light/dark mix | `#C75B3D` terracotta | `#F4F2ED` |
| daangn | light | `#FF6F0F` orange | `#F8F6F2` |

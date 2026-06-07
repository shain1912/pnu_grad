/* =====================================================================
   ARISE PNU — 공통 모션 엔진 (GSAP + ScrollTrigger)
   원칙: 풍부하지만 절제 · 기관 톤 유지 · prefers-reduced-motion 완전 존중
        모든 초기 상태는 JS(gsap.set)로만 숨김 → JS 실패/감속 모드 = 항상 보임
   적용: main.js에서 import → main.js를 로드하는 모든 페이지에 자동 적용
   ===================================================================== */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'power3.out';

/* 자식들을 순차로 드러내는 그리드 컨테이너 */
const GRID_SEL = [
  '.dstrip', '.cardgrid', '.pbars', '.pipe', '.charts', '.metrics', '.quad',
  '.anchors', '.checks', '.domains', '.targets', '.duallist', '.flow', '.tracks',
  '.ach-grid', '.transfer-grid', '.firsts-strip', '.gov-grid', '.programs-grid',
  '.partners-grid', '.impact-grid', '.press-grid', '.reach-grid', '.momentum-kpis',
  '.counter-grid', '.dom-grid', '.infra-grid', '.qnodes', '.phases', '.global-list',
  '.govt-grid', '.ind-grid', '.data-grid', '.minichart-row', '.htl', '.maplist',
  '.pt-metricband', '.eco-legend', '.legend'
];

/* 단일 블록 reveal (그리드 자식이 아닌 큰 단위) */
const BLOCK_SEL = [
  '.sec-head', '.section-header', '.panel', '.figband', '.figsplit', '.matrix',
  '.majors', '.closing', '.spotlight', '.gfe-feature', '.ranktable', '.certcard',
  '.news-feature', '.notice-box', '.pipe-band', '.split-block', '.vtl', '.eco-chart-box'
];

/* 숫자 카운트업 대상 */
const NUM_SEL = [
  '.dstrip__n', '.prog-hero__fact .n', '.metric .mn', '.ministat .n', '.tgt .tn',
  '[data-count]'
];

function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

ready(() => {
  // 감속 모드: 아무것도 숨기지 않고, 레거시 .reveal 만 즉시 표시
  if (REDUCE) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  intro();
  legacyReveal();
  staggerGrids();
  revealBlocks();
  countUps();
  fillBars();
  parallax();

  // 이미지 로드 등으로 위치가 바뀌면 트리거 재계산
  window.addEventListener('load', () => ScrollTrigger.refresh());
});

/* 페이지 진입 인트로 (히어로) */
function intro() {
  const bits = ['.prog-hero__crumb', '.prog-hero__kicker', '.prog-hero__title', '.prog-hero__en']
    .map((s) => document.querySelector(s))
    .filter(Boolean);
  if (bits.length) {
    gsap.from(bits, { y: 30, opacity: 0, duration: 0.9, ease: EASE, stagger: 0.12, delay: 0.08 });
  }
  const facts = document.querySelector('.prog-hero__facts');
  if (facts) {
    gsap.from(facts, { y: 26, opacity: 0, duration: 0.9, ease: EASE, delay: 0.5 });
  }
  const heroImg = document.querySelector('.prog-hero__img');
  if (heroImg) {
    gsap.from(heroImg, { scale: 1.14, duration: 1.8, ease: 'power2.out' });
  }
}

/* 레거시 .reveal 클래스 활성화 (기존 마크업 호환) */
function legacyReveal() {
  document.querySelectorAll('.reveal').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => el.classList.add('active')
    });
  });
}

/* 그리드 자식 순차 등장 */
function staggerGrids() {
  document.querySelectorAll(GRID_SEL.join(',')).forEach((grid) => {
    if (grid.dataset.mAnim) return;
    grid.dataset.mAnim = '1';
    const items = Array.from(grid.children).filter((c) => c.nodeType === 1);
    if (!items.length) return;
    items.forEach((c) => { c.dataset.mItem = '1'; });
    gsap.set(items, { opacity: 0, y: 26 });
    ScrollTrigger.create({
      trigger: grid, start: 'top 86%', once: true,
      onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.08 })
    });
  });
}

/* 단일 블록 reveal */
function revealBlocks() {
  document.querySelectorAll(BLOCK_SEL.join(',')).forEach((el) => {
    if (el.dataset.mAnim || el.dataset.mItem) return; // 그리드에서 이미 처리된 요소 제외
    el.dataset.mAnim = '1';
    gsap.set(el, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: EASE })
    });
  });
}

/* 숫자 카운트업 */
function countUps() {
  document.querySelectorAll(NUM_SEL.join(',')).forEach((el) => {
    if (el.dataset.counted) return;
    const textNode = el.childNodes[0];
    if (!textNode || textNode.nodeType !== 3) return;
    const raw = textNode.nodeValue;
    // 순수 숫자(쉼표/소수점/공백)만 카운트업 — "QS 473", "Top 200" 등은 제외
    if (!/^\s*[\d.,]+\s*$/.test(raw)) return;
    const target = parseFloat(raw.replace(/,/g, ''));
    if (!isFinite(target) || target <= 0) return;
    const decimals = (raw.split('.')[1] || '').trim().length;
    const useComma = /,/.test(raw);
    el.dataset.counted = '1';
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target, duration: 1.5, ease: 'power2.out',
          onUpdate: () => {
            let val = decimals ? obj.v.toFixed(decimals) : Math.round(obj.v);
            if (useComma) val = Number(val).toLocaleString('en-US');
            textNode.nodeValue = val;
          }
        });
      }
    });
  });
}

/* 진행률 바 채움 (인라인 width 를 목표값으로) */
function fillBars() {
  document.querySelectorAll('.pbar .pf, .metric .mbar i').forEach((el) => {
    const target = el.style.width;
    if (!target) return;
    gsap.set(el, { width: 0 });
    ScrollTrigger.create({
      trigger: el, start: 'top 95%', once: true,
      onEnter: () => gsap.to(el, { width: target, duration: 1.1, ease: 'power3.out' })
    });
  });
}

/* 부드러운 parallax (히어로 이미지 + data-parallax) */
function parallax() {
  const heroImg = document.querySelector('.prog-hero__img');
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 9, ease: 'none',
      scrollTrigger: {
        trigger: heroImg.closest('.prog-hero') || heroImg,
        start: 'top top', end: 'bottom top', scrub: true
      }
    });
  }
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 10;
    gsap.to(el, {
      yPercent: amt, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

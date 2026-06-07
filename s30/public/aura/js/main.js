/**
 * PNU AX AURA — main integrator.
 * Wires the WebGL stage to the scroll journey along the "PNU Core AXIS" spline.
 *
 * Module contract (implemented by parallel modules):
 *   track.js     -> createTrack(scene)            => { curve, group }
 *   buildings.js -> createBuildings(scene, curve) => { zones, update(elapsed) }
 *   probe.js     -> createProbe(scene)            => { mesh, update(t, curve) }
 *   camera.js    -> updateFollowCamera(camera, curve, t, elapsed)
 *
 * `curve` is a THREE.CatmullRomCurve3 (S-shaped, in/near the XZ plane).
 * `t` is the normalized scroll progress in [0, 1] mapped onto curve.getPointAt(t).
 */
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createBuildings } from './buildings.js';
import { createProbe } from './probe.js';
import { updateFollowCamera } from './camera.js';
import { initCharts } from './charts.js';

const canvas = document.getElementById('webgl');

/* ---------- Renderer ---------- */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,                 // let the CSS gradient sky show through
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // transparent clear → CSS sky behind
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ---------- Scene ---------- */
const scene = new THREE.Scene();
scene.background = null;                 // sky = CSS gradient on #webgl (renderer alpha)
scene.fog = new THREE.FogExp2('#dde6f3', 0.0038); // fade distant geometry into the sky tone

/* ---------- Camera ---------- */
const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 30, 60);
camera.lookAt(0, 0, 0);

/* ---------- Lights ---------- */
scene.add(new THREE.AmbientLight('#b4c0dc', 0.85));
const key = new THREE.DirectionalLight('#ffffff', 1.2);
key.position.set(40, 80, 40);
scene.add(key);
const rim = new THREE.DirectionalLight('#00a651', 0.55);
rim.position.set(-50, 30, -40);
scene.add(rim);
scene.add(new THREE.HemisphereLight('#dce6fb', '#aab8d8', 0.65));

/* ---------- Ground plane (tinted floor → creates a horizon) ---------- */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(5000, 5000),
  new THREE.MeshStandardMaterial({ color: '#d3deef', roughness: 0.97, metalness: 0.0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.6;
scene.add(ground);

/* ---------- Ground grid (campus floor) ---------- */
const grid = new THREE.GridHelper(1600, 160, '#8fa0cf', '#c4cfe8');
grid.material.transparent = true;
grid.material.opacity = 0.5;
grid.position.y = -0.5;
scene.add(grid);

/* ---------- Build the world (parallel modules) ---------- */
const { curve } = createTrack(scene);
const buildings = createBuildings(scene, curve);
const probe = createProbe(scene);

/* ---------- Scroll → t mapping ---------- */
let targetT = 0; // driven by scroll
let smoothT = 0; // eased for cinematic feel

const progressBar = document.getElementById('progress-bar');
const progressPct = document.getElementById('progress-pct');
const navLinks = [...document.querySelectorAll('[data-nav]')];
const sections = [...document.querySelectorAll('.section')];

function setProgressUI(p) {
  const pct = Math.round(p * 100);
  if (progressBar) progressBar.style.width = pct + '%';
  if (progressPct) progressPct.textContent = pct + '%';
}

const snap = document.getElementById('snap');

/**
 * Drive the journey directly from the scroll position of the snap container.
 * This is robust with CSS scroll-snap (where GSAP ScrollTrigger's custom-scroller
 * tracking is unreliable when the trigger element IS the scroller). We still let
 * ScrollTrigger refresh layout metrics if it happens to be present.
 */
function updateActiveNav() {
  // Active zone = the section whose center is nearest the viewport center.
  const mid = snap.scrollTop + snap.clientHeight / 2;
  let activeZone = null;
  let best = Infinity;
  sections.forEach((sec) => {
    const center = sec.offsetTop + sec.offsetHeight / 2;
    const d = Math.abs(center - mid);
    if (d < best) {
      best = d;
      activeZone = sec.getAttribute('data-zone');
    }
  });
  navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === activeZone));
}

let isAnimating = false;
let currentIndex = 0;

function getInitialIndex() {
  const currentScroll = snap.scrollTop;
  let closestIndex = 0;
  let minDiff = Infinity;
  sections.forEach((sec, idx) => {
    const diff = Math.abs(sec.offsetTop - currentScroll);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = idx;
    }
  });
  return closestIndex;
}

function scrollToSection(index) {
  if (index < 0 || index >= sections.length) return;
  
  isAnimating = true;
  currentIndex = index;
  
  const targetScroll = sections[index].offsetTop;
  
  // UI 반응성 향상을 위해 GNB 활성화 상태를 미리 조절
  const activeZone = sections[index].getAttribute('data-zone');
  navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === activeZone));
  
  const { gsap } = window;
  if (gsap) {
    gsap.to(snap, {
      scrollTop: targetScroll,
      duration: 1.1,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        isAnimating = false;
      }
    });
  } else {
    snap.scrollTop = targetScroll;
    isAnimating = false;
  }
}

function handleWheel(e) {
  if (window.innerWidth <= 760) return; // 모바일은 네이티브 브라우저 스냅 사용
  
  e.preventDefault();
  if (isAnimating) return;
  
  if (e.deltaY > 0) {
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1);
    }
  } else if (e.deltaY < 0) {
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    }
  }
}

function handleKeydown(e) {
  if (window.innerWidth <= 760) return;
  
  const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '];
  if (!keys.includes(e.key)) return;
  
  if (isAnimating) {
    e.preventDefault();
    return;
  }
  
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
    e.preventDefault();
    if (currentIndex < sections.length - 1) scrollToSection(currentIndex + 1);
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
    e.preventDefault();
    if (currentIndex > 0) scrollToSection(currentIndex - 1);
  }
}

function initNavClick() {
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetZone = link.dataset.nav;
      const targetSecIdx = sections.findIndex(sec => sec.getAttribute('data-zone') === targetZone);
      if (targetSecIdx !== -1) {
        scrollToSection(targetSecIdx);
      }
    });
  });
}

function onScroll() {
  const max = snap.scrollHeight - snap.clientHeight;
  targetT = max > 0 ? snap.scrollTop / max : 0;
  
  // 애니메이션 중이 아닐 때만 스크롤 위치 기반으로 activeNav 업데이트
  if (!isAnimating) {
    updateActiveNav();
    // 현재 스크롤 위치 기반으로 currentIndex 동기화
    currentIndex = getInitialIndex();
  }
}

function initScrollTrigger() {
  const { gsap, ScrollTrigger } = window;
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
  }
  
  snap.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    onScroll();
    if (window.innerWidth > 760) {
      snap.scrollTop = sections[currentIndex].offsetTop;
    }
  });
  
  snap.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeydown, { passive: false });
  
  initNavClick();
  
  currentIndex = getInitialIndex();
  onScroll();
}

/* ---------- Resize ---------- */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
}
window.addEventListener('resize', onResize);

/* ---------- Animate ---------- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Ease scroll progress toward target for smooth cinematic travel
  smoothT += (targetT - smoothT) * 0.09;
  const t = THREE.MathUtils.clamp(smoothT, 0, 1);

  setProgressUI(t);

  probe.update(t, curve);
  if (buildings.update) buildings.update(elapsed, t);
  updateFollowCamera(camera, curve, t, elapsed);

  renderer.render(scene, camera);
}

/* ---------- Boot ---------- */
function boot() {
  initScrollTrigger();
  initCharts();
  animate();
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 900);
  }
}

// GSAP scripts use `defer`; wait for full load so window.gsap exists.
if (document.readyState === 'complete') boot();
else window.addEventListener('load', boot);

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
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ---------- Scene ---------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color('#060b1c');
scene.fog = new THREE.FogExp2('#060b1c', 0.0065);

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
scene.add(new THREE.AmbientLight('#5566aa', 0.6));
const key = new THREE.DirectionalLight('#bcd0ff', 1.1);
key.position.set(40, 80, 40);
scene.add(key);
const rim = new THREE.DirectionalLight('#00e08a', 0.6);
rim.position.set(-50, 30, -40);
scene.add(rim);
scene.add(new THREE.HemisphereLight('#33408f', '#0a1228', 0.5));

/* ---------- Ground grid (campus floor) ---------- */
const grid = new THREE.GridHelper(1600, 160, '#2b3a8f', '#0f1f45');
grid.material.transparent = true;
grid.material.opacity = 0.35;
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

function onScroll() {
  const max = snap.scrollHeight - snap.clientHeight;
  targetT = max > 0 ? snap.scrollTop / max : 0;
  setProgressUI(targetT);
  updateActiveNav();
}

function initScrollTrigger() {
  const { gsap, ScrollTrigger } = window;
  if (gsap && ScrollTrigger) {
    // Keep ScrollTrigger available for layout refresh; not used for t-mapping.
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
  }
  snap.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
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
  smoothT += (targetT - smoothT) * 0.06;
  const t = THREE.MathUtils.clamp(smoothT, 0, 1);

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

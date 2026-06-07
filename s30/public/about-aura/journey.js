/**
 * A.U.R.A 2.0 — 스크롤 구동 3D 여정 (Hut8 레퍼런스 기반, 자체 제작)
 * 라이트 아이소메트릭 로우폴리 월드를 PNU Core AXIS 곡선을 따라 카메라가 이동.
 * 4개 레이어(A 철학 · U 연구 · R 교육 · A 행정)를 스크롤로 차례로 프레이밍한다.
 *
 * three 는 importmap 으로 /s30/aura/vendor/three.module.js 에 매핑됨.
 */
import * as THREE from 'three';

const canvas  = document.getElementById('auh-canvas');
const section = document.querySelector('.auh-journey');
if (canvas && section) bootstrap();

function bootstrap() {
  /* ───────── Renderer ───────── */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { section.classList.add('auh-journey--nogl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ───────── Scene ───────── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#eaf0f9', 120, 360);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 2000);

  /* ───────── Lights ───────── */
  scene.add(new THREE.HemisphereLight('#ffffff', '#cfd9ec', 0.95));
  const key = new THREE.DirectionalLight('#ffffff', 1.55);
  key.position.set(58, 96, 44);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 10; key.shadow.camera.far = 320;
  key.shadow.camera.left = -150; key.shadow.camera.right = 150;
  key.shadow.camera.top = 150; key.shadow.camera.bottom = -150;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#dbe6ff', 0.35);
  fill.position.set(-60, 40, -30);
  scene.add(fill);

  /* ───────── Ground + dot grid ───────── */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshStandardMaterial({ color: '#e9eef7', roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const dots = makeDotPlane();
  scene.add(dots);

  /* ───────── PNU Core AXIS curve ───────── */
  const PTS = [
    [-86, 0, 52], [-58, 0, 44], [-30, 0, 24], [-4, 0, 4],
    [22, 0, -16], [50, 0, -36], [84, 0, -62],
  ].map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(PTS, false, 'catmullrom', 0.5);

  // flow tube (faint white) + colored core line (PNU blue → green)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 200, 0.55, 10, false),
    new THREE.MeshStandardMaterial({ color: '#f2f6fc', roughness: .8, metalness: 0 })
  );
  tube.receiveShadow = true; tube.castShadow = true;
  scene.add(tube);

  const linePts = curve.getPoints(240);
  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts.map(p => p.clone().setY(0.45)));
  const cols = [];
  const cA = new THREE.Color('#2563EB'), cB = new THREE.Color('#00A651'), tmp = new THREE.Color();
  for (let i = 0; i < linePts.length; i++) { tmp.copy(cA).lerp(cB, i / (linePts.length - 1)); cols.push(tmp.r, tmp.g, tmp.b); }
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const flowLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .95 }));
  scene.add(flowLine);

  // moving probe
  const probe = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 24),
    new THREE.MeshStandardMaterial({ color: '#00E08A', emissive: '#00A651', emissiveIntensity: .7, roughness: .3 })
  );
  probe.castShadow = true;
  scene.add(probe);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.9, 20, 20),
    new THREE.MeshBasicMaterial({ color: '#7CF3C0', transparent: true, opacity: .22 }));
  probe.add(glow);

  const EDGE = new THREE.LineBasicMaterial({ color: '#c3cde0', transparent: true, opacity: .9 });

  /* ───────── Zones (4 axes) ───────── */
  // anchor = 마커가 떠 있는 월드 좌표(투영용)
  const zones = [
    { key: 'a',  at: [-58, 0, 44], anchor: new THREE.Vector3(-58, 17, 44), build: buildTower },
    { key: 'u',  at: [-22, 0, 16], anchor: new THREE.Vector3(-22, 13, 16), build: buildLab },
    { key: 'r',  at: [ 22, 0, -16],anchor: new THREE.Vector3( 22, 13, -16),build: buildCampus },
    { key: 'a2', at: [ 60, 0, -42],anchor: new THREE.Vector3( 60, 12, -42),build: buildServers },
  ];
  zones.forEach(z => { const g = new THREE.Group(); g.position.set(...z.at); z.build(g); scene.add(g); });

  // scatter low decorative blocks for "campus" density
  scatter(scene, curve);

  /* ───────── Camera keyframes (scroll stops) ───────── */
  const STOPS = [
    { s: 0.00, pos: [-30, 78, 120], tgt: [-40, 0, 30] },  // overview
    { s: 0.24, pos: [-58, 40, 92],  tgt: [-58, 6, 44] },   // A 철학
    { s: 0.48, pos: [-22, 36, 58],  tgt: [-22, 4, 16] },   // U 연구
    { s: 0.72, pos: [ 24, 36, 24],  tgt: [ 24, 4, -16] },  // R 교육
    { s: 1.00, pos: [ 60, 40, -2],  tgt: [ 60, 4, -42] },  // A 행정
  ].map(k => ({ s: k.s, pos: new THREE.Vector3(...k.pos), tgt: new THREE.Vector3(...k.tgt) }));

  /* ───────── DOM overlays ───────── */
  const layerEls = Array.from(document.querySelectorAll('.auh-layer'));
  const hotEls   = Array.from(document.querySelectorAll('.auh-hot'));
  const progFill = document.querySelector('.auh-journey__progress i');
  const progPct  = document.querySelector('.auh-journey__progress b');

  /* ───────── Resize ───────── */
  function resize() {
    const w = section.clientWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ───────── Scroll progress ───────── */
  let prog = 0;
  function readScroll() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    prog = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  const easeP = new THREE.Vector3(), easeT = new THREE.Vector3();
  const tmpV = new THREE.Vector3(), proj = new THREE.Vector3();
  let cur = 0;

  function frame() {
    cur += (prog - cur) * 0.09;               // smooth follow
    const seg = sampleStops(STOPS, cur);
    camera.position.lerpVectors(seg.aPos, seg.bPos, seg.k);
    easeT.lerpVectors(seg.aTgt, seg.bTgt, seg.k);
    camera.lookAt(easeT);

    // probe travels along curve
    const pt = curve.getPointAt(clamp(cur * 0.96 + 0.02, 0, 1));
    probe.position.set(pt.x, 0.7, pt.z);

    // active layer + hotspot projection
    const active = Math.round(cur * 4); // 0..4 (0 = intro)
    layerEls.forEach((el, i) => el.classList.toggle('is-active', i === active));

    hotEls.forEach((el, i) => {
      const z = zones[i];
      const near = Math.abs(cur - STOPS[i + 1].s) < 0.17;
      proj.copy(z.anchor).project(camera);
      const onScreen = proj.z < 1 && proj.x > -1.1 && proj.x < 1.1 && proj.y > -1.1 && proj.y < 1.1;
      if (near && onScreen) {
        const x = (proj.x * 0.5 + 0.5) * section.clientWidth;
        const y = (-proj.y * 0.5 + 0.5) * window.innerHeight;
        el.style.transform = `translate(-50%,-100%) translate(${x}px, ${y}px)`;
        el.classList.add('is-on');
      } else el.classList.remove('is-on');
    });

    if (progFill) progFill.style.transform = `scaleX(${cur})`;
    if (progPct) progPct.textContent = Math.round(cur * 100) + '%';

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ─────────────────────────── helpers ─────────────────────────── */
  function makeDotPlane() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'); x.fillStyle = 'rgba(150,165,195,.55)';
    x.beginPath(); x.arc(32, 32, 3.0, 0, Math.PI * 2); x.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(180, 180);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .5, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.01;
    return m;
  }

  function mat(hex) { return new THREE.MeshStandardMaterial({ color: hex, roughness: .94, metalness: .02, flatShading: true }); }

  function box(group, x, y, z, w, h, d, hex) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat(hex || '#f4f7fc'));
    m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; group.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), EDGE);
    e.position.copy(m.position); group.add(e);
    return m;
  }
  function cyl(group, x, y, z, rt, rb, h, hex) {
    const g = new THREE.CylinderGeometry(rt, rb, h, 18);
    const m = new THREE.Mesh(g, mat(hex || '#eef2fa'));
    m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; group.add(m);
    return m;
  }
  function accentEdge(group, mesh, hex) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: hex }));
    e.position.copy(mesh.position); e.scale.copy(mesh.scale); group.add(e);
  }

  // A · 철학 — AX Core Tower (중심 기둥)
  function buildTower(g) {
    const t = box(g, 0, 0, 0, 7, 26, 7, '#ffffff');
    accentEdge(g, t, '#2563EB');
    box(g, 0, 26, 0, 9, 1.4, 9, '#eaf1ff');
    box(g, 9, 0, 6, 6, 9, 6); box(g, -8, 0, -7, 7, 6, 7);
    box(g, 7, 0, -8, 5, 4, 5); box(g, -9, 0, 7, 5, 5, 5);
    cyl(g, 0, 26, 0, 0.4, 0.4, 6, '#2563EB');
  }
  // U · 연구 — 융합연구원 (랩 + 위성 접시)
  function buildLab(g) {
    const a = box(g, 0, 0, 0, 12, 12, 9, '#ffffff'); accentEdge(g, a, '#0EA5E9');
    box(g, 11, 0, 2, 7, 7, 8); box(g, -9, 0, -3, 6, 9, 6);
    // dish
    cyl(g, -2, 8, 9, 0.4, 0.4, 5, '#dfe7f4');
    const dish = new THREE.Mesh(new THREE.SphereGeometry(3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), mat('#eef3fb'));
    dish.position.set(-2, 12.5, 9); dish.rotation.x = -0.7; dish.castShadow = true; g.add(dish);
    panels(g, 9, -12, 2, 2);
  }
  // R · 교육 — 스마트 강의동 (캠퍼스)
  function buildCampus(g) {
    const a = box(g, 0, 0, 0, 16, 9, 11, '#ffffff'); accentEdge(g, a, '#22B573');
    box(g, 0, 9, 0, 16, 1.2, 11, '#e9f6ef');
    box(g, 13, 0, -4, 7, 13, 7); box(g, -12, 0, 4, 8, 7, 8);
    box(g, -13, 0, -8, 6, 5, 6);
    for (let i = 0; i < 4; i++) cyl(g, -6 + i * 4, 9, 6, 0.5, 0.5, 3.5, '#dfe7f4');
  }
  // A · 행정 — 지능형 서버 단지 (랙 행렬)
  function buildServers(g) {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const m = box(g, -12 + c * 8, 0, -12 + r * 8, 5, 9, 6, '#ffffff');
        // colored vents
        const v = box(g, -12 + c * 8, 0.2, -12 + r * 8 + 3.05, 3.6, 6, 0.15, '#eaf1ff');
        accentEdge(g, v, ((r + c) % 2) ? '#2563EB' : '#00A651');
      }
  }
  function panels(g, ox, oz, nx, nz) {
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const p = box(g, ox + i * 4, 0, oz + j * 4, 3.2, 0.4, 2.4, '#dfe7f4');
      p.rotation.x = -0.32;
    }
  }
  function scatter(scene, curve) {
    const grp = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const tt = i / 26;
      const p = curve.getPointAt(tt);
      const side = (i % 2 ? 1 : -1) * (16 + (i * 7 % 14));
      const ang = Math.atan2(curve.getTangentAt(tt).x, curve.getTangentAt(tt).z) + Math.PI / 2;
      const x = p.x + Math.cos(ang) * side, z = p.z + Math.sin(ang) * side;
      box(grp, x, 0, z, 2 + (i % 3), 1.5 + (i % 4) * 1.6, 2 + (i % 2), '#eef2fa');
    }
    scene.add(grp);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function sampleStops(stops, s) {
    let i = 0; while (i < stops.length - 2 && s > stops[i + 1].s) i++;
    const a = stops[i], b = stops[i + 1];
    const k = easeInOut(clamp((s - a.s) / (b.s - a.s || 1), 0, 1));
    return { aPos: a.pos, bPos: b.pos, aTgt: a.tgt, bTgt: b.tgt, k };
  }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
}

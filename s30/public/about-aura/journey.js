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
  const palette = { blue:'#2563EB', green:'#00A651', greenBright:'#00E08A', cyan:'#0EA5E9', axisGreen:'#22B573', ground:'#e9eef7', building:'#f4f7fc', edge:'#c3cde0', fogLight:'#eaf0f9' };
  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  scene.fog = new THREE.Fog(palette.fogLight, 100, 320);

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
    { key: 'a',  at: [-58, 0, 44],  anchor: new THREE.Vector3(-58, 17, 44) },
    { key: 'u',  at: [-22, 0, 16],  anchor: new THREE.Vector3(-22, 13, 16) },
    { key: 'r',  at: [ 22, 0, -16], anchor: new THREE.Vector3( 22, 13, -16) },
    { key: 'a2', at: [ 60, 0, -42], anchor: new THREE.Vector3( 60, 12, -42) },
  ];

  // scatter low decorative blocks for "campus" density
  scatter(scene, curve);

  // ── FX modules (detail + atmosphere + motion) — added to scene; updated each frame ──
  const fxCtx = { THREE, scene, curve, zones, palette, reducedMotion };
  const fx = [ createGroundFX(fxCtx), createZoneFX(fxCtx), createFlowFX(fxCtx) ];
  fx.forEach(f => f.objects.forEach(o => scene.add(o)));

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

  // pause rendering + animation while the journey is off-screen (battery / perf)
  const clock = new THREE.Clock();
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(section);
  }

  function frame() {
    requestAnimationFrame(frame);
    const delta = clock.getDelta();
    if (!visible) return;                     // skip work when section not in view
    const elapsed = clock.getElapsedTime();
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

    for (let i = 0; i < fx.length; i++) fx[i].update(elapsed, delta, cur);

    renderer.render(scene, camera);
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
  /* ═══════════ FX modules — detail · atmosphere · motion (core three only) ═══════════ */

  // ── Ground & atmosphere: blueprint overlay, axis plot tints, terraced pads, horizon glow ──
  function createGroundFX(ctx){
    const T = ctx.THREE, { scene, curve, zones, palette, reducedMotion } = ctx;
    const objects = [];
    const zoneColor = { a: palette.blue, u: palette.cyan, r: palette.axisGreen, a2: palette.green };

    // 1) Ground overlay: blueprint micro-grid + grain
    const gc = document.createElement('canvas'); gc.width = gc.height = 512;
    const g = gc.getContext('2d');
    g.fillStyle = 'rgba(255,255,255,0)'; g.fillRect(0,0,512,512);
    g.strokeStyle = 'rgba(120,150,210,0.16)'; g.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,512); g.moveTo(0,i); g.lineTo(512,i); g.stroke(); }
    g.strokeStyle = 'rgba(90,125,195,0.10)'; g.lineWidth = 1.6;
    for (let i = 0; i <= 512; i += 128){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,512); g.moveTo(0,i); g.lineTo(512,i); g.stroke(); }
    for (let n = 0; n < 2600; n++){ g.fillStyle = `rgba(80,95,130,${Math.random()*0.03})`; g.fillRect(Math.random()*512, Math.random()*512, 1, 1); }
    const gTex = new T.CanvasTexture(gc); gTex.colorSpace = T.SRGBColorSpace;
    gTex.wrapS = gTex.wrapT = T.RepeatWrapping; gTex.repeat.set(26, 26);
    const overlay = new T.Mesh(new T.PlaneGeometry(1200, 1200),
      new T.MeshBasicMaterial({ map: gTex, transparent: true, opacity: 0.55, depthWrite: false }));
    overlay.rotation.x = -Math.PI / 2; overlay.position.y = 0.006; overlay.renderOrder = 1;
    objects.push(overlay);

    // radial vignette (depth)
    const vc = document.createElement('canvas'); vc.width = vc.height = 256;
    const vg = vc.getContext('2d'), rad = vg.createRadialGradient(128,128,20, 128,128,128);
    rad.addColorStop(0, 'rgba(255,255,255,0.30)'); rad.addColorStop(0.6, 'rgba(255,255,255,0.04)'); rad.addColorStop(1, 'rgba(205,215,235,0.10)');
    vg.fillStyle = rad; vg.fillRect(0,0,256,256);
    const vTex = new T.CanvasTexture(vc); vTex.colorSpace = T.SRGBColorSpace;
    const vign = new T.Mesh(new T.PlaneGeometry(560, 560),
      new T.MeshBasicMaterial({ map: vTex, transparent: true, opacity: 0.7, depthWrite: false }));
    vign.rotation.x = -Math.PI / 2; vign.position.y = 0.008; vign.renderOrder = 2;
    objects.push(vign);

    // 2) Four soft plot tints under each zone
    function roundTintTex(hex){
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      x.fillStyle = hex; const r = 26, w = 128; x.beginPath();
      x.moveTo(r,0); x.arcTo(w,0,w,w,r); x.arcTo(w,w,0,w,r); x.arcTo(0,w,0,0,r); x.arcTo(0,0,w,0,r); x.fill();
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    }
    zones.forEach(z => {
      const tint = new T.Mesh(new T.PlaneGeometry(30, 30),
        new T.MeshBasicMaterial({ map: roundTintTex(zoneColor[z.key] || palette.blue), transparent: true, opacity: 0.08, depthWrite: false }));
      tint.rotation.x = -Math.PI / 2; tint.position.set(z.at[0], 0.012, z.at[2]); tint.renderOrder = 3;
      objects.push(tint);
    });

    // 3) Low terraced pads seating each zone
    const padEdge = new T.LineBasicMaterial({ color: palette.edge, transparent: true, opacity: 0.7 });
    const padMat = () => new T.MeshStandardMaterial({ color: palette.building, roughness: 0.95, metalness: 0.02 });
    zones.forEach(z => {
      [[22, 0.30], [13, 0.58]].forEach(([s, y]) => {
        const geo = new T.BoxGeometry(s, 0.3, s);
        const pad = new T.Mesh(geo, padMat()); pad.position.set(z.at[0], y, z.at[2]); pad.receiveShadow = true; pad.castShadow = true;
        const edge = new T.LineSegments(new T.EdgesGeometry(geo), padEdge); edge.position.copy(pad.position);
        objects.push(pad, edge);
      });
    });

    // 4) Soft additive horizon glow behind the zones
    const hc = document.createElement('canvas'); hc.width = hc.height = 256;
    const hg = hc.getContext('2d'), hr = hg.createRadialGradient(128,128,0, 128,128,128);
    hr.addColorStop(0, 'rgba(255,252,242,1)'); hr.addColorStop(0.4, 'rgba(250,248,240,0.45)'); hr.addColorStop(1, 'rgba(250,248,240,0)');
    hg.fillStyle = hr; hg.fillRect(0,0,256,256);
    const hTex = new T.CanvasTexture(hc); hTex.colorSpace = T.SRGBColorSpace;
    const horizon = new T.Sprite(new T.SpriteMaterial({ map: hTex, blending: T.AdditiveBlending, transparent: true, opacity: 0.12, depthWrite: false, depthTest: true }));
    const far = curve.getPointAt(0.98);
    horizon.position.set(far.x + 10, 46, far.z - 30); horizon.scale.set(150, 52, 1); horizon.renderOrder = 0;
    objects.push(horizon);

    const baseGlow = 0.12;
    return {
      objects,
      update(elapsed, delta, progress){
        if (reducedMotion) return;
        horizon.material.opacity = baseGlow + Math.sin(elapsed * 0.25) * 0.05;
      }
    };
  }

  // ── Zone buildings: window strips + rooftop beacons + idle motion (dish spin / beacon pulse / vent shimmer) ──
  function createZoneFX(ctx){
    const T = ctx.THREE;
    const P = ctx.palette;
    const EDGE = new T.LineBasicMaterial({ color: P.edge, transparent: true, opacity: .9 });

    let _glowTex = null;
    function glowTex(){
      if (_glowTex) return _glowTex;
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(32,32,0, 32,32,32);
      g.addColorStop(0,'rgba(255,255,255,1)');
      g.addColorStop(.35,'rgba(255,255,255,.55)');
      g.addColorStop(1,'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0,0,64,64);
      _glowTex = new T.CanvasTexture(c);
      _glowTex.colorSpace = T.SRGBColorSpace;
      return _glowTex;
    }

    function mat(hex){ return new T.MeshStandardMaterial({ color: hex||P.building, roughness:.94, metalness:.02, flatShading:true }); }
    function box(group,x,y,z,w,h,d,hex){
      const G = new T.BoxGeometry(w,h,d);
      const m = new T.Mesh(G, mat(hex));
      m.position.set(x, y+h/2, z); m.castShadow = m.receiveShadow = true; group.add(m);
      const e = new T.LineSegments(new T.EdgesGeometry(G), EDGE); e.position.copy(m.position); group.add(e);
      return m;
    }
    function cyl(group,x,y,z,rt,rb,h,hex){
      const m = new T.Mesh(new T.CylinderGeometry(rt,rb,h,18), mat(hex||'#eef2fa'));
      m.position.set(x, y+h/2, z); m.castShadow = m.receiveShadow = true; group.add(m); return m;
    }
    function accentEdge(group,mesh,hex){
      const e = new T.LineSegments(new T.EdgesGeometry(mesh.geometry), new T.LineBasicMaterial({ color: hex }));
      e.position.copy(mesh.position); e.scale.copy(mesh.scale); group.add(e);
    }
    function strip(group,x,y,z,w,h,d,hex){
      const m = new T.Mesh(new T.BoxGeometry(w,h,d),
        new T.MeshStandardMaterial({ color:'#ffffff', emissive:hex, emissiveIntensity:.28, roughness:.6, metalness:0 }));
      m.position.set(x,y,z); group.add(m); return m;
    }
    function beacon(group,x,y,z,hex){
      const core = new T.Mesh(new T.SphereGeometry(.28,12,12),
        new T.MeshStandardMaterial({ color:hex, emissive:hex, emissiveIntensity:1.4, roughness:.3 }));
      core.position.set(x,y,z); group.add(core);
      const spr = new T.Sprite(new T.SpriteMaterial({ map:glowTex(), color:hex, transparent:true,
        opacity:.55, blending:T.AdditiveBlending, depthWrite:false }));
      spr.position.set(x,y,z); spr.scale.set(2.6,2.6,1); group.add(spr);
      beacons.push({ core, spr, base:core.material.emissiveIntensity, phase: Math.random()*6.28 });
      return core;
    }

    const beacons = [];
    const vents = [];
    let dish = null;

    // a · 철학 — AX Core Tower
    const ga = new T.Group();
    (function(g,c){
      const t = box(g,0,0,0,7,26,7,'#ffffff'); accentEdge(g,t,c);
      box(g,0,26,0,9,1.4,9,'#eaf1ff');
      box(g,9,0,6,6,9,6); box(g,-8,0,-7,7,6,7); box(g,7,0,-8,5,4,5); box(g,-9,0,7,5,5,5);
      cyl(g,0,26,0,.4,.4,6,c);
      for (let i=0;i<6;i++) strip(g,3.56,4+i*3.4,0,.02,1.8,4.6,c);
      for (let i=0;i<6;i++) strip(g,0,4+i*3.4,3.56,4.6,1.8,.02,c);
      beacon(g,0,29.4,0,c); beacon(g,9,9.4,6,P.cyan);
    })(ga, P.blue);

    // u · 연구 — 융합연구원
    const gu = new T.Group();
    (function(g,c){
      const a = box(g,0,0,0,12,12,9,'#ffffff'); accentEdge(g,a,c);
      box(g,11,0,2,7,7,8); box(g,-9,0,-3,6,9,6);
      for (let i=0;i<3;i++) strip(g,0,3+i*3,4.56,9.2,1.6,.02,c);
      cyl(g,-2,8,9,.4,.4,5,'#dfe7f4');
      dish = new T.Mesh(new T.SphereGeometry(3,18,10,0,Math.PI*2,0,Math.PI/2.4), mat('#eef3fb'));
      dish.position.set(-2,12.5,9); dish.rotation.x=-0.7; dish.castShadow=true; g.add(dish);
      for (let i=0;i<2;i++) for (let j=0;j<2;j++){
        const p = box(g,9+i*4,0,-12+j*4,3.2,.4,2.4,'#dfe7f4'); p.rotation.x=-0.32;
        strip(g,9+i*4,.45,-12+j*4,3.0,.02,2.2,c).rotation.x=-0.32;
      }
      beacon(g,-9,9.4,-3,c); beacon(g,11,7.4,2,P.greenBright);
    })(gu, P.cyan);

    // r · 교육 — 스마트 강의동
    const gr = new T.Group();
    (function(g,c){
      const a = box(g,0,0,0,16,9,11,'#ffffff'); accentEdge(g,a,c);
      box(g,0,9,0,16,1.2,11,'#e9f6ef');
      box(g,13,0,-4,7,13,7); box(g,-12,0,4,8,7,8); box(g,-13,0,-8,6,5,6);
      for (let i=0;i<4;i++) cyl(g,-6+i*4,9,6,.5,.5,3.5,'#dfe7f4');
      for (let i=0;i<5;i++) strip(g,-6+i*3,4.5,5.56,2.2,3.2,.02,c);
      beacon(g,13,13.4,-4,c); beacon(g,-12,7.4,4,P.greenBright);
    })(gr, P.axisGreen);

    // a2 · 행정 — 지능형 서버 단지
    const ga2 = new T.Group();
    (function(g){
      for (let r=0;r<4;r++) for (let cc=0;cc<4;cc++){
        const x=-12+cc*8, z=-12+r*8;
        box(g,x,0,z,5,9,6,'#ffffff');
        const accent = ((r+cc)%2)? P.blue : P.green;
        const v = new T.Mesh(new T.BoxGeometry(3.6,6,.18),
          new T.MeshStandardMaterial({ color:'#ffffff', emissive:accent, emissiveIntensity:.35, roughness:.55 }));
        v.position.set(x,3.2,z+3.06); g.add(v);
        vents.push({ mesh:v, base:.35, phase:(r*4+cc)*0.7 });
        const e = new T.LineSegments(new T.EdgesGeometry(v.geometry), new T.LineBasicMaterial({ color:accent }));
        e.position.copy(v.position); g.add(e);
      }
      beacon(g,-12,9.4,-12,P.blue); beacon(g,12,9.4,12,P.green);
    })(ga2);

    const groups = [ga,gu,gr,ga2];
    ctx.zones.forEach((z,i)=> groups[i].position.set(...z.at));

    return {
      objects: groups,
      update(elapsed, delta, progress){
        if (ctx.reducedMotion) return;
        if (dish) dish.rotation.z = elapsed * 0.25;
        for (const b of beacons){
          const s = 0.5 + 0.5*Math.sin(elapsed*1.6 + b.phase);
          b.core.material.emissiveIntensity = b.base * (0.6 + 0.55*s);
          b.spr.material.opacity = 0.35 + 0.30*s;
          const sc = 2.4 + 0.5*s; b.spr.scale.set(sc,sc,1);
        }
        for (const v of vents)
          v.mesh.material.emissiveIntensity = v.base * (0.7 + 0.4*Math.sin(elapsed*2.2 + v.phase));
      }
    };
  }

  // ── Flow particles riding the AXIS curve (blue → green) ──
  function createFlowFX(ctx){
    const T = ctx.THREE;
    const { curve, palette, reducedMotion } = ctx;

    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c2 = cv.getContext('2d');
    const grd = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0.0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.65)');
    grd.addColorStop(1.0, 'rgba(255,255,255,0)');
    c2.fillStyle = grd; c2.fillRect(0, 0, 64, 64);
    const sprite = new T.CanvasTexture(cv); sprite.colorSpace = T.SRGBColorSpace;

    const N = 70, Y_BASE = 0.6, SPEED = 0.06;
    const cBlue = new T.Color(palette.blue), cGreen = new T.Color(palette.greenBright);
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const t0 = new Float32Array(N), jit = new Float32Array(N * 3);
    const _c = new T.Color(), _p = new T.Vector3();
    for (let i = 0; i < N; i++){
      const t = i / N; t0[i] = t;
      jit[i*3] = (Math.random() - 0.5) * 0.5; jit[i*3+1] = (Math.random() - 0.5) * 0.18; jit[i*3+2] = Math.random() * Math.PI * 2;
      _c.copy(cBlue).lerp(cGreen, t); col[i*3] = _c.r; col[i*3+1] = _c.g; col[i*3+2] = _c.b;
      curve.getPointAt(t, _p); pos[i*3] = _p.x + jit[i*3]; pos[i*3+1] = Y_BASE + jit[i*3+1]; pos[i*3+2] = _p.z;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const points = new T.Points(geo, new T.PointsMaterial({
      map: sprite, vertexColors: true, transparent: true, blending: T.AdditiveBlending,
      depthWrite: false, sizeAttenuation: true, size: 0.9, opacity: 0.9
    }));
    points.renderOrder = 3;

    return { objects: [ points ], update(elapsed, delta, progress){
      if (reducedMotion) return;
      const posArr = geo.attributes.position.array;
      for (let i = 0; i < N; i++){
        let t = t0[i] + SPEED * (delta || 0); t -= Math.floor(t); t0[i] = t;
        curve.getPointAt(t, _p);
        _c.copy(cBlue).lerp(cGreen, t); col[i*3] = _c.r; col[i*3+1] = _c.g; col[i*3+2] = _c.b;
        posArr[i*3] = _p.x + jit[i*3];
        posArr[i*3+1] = Y_BASE + jit[i*3+1] + Math.sin(elapsed * 1.6 + jit[i*3+2]) * 0.08;
        posArr[i*3+2] = _p.z;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    } };
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

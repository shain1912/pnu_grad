/**
 * PNU AX AURA — buildings.js
 * Places the 4 strategic "zone" structures along the glowing S-curve track.
 *
 * Module contract:
 *   createBuildings(scene, curve) => { zones, update }
 *     - curve: THREE.CatmullRomCurve3 (S-shaped, in/near the XZ plane)
 *     - zones: array of 4 { name, t, group, position }
 *     - update: function(elapsed, t) — called every frame for animations
 *
 * Each zone is a distinct procedural structure built from THREE primitives,
 * with emissive accents in a dark-futuristic palette.
 */
import * as THREE from 'three';

/* ---------- Shared palette ---------- */
const PALETTE = {
  cyan: 0x2563eb,   /* vivid blue glow — reads on light bg   */
  violet: 0x00a651, /* PNU green glow                        */
  amber: 0x0075c9,  /* PNU blue-sub (3rd accent)             */
  steel: 0x2b4c8a,  /* medium-dark blue structure (visible)  */
  panel: 0x1e3a6e,  /* darker blue panel                     */
  dark: 0x14294f,   /* deepest structural blue               */
};

/* ---------- Material helpers ---------- */

/** Solid structural material — dark, slightly metallic. */
function structMat(color = PALETTE.steel) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.65,
    roughness: 0.45,
  });
}

/** Emissive accent material — glows in the chosen color. */
function glowMat(color, intensity = 1.6) {
  return new THREE.MeshStandardMaterial({
    color: 0x14294f,
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.2,
    roughness: 0.35,
  });
}

/* =========================================================================
 *  ZONE BUILDERS — each returns a THREE.Group with animatable bits in
 *  group.userData. The structures are built centered on the origin and are
 *  positioned/oriented by createBuildings().
 * ========================================================================= */

/* ---- Zone 1: AX Core Tower (t = 0.12) ---------------------------------- */
function buildCoreTower() {
  const group = new THREE.Group();

  // Wide base plinth
  const base = new THREE.Mesh(new THREE.BoxGeometry(16, 3, 16), structMat(PALETTE.panel));
  base.position.y = 1.5;
  group.add(base);

  // Stacked, tapering box sections rising high
  const sections = [
    { w: 11, h: 18, y: 12 },
    { w: 8.5, h: 16, y: 28.5 },
    { w: 6, h: 14, y: 43.5 },
  ];
  sections.forEach((s, i) => {
    const seg = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.w), structMat(PALETTE.steel));
    seg.position.y = s.y;
    group.add(seg);

    // Glowing cyan ring/seam between sections
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(s.w * 0.62, 0.35, 8, 24),
      glowMat(i % 2 === 0 ? PALETTE.cyan : PALETTE.violet, 1.8)
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = s.y + s.h / 2;
    group.add(ring);
  });

  // Central spire/cylinder
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2.2, 12, 12),
    structMat(PALETTE.panel)
  );
  spire.position.y = 56;
  group.add(spire);

  // Glowing crown/beacon on top (pulses in update)
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 24, 24),
    glowMat(PALETTE.amber, 2.2)
  );
  beacon.position.y = 63;
  group.add(beacon);

  const beaconLight = new THREE.PointLight(PALETTE.amber, 3, 80, 2);
  beaconLight.position.y = 63;
  group.add(beaconLight);

  group.userData = { type: 'tower', beacon, beaconLight };
  return group;
}

/* ---- Zone 2: Jang Yeong-sil AI Research Hub (t = 0.38) ----------------- */
function buildResearchHub() {
  const group = new THREE.Group();

  // Cylindrical drum base
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(14, 16, 8, 32),
    structMat(PALETTE.panel)
  );
  drum.position.y = 4;
  group.add(drum);

  // Glowing seam around the drum
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(14.2, 0.4, 8, 48),
    glowMat(PALETTE.cyan, 1.6)
  );
  seam.rotation.x = Math.PI / 2;
  seam.position.y = 7.5;
  group.add(seam);

  // Hemispherical dome on top
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: PALETTE.steel,
      metalness: 0.5,
      roughness: 0.3,
      emissive: PALETTE.violet,
      emissiveIntensity: 0.25,
    })
  );
  dome.position.y = 8;
  group.add(dome);

  // 3 rotating radar dish assemblies mounted around the dome
  const radars = [];
  const radarColors = [PALETTE.cyan, PALETTE.violet, PALETTE.amber];
  for (let i = 0; i < 3; i++) {
    const radar = new THREE.Group();
    const ang = (i / 3) * Math.PI * 2;
    const r = 9;
    radar.position.set(Math.cos(ang) * r, 12 + i * 2.5, Math.sin(ang) * r);

    // Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 5, 8),
      structMat(PALETTE.steel)
    );
    mast.position.y = 2.5;
    radar.add(mast);

    // Spinning head: a cone "dish" + supporting torus + emitter cylinder
    const head = new THREE.Group();
    head.position.y = 5;

    const dish = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 2.4, 24, 1, true),
      new THREE.MeshStandardMaterial({
        color: PALETTE.panel,
        metalness: 0.6,
        roughness: 0.4,
        side: THREE.DoubleSide,
        emissive: radarColors[i],
        emissiveIntensity: 0.4,
      })
    );
    dish.rotation.z = Math.PI / 2; // point sideways
    head.add(dish);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.18, 8, 24),
      glowMat(radarColors[i], 1.8)
    );
    rim.rotation.y = Math.PI / 2;
    rim.position.x = 1.1;
    head.add(rim);

    const emitter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 3.4, 8),
      glowMat(radarColors[i], 2.0)
    );
    emitter.rotation.z = Math.PI / 2;
    head.add(emitter);

    radar.add(head);
    group.add(radar);
    // store the head (spins about its mast) + a per-radar speed
    radars.push({ head, speed: 0.6 + i * 0.35 });
  }

  group.userData = { type: 'hub', radars };
  return group;
}

/* ---- Zone 3: AI Smart Lecture Hall (t = 0.62) -------------------------- */
function buildLectureHall() {
  const group = new THREE.Group();

  // Wide, flattened hall body
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(34, 9, 22),
    structMat(PALETTE.panel)
  );
  hall.position.y = 4.5;
  group.add(hall);

  // Curved glowing roof strip
  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 11, 34, 24, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({
      color: PALETTE.steel,
      metalness: 0.5,
      roughness: 0.35,
      side: THREE.DoubleSide,
      emissive: PALETTE.cyan,
      emissiveIntensity: 0.3,
    })
  );
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 9;
  group.add(roof);

  // Glowing entry band along the front
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(34.4, 1.2, 0.6),
    glowMat(PALETTE.amber, 1.8)
  );
  band.position.set(0, 2.5, 11.1);
  group.add(band);

  // Floating data blocks orbiting/bobbing around the hall
  const blockColors = [PALETTE.cyan, PALETTE.violet, PALETTE.amber];
  const blocks = [];
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++) {
    const size = 0.9 + Math.random() * 1.4;
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      glowMat(blockColors[i % blockColors.length], 1.7)
    );
    // orbit parameters
    const baseAngle = (i / COUNT) * Math.PI * 2;
    const radius = 20 + Math.random() * 8;
    const baseY = 6 + Math.random() * 12;
    cube.position.set(Math.cos(baseAngle) * radius, baseY, Math.sin(baseAngle) * radius);
    group.add(cube);
    blocks.push({
      mesh: cube,
      baseAngle,
      radius,
      baseY,
      bobAmp: 1.2 + Math.random() * 2.2,
      bobSpeed: 0.6 + Math.random() * 1.1,
      orbitSpeed: 0.12 + Math.random() * 0.18,
      spin: 0.4 + Math.random() * 0.8,
    });
  }

  group.userData = { type: 'hall', blocks };
  return group;
}

/* ---- Zone 4: Intelligent Server Complex / Sanjini AI (t = 0.88) -------- */
function buildServerComplex() {
  const group = new THREE.Group();

  // Foundation slab
  const slab = new THREE.Mesh(new THREE.BoxGeometry(34, 2, 24), structMat(PALETTE.dark));
  slab.position.y = 1;
  group.add(slab);

  // Rows of server-rack boxes, each studded with blinking LEDs
  const leds = []; // { mesh, color, phase, speed }
  const ledColors = [PALETTE.cyan, PALETTE.violet, PALETTE.amber];
  const ROWS = 3;
  const RACKS = 4;
  const rackW = 6;
  const rackH = 14;
  const rackD = 4;
  const gapX = 1.5;
  const gapZ = 5;

  const rowSpanZ = (ROWS - 1) * (rackD + gapZ);
  const colSpanX = (RACKS - 1) * (rackW + gapX);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < RACKS; col++) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(rackW, rackH, rackD),
        structMat(PALETTE.panel)
      );
      const x = col * (rackW + gapX) - colSpanX / 2;
      const z = row * (rackD + gapZ) - rowSpanZ / 2;
      rack.position.set(x, 2 + rackH / 2, z);
      group.add(rack);

      // LED grid on the front face (facing +Z) of each rack
      const cols = 4;
      const rows = 6;
      for (let ly = 0; ly < rows; ly++) {
        for (let lx = 0; lx < cols; lx++) {
          const color = ledColors[(lx + ly + row + col) % ledColors.length];
          const led = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.45, 0.2),
            glowMat(color, 1.5)
          );
          const px = x + (lx - (cols - 1) / 2) * 1.1;
          const py = 2 + 2 + ly * 1.7;
          const pz = z + rackD / 2 + 0.12;
          led.position.set(px, py, pz);
          group.add(led);
          leds.push({
            mesh: led,
            base: 0.6 + Math.random() * 0.6,
            amp: 1.4 + Math.random() * 1.6,
            phase: Math.random() * Math.PI * 2,
            speed: 2.5 + Math.random() * 6.0,
          });
        }
      }
    }
  }

  // Glowing cooling pipes (torus accents) on top
  for (let i = 0; i < 2; i++) {
    const pipe = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.4, 8, 32),
      glowMat(PALETTE.cyan, 1.4)
    );
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(0, 17 + i * 1.2, (i - 0.5) * 6);
    group.add(pipe);
  }

  group.userData = { type: 'server', leds };
  return group;
}

/* =========================================================================
 *  Placement + assembly
 * ========================================================================= */

const ZONE_DEFS = [
  { name: 'AX Core Tower', t: 0.12, side: +1, build: buildCoreTower },
  { name: 'Jang Yeong-sil AI Research Hub', t: 0.38, side: -1, build: buildResearchHub },
  { name: 'AI Smart Lecture Hall', t: 0.62, side: +1, build: buildLectureHall },
  { name: 'Intelligent Server Complex (Sanjini AI)', t: 0.88, side: -1, build: buildServerComplex },
];

const OFFSET = 26; // lateral distance off the track (within 22–30 units)

export function createBuildings(scene, curve) {
  const zones = [];

  for (const def of ZONE_DEFS) {
    // Point on the curve at this normalized position
    const pos = curve.getPointAt(def.t);

    // Horizontal perpendicular to the tangent (in the XZ plane)
    const tangent = curve.getTangentAt(def.t);
    const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Offset laterally off the track, alternating sides per zone
    const placement = pos.clone().add(perp.multiplyScalar(OFFSET * def.side));
    placement.y = 0; // keep grounded

    // Build the procedural structure and place it
    const group = def.build();
    group.position.copy(placement);

    // Orient the structure to face back toward the track (look at curve point)
    const lookTarget = new THREE.Vector3(pos.x, placement.y, pos.z);
    group.lookAt(lookTarget);

    scene.add(group);

    zones.push({
      name: def.name,
      t: def.t,
      group,
      position: placement.clone(),
    });
  }

  /**
   * Per-frame animation. Called as update(elapsed, t).
   * Iterates each zone and animates it according to its userData.type.
   */
  function update(elapsed /*, t */) {
    for (const zone of zones) {
      const data = zone.group.userData;
      switch (data.type) {
        case 'tower': {
          // Pulsing beacon
          const pulse = 1.6 + Math.sin(elapsed * 3.0) * 1.1;
          data.beacon.material.emissiveIntensity = Math.max(0.4, pulse);
          data.beacon.scale.setScalar(1 + Math.sin(elapsed * 3.0) * 0.12);
          if (data.beaconLight) data.beaconLight.intensity = 2 + pulse;
          break;
        }
        case 'hub': {
          // Continuously rotating radar heads
          for (const r of data.radars) {
            r.head.rotation.y = elapsed * r.speed;
          }
          break;
        }
        case 'hall': {
          // Orbiting + bobbing floating data blocks
          for (const b of data.blocks) {
            const angle = b.baseAngle + elapsed * b.orbitSpeed;
            b.mesh.position.x = Math.cos(angle) * b.radius;
            b.mesh.position.z = Math.sin(angle) * b.radius;
            b.mesh.position.y = b.baseY + Math.sin(elapsed * b.bobSpeed + b.baseAngle) * b.bobAmp;
            b.mesh.rotation.x = elapsed * b.spin;
            b.mesh.rotation.y = elapsed * b.spin * 0.7;
          }
          break;
        }
        case 'server': {
          // Blinking / flickering LEDs
          for (const l of data.leds) {
            const flick = l.base + Math.abs(Math.sin(elapsed * l.speed + l.phase)) * l.amp;
            l.mesh.material.emissiveIntensity = flick;
          }
          break;
        }
      }
    }
  }

  return { zones, update };
}

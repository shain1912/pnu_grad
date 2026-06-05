import * as THREE from 'three';

/**
 * AX Probe — a glowing gyroscopic energy-node that travels along the PNU Core
 * AXIS track, mapped to scroll progress. A bright white-hot core sits inside a
 * set of spinning gyroscope rings, wrapped in a soft additive halo, with a
 * point light parented to it so it lights up structures as it passes.
 *
 * Module contract:
 *   import * as THREE from 'three';
 *   export function createProbe(scene) {
 *     return {
 *       mesh,                 // THREE.Group of the probe
 *       update(t, curve) {}   // called every frame; positions / orients probe
 *     };
 *   }
 *
 * Note: update() receives only (t, curve) — NOT elapsed time — so all
 * continuous animation (ring spin, pulse, bob) is driven by an internal frame
 * counter incremented every call.
 *
 * @param {THREE.Scene} scene  scene the probe group is added to
 * @returns {{ mesh: THREE.Group, update: (t: number, curve: THREE.Curve) => void }}
 */
export function createProbe(scene) {
  // -------------------------------------------------------------------------
  // Palette (dark futuristic, matches the track)
  // -------------------------------------------------------------------------
  const CYAN = 0x39e0ff;
  const VIOLET = 0x7b5cff;
  const WHITE_HOT = 0xeaffff;

  // -------------------------------------------------------------------------
  // Root group. Everything below is parented here, so positioning / orienting
  // the group moves the whole probe assembly (rings, core, halo, light).
  // -------------------------------------------------------------------------
  const mesh = new THREE.Group();
  mesh.name = 'AXProbe';

  // Inner pivot that holds the gyro rings, so we can spin/scale them without
  // disturbing the group's travel orientation (lookAt) on the outer group.
  const gyro = new THREE.Group();
  gyro.name = 'AXProbeGyro';
  mesh.add(gyro);

  // -------------------------------------------------------------------------
  // 1. Central glowing core — bright emissive white-hot sphere.
  // -------------------------------------------------------------------------
  const coreGeometry = new THREE.SphereGeometry(1.0, 24, 24);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: WHITE_HOT,
    emissive: CYAN,
    emissiveIntensity: 3.0,
    roughness: 0.15,
    metalness: 0.0,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.name = 'core';
  mesh.add(core);

  // -------------------------------------------------------------------------
  // 2. Gyroscopic rings — three torii at different orientations. Stored so
  //    update() can spin each on a different axis every frame.
  // -------------------------------------------------------------------------
  const ringMakeup = [
    { color: CYAN,   radius: 2.0, tube: 0.10, euler: [0, 0, 0] },
    { color: VIOLET, radius: 2.4, tube: 0.09, euler: [Math.PI / 2, 0, 0] },
    { color: CYAN,   radius: 2.8, tube: 0.08, euler: [Math.PI / 3, Math.PI / 4, 0] },
  ];

  const rings = ringMakeup.map((cfg) => {
    const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 12, 64);
    const matl = new THREE.MeshStandardMaterial({
      color: WHITE_HOT,
      emissive: cfg.color,
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.0,
    });
    const ring = new THREE.Mesh(geo, matl);
    // Base orientation so the rings sit on different planes.
    ring.rotation.set(cfg.euler[0], cfg.euler[1], cfg.euler[2]);
    gyro.add(ring);
    return ring;
  });

  // -------------------------------------------------------------------------
  // 3. Soft additive halo — a larger translucent sphere faking bloom around
  //    the core.
  // -------------------------------------------------------------------------
  const haloGeometry = new THREE.SphereGeometry(1.0, 24, 24);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.name = 'halo';
  halo.scale.setScalar(2.4);
  mesh.add(halo);

  // -------------------------------------------------------------------------
  // 4. Point light parented to the probe so it illuminates the track / grid
  //    as it moves. Cyan, moderate intensity, distance falloff.
  // -------------------------------------------------------------------------
  const light = new THREE.PointLight(CYAN, 60, 60, 2.0); // color, intensity, distance, decay
  light.name = 'probeLight';
  mesh.add(light);

  // -------------------------------------------------------------------------
  // Internal animation state. update() gets no time, so we count frames.
  // -------------------------------------------------------------------------
  let frame = 0;

  // Scratch vectors reused each frame (avoid per-frame allocation).
  const _pos = new THREE.Vector3();
  const _tangent = new THREE.Vector3();
  const _lookTarget = new THREE.Vector3();

  /**
   * Per-frame update.
   * @param {number} t              progress along the curve, expected [0,1]
   * @param {THREE.Curve} curve     curve exposing getPointAt / getTangentAt
   */
  function update(t, curve) {
    frame++;

    // --- Travel along the curve -------------------------------------------
    if (curve) {
      const tc = Math.min(1, Math.max(0, t)); // clamp to [0,1]

      // Position at the (arc-length) point on the curve.
      curve.getPointAt(tc, _pos);

      // Gentle vertical bob for life (independent of t).
      const bob = Math.sin(frame * 0.03) * 0.6;
      mesh.position.set(_pos.x, _pos.y + bob, _pos.z);

      // Orient along the direction of travel. Guard against a zero-length
      // tangent (degenerate point) before using it as a look direction.
      curve.getTangentAt(tc, _tangent);
      if (_tangent.lengthSq() > 1e-8) {
        _tangent.normalize();
        _lookTarget.copy(mesh.position).add(_tangent);
        mesh.lookAt(_lookTarget);
      }
    }

    // --- Continuous gyroscope spin (independent of t) ---------------------
    // Each ring spins on a different axis with a fixed per-frame increment.
    if (rings[0]) rings[0].rotation.z += 0.030;
    if (rings[1]) rings[1].rotation.y += 0.022;
    if (rings[2]) rings[2].rotation.x += 0.026;

    // Slow overall tumble of the gyro cluster for extra liveliness.
    gyro.rotation.y += 0.006;

    // --- Pulsing core + halo ----------------------------------------------
    const pulse = 1.0 + Math.sin(frame * 0.08) * 0.12;
    core.scale.setScalar(pulse);
    halo.scale.setScalar(2.4 * pulse);

    // Subtle emissive / light flicker tied to the same pulse.
    coreMaterial.emissiveIntensity = 3.0 + Math.sin(frame * 0.08) * 0.6;
    light.intensity = 60 + Math.sin(frame * 0.08) * 12;
  }

  // -------------------------------------------------------------------------
  // Add to scene and return the contract object.
  // -------------------------------------------------------------------------
  scene.add(mesh);

  return { mesh, update };
}

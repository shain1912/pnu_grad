import * as THREE from 'three';

/**
 * PNU Core AXIS — a glowing S-curved spline track snaking across the dark
 * campus grid. Builds a CatmullRomCurve3 (the logical path that probes travel
 * along) plus all the glowing visual meshes (core tube, halo tube, parallel
 * rail, waypoint nodes) grouped together and added to the scene.
 *
 * Module contract:
 *   import * as THREE from 'three';
 *   export function createTrack(scene) { ... return { curve, group }; }
 *
 * @param {THREE.Scene} scene  scene to which the track group is added
 * @returns {{ curve: THREE.CatmullRomCurve3, group: THREE.Group }}
 */
export function createTrack(scene) {
  // -------------------------------------------------------------------------
  // Palette (dark futuristic)
  // -------------------------------------------------------------------------
  const CYAN = 0x7ec8ff;
  const VIOLET = 0x00e08a;
  const WHITE_HOT = 0xeaffff;

  // -------------------------------------------------------------------------
  // 1. The spline curve — a clear double-bend "S".
  //    Lies in / near the XZ plane (y kept small), spans roughly
  //    X ∈ [-70, 70] and Z ∈ [-130, 130] so a probe travels forward/back.
  //    7 control points produce two opposing bends -> an S shape.
  // -------------------------------------------------------------------------
  const controlPoints = [
    new THREE.Vector3(  0, 1.5, -130), // far entry
    new THREE.Vector3( 55, 3.5,  -90), // bend out to +X
    new THREE.Vector3( 60, 4.5,  -35), // top of first curve
    new THREE.Vector3(  0, 0.5,    0), // cross through the origin (center)
    new THREE.Vector3(-60, 4.5,   35), // top of second curve (opposite side)
    new THREE.Vector3(-55, 3.5,   90), // bend back toward center
    new THREE.Vector3(  0, 1.5,  130), // near exit
  ];

  const curve = new THREE.CatmullRomCurve3(controlPoints);
  curve.closed = false;
  curve.curveType = 'catmullrom';
  curve.tension = 0.5;
  // Higher division count -> smooth, uniform-speed travel via getPointAt /
  // getTangentAt (arc-length parameterized sampling).
  curve.arcLengthDivisions = 600;

  // -------------------------------------------------------------------------
  // 2. Group that holds every visual mesh for the track.
  // -------------------------------------------------------------------------
  const group = new THREE.Group();
  group.name = 'PNUCoreAxisTrack';

  // -------------------------------------------------------------------------
  // 3. Core tube — bright white-hot center, the solid glowing line.
  // -------------------------------------------------------------------------
  const coreRadius = 0.6;
  const coreGeometry = new THREE.TubeGeometry(curve, 600, coreRadius, 8, false);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: WHITE_HOT,
    emissive: CYAN,
    emissiveIntensity: 2.2,
    roughness: 0.25,
    metalness: 0.0,
  });
  const coreTube = new THREE.Mesh(coreGeometry, coreMaterial);
  coreTube.name = 'coreTube';
  group.add(coreTube);

  // -------------------------------------------------------------------------
  // 4. Halo tube — a larger, additive, translucent cyan glow wrapped around
  //    the core to fake bloom / luminous falloff.
  // -------------------------------------------------------------------------
  const haloGeometry = new THREE.TubeGeometry(curve, 600, coreRadius * 2.6, 8, false);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide, // render the inside so the core stays visible through it
  });
  const haloTube = new THREE.Mesh(haloGeometry, haloMaterial);
  haloTube.name = 'haloTube';
  group.add(haloTube);

  // -------------------------------------------------------------------------
  // 5. Parallel "rail" — a second, laterally offset violet tube to give the
  //    track a double-line look. We build a sibling curve by sampling the
  //    main curve and pushing each point sideways along the horizontal
  //    normal (perpendicular to the tangent, in the XZ plane).
  // -------------------------------------------------------------------------
  const RAIL_OFFSET = 2.4; // lateral spacing between the two lines
  const railSamples = 200;
  const railPoints = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= railSamples; i++) {
    const t = i / railSamples;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    // Horizontal side vector = tangent × up  (perpendicular, stays ~flat).
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    railPoints.push(p.clone().addScaledVector(side, RAIL_OFFSET));
  }
  const railCurve = new THREE.CatmullRomCurve3(railPoints);
  railCurve.closed = false;
  railCurve.arcLengthDivisions = 600;

  const railGeometry = new THREE.TubeGeometry(railCurve, 600, coreRadius * 0.75, 8, false);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: WHITE_HOT,
    emissive: VIOLET,
    emissiveIntensity: 1.8,
    roughness: 0.3,
    metalness: 0.0,
  });
  const railTube = new THREE.Mesh(railGeometry, railMaterial);
  railTube.name = 'railTube';
  group.add(railTube);

  // Matching violet halo for the rail.
  const railHaloGeometry = new THREE.TubeGeometry(railCurve, 600, coreRadius * 2.0, 8, false);
  const railHaloMaterial = new THREE.MeshBasicMaterial({
    color: VIOLET,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const railHaloTube = new THREE.Mesh(railHaloGeometry, railHaloMaterial);
  railHaloTube.name = 'railHaloTube';
  group.add(railHaloTube);

  // -------------------------------------------------------------------------
  // 6. Waypoint nodes — small glowing spheres at several t values, reading
  //    as markers along the route. Alternate cyan / violet.
  // -------------------------------------------------------------------------
  const nodeGroup = new THREE.Group();
  nodeGroup.name = 'waypointNodes';
  const nodeTs = [0.0, 0.16, 0.33, 0.5, 0.66, 0.83, 1.0];
  const nodeSphere = new THREE.SphereGeometry(1.1, 16, 16);

  nodeTs.forEach((t, i) => {
    const pos = curve.getPointAt(t);
    const nodeColor = i % 2 === 0 ? CYAN : VIOLET;

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: WHITE_HOT,
      emissive: nodeColor,
      emissiveIntensity: 2.6,
      roughness: 0.2,
      metalness: 0.0,
    });
    const node = new THREE.Mesh(nodeSphere, nodeMaterial);
    node.position.copy(pos);
    nodeGroup.add(node);

    // Additive glow shell around each node.
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: nodeColor,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(nodeSphere, glowMaterial);
    glow.position.copy(pos);
    glow.scale.setScalar(2.2);
    nodeGroup.add(glow);
  });

  group.add(nodeGroup);

  // -------------------------------------------------------------------------
  // 7. Add to scene and hand back the contract object.
  // -------------------------------------------------------------------------
  scene.add(group);

  return { curve, group };
}

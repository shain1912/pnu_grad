import * as THREE from 'three';

/**
 * AX Probe FOLLOW CAMERA — a cinematic, gaming-style third-person chase cam.
 *
 * Every frame we sample the probe's point on the S-curve, drop the camera
 * BEHIND it (along the reverse tangent) and slightly ABOVE it, then aim it at
 * a point a little further down the track. Position and look-at are both
 * smoothed (lerped) so the camera glides instead of snapping, and a subtle
 * elapsed-driven sway / bank / FOV breathing keeps each section feeling alive
 * without inducing motion sickness.
 *
 * Module contract:
 *   import * as THREE from 'three';
 *   export function updateFollowCamera(camera, curve, t, elapsed) { ... }
 *
 * @param {THREE.PerspectiveCamera} camera  the camera to drive
 * @param {THREE.CatmullRomCurve3}  curve   S-shaped path (getPointAt/getTangentAt)
 * @param {number} t        normalized scroll progress in [0, 1]
 * @param {number} elapsed  seconds since start (used for idle sway)
 */

// -----------------------------------------------------------------------------
// Tunable feel constants
// -----------------------------------------------------------------------------
const FOLLOW_DISTANCE = 22; // how far BEHIND the probe (along -tangent)
const HEIGHT = 13;          // how far ABOVE the probe
const LOOK_AHEAD_T = 0.03;  // how far ahead (in curve t) the camera looks
const POS_LERP = 0.08;      // position smoothing factor (lower = smoother/laggier)
const LOOK_LERP = 0.1;      // look-target smoothing factor

// Cinematic flourish amplitudes (kept small to avoid nausea)
const SWAY_LATERAL = 1.2;   // sideways drift in world units
const SWAY_HEIGHT = 0.8;    // vertical bob in world units
const ROLL_AMOUNT = 0.03;   // camera.up roll in radians (~1.7°)
const FOV_BASE = null;      // resolved lazily from the camera on first frame
const FOV_BREATH = 0.6;     // half-range of FOV breathing in degrees

// -----------------------------------------------------------------------------
// Module-level reusable temporaries (allocation-light: no per-frame `new`)
// -----------------------------------------------------------------------------
const _pos = new THREE.Vector3();          // probe position on curve
const _tangent = new THREE.Vector3();      // normalized forward tangent
const _side = new THREE.Vector3();         // horizontal perpendicular (chase lateral)
const _worldUp = new THREE.Vector3(0, 1, 0);
const _targetPos = new THREE.Vector3();    // desired camera position this frame
const _lookTarget = new THREE.Vector3();   // desired aim point this frame
const _up = new THREE.Vector3(0, 1, 0);    // working up vector (gets rolled)

// Smoothed look-at state retained across frames so the aim glides too.
const _smoothedLook = new THREE.Vector3();
let _initialized = false;
let _baseFov = 0; // captured from the camera the first time we run

/** clamp helper */
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function updateFollowCamera(camera, curve, t, elapsed) {
  const tClamped = clamp01(t);

  // ---------------------------------------------------------------------------
  // 1. Sample the probe's position and forward direction on the curve.
  // ---------------------------------------------------------------------------
  curve.getPointAt(tClamped, _pos);
  curve.getTangentAt(tClamped, _tangent);

  // Guard against a degenerate (zero-length) tangent before normalizing.
  if (_tangent.lengthSq() < 1e-8) {
    _tangent.set(0, 0, 1); // sane forward fallback
  } else {
    _tangent.normalize();
  }

  // Horizontal side vector (perpendicular to forward, stays ~level): t × up.
  _side.crossVectors(_tangent, _worldUp);
  if (_side.lengthSq() < 1e-8) {
    _side.set(1, 0, 0); // fallback if tangent is vertical
  } else {
    _side.normalize();
  }

  // ---------------------------------------------------------------------------
  // 2. Cinematic sway — gentle, slow sinusoids tied to elapsed time. We use
  //    different frequencies so the motion never feels mechanically periodic.
  // ---------------------------------------------------------------------------
  const lateralSway = Math.sin(elapsed * 0.45) * SWAY_LATERAL;
  const heightSway = Math.sin(elapsed * 0.6 + 1.3) * SWAY_HEIGHT;

  // ---------------------------------------------------------------------------
  // 3. Build the desired camera position: BEHIND the probe (-tangent),
  //    ABOVE it (+up), plus the subtle lateral/height sway.
  // ---------------------------------------------------------------------------
  _targetPos.copy(_pos);
  _targetPos.addScaledVector(_tangent, -FOLLOW_DISTANCE);          // behind
  _targetPos.addScaledVector(_worldUp, HEIGHT + heightSway);        // above + bob
  _targetPos.addScaledVector(_side, lateralSway);                  // gentle drift

  // ---------------------------------------------------------------------------
  // 4. Build the desired look target: slightly AHEAD along the track so the
  //    camera leans into upcoming curves.
  // ---------------------------------------------------------------------------
  curve.getPointAt(clamp01(tClamped + LOOK_AHEAD_T), _lookTarget);

  // ---------------------------------------------------------------------------
  // 5. First-frame initialization — snap state into place so we don't lerp
  //    from the origin on frame one. Capture the base FOV for breathing.
  // ---------------------------------------------------------------------------
  if (!_initialized) {
    camera.position.copy(_targetPos);
    _smoothedLook.copy(_lookTarget);
    _baseFov = camera.fov;
    _initialized = true;
  }

  // ---------------------------------------------------------------------------
  // 6. SMOOTHING — glide position and look target toward their targets.
  // ---------------------------------------------------------------------------
  camera.position.lerp(_targetPos, POS_LERP);
  _smoothedLook.lerp(_lookTarget, LOOK_LERP);

  // ---------------------------------------------------------------------------
  // 7. Subtle banking roll — tilt the camera's up vector with a slow sinusoid
  //    so turns feel dynamic. Rebuilt each frame from world-up to avoid drift.
  // ---------------------------------------------------------------------------
  const roll = Math.sin(elapsed * 0.5 + 0.7) * ROLL_AMOUNT;
  _up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.up.copy(_up);

  // Aim the camera at the smoothed look target.
  camera.lookAt(_smoothedLook);

  // ---------------------------------------------------------------------------
  // 8. FOV "breathing" — a barely-perceptible lens pulse for life.
  // ---------------------------------------------------------------------------
  const breathedFov = _baseFov + Math.sin(elapsed * 0.35) * FOV_BREATH;
  if (Math.abs(camera.fov - breathedFov) > 1e-4) {
    camera.fov = breathedFov;
    camera.updateProjectionMatrix();
  }
}

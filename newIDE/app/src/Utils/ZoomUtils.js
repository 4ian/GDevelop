// @flow

const zoomStepBasePower = 1 / 16;

// See same factors in `GDJS/Runtime/InGameEditor/InGameEditor.tsx`.
const stepZoomFactor: number = Math.pow(2, 2 * zoomStepBasePower);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor: number = Math.pow(stepZoomFactor, -1);

// Base factor applied per unit of wheel delta. Using an exponential
// mapping (rather than only the sign of the delta) means a bigger
// scroll/swipe produces a proportionally bigger zoom change, instead of
// the old fixed-size step regardless of how hard the user scrolled.
const wheelZoomExponentialBase = 1.003;

// Clamp the raw wheel delta taken into account so a very fast scroll
// flick can't cause a huge, disorienting jump in a single event.
const maxWheelDeltaTakenIntoAccount = 250;

// TODO: Use absolute value of signal that should represent either:
// - Mouse sensitivity
// - MacOS scroll acceleration
// Signal is usually WheelEvent.deltaY
export const getWheelStepZoomFactor = (deltaY: number): number => {
  const clampedDeltaY = Math.max(
    -maxWheelDeltaTakenIntoAccount,
    Math.min(maxWheelDeltaTakenIntoAccount, deltaY)
  );
  return Math.pow(wheelZoomExponentialBase, clampedDeltaY);
};

const instancesEditorMaxZoom = 128;
const instancesEditorMinZoom = 1 / 128;

export const clampInstancesEditorZoom = (zoom: number): number =>
  Math.max(Math.min(zoom, instancesEditorMaxZoom), instancesEditorMinZoom);

// --- Smoothing (lerp) helpers ---
//
// Zoom is multiplicative (each step multiplies the current zoom), so
// interpolating it with a plain linear lerp (`a + (b - a) * t`) looks
// wrong: the motion feels fast at high zoom levels and sluggish at low
// zoom levels. Interpolating in log-space instead - equivalent to a
// geometric interpolation - feels smooth and consistent at any zoom
// level.
//
// Typical usage: keep a `targetZoom` (set instantly on wheel/button
// events, then clamped with `clampInstancesEditorZoom`) and a
// `currentZoom` that you animate towards it every frame:
//
//   targetZoom = clampInstancesEditorZoom(targetZoom * wheelStepZoomFactor);
//   // in a requestAnimationFrame loop:
//   currentZoom = lerpZoomWithDeltaTime(currentZoom, targetZoom, deltaTimeInSeconds);

// Fraction of the remaining (log-space) distance to the target closed
// on each call. Use this variant if you call it at a fixed rate (e.g.
// a steady 60fps loop).
const defaultZoomSmoothing = 0.25;

export const lerpZoom = (
  currentZoom: number,
  targetZoom: number,
  smoothing: number = defaultZoomSmoothing
): number => {
  if (currentZoom <= 0 || targetZoom <= 0) return targetZoom;

  const logCurrent = Math.log(currentZoom);
  const logTarget = Math.log(targetZoom);
  const logResult = logCurrent + (logTarget - logCurrent) * smoothing;

  return Math.exp(logResult);
};

// Frame-rate independent version of `lerpZoom`, using exponential decay
// based on elapsed time instead of a fixed fraction per call. Prefer
// this one for a real render loop, since it converges at the same
// *speed* (in seconds) no matter the frame rate.
//
// `smoothingTimeConstant` is roughly "how many seconds to close ~63% of
// the remaining distance". Smaller = snappier, larger = softer/slower.
const defaultSmoothingTimeConstant = 0.12;

export const lerpZoomWithDeltaTime = (
  currentZoom: number,
  targetZoom: number,
  deltaTimeInSeconds: number,
  smoothingTimeConstant: number = defaultSmoothingTimeConstant
): number => {
  if (currentZoom <= 0 || targetZoom <= 0) return targetZoom;

  const decay = 1 - Math.exp(-deltaTimeInSeconds / smoothingTimeConstant);
  return lerpZoom(currentZoom, targetZoom, decay);
};

// Returns true once currentZoom is close enough to targetZoom that the
// animation loop can stop (avoids running requestAnimationFrame forever
// chasing a target it has effectively already reached).
export const isZoomCloseEnough = (
  currentZoom: number,
  targetZoom: number,
  epsilon: number = 0.0005
): boolean => Math.abs(currentZoom - targetZoom) < epsilon;
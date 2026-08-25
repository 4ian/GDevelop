// @flow
import { type WheelInputDevice } from './WheelInputClassifier';

const zoomStepBasePower = 1 / 16;

// See same factors in `GDJS/Runtime/InGameEditor/InGameEditor.tsx`.
const stepZoomFactor: number = Math.pow(2, 2 * zoomStepBasePower);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor: number = Math.pow(stepZoomFactor, -1);

// Base factor applied per unit of wheel delta, for a trackpad. A trackpad
// swipe is a continuous gesture, so its magnitude is a meaningful physical
// signal (a longer/faster swipe should zoom more) - this exponential
// mapping means a bigger swipe produces a proportionally bigger zoom
// change, instead of a fixed-size step regardless of how far the user
// swiped.
const trackpadWheelZoomExponentialBase = 1.003;

// Clamp the raw wheel delta taken into account for a trackpad, so a very
// fast flick can't cause a huge, disorienting jump in a single event -
// this also guards against macOS scroll acceleration (see note below)
// amplifying a flick into an extreme delta.
const maxWheelDeltaTakenIntoAccount = 250;

// A fixed factor applied per mouse wheel notch/detent, regardless of the
// raw delta magnitude reported for it.
const mouseWheelZoomFactor = 1.2;

// A physical mouse wheel moves in discrete notches/detents - conceptually
// each notch is "one zoom step", regardless of how the OS/browser reports
// it. Unlike a trackpad's continuous swipe, the *magnitude* reported for a
// single notch is not a trustworthy physical signal: `WheelEvent.deltaY`
// for one notch can be 3, 40, 53, 100, 120... depending on the OS, the
// browser, and the user's own mouse/scroll sensitivity setting - none of
// which reflects how much the user actually wanted to zoom. So for a
// mouse wheel we deliberately ignore the magnitude and use only the sign,
// applying one fixed, well-tuned step per notch; for a trackpad the
// magnitude is kept, since it's a genuine physical/continuous signal
// (still clamped above to tame macOS's scroll acceleration curve, which
// can otherwise report a fast flick as a huge delta rather than the
// user's actual swipe distance).
export const getWheelStepZoomFactor = (
  deltaY: number,
  device: WheelInputDevice = 'trackpad'
): number => {
  if (device === 'mouseWheel') {
    return Math.pow(mouseWheelZoomFactor, Math.sign(deltaY));
  }

  const clampedDeltaY = Math.max(
    -maxWheelDeltaTakenIntoAccount,
    Math.min(maxWheelDeltaTakenIntoAccount, deltaY)
  );
  return Math.pow(trackpadWheelZoomExponentialBase, clampedDeltaY);
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
const defaultSmoothingTimeConstant = 0.06;

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
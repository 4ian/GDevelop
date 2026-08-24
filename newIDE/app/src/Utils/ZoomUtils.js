// @flow

const zoomStepBasePower = 1 / 16;

const stepZoomFactor: number = Math.pow(2, 2 * zoomStepBasePower);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor: number = Math.pow(stepZoomFactor, -1);

// Sensitivity constant mapping wheel/trackpad delta to zoom speed.
const WHEEL_SENSITIVITY = 0.0015;

/**
 * Calculates a continuous exponential zoom factor proportional to scroll magnitude.
 * Replaces discrete `Math.sign(deltaY)` steps with smooth exponentiation.
 */
export const getWheelStepZoomFactor = (deltaY: number): number => {
  // Standard wheel deltaY > 0 is scroll down (zoom out), deltaY < 0 is scroll up (zoom in).
  return Math.exp(deltaY * WHEEL_SENSITIVITY);
};

const instancesEditorMaxZoom = 128;
const instancesEditorMinZoom = 1 / 128;

export const clampInstancesEditorZoom = (zoom: number): number =>
  Math.max(Math.min(zoom, instancesEditorMaxZoom), instancesEditorMinZoom);

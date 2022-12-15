// @flow

const basePower = 1 / 16;

const stepZoomFactor = Math.pow(2, 2 * basePower);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor = Math.pow(stepZoomFactor, -1);
const continuousZoomFactor = Math.pow(2, basePower);

// TODO: Use absolute value of signal that should represent either:
// - Mouse sensitivity
// - MacOS scroll acceleration
// Signal is usually WheelEvent.deltaY
export const getContinuousZoomFactor = (signal: number): number =>
  Math.pow(continuousZoomFactor, Math.sign(signal));

const instancesEditorMaxZoom = 128;
const instancesEditorMinZoom = 1 / 128;

export const clampInstancesEditorZoom = (zoom: number): number =>
  Math.max(Math.min(zoom, instancesEditorMaxZoom), instancesEditorMinZoom);

export const imagePreviewMaxZoom = 16;
export const imagePreviewMinZoom = 1 / 16;

export const clampImagePreviewZoom = (zoom: number): number =>
  Math.max(Math.min(zoom, imagePreviewMaxZoom), imagePreviewMinZoom);

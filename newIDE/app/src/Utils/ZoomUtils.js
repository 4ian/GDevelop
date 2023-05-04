// @flow

const zoomStepBasePower = 1 / 16;

const stepZoomFactor = Math.pow(2, 2 * zoomStepBasePower);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor = Math.pow(stepZoomFactor, -1);
const wheelStepZoomFactor = Math.pow(1.7, zoomStepBasePower);

// TODO: Use absolute value of signal that should represent either:
// - Mouse sensitivity
// - MacOS scroll acceleration
// Signal is usually WheelEvent.deltaY
export const getWheelStepZoomFactor = (deltaY: number): number =>
  Math.pow(wheelStepZoomFactor, Math.sign(deltaY));

const instancesEditorMaxZoom = 128;
const instancesEditorMinZoom = 1 / 128;

export const clampInstancesEditorZoom = (zoom: number): number =>
  Math.max(Math.min(zoom, instancesEditorMaxZoom), instancesEditorMinZoom);

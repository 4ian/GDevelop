// @flow

const stepZoomFactor = Math.pow(2, 1 / 8);
export const zoomInFactor = stepZoomFactor;
export const zoomOutFactor = Math.pow(stepZoomFactor, -1);
const continuousZoomFactor = Math.sqrt(stepZoomFactor);

// TODO: Use absolute value of signal that should represent either:
// - Mouse sensitivity
// - MacOS scroll acceleration
// Signal is usually WheelEvent.deltaY
export const getContinuousZoomFactor = (signal: number): number =>
  Math.pow(continuousZoomFactor, Math.sign(signal));

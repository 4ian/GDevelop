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

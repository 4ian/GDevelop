// @flow

/**
 * Provide a method shouldUpdate that can be called in a game loop or in
 * a method used in renderAnimationFrame, and which indicate if the rendering/update
 * of the scene should be done according to the desired framerate.
 */
export default class FpsLimiter {
  _lastFrameTime: number;
  _interval: number;
  _forceUpdate: boolean;

  constructor(maxFps: number) {
    this._lastFrameTime = Date.now();
    this._interval = 1000 / maxFps;
    this._forceUpdate = false;
  }

  shouldUpdate() {
    const now = Date.now();
    const delta = now - this._lastFrameTime;

    if (delta > this._interval || this._forceUpdate) {
      this._lastFrameTime = now - delta % this._interval;
      this._forceUpdate = false;
      return true;
    }

    return false;
  }

  forceNextUpdate() {
    this._forceUpdate = true;
  }
}

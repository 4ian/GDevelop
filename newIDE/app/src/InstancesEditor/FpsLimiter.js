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
  _maxFps: number;
  _idleFps: number;
  _lastInteractionTime: number;

  constructor({ idleFps, maxFps }: {| idleFps: number, maxFps: number |}) {
    this._maxFps = maxFps;
    this._idleFps = idleFps;
    this._lastFrameTime = Date.now();
    this._interval = 1000 / idleFps;
    this._forceUpdate = false;
  }

  // When an interaction happens, increase the framerate to maxFps.
  notifyInteractionHappened() {
    this._interval = 1000 / this._maxFps;
    this._lastInteractionTime = Date.now();
  }

  shouldUpdate() {
    const now = Date.now();
    const delta = now - this._lastFrameTime;

    // If the user did not interact with the scene for 1 second, go back to idleFps.
    if (now - this._lastInteractionTime > 1000) {
      this._interval = 1000 / this._idleFps;
    }

    if (delta > this._interval || this._forceUpdate) {
      this._lastFrameTime = now - (delta % this._interval);
      this._forceUpdate = false;
      return true;
    }

    return false;
  }

  forceNextUpdate() {
    this._forceUpdate = true;
  }
}

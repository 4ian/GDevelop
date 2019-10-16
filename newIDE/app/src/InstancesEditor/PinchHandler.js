// @flow
import ViewPosition from './ViewPosition';

export const shouldBeHandledByPinch = (event: ?TouchEvent) => {
  if (!event) return false;

  const { targetTouches } = event;
  return targetTouches && targetTouches.length >= 2;
};

type PinchDetectorArgs = {|
  canvas: HTMLCanvasElement,
  onPinchStart: () => void,
  onPinchMove: (x: number, y: number, scale: number) => void,
  onPinchEnd: () => void,
|};

/**
 * Attach events to the canvas that will notify of a pinch at some position
 * and scaling associated with it.
 * Returns a function that can be called to remove these events.
 */
const registerCanvasPinchDetector = ({
  canvas,
  onPinchStart,
  onPinchMove,
  onPinchEnd,
}: PinchDetectorArgs) => {
  let lastPinch = null;

  function start() {
    canvas.addEventListener('touchmove', move);
  }

  function move(e: TouchEvent) {
    if (!shouldBeHandledByPinch(e)) {
      return;
    }
    var t = e.targetTouches;

    var dx = t[0].clientX - t[1].clientX;
    var dy = t[0].clientY - t[1].clientY;
    var distance = Math.sqrt(dx * dx + dy * dy);
    if (!lastPinch) {
      lastPinch = {
        p: {
          distance: distance,
          date: new Date(),
        },
      };
      onPinchStart();
      return;
    }
    var now = new Date();
    var interval = now - lastPinch.p.date;
    if (interval < 12) {
      return;
    }
    const newCenter = {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    };
    const scaleChange = distance / lastPinch.p.distance;

    onPinchMove(newCenter.x, newCenter.y, scaleChange);
    lastPinch.p = {
      distance: distance,
      date: now,
    };
  }

  function end(e: TouchEvent) {
    canvas.removeEventListener('touchmove', move);
    if (!lastPinch) {
      return;
    }

    onPinchEnd();
    lastPinch = null;
  }

  canvas.addEventListener('touchstart', start);
  canvas.addEventListener('touchend', end);

  function unregisterCanvasPinchDetector() {
    canvas.removeEventListener('touchstart', start);
    canvas.removeEventListener('touchmove', move);
    canvas.removeEventListener('touchend', end);
  }

  return unregisterCanvasPinchDetector;
};

type Props = {|
  canvas: HTMLCanvasElement,
  setZoomFactor: number => void,
  getZoomFactor: () => number,
  viewPosition: ViewPosition,
|};

/**
 * Handle pinch to zoom/move on the canvas, changing the zoom factor or view
 * position accordingly.
 */
export default class PinchHandler {
  _lastPinchCenterX: number | null = null;
  _lastPinchCenterY: number | null = null;
  _setZoomFactor: number => void;
  _getZoomFactor: () => number;
  _viewPosition: ViewPosition;
  _unregisterCanvasPinchDetector: () => void;

  constructor({ canvas, setZoomFactor, getZoomFactor, viewPosition }: Props) {
    this._setZoomFactor = setZoomFactor;
    this._getZoomFactor = getZoomFactor;
    this._viewPosition = viewPosition;
    this._unregisterCanvasPinchDetector = registerCanvasPinchDetector({
      canvas,
      onPinchStart: this._startPinch,
      onPinchMove: this._onPinchMove,
      onPinchEnd: this._endPinch,
    });
  }

  _startPinch = () => {
    // Nothing to do
  };

  _onPinchMove = (centerX: number, centerY: number, scale: number) => {
    if (this._lastPinchCenterX === null || this._lastPinchCenterY === null) {
      this._lastPinchCenterX = centerX;
      this._lastPinchCenterY = centerY;
      return;
    }

    const deltaX = centerX - this._lastPinchCenterX;
    const deltaY = centerY - this._lastPinchCenterY;
    const sceneDeltaX = deltaX / this._getZoomFactor();
    const sceneDeltaY = deltaY / this._getZoomFactor();
    this._viewPosition.scrollBy(-sceneDeltaX, -sceneDeltaY);
    this._lastPinchCenterX = centerX;
    this._lastPinchCenterY = centerY;

    this._setZoomFactor(this._getZoomFactor() * scale);
  };

  _endPinch = () => {
    this._lastPinchCenterX = null;
    this._lastPinchCenterY = null;
  };

  unmount = () => {
    this._unregisterCanvasPinchDetector();
  };
}

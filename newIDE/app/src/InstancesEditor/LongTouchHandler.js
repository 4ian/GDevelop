// @flow

type CallbackEvent = {|
  /* The X position, relative to the viewport, not including scroll offset, of the long touch */
  clientX: number,
  /* The Y position, relative to the viewport, not including scroll offset, of the long touch */
  clientY: number,
|};

type Props = {|
  canvas: HTMLCanvasElement,
  onLongTouch: (event: CallbackEvent) => void,
|};

const delay = 600; // ms
const moveTolerance = 10; // px

/**
 * Listen for a long touch on a canvas. Usually used to simulate the equivalent of a right click.
 *
 * A long press is characterized by starting a touch and staying pressed, without
 * moving too far from the initial position (to avoid being confused with a drag/scroll).
 */
export default class LongTouchHandler {
  _lastTouchX: number = 0;
  _lastTouchY: number = 0;
  _longTouchTimeoutID: TimeoutID;
  _canvas: HTMLCanvasElement;
  _onLongTouch: ?(event: CallbackEvent) => void;

  constructor({ canvas, onLongTouch }: Props) {
    this._canvas = canvas;
    this._onLongTouch = onLongTouch;

    canvas.addEventListener('touchstart', this._onTouchStart);
    canvas.addEventListener('touchmove', this._onTouchMove);
    canvas.addEventListener('touchend', this._clear);
  }

  _onTouchStart = (event: TouchEvent) => {
    // If more than one touch,
    // it's not a long press.
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    this._lastTouchX = touch.clientX;
    this._lastTouchY = touch.clientY;

    // Ensure we're tracking a single long press, as sometimes
    // the 'touchstart' event is called more than once.
    this._clear();
    this._longTouchTimeoutID = setTimeout(() => {
      if (this._onLongTouch)
        this._onLongTouch({
          clientX: this._lastTouchX,
          clientY: this._lastTouchY,
        });
    }, delay);
  };

  _onTouchMove = (event: TouchEvent) => {
    // If more than one touch,
    // it's not a long press anymore.
    if (event.touches.length !== 1) {
      this._clear();
      return;
    }

    // If touch moved too far from the initial touch position,
    // it's not a long press anymore.
    const touch = event.touches[0];
    if (
      Math.abs(touch.clientX - this._lastTouchX) > moveTolerance ||
      Math.abs(touch.clientY - this._lastTouchY) > moveTolerance
    ) {
      this._clear();
      return;
    }
  };

  _clear = () => {
    clearTimeout(this._longTouchTimeoutID);
  };

  unmount = () => {
    this._canvas.removeEventListener('touchstart', this._onTouchStart);
    this._canvas.removeEventListener('touchmove', this._onTouchMove);
    this._canvas.removeEventListener('touchend', this._clear);
  };
}

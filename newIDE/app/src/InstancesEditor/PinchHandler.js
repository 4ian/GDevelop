// @flow
import gesture from 'pixi-simple-gesture';
import ViewPosition from './ViewPosition';
import * as PIXI from 'pixi.js';

type Props = {|
  backgroundArea: PIXI.Container,
  setZoomFactor: number => void,
  getZoomFactor: () => number,
  viewPosition: ViewPosition,
|};

export default class PinchHandler {
  _lastPinchCenterX: number | null = null;
  _lastPinchCenterY: number | null = null;
  _setZoomFactor: number => void;
  _getZoomFactor: () => number;
  _viewPosition: ViewPosition;

  constructor({
    backgroundArea,
    setZoomFactor,
    getZoomFactor,
    viewPosition,
  }: Props) {
    this._setZoomFactor = setZoomFactor;
    this._getZoomFactor = getZoomFactor;
    this._viewPosition = viewPosition;

    gesture.pinchable(backgroundArea, false);
    backgroundArea.on('pinchstart', () => {
      this._startPinch();
    });

    backgroundArea.on('pinchmove', event => {
      this._onPinchMove(event.center.x, event.center.y, event.scale);
    });

    backgroundArea.on('pinchend', () => {
      this._endPinch();
    });
  }

  _startPinch() {
    // Nothing to do
  }

  _onPinchMove(centerX: number, centerY: number, scale: number) {
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
  }

  _endPinch() {
    this._lastPinchCenterX = null;
    this._lastPinchCenterY = null;
  }
}

// @flow
import * as PIXI from 'pixi.js-legacy';
import Rectangle from '../Utils/Rectangle';
import { type InstancesEditorSettings } from './InstancesEditorSettings';

type Props = {|
  initialViewX: number,
  initialViewY: number,
  initialWidth: number,
  initialHeight: number,
  instancesEditorSettings: InstancesEditorSettings,
|};

export default class ViewPosition {
  viewX: number = 0;
  viewY: number = 0;
  width: number;
  height: number;
  instancesEditorSettings: InstancesEditorSettings;
  _pixiContainer = new PIXI.Container();

  constructor({
    initialViewX,
    initialViewY,
    initialWidth,
    initialHeight,
    instancesEditorSettings,
  }: Props) {
    this.viewX = initialViewX;
    this.viewY = initialViewY;
    this.instancesEditorSettings = instancesEditorSettings;
    this.resize(initialWidth, initialHeight);
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  resize(newWidth: number, newHeight: number) {
    this.width = newWidth;
    this.height = newHeight;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  /**
   * Convert a point from the canvas coordinates (for example, the mouse position) to the
   * "world" coordinates.
   */
  toSceneCoordinates = (x: number, y: number): [number, number] => {
    x -= this.width / 2;
    y -= this.height / 2;
    x /= Math.abs(this.instancesEditorSettings.zoomFactor);
    y /= Math.abs(this.instancesEditorSettings.zoomFactor);

    var viewRotation = 0;
    var tmp = x;
    x =
      Math.cos((viewRotation / 180) * Math.PI) * x -
      Math.sin((viewRotation / 180) * Math.PI) * y;
    y =
      Math.sin((viewRotation / 180) * Math.PI) * tmp +
      Math.cos((viewRotation / 180) * Math.PI) * y;

    return [x + this.viewX, y + this.viewY];
  };

  /**
   * Convert a point from the "world" coordinates (for example, an object position) to the
   * canvas coordinates.
   */
  toCanvasCoordinates = (x: number, y: number): [number, number] => {
    x -= this.viewX;
    y -= this.viewY;

    var viewRotation = -0;
    var tmp = x;
    x =
      Math.cos((viewRotation / 180) * Math.PI) * x -
      Math.sin((viewRotation / 180) * Math.PI) * y;
    y =
      Math.sin((viewRotation / 180) * Math.PI) * tmp +
      Math.cos((viewRotation / 180) * Math.PI) * y;

    x *= Math.abs(this.instancesEditorSettings.zoomFactor);
    y *= Math.abs(this.instancesEditorSettings.zoomFactor);

    return [x + this.width / 2, y + this.height / 2];
  };

  scrollBy(x: number, y: number) {
    this.viewX += x;
    this.viewY += y;
  }

  scrollTo(x: number, y: number) {
    this.viewX = x;
    this.viewY = y;
  }

  /**
   * Moves view to the rectangle center and returns the ideal zoom
   * factor to fit to the rectangle.
   */
  fitToRectangle(rectangle: Rectangle): number {
    this.viewX = rectangle.centerX();
    this.viewY = rectangle.centerY();
    const idealZoomOnX = this.width / rectangle.width();
    const idealZoomOnY = this.height / rectangle.height();

    return Math.min(idealZoomOnX, idealZoomOnY) * 0.95; // Add margin so that the object doesn't feel cut
  }

  getViewX() {
    return this.viewX;
  }

  getViewY() {
    return this.viewY;
  }

  getPixiContainer() {
    return this._pixiContainer;
  }

  render() {
    this._pixiContainer.position.x =
      -this.viewX * this.instancesEditorSettings.zoomFactor;
    this._pixiContainer.position.y =
      -this.viewY * this.instancesEditorSettings.zoomFactor;
    this._pixiContainer.position.x += this.width / 2;
    this._pixiContainer.position.y += this.height / 2;
    this._pixiContainer.scale.x = this.instancesEditorSettings.zoomFactor;
    this._pixiContainer.scale.y = this.instancesEditorSettings.zoomFactor;
  }
}

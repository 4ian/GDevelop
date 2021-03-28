// @flow
import * as PIXI from 'pixi.js-legacy';

type Props = {|
  initialViewX: number,
  initialViewY: number,
  width: number,
  height: number,
  options: any,
|};

export default class ViewPosition {
  viewX: number = 0;
  viewY: number = 0;
  _width: number;
  _height: number;
  options: any;
  _pixiContainer = new PIXI.Container();

  constructor({ initialViewX, initialViewY, width, height, options }: Props) {
    this.viewX = initialViewX;
    this.viewY = initialViewY;
    this.options = options;
    this.resize(width, height);
  }

  setOptions(options: any) {
    this.options = options;
  }

  resize(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  getWidth() {
    return this._width;
  }

  getHeight() {
    return this._height;
  }

  /**
   * Convert a point from the canvas coordinates (for example, the mouse position) to the
   * "world" coordinates.
   */
  toSceneCoordinates = (x: number, y: number): [number, number] => {
    x -= this._width / 2;
    y -= this._height / 2;
    x /= Math.abs(this.options.zoomFactor);
    y /= Math.abs(this.options.zoomFactor);

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

    x *= Math.abs(this.options.zoomFactor);
    y *= Math.abs(this.options.zoomFactor);

    return [x + this._width / 2, y + this._height / 2];
  };

  scrollBy(x: number, y: number) {
    this.viewX += x;
    this.viewY += y;
  }

  scrollTo(x: number, y: number) {
    this.viewX = x;
    this.viewY = y;
  }

  scrollToInstance(instance: gdInitialInstance) {
    this.viewX = instance.getX();
    this.viewY = instance.getY();
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
    this._pixiContainer.position.x = -this.viewX * this.options.zoomFactor;
    this._pixiContainer.position.y = -this.viewY * this.options.zoomFactor;
    this._pixiContainer.position.x += this._width / 2;
    this._pixiContainer.position.y += this._height / 2;
    this._pixiContainer.scale.x = this.options.zoomFactor;
    this._pixiContainer.scale.y = this.options.zoomFactor;
  }
}

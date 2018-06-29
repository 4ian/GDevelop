import PIXI from 'pixi.js';

export default class ViewPosition {
  constructor({ width, height, options }) {
    this.viewX = width / 2;
    this.viewY = height / 2;
    this.options = options;
    this._pixiContainer = new PIXI.Container();
    this.resize(width, height);
  }

  setOptions(options) {
    this.options = options;
  }

  resize(width, height) {
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
  toSceneCoordinates = (x, y) => {
    x -= this._width / 2;
    y -= this._height / 2;
    x /= Math.abs(this._pixiContainer.scale.x);
    y /= Math.abs(this._pixiContainer.scale.y);

    var viewRotation = 0;
    var tmp = x;
    x =
      Math.cos(viewRotation / 180 * 3.14159) * x -
      Math.sin(viewRotation / 180 * 3.14159) * y;
    y =
      Math.sin(viewRotation / 180 * 3.14159) * tmp +
      Math.cos(viewRotation / 180 * 3.14159) * y;

    return [x + this.viewX, y + this.viewY];
  };

  /**
   * Convert a point from the "world" coordinates (for example, an object position) to the
   * canvas coordinates.
   */
  toCanvasCoordinates = (x, y) => {
    x -= this.viewX;
    y -= this.viewY;

    var viewRotation = -0;
    var tmp = x;
    x =
      Math.cos(viewRotation / 180 * 3.14159) * x -
      Math.sin(viewRotation / 180 * 3.14159) * y;
    y =
      Math.sin(viewRotation / 180 * 3.14159) * tmp +
      Math.cos(viewRotation / 180 * 3.14159) * y;

    x *= Math.abs(this._pixiContainer.scale.x);
    y *= Math.abs(this._pixiContainer.scale.y);

    return [x + this._width / 2, y + this._height / 2];
  };

  scrollBy(x, y) {
    this.viewX += x;
    this.viewY += y;
  }

  scrollTo(x, y) {
    this.viewX = x;
    this.viewY = y;
  }

  scrollToInstance(instance) {
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

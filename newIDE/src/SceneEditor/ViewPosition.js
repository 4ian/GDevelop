const PIXI = global.PIXI;
import gesture from 'pixi-simple-gesture';

export default class ViewPosition {
  constructor({onPanMoveView}) {
    this.viewX = 0;
    this.viewY = 0;
    this._zoomFactor = 1;
    this._pixiContainer = new PIXI.Container();

    // gesture.panable(this._pixiContainer);
    // this._pixiContainer.on('panmove', (event) => onPanMoveView(event.deltaX, event.deltaY));
  }


  /**
   * Convert a point from the canvas coordinates (for example, the mouse position) to the
   * "world" coordinates.
   */
  toSceneCoordinates = (x, y) => {
    x /= Math.abs(this._pixiContainer.scale.x);
    y /= Math.abs(this._pixiContainer.scale.y);

    var viewRotation = 0;
    var tmp = x;
    x = Math.cos(viewRotation/180*3.14159)*x - Math.sin(viewRotation/180*3.14159)*y;
    y = Math.sin(viewRotation/180*3.14159)*tmp + Math.cos(viewRotation/180*3.14159)*y;

    return [x+this.viewX, y+this.viewY];
  }

  /**
   * Convert a point from the "world" coordinates (for example, an object position) to the
   * canvas coordinates.
   */
  toCanvasCoordinates = (x, y) => {
    var viewRotation = -0;
    var tmp = x;
    x = Math.cos(viewRotation/180*3.14159)*x - Math.sin(viewRotation/180*3.14159)*y;
    y = Math.sin(viewRotation/180*3.14159)*tmp + Math.cos(viewRotation/180*3.14159)*y;

    x *= Math.abs(this._pixiContainer.scale.x);
    y *= Math.abs(this._pixiContainer.scale.y);

    return [x-this.viewX, y-this.viewY];
  }

  scrollBy(x, y) {
    this.viewX += x;
    this.viewY += y;
  }

  zoomBy(value) {
    this._zoomFactor = Math.max(Math.min(this._zoomFactor + value, 10), 0.05);
  }

  getPixiContainer() {
    return this._pixiContainer;
  }

  render() {
    this._pixiContainer.position.x = -this.viewX * this._zoomFactor;
    this._pixiContainer.position.y = -this.viewY * this._zoomFactor;
  	this._pixiContainer.scale.x = this._zoomFactor;
  	this._pixiContainer.scale.y = this._zoomFactor;
  }
}

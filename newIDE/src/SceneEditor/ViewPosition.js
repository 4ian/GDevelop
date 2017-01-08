const PIXI = global.PIXI;
import gesture from 'pixi-simple-gesture';

export default class ViewPosition {
  constructor({onPanMoveView}) {
    this.viewX = 0;
    this.viewY = 0;
    this.pixiContainer = new PIXI.Container();
    gesture.panable(this.pixiContainer);
    this.pixiContainer.on('panmove', (event) => onPanMoveView(event.deltaX, event.deltaY));
  }

  scrollBy(x, y) {
    this.viewX += x;
    this.viewY += y;
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  render() {
    this.pixiContainer.position.x = -this.viewX;
    this.pixiContainer.position.y = -this.viewY;
  }
}

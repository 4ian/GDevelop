import PIXI from 'pixi.js';
import transformRect from '../Utils/TransformRect';

export default class WindowBorder {
  constructor({ project, toCanvasCoordinates }) {
    this.project = project;
    this.toCanvasCoordinates = toCanvasCoordinates;

    this.pixiRectangle = new PIXI.Graphics();
    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this.windowRectangle = {
      x: 0,
      y: 0,
      width: this.project.getMainWindowDefaultWidth(),
      height: this.project.getMainWindowDefaultHeight(),
    };
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    const displayedRectangle = transformRect(
      this.toCanvasCoordinates,
      this.windowRectangle
    );

    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x000000);
    this.pixiRectangle.lineStyle(1, 0x000000, 1);
    this.pixiRectangle.alpha = 1;
    this.pixiRectangle.fillAlpha = 0;
    this.pixiRectangle.drawRect(
      displayedRectangle.x,
      displayedRectangle.y,
      displayedRectangle.width,
      displayedRectangle.height
    );
    this.pixiRectangle.endFill();
  }
}

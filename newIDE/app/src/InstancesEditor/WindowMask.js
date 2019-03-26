import * as PIXI from 'pixi.js';
import transformRect from '../Utils/TransformRect';

export default class WindowBorder {
  constructor({ project, viewPosition, options }) {
    this.project = project;
    this.viewPosition = viewPosition;
    this.options = options;

    this.pixiRectangle = new PIXI.Graphics();
    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this.windowRectangle = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  setOptions(options) {
    this.options = options;
  }

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    const options = this.options;

    if (!options.windowMask) {
      this.pixiRectangle.visible = false;
      return;
    }

    const width = this.project.getMainWindowDefaultWidth();
    const height = this.project.getMainWindowDefaultHeight();
    this.windowRectangle.x = this.viewPosition.getViewX() - width / 2;
    this.windowRectangle.y = this.viewPosition.getViewY() - height / 2;
    this.windowRectangle.width = width;
    this.windowRectangle.height = height;

    const displayedRectangle = transformRect(
      this.viewPosition.toCanvasCoordinates,
      this.windowRectangle
    );

    this.pixiRectangle.visible = true;
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

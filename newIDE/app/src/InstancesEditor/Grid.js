import * as PIXI from 'pixi.js-legacy';
import { rgbColorToHexNumber, type RGBColor } from '../Utils/ColorTransformer';

// Equal to #6868E8
const DEFAULT_COLOR: RGBColor = {
  r: 104,
  g: 104,
  b: 232,
};

export default class SelectionRectangle {
  constructor({ viewPosition, options }) {
    this.viewPosition = viewPosition;
    this.options = options;

    this.pixiGrid = new PIXI.Graphics();
    this.pixiGrid.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  setOptions(options) {
    this.options = options;
  }

  getPixiObject() {
    return this.pixiGrid;
  }

  render() {
    const options = this.options;

    if (!options.grid) {
      this.pixiGrid.visible = false;
      return;
    }

    const gridColor = options.gridColor || DEFAULT_COLOR;
    const gridHex = rgbColorToHexNumber(gridColor);
    const gridAlpha = gridColor.a || 1;

    this.pixiGrid.visible = true;
    this.pixiGrid.clear();
    this.pixiGrid.beginFill(gridHex);
    this.pixiGrid.lineStyle(1, gridHex, gridAlpha);
    this.pixiGrid.fill.alpha = 0.1;
    this.pixiGrid.alpha = 0.8;

    const sceneStartPoint = this.viewPosition.toSceneCoordinates(0, 0);
    const sceneEndPoint = this.viewPosition.toSceneCoordinates(
      this.viewPosition.getWidth(),
      this.viewPosition.getHeight()
    );

    const startXPos =
      Math.floor(sceneStartPoint[0] / options.gridWidth) * options.gridWidth;
    const startYPos =
      Math.floor(sceneStartPoint[1] / options.gridHeight) * options.gridHeight;

    const endXPos =
      Math.ceil(sceneEndPoint[0] / options.gridWidth) * options.gridWidth;
    const endYPos =
      Math.ceil(sceneEndPoint[1] / options.gridHeight) * options.gridHeight;

    for (
      let Xpos = startXPos + options.gridOffsetX;
      Xpos < endXPos;
      Xpos += options.gridWidth
    ) {
      const start = this.viewPosition.toCanvasCoordinates(Xpos, startYPos);
      const end = this.viewPosition.toCanvasCoordinates(Xpos, endYPos);

      this.pixiGrid.moveTo(start[0], start[1]);
      this.pixiGrid.lineTo(end[0], end[1]);
    }

    for (
      let Ypos = startYPos + options.gridOffsetY;
      Ypos < endYPos;
      Ypos += options.gridHeight
    ) {
      const start = this.viewPosition.toCanvasCoordinates(startXPos, Ypos);
      const end = this.viewPosition.toCanvasCoordinates(endXPos, Ypos);

      this.pixiGrid.moveTo(start[0], start[1]);
      this.pixiGrid.lineTo(end[0], end[1]);
    }

    this.pixiGrid.endFill();
  }
}

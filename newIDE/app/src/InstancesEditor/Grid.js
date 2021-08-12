import * as PIXI from 'pixi.js-legacy';
import {
  rgbColorToHexNumber,
  // TODO: Add Flow typing in this file.
  // , type RGBColor
} from '../Utils/ColorTransformer';

// Equal to #6868E8
const DEFAULT_COLOR /*: RGBColor */ = {
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

    const offsetX =
      ((options.gridOffsetX % options.gridWidth) + options.gridWidth) %
      options.gridWidth;
    const offsetY =
      ((options.gridOffsetY % options.gridHeight) + options.gridHeight) %
      options.gridHeight;

    const startX =
      Math.floor((sceneStartPoint[0] - offsetX) / options.gridWidth) *
        options.gridWidth +
      offsetX;
    const startY =
      Math.floor((sceneStartPoint[1] - offsetY) / options.gridHeight) *
        options.gridHeight +
      offsetY;

    const endX =
      Math.ceil((sceneEndPoint[0] - offsetX) / options.gridWidth) *
        options.gridWidth +
      offsetX;
    const endY =
      Math.ceil((sceneEndPoint[1] - offsetY) / options.gridHeight) *
        options.gridHeight +
      offsetY;

    if (options.gridType === 'isometric') {
      const countX = Math.round((endX - startX) / options.gridWidth);
      const countY = Math.round((endY - startY) / options.gridHeight);
      const lineCount = countX + countY;
      for (let i = 0; i < lineCount; ++i) {
        let lineStartX;
        let lineStartY;
        if (i < countX) {
          // top
          lineStartX = startX + options.gridWidth / 2 + i * options.gridWidth;
          lineStartY = startY;
        } else {
          // right
          lineStartX = endX;
          lineStartY =
            startY + options.gridHeight / 2 + (i - countX) * options.gridHeight;
        }
        let lineEndX;
        let lineEndY;
        if (i < countY) {
          // left
          lineEndX = startX;
          lineEndY = startY + options.gridHeight / 2 + i * options.gridHeight;
        } else {
          // bottom
          lineEndX =
            startX + options.gridWidth / 2 + (i - countY) * options.gridWidth;
          lineEndY = endY;
        }
        const start = this.viewPosition.toCanvasCoordinates(
          lineStartX,
          lineStartY
        );
        const end = this.viewPosition.toCanvasCoordinates(lineEndX, lineEndY);
        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }
      for (let i = 0; i < lineCount; ++i) {
        let lineStartX;
        let lineStartY;
        if (i < countY) {
          // reverse left
          lineStartX = startX;
          lineStartY =
            startY +
            options.gridHeight / 2 +
            (countY - 1 - i) * options.gridHeight;
        } else {
          // top
          lineStartX =
            startX + options.gridWidth / 2 + (i - countY) * options.gridWidth;
          lineStartY = startY;
        }
        let lineEndX;
        let lineEndY;
        if (i < countX) {
          // bottom
          lineEndX = startX + options.gridWidth / 2 + i * options.gridWidth;
          lineEndY = endY;
        } else {
          // reverse right
          lineEndX = endX;
          lineEndY =
            startY +
            options.gridHeight / 2 +
            (lineCount - 1 - i) * options.gridHeight;
        }
        const start = this.viewPosition.toCanvasCoordinates(
          lineStartX,
          lineStartY
        );
        const end = this.viewPosition.toCanvasCoordinates(lineEndX, lineEndY);
        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }
    } else {
      for (let x = startX; x < endX; x += options.gridWidth) {
        const start = this.viewPosition.toCanvasCoordinates(x, startY);
        const end = this.viewPosition.toCanvasCoordinates(x, endY);

        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }

      for (let y = startY; y < endY; y += options.gridHeight) {
        const start = this.viewPosition.toCanvasCoordinates(startX, y);
        const end = this.viewPosition.toCanvasCoordinates(endX, y);

        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }
    }

    this.pixiGrid.endFill();
  }
}

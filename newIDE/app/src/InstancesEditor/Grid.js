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
      this._drawLines(
        this._topLeftDiamondPoints(startX, endX, startY, endY),
        this._rightBottomDiamondPoints(startX, endX, startY, endY)
      );
      this._drawLines(
        this._rightTopDiamondPoints(startX, endX, startY, endY),
        this._bottomLeftDiamondPoints(startX, endX, startY, endY)
      );
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

  _drawLines(sceneStartPoints, sceneEndPoints) {
    let sceneStartPoint = sceneStartPoints.next();
    let sceneEndPoint = sceneEndPoints.next();
    while (!sceneStartPoint.done && !sceneEndPoint.done) {
      const start = this.viewPosition.toCanvasCoordinates(
        sceneStartPoint.value[0],
        sceneStartPoint.value[1]
      );
      const end = this.viewPosition.toCanvasCoordinates(
        sceneEndPoint.value[0],
        sceneEndPoint.value[1]
      );

      this.pixiGrid.moveTo(start[0], start[1]);
      this.pixiGrid.lineTo(end[0], end[1]);

      sceneStartPoint = sceneStartPoints.next();
      sceneEndPoint = sceneEndPoints.next();
    }
  }

  *_diamondsX(startX, endX) {
    const options = this.options;
    for (
      let x = startX + options.gridWidth / 2;
      x < endX;
      x += options.gridWidth
    ) {
      yield x;
    }
  }

  *_diamondsY(startY, endY) {
    const options = this.options;
    for (
      let y = startY + options.gridHeight / 2;
      y < endY;
      y += options.gridHeight
    ) {
      yield y;
    }
  }

  *_reverseDiamondsY(startY, endY) {
    const options = this.options;
    for (
      let y = endY - options.gridHeight / 2;
      y > startY;
      y -= options.gridHeight
    ) {
      yield y;
    }
  }

  _temporaryTopLeftDiamondPoint = [0, 0];
  *_topLeftDiamondPoints(startX, endX, startY, endY) {
    const point = this._temporaryTopLeftDiamondPoint;
    for (const x of this._diamondsX(startX, endX)) {
      point[0] = x;
      point[1] = startY;
      yield point;
    }
    for (const y of this._diamondsY(startY, endY)) {
      point[0] = endX;
      point[1] = y;
      yield point;
    }
  }

  _temporaryRightBottomDiamondPoint = [0, 0];
  *_rightBottomDiamondPoints(startX, endX, startY, endY) {
    const point = this._temporaryRightBottomDiamondPoint;
    for (const y of this._diamondsY(startY, endY)) {
      point[0] = startX;
      point[1] = y;
      yield point;
    }
    for (const x of this._diamondsX(startX, endX)) {
      point[0] = x;
      point[1] = endY;
      yield point;
    }
  }

  _temporaryRightTopDiamondPoint = [0, 0];
  *_rightTopDiamondPoints(startX, endX, startY, endY) {
    const point = this._temporaryRightTopDiamondPoint;
    for (const y of this._reverseDiamondsY(startY, endY)) {
      point[0] = startX;
      point[1] = y;
      yield point;
    }
    for (const x of this._diamondsX(startX, endX)) {
      point[0] = x;
      point[1] = startY;
      yield point;
    }
  }

  _temporaryBottomLeftDiamondPoint = [0, 0];
  *_bottomLeftDiamondPoints(startX, endX, startY, endY) {
    const point = this._temporaryBottomLeftDiamondPoint;
    for (const x of this._diamondsX(startX, endX)) {
      point[0] = x;
      point[1] = endY;
      yield point;
    }
    for (const y of this._reverseDiamondsY(startY, endY)) {
      point[0] = endX;
      point[1] = y;
      yield point;
    }
  }
}

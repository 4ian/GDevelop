// @flow
import * as PIXI from 'pixi.js-legacy';
import ViewPosition from './ViewPosition';
import { type InstancesEditorSettings } from './InstancesEditorSettings';

type Props = {|
  viewPosition: ViewPosition,
  instancesEditorSettings: InstancesEditorSettings,
|};

export default class Grid {
  pixiGrid = new PIXI.Graphics();
  instancesEditorSettings: InstancesEditorSettings;
  viewPosition: ViewPosition;

  constructor({ viewPosition, instancesEditorSettings }: Props) {
    this.viewPosition = viewPosition;
    this.instancesEditorSettings = instancesEditorSettings;

    this.pixiGrid.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  getPixiObject() {
    return this.pixiGrid;
  }

  render() {
    const instancesEditorSettings = this.instancesEditorSettings;

    if (!instancesEditorSettings.grid) {
      this.pixiGrid.visible = false;
      return;
    }

    const gridColor = instancesEditorSettings.gridColor;
    const gridAlpha = instancesEditorSettings.gridAlpha;

    this.pixiGrid.visible = true;
    this.pixiGrid.clear();
    this.pixiGrid.beginFill(gridColor);
    this.pixiGrid.lineStyle(1, gridColor, 1);
    this.pixiGrid.alpha = gridAlpha;

    const sceneStartPoint = this.viewPosition.toSceneCoordinates(0, 0);
    const sceneEndPoint = this.viewPosition.toSceneCoordinates(
      this.viewPosition.getWidth(),
      this.viewPosition.getHeight()
    );

    const offsetX =
      ((instancesEditorSettings.gridOffsetX %
        instancesEditorSettings.gridWidth) +
        instancesEditorSettings.gridWidth) %
      instancesEditorSettings.gridWidth;
    const offsetY =
      ((instancesEditorSettings.gridOffsetY %
        instancesEditorSettings.gridHeight) +
        instancesEditorSettings.gridHeight) %
      instancesEditorSettings.gridHeight;

    const startX =
      Math.floor(
        (sceneStartPoint[0] - offsetX) / instancesEditorSettings.gridWidth
      ) *
        instancesEditorSettings.gridWidth +
      offsetX;
    const startY =
      Math.floor(
        (sceneStartPoint[1] - offsetY) / instancesEditorSettings.gridHeight
      ) *
        instancesEditorSettings.gridHeight +
      offsetY;

    const endX =
      Math.ceil(
        (sceneEndPoint[0] - offsetX) / instancesEditorSettings.gridWidth
      ) *
        instancesEditorSettings.gridWidth +
      offsetX;
    const endY =
      Math.ceil(
        (sceneEndPoint[1] - offsetY) / instancesEditorSettings.gridHeight
      ) *
        instancesEditorSettings.gridHeight +
      offsetY;

    if (instancesEditorSettings.gridType === 'isometric') {
      const countX = Math.round(
        (endX - startX) / instancesEditorSettings.gridWidth
      );
      const countY = Math.round(
        (endY - startY) / instancesEditorSettings.gridHeight
      );
      const lineCount = countX + countY;
      for (let i = 0; i < lineCount; ++i) {
        let lineStartX;
        let lineStartY;
        if (i < countX) {
          // top
          lineStartX =
            startX +
            instancesEditorSettings.gridWidth / 2 +
            i * instancesEditorSettings.gridWidth;
          lineStartY = startY;
        } else {
          // right
          lineStartX = endX;
          lineStartY =
            startY +
            instancesEditorSettings.gridHeight / 2 +
            (i - countX) * instancesEditorSettings.gridHeight;
        }
        let lineEndX;
        let lineEndY;
        if (i < countY) {
          // left
          lineEndX = startX;
          lineEndY =
            startY +
            instancesEditorSettings.gridHeight / 2 +
            i * instancesEditorSettings.gridHeight;
        } else {
          // bottom
          lineEndX =
            startX +
            instancesEditorSettings.gridWidth / 2 +
            (i - countY) * instancesEditorSettings.gridWidth;
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
            instancesEditorSettings.gridHeight / 2 +
            (countY - 1 - i) * instancesEditorSettings.gridHeight;
        } else {
          // top
          lineStartX =
            startX +
            instancesEditorSettings.gridWidth / 2 +
            (i - countY) * instancesEditorSettings.gridWidth;
          lineStartY = startY;
        }
        let lineEndX;
        let lineEndY;
        if (i < countX) {
          // bottom
          lineEndX =
            startX +
            instancesEditorSettings.gridWidth / 2 +
            i * instancesEditorSettings.gridWidth;
          lineEndY = endY;
        } else {
          // reverse right
          lineEndX = endX;
          lineEndY =
            startY +
            instancesEditorSettings.gridHeight / 2 +
            (lineCount - 1 - i) * instancesEditorSettings.gridHeight;
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
      for (let x = startX; x < endX; x += instancesEditorSettings.gridWidth) {
        const start = this.viewPosition.toCanvasCoordinates(x, startY);
        const end = this.viewPosition.toCanvasCoordinates(x, endY);

        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }

      for (let y = startY; y < endY; y += instancesEditorSettings.gridHeight) {
        const start = this.viewPosition.toCanvasCoordinates(startX, y);
        const end = this.viewPosition.toCanvasCoordinates(endX, y);

        this.pixiGrid.moveTo(start[0], start[1]);
        this.pixiGrid.lineTo(end[0], end[1]);
      }
    }

    this.pixiGrid.endFill();
  }
}

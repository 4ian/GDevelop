import gesture from 'pixi-simple-gesture';
import transformRect from '../Utils/TransformRect';
import PIXI from 'pixi.js';

const buttonSize = 10;
const smallButtonSize = 8;
const buttonPadding = 5;

export default class InstancesSelection {
  constructor({
    instancesSelection,
    instanceMeasurer,
    onResize,
    onResizeEnd,
    toCanvasCoordinates,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.onResize = onResize;
    this.onResizeEnd = onResizeEnd;
    this.toCanvasCoordinates = toCanvasCoordinates;
    this.instancesSelection = instancesSelection;

    this.pixiContainer = new PIXI.Container();
    this.rectanglesContainer = new PIXI.Container();
    this.selectedRectangles = [];
    this.pixiContainer.addChild(this.rectanglesContainer);

    this.resizeButton = new PIXI.Graphics();
    this.resizeIcon = new PIXI.Sprite.fromImage('res/actions/direction.png');
    this.rightResizeButton = new PIXI.Graphics();
    this.bottomResizeButton = new PIXI.Graphics();
    this._makeButton(
      this.resizeButton,
      event => {
        this.onResize(event.deltaX, event.deltaY);
      },
      () => {
        this.onResizeEnd();
      },
      'nwse-resize'
    );
    this._makeButton(
      this.rightResizeButton,
      event => {
        this.onResize(event.deltaX, 0);
      },
      () => {
        this.onResizeEnd();
      },
      'ew-resize'
    );
    this._makeButton(
      this.bottomResizeButton,
      event => {
        this.onResize(0, event.deltaY);
      },
      () => {
        this.onResizeEnd();
      },
      'ns-resize'
    );
  }

  _makeButton(objectButton, onMove, onEnd, cursor) {
    objectButton.interactive = true;
    objectButton.buttonMode = true;
    objectButton.defaultCursor = cursor;
    gesture.panable(objectButton);
    objectButton.on('panmove', onMove);
    objectButton.on('panend', onEnd);
    this.pixiContainer.addChild(objectButton);
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  _renderButton(show, buttonObject, canvasPosition, size) {
    buttonObject.clear();
    if (!show) {
      buttonObject.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
      return;
    }

    buttonObject.beginFill(0xffffff);
    buttonObject.lineStyle(1, 0x6868e8, 1);
    buttonObject.fillAlpha = 0.9;
    buttonObject.drawRect(canvasPosition[0], canvasPosition[1], size, size);
    buttonObject.endFill();
    buttonObject.hitArea = new PIXI.Rectangle(
      canvasPosition[0],
      canvasPosition[1],
      size,
      size
    );
  }

  render() {
    const selection = this.instancesSelection.getSelectedInstances();
    let x1;
    let y1;
    let x2;
    let y2;

    //Update the selection rectangle of each instance
    for (var i = 0; i < selection.length; i++) {
      if (this.selectedRectangles.length === i) {
        const newRectangle = new PIXI.Graphics();
        newRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
        this.selectedRectangles.push(newRectangle);
        this.rectanglesContainer.addChild(newRectangle);
      }

      const instance = selection[i];
      const instanceRect = this.instanceMeasurer.getInstanceRect(instance);
      const selectionRectangle = transformRect(
        this.toCanvasCoordinates,
        instanceRect
      );

      this.selectedRectangles[i].clear();
      this.selectedRectangles[i].beginFill(0x6868e8);
      this.selectedRectangles[i].lineStyle(1, 0x6868e8, 1);
      this.selectedRectangles[i].fillAlpha = 0.3;
      this.selectedRectangles[i].alpha = 0.8;
      this.selectedRectangles[i].drawRect(
        selectionRectangle.x,
        selectionRectangle.y,
        selectionRectangle.width,
        selectionRectangle.height
      );
      this.selectedRectangles[i].endFill();

      if (x1 === undefined || instanceRect.x < x1) x1 = instanceRect.x;
      if (y1 === undefined || instanceRect.y < y1) y1 = instanceRect.y;
      if (x2 === undefined || instanceRect.x + instanceRect.width > x2)
        x2 = instanceRect.x + instanceRect.width;
      if (y2 === undefined || instanceRect.y + instanceRect.height > y2)
        y2 = instanceRect.y + instanceRect.height;
    }

    while (this.selectedRectangles.length > selection.length) {
      this.rectanglesContainer.removeChild(this.selectedRectangles.pop());
    }

    //Position the resize button.
    const show = selection.length !== 0;
    const resizeButtonPos = this.toCanvasCoordinates(x2, y2);
    resizeButtonPos[0] += buttonPadding;
    resizeButtonPos[1] += buttonPadding;

    const rightResizeButtonPos = this.toCanvasCoordinates(
      x2,
      y1 + (y2 - y1) / 2
    );
    rightResizeButtonPos[0] += buttonPadding;
    rightResizeButtonPos[1] -= -smallButtonSize / 2;

    const bottomResizeButtonPos = this.toCanvasCoordinates(
      x1 + (x2 - x1) / 2,
      y2
    );
    bottomResizeButtonPos[0] -= -smallButtonSize / 2;
    bottomResizeButtonPos[1] += buttonPadding;

    this._renderButton(show, this.resizeButton, resizeButtonPos, buttonSize);
    this._renderButton(
      show,
      this.rightResizeButton,
      rightResizeButtonPos,
      smallButtonSize
    );
    this._renderButton(
      show,
      this.bottomResizeButton,
      bottomResizeButtonPos,
      smallButtonSize
    );
  }
}

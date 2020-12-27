// @flow
import gesture from 'pixi-simple-gesture';
import transformRect from '../Utils/TransformRect';
import * as PIXI from 'pixi.js-legacy';
import { type ScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import InstancesSelection from './InstancesSelection';

type Props = {|
  instancesSelection: InstancesSelection,
  instanceMeasurer: Object, // To be typed in InstancesRenderer
  onResize: (deltaX: number | null, deltaY: number | null) => void,
  onResizeEnd: () => void,
  onRotate: (number, number) => void,
  onRotateEnd: () => void,
  toCanvasCoordinates: (x: number, y: number) => [number, number],
  screenType: ScreenType,
|};

const getButtonSizes = (screenType: ScreenType) => {
  if (screenType === 'touch') {
    return {
      buttonSize: 14,
      smallButtonSize: 12,
      buttonPadding: 5,
      hitAreaPadding: 12,
    };
  }

  return {
    buttonSize: 10,
    smallButtonSize: 8,
    buttonPadding: 5,
    hitAreaPadding: 5,
  };
};

const RECTANGLE_BUTTON_SHAPE = 0;
const CIRCLE_BUTTON_SHAPE = 1;

/**
 * Render selection rectangle for selected instances.
 */
export default class SelectedInstances {
  instancesSelection: InstancesSelection;
  instanceMeasurer: Object; // To be typed in InstancesRenderer
  onResize: (deltaX: number | null, deltaY: number | null) => void;
  onResizeEnd: () => void;
  onRotate: (number, number) => void;
  onRotateEnd: () => void;
  toCanvasCoordinates: (x: number, y: number) => [number, number];
  _screenType: ScreenType;

  pixiContainer = new PIXI.Container();
  rectanglesContainer = new PIXI.Container();
  selectedRectangles = [];
  resizeButton = new PIXI.Graphics();
  resizeIcon = PIXI.Sprite.from('res/actions/direction.png');
  rightResizeButton = new PIXI.Graphics();
  bottomResizeButton = new PIXI.Graphics();
  rotateButton = new PIXI.Graphics();

  constructor({
    instancesSelection,
    instanceMeasurer,
    onResize,
    onResizeEnd,
    onRotate,
    onRotateEnd,
    toCanvasCoordinates,
    screenType,
  }: Props) {
    this.instanceMeasurer = instanceMeasurer;
    this.onResize = onResize;
    this.onResizeEnd = onResizeEnd;
    this.onRotate = onRotate;
    this.onRotateEnd = onRotateEnd;
    this.toCanvasCoordinates = toCanvasCoordinates;
    this.instancesSelection = instancesSelection;
    this._screenType = screenType;

    this.pixiContainer.addChild(this.rectanglesContainer);

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
        this.onResize(event.deltaX, null);
      },
      () => {
        this.onResizeEnd();
      },
      'ew-resize'
    );
    this._makeButton(
      this.bottomResizeButton,
      event => {
        this.onResize(null, event.deltaY);
      },
      () => {
        this.onResizeEnd();
      },
      'ns-resize'
    );
    this._makeButton(
      this.rotateButton,
      event => {
        this.onRotate(event.deltaX, event.deltaY);
      },
      () => {
        this.onRotateEnd();
      },
      'url("res/actions/rotate24.png"),auto'
    );
  }

  setScreenType(screenType: ScreenType) {
    this._screenType = screenType;
  }

  _makeButton(
    objectButton: PIXI.Graphics,
    onMove: (event: any) => void,
    onEnd: () => void,
    cursor: string
  ) {
    objectButton.interactive = true;
    objectButton.buttonMode = true;
    objectButton.cursor = cursor;
    gesture.panable(objectButton);
    objectButton.on('panmove', onMove);
    objectButton.on('panend', onEnd);
    this.pixiContainer.addChild(objectButton);
  }

  getPixiContainer() {
    return this.pixiContainer;
  }

  _renderButton(
    show: boolean,
    buttonObject: PIXI.Graphics,
    canvasPosition: [number, number],
    size: number,
    shape: 0 | 1,
    hitAreaPadding: number
  ) {
    buttonObject.clear();
    if (!show) {
      buttonObject.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
      return;
    }

    buttonObject.beginFill(0xffffff);
    buttonObject.lineStyle(1, 0x6868e8, 1);
    buttonObject.fill.alpha = 0.9;
    if (shape === RECTANGLE_BUTTON_SHAPE) {
      buttonObject.drawRect(canvasPosition[0], canvasPosition[1], size, size);
    } else if (shape === CIRCLE_BUTTON_SHAPE) {
      buttonObject.drawCircle(
        canvasPosition[0] + size / 2,
        canvasPosition[1] + size / 2,
        size / 2
      );
    }

    buttonObject.endFill();
    buttonObject.hitArea = new PIXI.Rectangle(
      canvasPosition[0] - hitAreaPadding,
      canvasPosition[1] - hitAreaPadding,
      size + hitAreaPadding * 2,
      size + hitAreaPadding * 2
    );
  }

  render() {
    const {
      buttonSize,
      smallButtonSize,
      buttonPadding,
      hitAreaPadding,
    } = getButtonSizes(this._screenType);
    const selection = this.instancesSelection.getSelectedInstances();
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

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
      this.selectedRectangles[i].fill.alpha = 0.3;
      this.selectedRectangles[i].alpha = 0.8;
      this.selectedRectangles[i].drawRect(
        selectionRectangle.x,
        selectionRectangle.y,
        selectionRectangle.width,
        selectionRectangle.height
      );
      this.selectedRectangles[i].endFill();

      if (i === 0) {
        x1 = instanceRect.x;
        y1 = instanceRect.y;
        x2 = instanceRect.x + instanceRect.width;
        y2 = instanceRect.y + instanceRect.height;
      } else {
        if (instanceRect.x < x1) x1 = instanceRect.x;
        if (instanceRect.y < y1) y1 = instanceRect.y;
        if (instanceRect.x + instanceRect.width > x2)
          x2 = instanceRect.x + instanceRect.width;
        if (instanceRect.y + instanceRect.height > y2)
          y2 = instanceRect.y + instanceRect.height;
      }
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
    rightResizeButtonPos[1] -= smallButtonSize / 2;

    const bottomResizeButtonPos = this.toCanvasCoordinates(
      x1 + (x2 - x1) / 2,
      y2
    );
    bottomResizeButtonPos[0] -= smallButtonSize / 2;
    bottomResizeButtonPos[1] += buttonPadding;

    const rotateButtonPos = this.toCanvasCoordinates(x1 + (x2 - x1) / 2, y1);
    rotateButtonPos[0] -= smallButtonSize / 2;
    rotateButtonPos[1] -= buttonPadding * 4;

    this._renderButton(
      show,
      this.resizeButton,
      resizeButtonPos,
      buttonSize,
      RECTANGLE_BUTTON_SHAPE,
      hitAreaPadding
    );
    this._renderButton(
      show,
      this.rightResizeButton,
      rightResizeButtonPos,
      smallButtonSize,
      RECTANGLE_BUTTON_SHAPE,
      hitAreaPadding
    );
    this._renderButton(
      show,
      this.bottomResizeButton,
      bottomResizeButtonPos,
      smallButtonSize,
      RECTANGLE_BUTTON_SHAPE,
      hitAreaPadding
    );
    this._renderButton(
      show,
      this.rotateButton,
      rotateButtonPos,
      smallButtonSize,
      CIRCLE_BUTTON_SHAPE,
      hitAreaPadding
    );
  }
}

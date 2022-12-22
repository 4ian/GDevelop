// @flow
import * as PIXI from 'pixi.js-legacy';
import Rectangle from '../Utils/Rectangle';
import { type InstanceMeasurer } from './InstancesRenderer';
const gd: libGDevelop = global.gd;

const getRectangleNormalizedBoundaries = ({
  startX,
  startY,
  endX,
  endY,
}: {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
}) => {
  let normalizedStartX = startX;
  let normalizedStartY = startY;
  let normalizedEndX = endX;
  let normalizedEndY = endY;
  if (normalizedStartX > normalizedEndX) {
    const tmp = normalizedStartX;
    normalizedStartX = normalizedEndX;
    normalizedEndX = tmp;
  }
  if (normalizedStartY > normalizedEndY) {
    const tmp = normalizedStartY;
    normalizedStartY = normalizedEndY;
    normalizedEndY = tmp;
  }
  return {
    startX: normalizedStartX,
    startY: normalizedStartY,
    endX: normalizedEndX,
    endY: normalizedEndY,
  };
};

export default class SelectionRectangle {
  instances: gdInitialInstancesContainer;
  instanceMeasurer: InstanceMeasurer;
  toSceneCoordinates: (x: number, y: number) => [number, number];

  pixiRectangle: PIXI.Graphics;
  selectionRectangleStart: { x: number, y: number } | null;
  selectionRectangleEnd: { x: number, y: number } | null;
  temporarySelectionRectangleStart: { x: number, y: number } | null;
  temporarySelectionRectangleEnd: { x: number, y: number } | null;
  _instancesInSelectionRectangle: gdInitialInstance[];
  _temporaryInstancesInSelectionRectangle: gdInitialInstance[];

  selector: gdInitialInstanceJSFunctor;
  temporarySelector: gdInitialInstanceJSFunctor;
  /**
   * Used to check if an instance is in the selection rectangle
   */
  _temporaryAABB: Rectangle;

  constructor({
    instances,
    instanceMeasurer,
    toSceneCoordinates,
  }: {
    instances: gdInitialInstancesContainer,
    instanceMeasurer: InstanceMeasurer,
    toSceneCoordinates: (x: number, y: number) => [number, number],
  }) {
    this.instances = instances;
    this.instanceMeasurer = instanceMeasurer;
    this.toSceneCoordinates = toSceneCoordinates;

    this.pixiRectangle = new PIXI.Graphics();
    this.pixiRectangle.hitArea = new PIXI.Rectangle(0, 0, 0, 0);
    this.selectionRectangleStart = null;
    this.selectionRectangleEnd = null;
    this._instancesInSelectionRectangle = [];
    this._temporaryInstancesInSelectionRectangle = [];

    this._temporaryAABB = new Rectangle();
    this.selector = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - invoke is not writable
    this.selector.invoke = instancePtr => {
      // $FlowFixMe - wrapPointer is not exposed
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);
      const instanceAABB = this.instanceMeasurer.getInstanceAABB(
        instance,
        this._temporaryAABB
      );

      const { selectionRectangleEnd, selectionRectangleStart } = this;
      if (!selectionRectangleStart || !selectionRectangleEnd) return;

      const selectionSceneStart = toSceneCoordinates(
        selectionRectangleStart.x,
        selectionRectangleStart.y
      );
      const selectionSceneEnd = toSceneCoordinates(
        selectionRectangleEnd.x,
        selectionRectangleEnd.y
      );

      if (
        selectionSceneStart[0] <= instanceAABB.left &&
        instanceAABB.right <= selectionSceneEnd[0] &&
        selectionSceneStart[1] <= instanceAABB.top &&
        instanceAABB.bottom <= selectionSceneEnd[1]
      ) {
        this._instancesInSelectionRectangle.push(instance);
      }
    };
    this.temporarySelector = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - invoke is not writable
    this.temporarySelector.invoke = instancePtr => {
      // $FlowFixMe - wrapPointer is not exposed
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);
      const instanceAABB = this.instanceMeasurer.getInstanceAABB(
        instance,
        this._temporaryAABB
      );

      const {
        temporarySelectionRectangleEnd,
        temporarySelectionRectangleStart,
      } = this;
      if (!temporarySelectionRectangleStart || !temporarySelectionRectangleEnd)
        return;

      const selectionSceneStart = toSceneCoordinates(
        temporarySelectionRectangleStart.x,
        temporarySelectionRectangleStart.y
      );
      const selectionSceneEnd = toSceneCoordinates(
        temporarySelectionRectangleEnd.x,
        temporarySelectionRectangleEnd.y
      );

      if (
        selectionSceneStart[0] <= instanceAABB.left &&
        instanceAABB.right <= selectionSceneEnd[0] &&
        selectionSceneStart[1] <= instanceAABB.top &&
        instanceAABB.bottom <= selectionSceneEnd[1]
      ) {
        this._temporaryInstancesInSelectionRectangle.push(instance);
      }
    };
  }

  hasStartedSelectionRectangle() {
    return this.selectionRectangleStart;
  }

  startSelectionRectangle = (x: number, y: number) => {
    this.selectionRectangleStart = { x, y };
    this.selectionRectangleEnd = { x, y };
  };

  updateSelectionRectangle = (
    lastX: number,
    lastY: number
  ): Array<gdInitialInstance> => {
    if (!this.selectionRectangleStart)
      this.selectionRectangleStart = { x: lastX, y: lastY };

    this.selectionRectangleEnd = { x: lastX, y: lastY };
    this._temporaryInstancesInSelectionRectangle.length = 0;
    const normalizedSelectionRectangle = getRectangleNormalizedBoundaries({
      startX: this.selectionRectangleStart.x,
      startY: this.selectionRectangleStart.y,
      endX: this.selectionRectangleEnd.x,
      endY: this.selectionRectangleEnd.y,
    });
    this.temporarySelectionRectangleStart = {
      x: normalizedSelectionRectangle.startX,
      y: normalizedSelectionRectangle.startY,
    };
    this.temporarySelectionRectangleEnd = {
      x: normalizedSelectionRectangle.endX,
      y: normalizedSelectionRectangle.endY,
    };

    this.instances.iterateOverInstances(
      // $FlowFixMe - gd.castObject is not supporting typings.
      this.temporarySelector
    );
    return this._temporaryInstancesInSelectionRectangle;
  };

  endSelectionRectangle = (): Array<gdInitialInstance> => {
    if (!this.selectionRectangleStart || !this.selectionRectangleEnd) return [];

    this._instancesInSelectionRectangle.length = 0;
    const normalizedSelectionRectangle = getRectangleNormalizedBoundaries({
      startX: this.selectionRectangleStart.x,
      startY: this.selectionRectangleStart.y,
      endX: this.selectionRectangleEnd.x,
      endY: this.selectionRectangleEnd.y,
    });
    this.selectionRectangleStart = {
      x: normalizedSelectionRectangle.startX,
      y: normalizedSelectionRectangle.startY,
    };
    this.selectionRectangleEnd = {
      x: normalizedSelectionRectangle.endX,
      y: normalizedSelectionRectangle.endY,
    };
    this.instances.iterateOverInstances(
      // $FlowFixMe - gd.castObject is not supporting typings.
      this.selector
    );

    this.selectionRectangleStart = null;
    return this._instancesInSelectionRectangle;
  };

  getPixiObject() {
    return this.pixiRectangle;
  }

  render() {
    if (!this.selectionRectangleStart || !this.selectionRectangleEnd) {
      this.pixiRectangle.visible = false;
      return;
    }

    let x1 = this.selectionRectangleStart.x;
    let y1 = this.selectionRectangleStart.y;
    let x2 = this.selectionRectangleEnd.x;
    let y2 = this.selectionRectangleEnd.y;

    this.pixiRectangle.visible = true;
    this.pixiRectangle.clear();
    this.pixiRectangle.beginFill(0x6868e8);
    this.pixiRectangle.lineStyle(1, 0x6868e8, 1);
    this.pixiRectangle.fill.alpha = 0.1;
    this.pixiRectangle.alpha = 0.8;
    this.pixiRectangle.drawRect(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.abs(x2 - x1),
      Math.abs(y2 - y1)
    );
    this.pixiRectangle.endFill();
  }

  delete() {
    this.selector.delete();
  }
}

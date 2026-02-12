// @flow
import * as PIXI from 'pixi.js-legacy';
import Rectangle from '../Utils/Rectangle';
import { type InstanceMeasurer } from './InstancesRenderer';
const gd: libGDevelop = global.gd;

export default class SelectionRectangle {
  instances: gdInitialInstancesContainer;
  instanceMeasurer: InstanceMeasurer;
  toSceneCoordinates: (x: number, y: number) => [number, number];

  pixiRectangle: PIXI.Graphics;
  selectionRectangleStart: { x: number, y: number } | null;
  selectionRectangleEnd: { x: number, y: number } | null;
  _instancesInSelectionRectangle: gdInitialInstance[];

  selector: gdInitialInstanceJSFunctor;
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
  }

  hasStartedSelectionRectangle() {
    return this.selectionRectangleStart;
  }

  startSelectionRectangle = (x: number, y: number) => {
    this.selectionRectangleStart = { x, y };
    this.selectionRectangleEnd = { x, y };
  };

  updateSelectionRectangle = (lastX: number, lastY: number) => {
    if (!this.selectionRectangleStart)
      this.selectionRectangleStart = { x: lastX, y: lastY };

    this.selectionRectangleEnd = { x: lastX, y: lastY };
  };

  endSelectionRectangle = () => {
    if (!this.selectionRectangleStart || !this.selectionRectangleEnd) return [];

    this._instancesInSelectionRectangle.length = 0;
    if (this.selectionRectangleStart.x > this.selectionRectangleEnd.x) {
      const tmp = this.selectionRectangleStart.x;
      this.selectionRectangleStart.x = this.selectionRectangleEnd.x;
      this.selectionRectangleEnd.x = tmp;
    }
    if (this.selectionRectangleStart.y > this.selectionRectangleEnd.y) {
      const tmp = this.selectionRectangleStart.y;
      this.selectionRectangleStart.y = this.selectionRectangleEnd.y;
      this.selectionRectangleEnd.y = tmp;
    }

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

// @flow
import Rectangle from '../Utils/Rectangle';
import { roundPosition } from '../Utils/GridHelpers';

export type ResizeGrabbingLocation = "TopLeft" | "BottomLeft" | "BottomRight" | "TopRight" | "Top" | "Left" | "Bottom" | "Right";

export const resizeGrabbingLocationValues = ["TopLeft", "BottomLeft", "BottomRight", "TopRight", "Top", "Left", "Bottom", "Right"];

export const resizeGrabbingRelativePositions = {
  TopLeft: [0, 0],
  BottomLeft: [0, 1],
  BottomRight: [1, 1],
  TopRight: [1, 0],
  Top: [0.5, 0],
  Left: [0, 0.5],
  Bottom: [0.5, 1],
  Right: [1, 0.5],
};

export const isFreeOnX = (location: ResizeGrabbingLocation) =>
  location !== "Top" && location !== "Bottom";

export const isFreeOnY = (location: ResizeGrabbingLocation) =>
  location !== "Left" && location !== "Right";

export default class InstancesResizer {
  instanceMeasurer: any;
  options: Object;
  _initialSelectionAABB: ?Rectangle = null;
  _instanceOBBs: { [number]: Rectangle } = {};
  _instanceAABBs: { [number]: Rectangle } = {};
  _instancePositions: { [number]: { x: number, y: number } } = {};
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;

  _temporaryGrabbingPosition: [number, number] = [0, 0];

  constructor({
    instanceMeasurer,
    options,
  }: {
    instanceMeasurer: any,
    options: Object,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
  }

  setOptions(options: Object) {
    this.options = options;
  }

  _getOrCreateAABB(instance: gdInitialInstance) {
    let initialAABB = this._instanceAABBs[instance.ptr];
    if (!initialAABB) {
      initialAABB = new Rectangle();
      initialAABB = this.instanceMeasurer.getInstanceAABB(
        instance,
        initialAABB
      );
      this._instanceAABBs[instance.ptr] = initialAABB;
    }
    return initialAABB;
  }

  _getOrCreateOBB(instance: gdInitialInstance) {
    let initialOBB = this._instanceOBBs[instance.ptr];
    if (!initialOBB) {
      initialOBB = new Rectangle();
      initialOBB = this.instanceMeasurer.getInstanceOBB(
        instance,
        initialOBB
      );
      this._instanceOBBs[instance.ptr] = initialOBB;
    }
    return initialOBB;
  }

  _getOrCreatePosition(instance: gdInitialInstance) {
    let initialPosition = this._instancePositions[instance.ptr];
    if (!initialPosition) {
      initialPosition = this._instancePositions[instance.ptr] = {
        x: instance.getX(),
        y: instance.getY(),
      };
    }
    return initialPosition;
  }

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): Rectangle {
    let initialSelectionAABB = this._initialSelectionAABB;
    if (!initialSelectionAABB) {
      initialSelectionAABB = new Rectangle();
      initialSelectionAABB.setRectangle(this._getOrCreateAABB(instances[0]));
      for (let i = 1; i < instances.length; i++) {
        initialSelectionAABB.union(this._getOrCreateAABB(instances[i]));
      }
      this._initialSelectionAABB = initialSelectionAABB;
    }
    return initialSelectionAABB;
  }

  resizeBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    grabbingLocation: ResizeGrabbingLocation,
    proportional: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;
    
    let hasRotatedInstance = false;
    for (let i = 0; i < instances.length && !hasRotatedInstance; i++) {
      const selectedInstance = instances[i];
      hasRotatedInstance = selectedInstance.getAngle() !== 0;
    }
    
    const initialSelectionAABB = this._getOrCreateSelectionAABB(instances);

    let roundedTotalDeltaX;
    let roundedTotalDeltaY;
    if (this.options.snap) {
      const grabbingRelativePosition = resizeGrabbingRelativePositions[grabbingLocation];
      const initialGrabbingX = initialSelectionAABB.left + initialSelectionAABB.width() * grabbingRelativePosition[0];
      const initialGrabbingY = initialSelectionAABB.top + initialSelectionAABB.height() * grabbingRelativePosition[1];
      const grabbingPosition = this._temporaryGrabbingPosition;
      grabbingPosition[0] = initialGrabbingX + this.totalDeltaX;
      grabbingPosition[1] = initialGrabbingY + this.totalDeltaY;
      roundPosition(grabbingPosition, this.options.gridWidth, this.options.gridHeight, this.options.gridOffsetX, this.options.gridOffsetY, this.options.gridType);
      roundedTotalDeltaX = grabbingPosition[0] - initialGrabbingX;
      roundedTotalDeltaY = grabbingPosition[1] - initialGrabbingY;
    } else {
      roundedTotalDeltaX = this.totalDeltaX;
      roundedTotalDeltaY = this.totalDeltaY;
    }
    if (!isFreeOnX(grabbingLocation)) {
      roundedTotalDeltaX = 0;
    }
    if (!isFreeOnY(grabbingLocation)) {
      roundedTotalDeltaY = 0;
    }

    const isLeft = grabbingLocation === "TopLeft" || grabbingLocation === "BottomLeft" || grabbingLocation === "Left";
    const isTop = grabbingLocation === "TopLeft" || grabbingLocation === "TopRight" || grabbingLocation === "Top";

    const flippedTotalDeltaX = (isLeft ? -roundedTotalDeltaX : roundedTotalDeltaX);
    const flippedTotalDeltaY = (isTop ? -roundedTotalDeltaY : roundedTotalDeltaY);

    let scaleX = (initialSelectionAABB.width() + flippedTotalDeltaX) / initialSelectionAABB.width();
    let scaleY = (initialSelectionAABB.height() + flippedTotalDeltaY) / initialSelectionAABB.height();
    let translationX = isLeft ? roundedTotalDeltaX : 0;
    let translationY = isTop ? roundedTotalDeltaY : 0;
    if (proportional || hasRotatedInstance) {
      if (!flippedTotalDeltaY ||
        (flippedTotalDeltaX &&
          flippedTotalDeltaX * initialSelectionAABB.height() >
          initialSelectionAABB.width() * flippedTotalDeltaY)) {
        scaleY = scaleX;
        if (translationY != 0) {
          translationY = roundedTotalDeltaX * initialSelectionAABB.height() / initialSelectionAABB.width();
          if (isLeft != isTop) {
            translationY = -translationY;
          }
        }
      } else {
        scaleX = scaleY;
        if (translationX != 0) {
          translationX = roundedTotalDeltaY * initialSelectionAABB.width() / initialSelectionAABB.height();
          if (isLeft != isTop) {
            translationX = -translationX;
          }
        }
      }
    }

    
    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialOBB = this._getOrCreateOBB(selectedInstance);
      let initialPosition = this._getOrCreatePosition(selectedInstance);

      selectedInstance.setCustomWidth(
        scaleX * initialOBB.width()
      );
      selectedInstance.setCustomHeight(
        scaleY * initialOBB.height()
      );
      selectedInstance.setHasCustomSize(true);
      selectedInstance.setX(
        initialPosition.x + translationX + (initialOBB.left - initialSelectionAABB.left) * (scaleX - 1)
      );
      selectedInstance.setY(
        initialPosition.y + translationY + (initialOBB.top - initialSelectionAABB.top) * (scaleY - 1)
      );
    }
  }

  endResize() {
    this._initialSelectionAABB = null;
    this._instanceOBBs = {};
    this._instanceAABBs = {};
    this._instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

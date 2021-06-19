// @flow
import Rectangle from '../Utils/Rectangle';
import { roundPosition } from '../Utils/GridHelpers';

export type ResizeAnchorLocation = "TopLeft" | "Top" | "Left";

const grabbingRelativePositions = {
  TopLeft: [1, 1],
  Top: [0, 1],
  Left: [1, 0],
};

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
      initialSelectionAABB.set(this._getOrCreateAABB(instances[0]));
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
    anchorLocation: ResizeAnchorLocation,
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
      const grabbingRelativePosition = grabbingRelativePositions[anchorLocation];
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
    if (anchorLocation === "Top") {
      roundedTotalDeltaX = 0;
    }
    if (anchorLocation === "Left") {
      roundedTotalDeltaY = 0;
    }

    let scaleX = (initialSelectionAABB.width() + roundedTotalDeltaX) / initialSelectionAABB.width();
    let scaleY = (initialSelectionAABB.height() + roundedTotalDeltaY) / initialSelectionAABB.height();
    if (proportional || hasRotatedInstance) {
      scaleX =
        (!roundedTotalDeltaY ||
        (roundedTotalDeltaX &&
          roundedTotalDeltaX * initialSelectionAABB.height() >
          initialSelectionAABB.width() * roundedTotalDeltaY))
          ? scaleX
          : scaleY;
      scaleY = scaleX;
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
        initialPosition.x + (initialOBB.left - initialSelectionAABB.left) * (scaleX - 1)
      );
      selectedInstance.setY(
        initialPosition.y + (initialOBB.top - initialSelectionAABB.top) * (scaleY - 1)
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

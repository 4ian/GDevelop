// @flow
import Rectangle from '../Utils/Rectangle';

export type ResizeAnchorLocation = "TopLeft" | "Top" | "Left";

export default class InstancesResizer {
  instanceMeasurer: any;
  options: Object;
  _initialSelectionAABB: ?Rectangle = null;
  _instanceOBBs: { [number]: Rectangle } = {};
  _instanceAABBs: { [number]: Rectangle } = {};
  _instancePositions: { [number]: { x: number, y: number } } = {};
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;

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

  //TODO make the dragged square magnet to the grid instead.
  _roundWidth(width: number) {
    if (!this.options.snap || !this.options.grid || this.options.gridWidth <= 0)
      return Math.max(Math.round(width), 1);

    return Math.max(
      Math.round(width / this.options.gridWidth) * this.options.gridWidth,
      1
    );
  }
  _roundHeight(height: number) {
    if (
      !this.options.snap ||
      !this.options.grid ||
      this.options.gridHeight <= 0
    )
      return Math.max(Math.round(height), 1);

    return Math.max(
      Math.round(height / this.options.gridHeight) * this.options.gridHeight,
      1
    );
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
    if (anchorLocation !== "Top") {
      this.totalDeltaX += deltaX;
    }
    if (anchorLocation !== "Left") {
      this.totalDeltaY += deltaY;
    }
    
    let hasRotatedInstance = false;
    for (let i = 0; i < instances.length && !hasRotatedInstance; i++) {
      const selectedInstance = instances[i];
      hasRotatedInstance = selectedInstance.getAngle() !== 0;
    }
    
    const initialSelectionAABB = this._getOrCreateSelectionAABB(instances);
    let scaleX = (initialSelectionAABB.width() + this.totalDeltaX) / initialSelectionAABB.width();
    let scaleY = (initialSelectionAABB.height() + this.totalDeltaY) / initialSelectionAABB.height();
    if (proportional || hasRotatedInstance) {
      scaleX =
        (!this.totalDeltaY ||
        (this.totalDeltaX &&
          this.totalDeltaX * initialSelectionAABB.height() >
          initialSelectionAABB.width() * this.totalDeltaY))
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

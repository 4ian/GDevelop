// @flow
import Rectangle from '../Utils/Rectangle';

export default class InstancesResizer {
  instanceMeasurer: any;
  options: Object;
  initialSelectionAABB: ?Rectangle;
  instanceOBBs: { [number]: Rectangle };
  instanceAABBs: { [number]: Rectangle };
  instancePositions: { [number]: { x: number, y: number } };
  totalDeltaX: number;
  totalDeltaY: number;

  constructor({
    instanceMeasurer,
    options,
  }: {
    instanceMeasurer: any,
    options: Object,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
    this.instanceOBBs = {};
    this.instanceAABBs = {};
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  setOptions(options: Object) {
    this.options = options;
  }

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

  _getSizeDeltaX(proportional: boolean, initialOBB: Rectangle) {
    if (proportional && Math.abs(this.totalDeltaX) < Math.abs(this.totalDeltaY))
      return (initialOBB.width() / initialOBB.height()) * this.totalDeltaY;

    return this.totalDeltaX;
  }

  _getSizeDeltaY(proportional: boolean, initialOBB: Rectangle) {
    if (proportional && Math.abs(this.totalDeltaY) < Math.abs(this.totalDeltaX))
      return (initialOBB.height() / initialOBB.width()) * this.totalDeltaX;

    return this.totalDeltaY;
  }

  _getOrCreateAABB(instance: gdInitialInstance) {
    let initialAABB = this.instanceAABBs[instance.ptr];
    if (!initialAABB) {
      initialAABB = new Rectangle();
      initialAABB = this.instanceMeasurer.getInstanceAABB(
        instance,
        initialAABB
      );
      this.instanceAABBs[instance.ptr] = initialAABB;
    }
    return initialAABB;
  }

  resizeBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    proportional: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;
    
    if (!this.initialSelectionAABB) {
      this.initialSelectionAABB = new Rectangle();
      this.initialSelectionAABB.set(this._getOrCreateAABB(instances[0]));
      for (let i = 1; i < instances.length; i++) {
        this.initialSelectionAABB.union(this._getOrCreateAABB(instances[i]));
      }
    }

    let hasRotatedInstance = false;
    for (let i = 0; i < instances.length && !hasRotatedInstance; i++) {
      const selectedInstance = instances[i];
      hasRotatedInstance = selectedInstance.getAngle() !== 0;
    }

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      // already populated above
      let initialAABB = this._getOrCreateAABB(selectedInstance);

      let initialOBB = this.instanceOBBs[selectedInstance.ptr];
      if (!initialOBB) {
        initialOBB = new Rectangle();
        initialOBB = this.instanceMeasurer.getInstanceOBB(
          selectedInstance,
          initialOBB
        );
        this.instanceOBBs[selectedInstance.ptr] = initialOBB;
      }

      if (!selectedInstance.hasCustomSize()) {
        selectedInstance.setCustomWidth(
          initialOBB.width()
        );
        selectedInstance.setCustomHeight(
          initialOBB.height()
        );
      }

      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        };
      }

      selectedInstance.setHasCustomSize(true);
      if (hasRotatedInstance) {
        const ratio =
          !this.totalDeltaY ||
          (this.totalDeltaX &&
            this.totalDeltaX * this.initialSelectionAABB.height() >
            this.initialSelectionAABB.width() * this.totalDeltaY)
            ? (this.initialSelectionAABB.width() + this.totalDeltaX) / this.initialSelectionAABB.width()
            : (this.initialSelectionAABB.height() + this.totalDeltaY) / this.initialSelectionAABB.height();
        selectedInstance.setCustomWidth(
          this._roundWidth(ratio * initialOBB.width())
        );
        selectedInstance.setCustomHeight(
          this._roundHeight(ratio * initialOBB.height())
        );
        selectedInstance.setX(
          initialPosition.x + (initialAABB.left - this.initialSelectionAABB.left + initialOBB.left - initialAABB.left) * (ratio - 1)
        );
        selectedInstance.setY(
          initialPosition.y + (initialAABB.top - this.initialSelectionAABB.top + initialOBB.top - initialAABB.top) * (ratio - 1)
        );
      } else {
        const scaleX = (this.initialSelectionAABB.width() + this._getSizeDeltaX(proportional, initialOBB)) / this.initialSelectionAABB.width();
        const scaleY = (this.initialSelectionAABB.height() + this._getSizeDeltaY(proportional, initialOBB)) / this.initialSelectionAABB.height();

        selectedInstance.setCustomWidth(
          this._roundWidth(
            initialOBB.width() * scaleX
          )
        );
        selectedInstance.setCustomHeight(
          this._roundHeight(
            initialOBB.height() * scaleY
          )
        );
        selectedInstance.setX(
          initialPosition.x + (initialAABB.left - this.initialSelectionAABB.left) * scaleX
        );
        selectedInstance.setY(
          initialPosition.y + (initialAABB.top - this.initialSelectionAABB.top) * scaleY
        );
      }
    }
  }

  endResize() {
    this.initialSelectionAABB = null;
    this.instanceOBBs = {};
    this.instanceAABBs = {};
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

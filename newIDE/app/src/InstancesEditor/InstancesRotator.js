// @flow
import Rectangle from '../Utils/Rectangle';

export default class InstancesRotator {
  _instanceMeasurer: any;
  _instanceAngles: { [number]: number } = {};
  _instancePositions: { [number]: { x: number, y: number } } = {};
  _instanceAABBs: { [number]: Rectangle } = {};
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;
  _anchorIsUpToDate: boolean = false;
  _anchor: [number, number] = [0, 0];

  constructor(instanceMeasurer: any) {
    this._instanceMeasurer = instanceMeasurer;
  }

  _getNewAngle(proportional: boolean, initialAngle: number) {
    const angle =
      (Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180) / Math.PI +
      90 +
      initialAngle;
    return proportional ? Math.round(angle / 15) * 15 : angle;
  }

  _getOrCreateInstanceAABB(instance: gdInitialInstance) {
    let initialAABB = this._instanceAABBs[instance.ptr];
    if (initialAABB) {
      return initialAABB;
    }
    initialAABB = new Rectangle();
    initialAABB = this._instanceMeasurer.getInstanceAABB(instance, initialAABB);
    this._instanceAABBs[instance.ptr] = initialAABB;
    return initialAABB;
  }

  _getOrCreateInstanceOriginPosition(instance: gdInitialInstance) {
    let initialPosition = this._instancePositions[instance.ptr];
    if (initialPosition) {
      return initialPosition;
    }
    initialPosition = this._instancePositions[instance.ptr] = {
      x: instance.getX(),
      y: instance.getY(),
    };
    return initialPosition;
  }

  rotateBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    proportional: boolean
  ) {
    if (!this._anchorIsUpToDate) {
      this._anchorIsUpToDate = true;
      let selectionAABB = new Rectangle();
      selectionAABB.setRectangle(this._getOrCreateInstanceAABB(instances[0]));
      for (let i = 1; i < instances.length; i++) {
        selectionAABB.union(this._getOrCreateInstanceAABB(instances[i]));
      }
      this._anchor[0] = selectionAABB.centerX();
      this._anchor[1] = selectionAABB.centerY();
      // Because the button is on top.
      this.totalDeltaY -= selectionAABB.height() / 2;
    }

    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialAABB = this._getOrCreateInstanceAABB(selectedInstance);

      let initialAngle = this._instanceAngles[selectedInstance.ptr];
      if (initialAngle === undefined) {
        initialAngle = this._instanceAngles[
          selectedInstance.ptr
        ] = selectedInstance.getAngle();
      }

      let initialInstanceOriginPosition = this._getOrCreateInstanceOriginPosition(
        selectedInstance
      );

      const degreeAngle = this._getNewAngle(proportional, initialAngle);
      selectedInstance.setAngle(((degreeAngle % 360) + 360) % 360);

      const rotationAngle = ((degreeAngle - initialAngle) * Math.PI) / 180;
      const cosa = Math.cos(-rotationAngle);
      const sina = Math.sin(-rotationAngle);
      const deltaX = initialAABB.centerX() - this._anchor[0];
      const deltaY = initialAABB.centerY() - this._anchor[1];
      selectedInstance.setX(
        this._anchor[0] +
          (initialInstanceOriginPosition.x - initialAABB.centerX()) +
          cosa * deltaX +
          sina * deltaY
      );
      selectedInstance.setY(
        this._anchor[1] +
          (initialInstanceOriginPosition.y - initialAABB.centerY()) -
          sina * deltaX +
          cosa * deltaY
      );
    }
  }

  endRotate() {
    this._instanceAngles = {};
    this._instancePositions = {};
    this._instanceAABBs = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._anchorIsUpToDate = false;
  }
}

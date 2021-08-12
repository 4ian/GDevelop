// @flow
import Rectangle from '../Utils/Rectangle';

export default class InstancesRotator {
  _instanceMeasurer: any;

  // Initial state of the instances
  // from which the rotation is calculated.
  _instanceAngles: { [number]: number } = {};
  _instancePositions: { [number]: {| x: number, y: number |} } = {};
  _instanceAABBs: { [number]: Rectangle } = {};

  totalDeltaX: number = 0;
  totalDeltaY: number = 0;

  /**
   * The fixed point is invalidated when the rotation end.
   */
  _fixedPointIsUpToDate: boolean = false;

  // TODO: the fixed point could be made draggable.
  /**
   * The fixed point is the center of the selection
   */
  _fixedPoint: [number, number] = [0, 0];

  constructor(instanceMeasurer: any) {
    this._instanceMeasurer = instanceMeasurer;
  }

  _getNewAngle(proportional: boolean, initialAngle: number) {
    // The grabbable handle for rotation is on top.
    // Initially, totalDelta = (0 , selectionAABB.height() / 2)
    // (see the affectation of totalDeltaY in the rotateBy method).
    // So the initial angle given by atan2 is -90.
    // 90 is added to start with a angle delta of 0.
    const angle =
      (Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180) / Math.PI +
      90 +
      initialAngle;
    return proportional ? Math.round(angle / 15) * 15 : angle;
  }

  _getOrCreateInstanceAABB(instance: gdInitialInstance) {
    const initialAABB = this._instanceAABBs[instance.ptr];
    if (initialAABB) return initialAABB;

    return (this._instanceAABBs[
      instance.ptr
    ] = this._instanceMeasurer.getInstanceAABB(instance, new Rectangle()));
  }

  _getOrCreateInstanceOriginPosition(instance: gdInitialInstance) {
    const initialPosition = this._instancePositions[instance.ptr];
    if (initialPosition) return initialPosition;

    return (this._instancePositions[instance.ptr] = {
      x: instance.getX(),
      y: instance.getY(),
    });
  }

  _getOrCreateInstanceAngle(instance: gdInitialInstance) {
    const initialAngle = this._instanceAngles[instance.ptr];
    if (initialAngle !== undefined) return initialAngle;

    return (this._instanceAngles[instance.ptr] = instance.getAngle());
  }

  rotateBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    proportional: boolean
  ) {
    if (!this._fixedPointIsUpToDate) {
      this._fixedPointIsUpToDate = true;
      let selectionAABB = new Rectangle();
      selectionAABB.setRectangle(this._getOrCreateInstanceAABB(instances[0]));
      for (let i = 1; i < instances.length; i++) {
        selectionAABB.union(this._getOrCreateInstanceAABB(instances[i]));
      }
      this._fixedPoint[0] = selectionAABB.centerX();
      this._fixedPoint[1] = selectionAABB.centerY();

      // Because the button is on top, consider the initial rotation vector to
      // be directed to the top.
      this.totalDeltaY -= selectionAABB.height() / 2;
    }

    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      const initialAABB = this._getOrCreateInstanceAABB(selectedInstance);
      const initialAngle = this._getOrCreateInstanceAngle(selectedInstance);
      const initialInstanceOriginPosition = this._getOrCreateInstanceOriginPosition(
        selectedInstance
      );

      const degreeAngle = this._getNewAngle(proportional, initialAngle);
      selectedInstance.setAngle(((degreeAngle % 360) + 360) % 360);

      const rotationAngle = ((degreeAngle - initialAngle) * Math.PI) / 180;
      const cosa = Math.cos(-rotationAngle);
      const sina = Math.sin(-rotationAngle);
      const deltaX = initialAABB.centerX() - this._fixedPoint[0];
      const deltaY = initialAABB.centerY() - this._fixedPoint[1];
      selectedInstance.setX(
        this._fixedPoint[0] +
          (initialInstanceOriginPosition.x - initialAABB.centerX()) +
          cosa * deltaX +
          sina * deltaY
      );
      selectedInstance.setY(
        this._fixedPoint[1] +
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
    this._fixedPointIsUpToDate = false;
  }
}

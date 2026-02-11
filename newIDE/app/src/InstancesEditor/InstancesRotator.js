// @flow
import Rectangle from '../Utils/Rectangle';
import { type InstanceMeasurer } from './InstancesRenderer';

export default class InstancesRotator {
  _instanceMeasurer: InstanceMeasurer;

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

  /**
   * The initial rotation button position, used to calculate the correct
   * initial angle when the selection is already rotated.
   */
  _initialButtonPosition: [number, number] | null = null;

  /**
   * The initial angle offset calculated from the button position.
   * This is subtracted from the calculated angle to prevent jumps.
   */
  _initialAngleOffset: number = 0;

  constructor(instanceMeasurer: InstanceMeasurer) {
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
      initialAngle -
      this._initialAngleOffset;
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
    const nonLockedInstances = instances.filter(
      instance => !instance.isLocked()
    );

    if (!this._fixedPointIsUpToDate) {
      this._fixedPointIsUpToDate = true;
      let selectionAABB = new Rectangle();
      selectionAABB.setRectangle(
        this._getOrCreateInstanceAABB(nonLockedInstances[0])
      );
      for (let i = 1; i < nonLockedInstances.length; i++) {
        selectionAABB.union(
          this._getOrCreateInstanceAABB(nonLockedInstances[i])
        );
      }
      this._fixedPoint[0] = selectionAABB.centerX();
      this._fixedPoint[1] = selectionAABB.centerY();

      // If we have an initial button position set, use it to calculate the initial vector
      if (this._initialButtonPosition) {
        this.totalDeltaX += this._initialButtonPosition[0] - this._fixedPoint[0];
        this.totalDeltaY += this._initialButtonPosition[1] - this._fixedPoint[1];

        // Calculate the initial angle offset from the button position
        // This is the angle that the button currently represents
        this._initialAngleOffset =
          (Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180) / Math.PI + 90;
      } else {
        // Fallback: assume the button is on top (for backwards compatibility)
        this.totalDeltaY -= selectionAABB.height() / 2;
        this._initialAngleOffset = 0;
      }
    }

    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < nonLockedInstances.length; i++) {
      const selectedInstance = nonLockedInstances[i];

      const initialAABB = this._getOrCreateInstanceAABB(selectedInstance);
      const initialAngle = this._getOrCreateInstanceAngle(selectedInstance);
      const initialInstanceOriginPosition = this._getOrCreateInstanceOriginPosition(
        selectedInstance
      );

      const degreeAngle = this._getNewAngle(proportional, initialAngle);
      // We round the angle to the nearest degree when an instance is rotated in the editor.
      // This is to avoid having a lot of decimals in the angle of instances.
      // It does not prevent the user from having decimals, when editing the angle manually.
      const newAngle = Math.round(((degreeAngle % 360) + 360) % 360);
      selectedInstance.setAngle(newAngle);

      const rotationAngle = ((degreeAngle - initialAngle) * Math.PI) / 180;
      const cosa = Math.cos(-rotationAngle);
      const sina = Math.sin(-rotationAngle);
      const deltaX = initialAABB.centerX() - this._fixedPoint[0];
      const deltaY = initialAABB.centerY() - this._fixedPoint[1];
      // We also round the position to the nearest pixel after rotation.
      const newX = Math.round(
        this._fixedPoint[0] +
          (initialInstanceOriginPosition.x - initialAABB.centerX()) +
          cosa * deltaX +
          sina * deltaY
      );
      const newY = Math.round(
        this._fixedPoint[1] +
          (initialInstanceOriginPosition.y - initialAABB.centerY()) -
          sina * deltaX +
          cosa * deltaY
      );
      selectedInstance.setX(newX);
      selectedInstance.setY(newY);
    }
  }

  setInitialButtonPosition(x: number, y: number) {
    this._initialButtonPosition = [x, y];
  }

  endRotate() {
    this._instanceAngles = {};
    this._instancePositions = {};
    this._instanceAABBs = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._fixedPointIsUpToDate = false;
    this._initialButtonPosition = null;
    this._initialAngleOffset = 0;
  }
}

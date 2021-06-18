// @flow
import Rectangle from '../Utils/Rectangle';

export default class InstancesRotator {
  instanceMeasurer: any;
  instanceAngles: { [number]: number } = {};
  instancePositions: { [number]: { x: number, y: number } } = {};
  instanceAABBs: { [number]: Rectangle } = {};
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;
  anchor: ?[number, number] = null;

  constructor(instanceMeasurer: any) {
    this.instanceMeasurer = instanceMeasurer;
  }

  _getNewAngle(proportional: boolean, initialAngle: number) {
    const angle =
      Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180 / Math.PI - 90 +
      initialAngle;
    return proportional ? Math.round(angle / 15) * 15 : angle;
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

  rotateBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    proportional: boolean
  ) {
    if (!this.anchor) {
      let selectionAABB = new Rectangle();
      selectionAABB.set(this._getOrCreateAABB(instances[0]));
      for (let i = 1; i < instances.length; i++) {
        selectionAABB.union(this._getOrCreateAABB(instances[i]));
      }
      this.anchor = [selectionAABB.centerX(), selectionAABB.centerY()];
      this.totalDeltaY -= selectionAABB.height() / 2;
      console.log("selectionAABB: " + selectionAABB);
    }

    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      // already populated above
      let initialAABB = this._getOrCreateAABB(selectedInstance);

      let initialAngle = this.instanceAngles[selectedInstance.ptr];
      if (initialAngle === undefined) {
        initialAngle = this.instanceAngles[
          selectedInstance.ptr
        ] = selectedInstance.getAngle();
      }
      
      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        };
      }

      const degreeAngle = this._getNewAngle(proportional, initialAngle);
      selectedInstance.setAngle(degreeAngle);

      const angle = (degreeAngle - initialAngle) * Math.PI / 180;
      const cosa = Math.cos(-angle);
      const sina = Math.sin(-angle);
      const deltaX = -(initialAABB.centerX() - this.anchor[0]);
      const deltaY = -(initialAABB.centerY() - this.anchor[1]);
      selectedInstance.setX(
        this.anchor[0] + (initialPosition.x - initialAABB.centerX()) + cosa * deltaX + sina * deltaY
      );
      selectedInstance.setY(
        this.anchor[1] + (initialPosition.y - initialAABB.centerY()) - sina * deltaX + cosa * deltaY
      );
    }
  }

  endRotate() {
    this.instanceAngles = {};
    this.instancePositions = {};
    this.instanceAABBs = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this.anchor = null;
  }
}

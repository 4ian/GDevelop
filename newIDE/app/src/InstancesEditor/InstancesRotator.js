export default class InstancesRotator {
  constructor() {
    this.instanceAngles = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  _getNewAngle(proportional: boolean, initialAngle: number) {
    const angle =
      (Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180) / Math.PI +
      initialAngle;
    return proportional ? Math.round(angle / 15) * 15 : angle;
  }

  rotateBy(instances, deltaX, deltaY, proportional) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];
      let initialAngle = this.instanceAngles[selectedInstance.ptr];
      if (initialAngle === undefined) {
        initialAngle = this.instanceAngles[
          selectedInstance.ptr
        ] = selectedInstance.getAngle();
      }
      selectedInstance.setAngle(this._getNewAngle(proportional, initialAngle));
    }
  }

  endRotate() {
    this.instanceAngles = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

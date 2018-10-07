export default class InstancesRotator {
  constructor({ options }) {
    this.options = options;
    this.instanceAngles = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  setOptions(options) {
    this.options = options;
  }

  _getAngleDelta(proportional, initialAngle) {
    let deg = Math.atan2(this.totalDeltaY, this.totalDeltaX) * 180 / Math.PI;
    deg += initialAngle;
    if (proportional) {
      return (deg = Math.round(deg / 45) * 45);
    }
    return deg;
  }

  rotateBy(instances, deltaX, deltaY, proportional) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];
      let initialAngle = this.instanceAngles[selectedInstance.ptr];
      if (!initialAngle) {
        initialAngle = this.instanceAngles[
          selectedInstance.ptr
        ] = selectedInstance.getAngle();
      }
      let newAngle = this._getAngleDelta(proportional, initialAngle);
      selectedInstance.setAngle(newAngle);
    }
  }

  endRotate() {
    this.instanceAngles = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

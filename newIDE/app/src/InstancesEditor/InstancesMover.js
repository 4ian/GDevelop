export default class InstancesResizer {
  constructor({ instanceMeasurer, options }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  setOptions(options) {
    this.options = options;
  }

  _roundXPosition(x) {
    if (!this.options.snap) return x;

    return Math.round(x / this.options.gridWidth) * this.options.gridWidth;
  }

  _roundYPosition(y) {
    if (!this.options.snap) return y;

    return Math.round(y / this.options.gridHeight) * this.options.gridHeight;
  }

  _getMoveDeltaX(followAxis) {
    if (followAxis && Math.abs(this.totalDeltaX) < Math.abs(this.totalDeltaY))
      return 0;

    return this.totalDeltaX;
  }

  _getMoveDeltaY(followAxis) {
    if (followAxis && Math.abs(this.totalDeltaY) < Math.abs(this.totalDeltaX))
      return 0;

    return this.totalDeltaY;
  }

  moveBy(instances, deltaX, deltaY, followAxis) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (var i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = (this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        });
      }

      selectedInstance.setX(
        this._roundXPosition(
          initialPosition.x + this._getMoveDeltaX(followAxis)
        )
      );
      selectedInstance.setY(
        this._roundYPosition(
          initialPosition.y + this._getMoveDeltaY(followAxis)
        )
      );
    }
  }

  endMove() {
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

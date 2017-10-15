export default class InstancesResizer {
  constructor({ instanceMeasurer, options }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
    this.instanceSizes = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  setOptions(options) {
    this.options = options;
  }

  _roundWidth(width) {
    if (!this.options.snap || !this.options.grid) return width;

    return Math.round(width / this.options.gridWidth) * this.options.gridWidth;
  }

  _roundHeight(height) {
    if (!this.options.snap || !this.options.grid) return height;

    return (
      Math.round(height / this.options.gridHeight) * this.options.gridHeight
    );
  }

  _getSizeDeltaX(proportional, initialSize) {
    if (proportional && Math.abs(this.totalDeltaX) < Math.abs(this.totalDeltaY))
      return initialSize.width / initialSize.height * this.totalDeltaY;

    return this.totalDeltaX;
  }

  _getSizeDeltaY(proportional, initialSize) {
    if (proportional && Math.abs(this.totalDeltaY) < Math.abs(this.totalDeltaX))
      return initialSize.height / initialSize.width * this.totalDeltaX;

    return this.totalDeltaY;
  }

  resizeBy(instances, deltaX, deltaY, proportional) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (var i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      if (!selectedInstance.hasCustomSize()) {
        selectedInstance.setCustomWidth(
          this.instanceMeasurer.getInstanceWidth(selectedInstance)
        );
        selectedInstance.setCustomHeight(
          this.instanceMeasurer.getInstanceHeight(selectedInstance)
        );
      }

      let initialSize = this.instanceSizes[selectedInstance.ptr];
      if (!initialSize) {
        initialSize = this.instanceSizes[selectedInstance.ptr] = {
          width: selectedInstance.getCustomWidth(),
          height: selectedInstance.getCustomHeight(),
        };
      }

      selectedInstance.setHasCustomSize(true);
      selectedInstance.setCustomWidth(
        this._roundWidth(
          initialSize.width + this._getSizeDeltaX(proportional, initialSize)
        )
      );
      selectedInstance.setCustomHeight(
        this._roundHeight(
          initialSize.height + this._getSizeDeltaY(proportional, initialSize)
        )
      );
    }
  }

  endResize() {
    this.instanceSizes = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

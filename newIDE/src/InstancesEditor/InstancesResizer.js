export default class InstancesResizer {
  constructor({instanceMeasurer, options}) {
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
    if (!this.options.snap) return width;

    return Math.round(width / this.options.gridWidth) * this.options.gridWidth;
  }

  _roundHeight(height) {
    if (!this.options.snap) return height;

    return Math.round(height / this.options.gridHeight) * this.options.gridHeight;
  }

  resizeBy(instances, deltaX, deltaY) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (var i = 0;i < instances.length;i++) {
      const selectedInstance = instances[i];

      if (!selectedInstance.hasCustomSize()) {
        selectedInstance.setCustomWidth(this.instanceMeasurer.getInstanceWidth(selectedInstance));
        selectedInstance.setCustomHeight(this.instanceMeasurer.getInstanceHeight(selectedInstance));
      }

      let initialSize = this.instanceSizes[selectedInstance.ptr];
      if (!initialSize) {
        initialSize = this.instanceSizes[selectedInstance.ptr] = {
          width: selectedInstance.getCustomWidth(),
          height: selectedInstance.getCustomHeight(),
        }
      }

      selectedInstance.setHasCustomSize(true);
      selectedInstance.setCustomWidth(this._roundWidth(initialSize.width + this.totalDeltaX));
      selectedInstance.setCustomHeight(this._roundHeight(initialSize.height + this.totalDeltaY));
    }
  }

  endResize() {
    this.instanceSizes = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

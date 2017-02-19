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
      selectedInstance.setCustomWidth(initialSize.width + this.totalDeltaX);
      selectedInstance.setCustomHeight(initialSize.height + this.totalDeltaY);
    }
  }

  endResize() {
    this.instanceSizes = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

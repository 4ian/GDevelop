// @flow
type Dimension = {|
  width: number,
  height: number,
|};

export default class InstancesResizer {
  instanceMeasurer: any;
  options: Object;
  instanceSizes: { [number]: Dimension };
  totalDeltaX: number;
  totalDeltaY: number;

  constructor({
    instanceMeasurer,
    options,
  }: {
    instanceMeasurer: any,
    options: Object,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
    this.instanceSizes = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }

  setOptions(options: Object) {
    this.options = options;
  }

  _roundWidth(width: number) {
    if (!this.options.snap || !this.options.grid || this.options.gridWidth <= 0)
      return Math.max(Math.round(width), 1);

    return Math.max(
      Math.round(width / this.options.gridWidth) * this.options.gridWidth,
      1
    );
  }

  _roundHeight(height: number) {
    if (
      !this.options.snap ||
      !this.options.grid ||
      this.options.gridHeight <= 0
    )
      return Math.max(Math.round(height), 1);

    return Math.max(
      Math.round(height / this.options.gridHeight) * this.options.gridHeight,
      1
    );
  }

  _getSizeDeltaX(proportional: boolean, initialSize: Dimension) {
    if (proportional && Math.abs(this.totalDeltaX) < Math.abs(this.totalDeltaY))
      return (initialSize.width / initialSize.height) * this.totalDeltaY;

    return this.totalDeltaX;
  }

  _getSizeDeltaY(proportional: boolean, initialSize: Dimension) {
    if (proportional && Math.abs(this.totalDeltaY) < Math.abs(this.totalDeltaX))
      return (initialSize.height / initialSize.width) * this.totalDeltaX;

    return this.totalDeltaY;
  }

  resizeBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    proportional: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    for (let i = 0; i < instances.length; i++) {
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

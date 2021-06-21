// @flow
import { roundPosition } from '../Utils/GridHelpers';
import Rectangle from '../Utils/Rectangle';
import { Softener, angleDifference } from '../Utils/Math';

export default class InstancesMover {
  instanceMeasurer: any;
  options: Object;
  instancePositions: { [number]: { x: number, y: number } };
  totalDeltaX: number;
  totalDeltaY: number;
  _temporaryPoint: [number, number];
  _initialSelectionAABB: ?Rectangle = null;
  _lastDeltaSumX: Softener = new Softener(8);
  _lastDeltaSumY: Softener = new Softener(8);
  _magnetLeft: boolean = true;
  _magnetTop: boolean = true;
  _lastRoundedTotalDeltaX: number = 0;
  _lastRoundedTotalDeltaY: number = 0;

  constructor({
    instanceMeasurer,
    options,
  }: {
    instanceMeasurer: any,
    options: Object,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._temporaryPoint = [0, 0];
  }

  setOptions(options: Object) {
    this.options = options;
  }

  _getMoveDeltaX(
    totalDeltaX: number,
    totalDeltaY: number,
    followAxis: boolean
  ) {
    if (followAxis && Math.abs(totalDeltaX) < Math.abs(totalDeltaY)) return 0;

    return totalDeltaX;
  }

  _getMoveDeltaY(
    totalDeltaX: number,
    totalDeltaY: number,
    followAxis: boolean
  ) {
    if (followAxis && Math.abs(totalDeltaY) < Math.abs(totalDeltaX)) return 0;

    return totalDeltaY;
  }

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): Rectangle {
    if (this._initialSelectionAABB) {
      return this._initialSelectionAABB;
    }
    let initialSelectionAABB = new Rectangle();
    this.instanceMeasurer.getInstanceAABB(instances[0], initialSelectionAABB);
    const initialInstanceAABB = new Rectangle();
    for (let i = 1; i < instances.length; i++) {
      this.instanceMeasurer.getInstanceAABB(instances[i], initialInstanceAABB);
      initialSelectionAABB.union(initialInstanceAABB);
    }
    this._initialSelectionAABB = initialSelectionAABB;
    return initialSelectionAABB;
  }

  moveBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    followAxis: boolean,
    noGridSnap: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    let roundedTotalDeltaX;
    let roundedTotalDeltaY;
    if (this.options.snap && this.options.grid && !noGridSnap) {
      // Round one side of the selection to the grid
      // according to the cursor direction.

      // This allow to align each side of the selection
      // with a small movement.
      // And also do full column or row jumps
      // to stay fluid on big gestures.

      // more than one delta avoid noise
      this._lastDeltaSumX.push(deltaX);
      this._lastDeltaSumY.push(deltaY);
      const directionAngle =
        (Math.atan2(
          this._lastDeltaSumY.getSum(),
          this._lastDeltaSumX.getSum()
        ) *
          180) /
        Math.PI;

      // leave a 2 * 15° margin to avoid flickering
      if (Math.abs(angleDifference(directionAngle, -90)) < 75) {
        this._magnetTop = true;
      }
      if (Math.abs(angleDifference(directionAngle, 90)) < 75) {
        this._magnetTop = false;
      }
      if (Math.abs(angleDifference(directionAngle, 0)) < 75) {
        this._magnetLeft = false;
      }
      if (Math.abs(angleDifference(directionAngle, 180)) < 75) {
        this._magnetLeft = true;
      }
      const initialSelectionAABB = this._getOrCreateSelectionAABB(instances);
      const initialMagnetX = this._magnetLeft
        ? initialSelectionAABB.left
        : initialSelectionAABB.right;
      const initialMagnetY = this._magnetTop
        ? initialSelectionAABB.top
        : initialSelectionAABB.bottom;
      const magnetPosition = this._temporaryPoint;
      magnetPosition[0] = initialMagnetX + this.totalDeltaX;
      magnetPosition[1] = initialMagnetY + this.totalDeltaY;
      roundPosition(
        magnetPosition,
        this.options.gridWidth,
        this.options.gridHeight,
        this.options.gridOffsetX,
        this.options.gridOffsetY,
        this.options.gridType
      );
      roundedTotalDeltaX = magnetPosition[0] - initialMagnetX;
      roundedTotalDeltaY = magnetPosition[1] - initialMagnetY;

      // When changing magnet side, the selection
      // could move the opposite way of the cursor movement
      // This ensures it doesn't.

      // prettier-ignore to keep parenthesis
      if (
        this._magnetTop ===
        (roundedTotalDeltaY < this._lastRoundedTotalDeltaY)
      ) {
        this._lastRoundedTotalDeltaY = roundedTotalDeltaY;
      } else {
        roundedTotalDeltaY = this._lastRoundedTotalDeltaY;
      }
      // prettier-ignore to keep parenthesis
      if (
        this._magnetLeft ===
        (roundedTotalDeltaX < this._lastRoundedTotalDeltaX)
      ) {
        this._lastRoundedTotalDeltaX = roundedTotalDeltaX;
      } else {
        roundedTotalDeltaX = this._lastRoundedTotalDeltaX;
      }
    } else {
      roundedTotalDeltaX = this.totalDeltaX;
      roundedTotalDeltaY = this.totalDeltaY;
    }

    for (var i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        };
      }
      selectedInstance.setX(
        initialPosition.x +
          this._getMoveDeltaX(
            roundedTotalDeltaX,
            roundedTotalDeltaY,
            followAxis
          )
      );
      selectedInstance.setY(
        initialPosition.y +
          this._getMoveDeltaY(
            roundedTotalDeltaX,
            roundedTotalDeltaY,
            followAxis
          )
      );
    }
  }

  endMove() {
    this._initialSelectionAABB = null;
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._lastRoundedTotalDeltaX = 0;
    this._lastRoundedTotalDeltaY = 0;
  }
}

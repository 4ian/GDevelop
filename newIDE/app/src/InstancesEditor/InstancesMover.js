// @flow
import { roundPosition } from '../Utils/GridHelpers';
import Rectangle from '../Utils/Rectangle';

export default class InstancesMover {
  instanceMeasurer: any;
  options: Object;
  instancePositions: { [number]: { x: number, y: number } };
  totalDeltaX: number;
  totalDeltaY: number;
  _temporaryPoint: [number, number];
  _initialSelectionAABB: ?Rectangle = null;
  _startX: number = 0;
  _startY: number = 0;

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

  startMove(startX: number, startY: number) {
    this._startX = startX;
    this._startY = startY;
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
      // It will magnet the corner nearest to the grabbing position
      const initialSelectionAABB = this._getOrCreateSelectionAABB(instances);
      const magnetLeft = this._startX < initialSelectionAABB.centerX();
      const magnetTop = this._startY < initialSelectionAABB.centerY();

      const initialMagnetX = magnetLeft
        ? initialSelectionAABB.left
        : initialSelectionAABB.right;
      const initialMagnetY = magnetTop
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
  }
}

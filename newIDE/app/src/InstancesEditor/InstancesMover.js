// @flow
import { roundPosition } from '../Utils/GridHelpers';

export default class InstancesMover {
  instanceMeasurer: any;
  options: Object;
  instancePositions: { [number]: { x: number, y: number } };
  totalDeltaX: number;
  totalDeltaY: number;
  temporaryPoint: [number, number];

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
    this.temporaryPoint = [0, 0];
  }

  setOptions(options: Object) {
    this.options = options;
  }

  _roundPosition(pos: [number, number], noGridSnap: boolean) {
    if (!this.options.snap || !this.options.grid || noGridSnap) {
      pos[0] = Math.round(pos[0]);
      pos[1] = Math.round(pos[1]);
      return;
    }
    roundPosition(
      pos,
      this.options.gridWidth,
      this.options.gridHeight,
      this.options.gridOffsetX,
      this.options.gridOffsetY,
      this.options.gridType
    );
  }

  _getMoveDeltaX(followAxis: boolean) {
    if (followAxis && Math.abs(this.totalDeltaX) < Math.abs(this.totalDeltaY))
      return 0;

    return this.totalDeltaX;
  }

  _getMoveDeltaY(followAxis: boolean) {
    if (followAxis && Math.abs(this.totalDeltaY) < Math.abs(this.totalDeltaX))
      return 0;

    return this.totalDeltaY;
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

    for (var i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        };
      }
      this.temporaryPoint[0] =
        initialPosition.x + this._getMoveDeltaX(followAxis);
      this.temporaryPoint[1] =
        initialPosition.y + this._getMoveDeltaY(followAxis);
      this._roundPosition(this.temporaryPoint, noGridSnap);
      selectedInstance.setX(this.temporaryPoint[0]);
      selectedInstance.setY(this.temporaryPoint[1]);
    }
  }

  endMove() {
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

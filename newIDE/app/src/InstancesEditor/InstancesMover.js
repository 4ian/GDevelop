// @flow
import { roundPositionsToGrid } from '../Utils/GridHelpers';
import Rectangle from '../Utils/Rectangle';
import { type InstancesEditorSettings } from './InstancesEditorSettings';
import {
  buildInstancesIndex,
  syncLocalFromWorld,
  applyParentTransformToDescendants,
  type InstancesIndex,
} from './ParentingHelpers';
import { type InstanceMeasurer } from './InstancesRenderer';

export default class InstancesMover {
  instanceMeasurer: InstanceMeasurer;
  instancesEditorSettings: InstancesEditorSettings;
  initialInstances: gdInitialInstancesContainer;
  instancePositions: { [number]: { x: number, y: number } };
  totalDeltaX: number;
  totalDeltaY: number;
  _temporaryPoint: [number, number];
  _initialSelectionAABB: ?Rectangle = null;
  _startX: number = 0;
  _startY: number = 0;
  _instancesIndex: ?InstancesIndex = null;

  constructor({
    instanceMeasurer,
    instancesEditorSettings,
    initialInstances,
  }: {
    instanceMeasurer: InstanceMeasurer,
    instancesEditorSettings: InstancesEditorSettings,
    initialInstances: gdInitialInstancesContainer,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.instancesEditorSettings = instancesEditorSettings;
    this.initialInstances = initialInstances;
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._temporaryPoint = [0, 0];
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  _getMoveDeltaX(
    totalDeltaX: number,
    totalDeltaY: number,
    followAxis: boolean
  ): any {
    if (followAxis && Math.abs(totalDeltaX) < Math.abs(totalDeltaY)) return 0;

    return totalDeltaX;
  }

  _getMoveDeltaY(
    totalDeltaX: number,
    totalDeltaY: number,
    followAxis: boolean
  ): any {
    if (followAxis && Math.abs(totalDeltaY) < Math.abs(totalDeltaX)) return 0;

    return totalDeltaY;
  }

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): ?Rectangle {
    if (this._initialSelectionAABB) {
      return this._initialSelectionAABB;
    }
    if (!instances.length) return null;
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
    this._instancesIndex = buildInstancesIndex(this.initialInstances);
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

    if (!this._instancesIndex) {
      this._instancesIndex = buildInstancesIndex(this.initialInstances);
    }
    const instancesIndex = this._instancesIndex;
    const nonLockedInstances = instances.filter(
      instance => !instance.isLocked()
    );

    // It will magnet the corner nearest to the grabbing position
    const initialSelectionAABB = this._getOrCreateSelectionAABB(
      nonLockedInstances
    );
    if (!initialSelectionAABB) return;
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
    roundPositionsToGrid(
      magnetPosition,
      this.instancesEditorSettings,
      noGridSnap
    );
    const roundedTotalDeltaX = magnetPosition[0] - initialMagnetX;
    const roundedTotalDeltaY = magnetPosition[1] - initialMagnetY;

    for (let i = 0; i < nonLockedInstances.length; i++) {
      const selectedInstance = nonLockedInstances[i];

      let initialPosition = this.instancePositions[selectedInstance.ptr];
      if (!initialPosition) {
        initialPosition = this.instancePositions[selectedInstance.ptr] = {
          x: selectedInstance.getX(),
          y: selectedInstance.getY(),
        };
      }
      // We round the position to the nearest pixel when an instance is moved in the editor.
      // This is to avoid having a lot of decimals in the position of instances.
      // It does not prevent the user from having decimals, when editing the position manually.
      const newX = Math.round(
        initialPosition.x +
          this._getMoveDeltaX(
            roundedTotalDeltaX,
            roundedTotalDeltaY,
            followAxis
          )
      );
      const newY = Math.round(
        initialPosition.y +
          this._getMoveDeltaY(
            roundedTotalDeltaX,
            roundedTotalDeltaY,
            followAxis
          )
      );
      selectedInstance.setX(newX);
      selectedInstance.setY(newY);
      syncLocalFromWorld(selectedInstance, instancesIndex);
    }

    nonLockedInstances.forEach(instance => {
      applyParentTransformToDescendants(instance, instancesIndex);
    });
  }

  endMove() {
    this._initialSelectionAABB = null;
    this.instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
    this._instancesIndex = null;
  }

  snapSelection(instances: gdInitialInstance[]): void {
    // The snapping doesn't work well on 3D model objects because their default
    // dimensions and origin change when the model is loaded from an async call.
    this.endMove();
    // Force magnet from selection top left corner.
    this.startMove(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.moveBy(instances, 0, 0, false, false);
    this.endMove();
  }

  isMoving(): any {
    return !!this._initialSelectionAABB;
  }
}

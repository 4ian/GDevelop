// @flow
import Rectangle from '../Utils/Rectangle';
import { roundPositionForResizing } from '../Utils/GridHelpers';
import { type InstancesEditorSettings } from './InstancesEditorSettings';
import { type InstanceMeasurer } from './InstancesRenderer';

export type ResizeGrabbingLocation =
  | 'TopLeft'
  | 'BottomLeft'
  | 'BottomRight'
  | 'TopRight'
  | 'Top'
  | 'Left'
  | 'Bottom'
  | 'Right';

export const resizeGrabbingLocationValues = [
  'TopLeft',
  'BottomLeft',
  'BottomRight',
  'TopRight',
  'Top',
  'Left',
  'Bottom',
  'Right',
];

export const resizeGrabbingRelativePositions = {
  TopLeft: [0, 0],
  BottomLeft: [0, 1],
  BottomRight: [1, 1],
  TopRight: [1, 0],
  Top: [0.5, 0],
  Left: [0, 0.5],
  Bottom: [0.5, 1],
  Right: [1, 0.5],
};

export const canMoveOnX = (location: ResizeGrabbingLocation) =>
  location !== 'Top' && location !== 'Bottom';

export const canMoveOnY = (location: ResizeGrabbingLocation) =>
  location !== 'Left' && location !== 'Right';

const areAnyInstancesNotStraight = (instances: gdInitialInstance[]) => {
  for (let i = 0; i < instances.length; i++) {
    if (instances[i].getAngle() % 90 !== 0) return true;
  }
  return false;
};

export default class InstancesResizer {
  instanceMeasurer: InstanceMeasurer;
  instancesEditorSettings: InstancesEditorSettings;

  // The initial state of instances before a resize:
  _initialSelectionAABB: ?Rectangle = null;
  _unrotatedInstanceAABBs: { [number]: Rectangle } = {};
  _instanceAABBs: { [number]: Rectangle } = {};
  _instancePositions: { [number]: { x: number, y: number } } = {};

  // The coordinates of the vector of the resize being done:
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;

  /**
   * Used when rounding on the grid
   */
  _temporaryGrabbingPosition: [number, number] = [0, 0];

  constructor({
    instanceMeasurer,
    instancesEditorSettings,
  }: {
    instanceMeasurer: InstanceMeasurer,
    instancesEditorSettings: InstancesEditorSettings,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.instancesEditorSettings = instancesEditorSettings;
  }

  setInstancesEditorSettings(instancesEditorSettings: InstancesEditorSettings) {
    this.instancesEditorSettings = instancesEditorSettings;
  }

  _getOrCreateInstanceAABB(instance: gdInitialInstance) {
    const initialInstanceAABB = this._instanceAABBs[instance.ptr];
    if (initialInstanceAABB) return initialInstanceAABB;

    return (this._instanceAABBs[
      instance.ptr
    ] = this.instanceMeasurer.getInstanceAABB(instance, new Rectangle()));
  }

  _getOrCreateUnrotatedInstanceAABB(instance: gdInitialInstance) {
    const initialUnrotatedInstanceAABB = this._unrotatedInstanceAABBs[
      instance.ptr
    ];
    if (initialUnrotatedInstanceAABB) return initialUnrotatedInstanceAABB;

    return (this._unrotatedInstanceAABBs[
      instance.ptr
    ] = this.instanceMeasurer.getUnrotatedInstanceAABB(
      instance,
      new Rectangle()
    ));
  }

  _getOrCreateInstanceOriginPosition(instance: gdInitialInstance) {
    const initialPosition = this._instancePositions[instance.ptr];
    if (initialPosition) return initialPosition;

    return (this._instancePositions[instance.ptr] = {
      x: instance.getX(),
      y: instance.getY(),
    });
  }

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): ?Rectangle {
    let initialSelectionAABB = this._initialSelectionAABB;
    if (initialSelectionAABB) {
      return initialSelectionAABB;
    }
    if (!instances.length) return null;
    initialSelectionAABB = new Rectangle();
    initialSelectionAABB.setRectangle(
      this._getOrCreateInstanceAABB(instances[0])
    );
    for (let i = 1; i < instances.length; i++) {
      initialSelectionAABB.union(this._getOrCreateInstanceAABB(instances[i]));
    }
    this._initialSelectionAABB = initialSelectionAABB;
    return initialSelectionAABB;
  }

  resizeBy(
    instances: gdInitialInstance[],
    deltaX: number,
    deltaY: number,
    grabbingLocation: ResizeGrabbingLocation,
    proportional: boolean,
    noGridSnap: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    const nonLockedInstances = instances.filter(
      instance => !instance.isLocked()
    );

    const initialSelectionAABB = this._getOrCreateSelectionAABB(
      nonLockedInstances
    );
    if (!initialSelectionAABB) return;

    // Round the grabbed handle position on the grid.
    const grabbingRelativePosition =
      resizeGrabbingRelativePositions[grabbingLocation];
    const initialGrabbingX =
      initialSelectionAABB.left +
      initialSelectionAABB.width() * grabbingRelativePosition[0];
    const initialGrabbingY =
      initialSelectionAABB.top +
      initialSelectionAABB.height() * grabbingRelativePosition[1];
    const grabbingPosition = this._temporaryGrabbingPosition;
    grabbingPosition[0] = initialGrabbingX + this.totalDeltaX;
    grabbingPosition[1] = initialGrabbingY + this.totalDeltaY;
    if (
      this.instancesEditorSettings.snap &&
      this.instancesEditorSettings.grid &&
      !noGridSnap
    ) {
      roundPositionForResizing(
        grabbingPosition,
        this.instancesEditorSettings.gridWidth,
        this.instancesEditorSettings.gridHeight,
        this.instancesEditorSettings.gridOffsetX,
        this.instancesEditorSettings.gridOffsetY,
        this.instancesEditorSettings.gridType
      );
    } else {
      // Without a grid, the position is still rounded to the nearest pixel.
      grabbingPosition[0] = Math.round(grabbingPosition[0]);
      grabbingPosition[1] = Math.round(grabbingPosition[1]);
    }
    let roundedTotalDeltaX = grabbingPosition[0] - initialGrabbingX;
    let roundedTotalDeltaY = grabbingPosition[1] - initialGrabbingY;

    if (!canMoveOnX(grabbingLocation)) {
      roundedTotalDeltaX = 0;
    }
    if (!canMoveOnY(grabbingLocation)) {
      roundedTotalDeltaY = 0;
    }

    const isLeft =
      grabbingLocation === 'TopLeft' ||
      grabbingLocation === 'BottomLeft' ||
      grabbingLocation === 'Left';
    const isTop =
      grabbingLocation === 'TopLeft' ||
      grabbingLocation === 'TopRight' ||
      grabbingLocation === 'Top';

    // Flip the deltas to end up in the nominal case of a bottom-right grabbed node.
    // Because a negative deltaX on the left grabbing handle will make the width greater
    // as a positive deltaX on the right grabbing handle would do.
    const flippedTotalDeltaX = isLeft
      ? -roundedTotalDeltaX
      : roundedTotalDeltaX;
    const flippedTotalDeltaY = isTop ? -roundedTotalDeltaY : roundedTotalDeltaY;

    let scaleX =
      initialSelectionAABB.width() !== 0
        ? (initialSelectionAABB.width() + flippedTotalDeltaX) /
          initialSelectionAABB.width()
        : flippedTotalDeltaX;
    let scaleY =
      initialSelectionAABB.height() !== 0
        ? (initialSelectionAABB.height() + flippedTotalDeltaY) /
          initialSelectionAABB.height()
        : flippedTotalDeltaY;
    let scaleZ = 1;

    const hasRotatedInstance = areAnyInstancesNotStraight(nonLockedInstances);

    // Applying a rotation then a scaling can result to
    // an affine transformation with a shear transformation - which we don't want.
    // If any instance is rotated, we keep the aspect ratio (i.e: force proportional resizing)
    // to ensure a transformation without any shear.
    if (proportional || hasRotatedInstance) {
      // Choose the axis where the selection is the biggest.
      // That way the cursor is always on one edge.
      if (
        !canMoveOnY(grabbingLocation) ||
        (canMoveOnX(grabbingLocation) &&
          flippedTotalDeltaX * initialSelectionAABB.height() >
            flippedTotalDeltaY * initialSelectionAABB.width())
      ) {
        scaleY = scaleX;
        scaleZ = scaleX;
      } else {
        scaleX = scaleY;
        scaleZ = scaleY;
      }
    }

    // No negative scale because instances can't be mirrored.
    // Make the minimal selection size to 1 to avoid absorption.
    // If size is already 0, use a minimum scale to avoid negative scales.
    scaleX = Math.max(
      initialSelectionAABB.width() !== 0
        ? 1 / initialSelectionAABB.width()
        : 0.00001,
      scaleX
    );
    scaleY = Math.max(
      initialSelectionAABB.height() !== 0
        ? 1 / initialSelectionAABB.height()
        : 0.00001,
      scaleY
    );
    scaleZ = Math.max(
      initialSelectionAABB.depth() !== 0
        ? 1 / initialSelectionAABB.depth()
        : 0.00001,
      scaleZ
    );

    const fixedPointX =
      initialSelectionAABB.right -
      resizeGrabbingRelativePositions[grabbingLocation][0] *
        initialSelectionAABB.width();
    const fixedPointY =
      initialSelectionAABB.bottom -
      resizeGrabbingRelativePositions[grabbingLocation][1] *
        initialSelectionAABB.height();

    for (let i = 0; i < nonLockedInstances.length; i++) {
      const selectedInstance = nonLockedInstances[i];

      let initialUnrotatedInstanceAABB = this._getOrCreateUnrotatedInstanceAABB(
        selectedInstance
      );
      let initialInstanceOriginPosition = this._getOrCreateInstanceOriginPosition(
        selectedInstance
      );

      // Assume a size of 1 pixel to start the resizing
      // if the instance had a size of 0.
      const initialWidth =
        initialUnrotatedInstanceAABB.width() !== 0
          ? initialUnrotatedInstanceAABB.width()
          : 1;
      const initialHeight =
        initialUnrotatedInstanceAABB.height() !== 0
          ? initialUnrotatedInstanceAABB.height()
          : 1;
      const initialDepth =
        initialUnrotatedInstanceAABB.depth() !== 0
          ? initialUnrotatedInstanceAABB.depth()
          : 1;

      // The position and size of an instance describe the shape
      // before the rotation is applied.
      // The calculus is like a 90° or 270° rotation of the basis around the scaling.
      // The AABB dimensions are the same in both cases and the AABB center
      // is stable by instance rotation. This allows to use the same formula
      // for both 90° or 270°.
      const angle = ((selectedInstance.getAngle() % 360) + 360) % 360;
      let newX = initialInstanceOriginPosition.x;
      let newY = initialInstanceOriginPosition.y;
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newDepth = initialDepth;
      if (
        !proportional &&
        !hasRotatedInstance &&
        (angle === 90 || angle === 270)
      ) {
        newWidth = scaleY * initialWidth;
        newHeight = scaleX * initialHeight;
        newDepth = scaleZ * initialDepth;

        // These 4 variables are the positions and vector after the scaling.
        // It's easier to scale the instance center
        // because it's not affected by the instance rotation.
        const centerX =
          (initialUnrotatedInstanceAABB.centerX() - fixedPointX) * scaleX +
          fixedPointX;
        const centerY =
          (initialUnrotatedInstanceAABB.centerY() - fixedPointY) * scaleY +
          fixedPointY;
        // and then add the vector from the center to the origin.
        // It's the vector on the unrotated instance
        // and the scale was applied on the rotated one so it's switched.
        const centerToOriginX =
          scaleY *
          (initialInstanceOriginPosition.x -
            initialUnrotatedInstanceAABB.centerX());
        const centerToOriginY =
          scaleX *
          (initialInstanceOriginPosition.y -
            initialUnrotatedInstanceAABB.centerY());
        newX = centerX + centerToOriginX;
        newY = centerY + centerToOriginY;
      } else {
        newWidth = scaleX * initialWidth;
        newHeight = scaleY * initialHeight;
        newDepth = scaleZ * initialDepth;
        newX =
          (initialInstanceOriginPosition.x - fixedPointX) * scaleX +
          fixedPointX;
        newY =
          (initialInstanceOriginPosition.y - fixedPointY) * scaleY +
          fixedPointY;
      }

      // After resizing, we round the new positions and dimensions to the nearest pixel.
      // This is to avoid having a lot of decimals appearing, and it does not
      // prevent the user from modifying them manually in the inline fields.
      selectedInstance.setX(Math.round(newX));
      selectedInstance.setY(Math.round(newY));

      // Also round the size.
      selectedInstance.setHasCustomDepth(true);
      selectedInstance.setHasCustomSize(true);
      selectedInstance.setCustomWidth(Math.round(newWidth));
      selectedInstance.setCustomHeight(Math.round(newHeight));
      selectedInstance.setCustomDepth(Math.round(newDepth));
    }
  }

  endResize() {
    this._initialSelectionAABB = null;
    this._unrotatedInstanceAABBs = {};
    this._instanceAABBs = {};
    this._instancePositions = {};
    this.totalDeltaX = 0;
    this.totalDeltaY = 0;
  }
}

// @flow
import Rectangle from '../Utils/Rectangle';
import { roundPositionForResizing } from '../Utils/GridHelpers';

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
  instanceMeasurer: any;
  options: Object;

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
    options,
  }: {
    instanceMeasurer: any,
    options: Object,
  }) {
    this.instanceMeasurer = instanceMeasurer;
    this.options = options;
  }

  setOptions(options: Object) {
    this.options = options;
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

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): Rectangle {
    let initialSelectionAABB = this._initialSelectionAABB;
    if (initialSelectionAABB) {
      return initialSelectionAABB;
    }
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
    proportional: boolean
  ) {
    this.totalDeltaX += deltaX;
    this.totalDeltaY += deltaY;

    const initialSelectionAABB = this._getOrCreateSelectionAABB(instances);

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
    if (this.options.snap && this.options.grid) {
      roundPositionForResizing(
        grabbingPosition,
        this.options.gridWidth,
        this.options.gridHeight,
        this.options.gridOffsetX,
        this.options.gridOffsetY,
        this.options.gridType
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
      (initialSelectionAABB.width() + flippedTotalDeltaX) /
      initialSelectionAABB.width();
    let scaleY =
      (initialSelectionAABB.height() + flippedTotalDeltaY) /
      initialSelectionAABB.height();

    const hasRotatedInstance = areAnyInstancesNotStraight(instances);

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
      } else {
        scaleX = scaleY;
      }
    }

    // No negative scale because instances can't be mirrored
    // Make the minimal selection size to 1 to avoid absorption
    scaleX = Math.max(1 / initialSelectionAABB.width(), scaleX);
    scaleY = Math.max(1 / initialSelectionAABB.height(), scaleY);

    const fixedPointX =
      initialSelectionAABB.right -
      resizeGrabbingRelativePositions[grabbingLocation][0] *
        initialSelectionAABB.width();
    const fixedPointY =
      initialSelectionAABB.bottom -
      resizeGrabbingRelativePositions[grabbingLocation][1] *
        initialSelectionAABB.height();

    for (let i = 0; i < instances.length; i++) {
      const selectedInstance = instances[i];

      let initialUnrotatedInstanceAABB = this._getOrCreateUnrotatedInstanceAABB(
        selectedInstance
      );
      let initialInstanceOriginPosition = this._getOrCreateInstanceOriginPosition(
        selectedInstance
      );

      // The position and size of an instance describe the shape
      // before the rotation is applied.
      // The calculus is like a 90° or 270° rotation of the basis around the scaling.
      // The AABB dimensions are the same in both cases and the AABB center
      // is stable by instance rotation. This allows to use the same formula
      // for both 90° or 270°.
      const angle = ((selectedInstance.getAngle() % 360) + 360) % 360;
      if (
        !proportional &&
        !hasRotatedInstance &&
        (angle === 90 || angle === 270)
      ) {
        selectedInstance.setCustomWidth(
          scaleY * initialUnrotatedInstanceAABB.width()
        );
        selectedInstance.setCustomHeight(
          scaleX * initialUnrotatedInstanceAABB.height()
        );
        selectedInstance.setHasCustomSize(true);

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
        selectedInstance.setX(centerX + centerToOriginX);
        selectedInstance.setY(centerY + centerToOriginY);
      } else {
        selectedInstance.setCustomWidth(
          scaleX * initialUnrotatedInstanceAABB.width()
        );
        selectedInstance.setCustomHeight(
          scaleY * initialUnrotatedInstanceAABB.height()
        );
        selectedInstance.setHasCustomSize(true);

        selectedInstance.setX(
          (initialInstanceOriginPosition.x - fixedPointX) * scaleX + fixedPointX
        );
        selectedInstance.setY(
          (initialInstanceOriginPosition.y - fixedPointY) * scaleY + fixedPointY
        );
      }
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

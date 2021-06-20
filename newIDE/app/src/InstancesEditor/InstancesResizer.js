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

export const isFreeOnX = (location: ResizeGrabbingLocation) =>
  location !== 'Top' && location !== 'Bottom';

export const isFreeOnY = (location: ResizeGrabbingLocation) =>
  location !== 'Left' && location !== 'Right';

export default class InstancesResizer {
  instanceMeasurer: any;
  options: Object;
  _initialSelectionAABB: ?Rectangle = null;
  _unrotatedInstanceAABBs: { [number]: Rectangle } = {};
  _instanceAABBs: { [number]: Rectangle } = {};
  _instancePositions: { [number]: { x: number, y: number } } = {};
  totalDeltaX: number = 0;
  totalDeltaY: number = 0;

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
    let initialInstanceAABB = this._instanceAABBs[instance.ptr];
    if (!initialInstanceAABB) {
      initialInstanceAABB = new Rectangle();
      initialInstanceAABB = this.instanceMeasurer.getInstanceAABB(
        instance,
        initialInstanceAABB
      );
      this._instanceAABBs[instance.ptr] = initialInstanceAABB;
    }
    return initialInstanceAABB;
  }

  _getOrCreateUnrotatedInstanceAABB(instance: gdInitialInstance) {
    let initialUnrotatedInstanceAABB = this._unrotatedInstanceAABBs[
      instance.ptr
    ];
    if (!initialUnrotatedInstanceAABB) {
      initialUnrotatedInstanceAABB = new Rectangle();
      initialUnrotatedInstanceAABB = this.instanceMeasurer.getUnrotatedInstanceAABB(
        instance,
        initialUnrotatedInstanceAABB
      );
      this._unrotatedInstanceAABBs[instance.ptr] = initialUnrotatedInstanceAABB;
    }
    return initialUnrotatedInstanceAABB;
  }

  _getOrCreateInstanceOriginPosition(instance: gdInitialInstance) {
    let initialPosition = this._instancePositions[instance.ptr];
    if (!initialPosition) {
      initialPosition = this._instancePositions[instance.ptr] = {
        x: instance.getX(),
        y: instance.getY(),
      };
    }
    return initialPosition;
  }

  _getOrCreateSelectionAABB(instances: gdInitialInstance[]): Rectangle {
    //TODO the same thing is calculated in InstanceRotator and SelectedInstances,
    // does it worth extracting this in a selection model
    // who would know when to reprocess it?
    let initialSelectionAABB = this._initialSelectionAABB;
    if (!initialSelectionAABB) {
      initialSelectionAABB = new Rectangle();
      initialSelectionAABB.setRectangle(
        this._getOrCreateInstanceAABB(instances[0])
      );
      for (let i = 1; i < instances.length; i++) {
        initialSelectionAABB.union(this._getOrCreateInstanceAABB(instances[i]));
      }
      this._initialSelectionAABB = initialSelectionAABB;
    }
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

    let roundedTotalDeltaX;
    let roundedTotalDeltaY;
    if (this.options.snap) {
      // round the grabbed node position on the grid
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
      roundPositionForResizing(
        grabbingPosition,
        this.options.gridWidth,
        this.options.gridHeight,
        this.options.gridOffsetX,
        this.options.gridOffsetY,
        this.options.gridType
      );
      roundedTotalDeltaX = grabbingPosition[0] - initialGrabbingX;
      roundedTotalDeltaY = grabbingPosition[1] - initialGrabbingY;
    } else {
      roundedTotalDeltaX = this.totalDeltaX;
      roundedTotalDeltaY = this.totalDeltaY;
    }
    if (!isFreeOnX(grabbingLocation)) {
      roundedTotalDeltaX = 0;
    }
    if (!isFreeOnY(grabbingLocation)) {
      roundedTotalDeltaY = 0;
    }

    let hasRotatedInstance = false;
    for (let i = 0; i < instances.length && !hasRotatedInstance; i++) {
      const selectedInstance = instances[i];
      hasRotatedInstance = selectedInstance.getAngle() !== 0;
    }

    const isLeft =
      grabbingLocation === 'TopLeft' ||
      grabbingLocation === 'BottomLeft' ||
      grabbingLocation === 'Left';
    const isTop =
      grabbingLocation === 'TopLeft' ||
      grabbingLocation === 'TopRight' ||
      grabbingLocation === 'Top';

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
    // Applying a rotation then a scaling can result to
    // an affine transformation with a shear composite.
    // So, keeping the aspect ratio ensures a transformation without any shear.
    if (proportional || hasRotatedInstance) {
      // Choose the axis where the selection is the biggest.
      // That way the cursor is always on one edge.
      if (
        !flippedTotalDeltaY ||
        (flippedTotalDeltaX &&
          flippedTotalDeltaX * initialSelectionAABB.height() >
            initialSelectionAABB.width() * flippedTotalDeltaY)
      ) {
        scaleY = scaleX;
      } else {
        scaleX = scaleY;
      }
    }

    // instances can't be mirrored
    scaleX = Math.max(0, scaleX);
    scaleY = Math.max(0, scaleY);

    const anchorX =
      initialSelectionAABB.right -
      resizeGrabbingRelativePositions[grabbingLocation][0] *
        initialSelectionAABB.width();
    const anchorY =
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

      selectedInstance.setCustomWidth(
        scaleX * initialUnrotatedInstanceAABB.width()
      );
      selectedInstance.setCustomHeight(
        scaleY * initialUnrotatedInstanceAABB.height()
      );
      selectedInstance.setHasCustomSize(true);
      selectedInstance.setX(
        (initialInstanceOriginPosition.x - anchorX) * scaleX + anchorX
      );
      selectedInstance.setY(
        (initialInstanceOriginPosition.y - anchorY) * scaleY + anchorY
      );
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

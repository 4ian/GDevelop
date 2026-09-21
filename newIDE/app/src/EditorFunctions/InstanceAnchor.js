// @flow
import { type ObjectSizeInfo } from './Utils';

/**
 * Which point of the instances a brush position places:
 * - `origin`: their origin, which is what an instance x;y;z is - the default,
 *   and the only anchor needing nothing to be known of the object.
 * - `min_corner`: the corner of their box with the minimum coordinates.
 * - `center`: the middle of their box on every axis.
 * - `bottom_center`: the middle on X and Y and the minimum on Z, what rests a
 *   3D object on a surface (3D only: in 2D, Y is the axis pointing down).
 */
export type InstanceAnchor =
  | 'origin'
  | 'min_corner'
  | 'center'
  | 'bottom_center';

export const INSTANCE_ANCHORS_2D: Array<InstanceAnchor> = [
  'origin',
  'min_corner',
  'center',
];

export const INSTANCE_ANCHORS_3D: Array<InstanceAnchor> = [
  'origin',
  'min_corner',
  'center',
  'bottom_center',
];

// The anchor point, as a fraction of the box size on each axis.
const ANCHOR_FRACTIONS: { [InstanceAnchor]: Array<number> } = {
  origin: [0, 0, 0],
  min_corner: [0, 0, 0],
  center: [0.5, 0.5, 0.5],
  bottom_center: [0.5, 0.5, 0],
};

/**
 * What to add to a position given by `anchor` to get the position of the
 * origin of an instance of `size`, which is the position an instance holds.
 * The box is the unrotated, unflipped one, like the offsets of
 * `objectSizeInfo`.
 *
 * `null` when the box of the object is unknown: the position could only be
 * guessed, and every instance placed from it would be somewhere else.
 */
export const getAnchorOffset = (
  anchor: InstanceAnchor,
  size: $ReadOnlyArray<number>,
  objectSizeInfo: ObjectSizeInfo | null
): Array<number> | null => {
  const zeroOffsets = size.map(() => 0);
  if (anchor === 'origin') return zeroOffsets;
  const fractions = ANCHOR_FRACTIONS[anchor];
  if (!fractions || !objectSizeInfo) return null;

  const defaultSizes = [
    objectSizeInfo.width,
    objectSizeInfo.height,
    objectSizeInfo.depth,
  ];
  const origins = [
    objectSizeInfo.originX,
    objectSizeInfo.originY,
    objectSizeInfo.originZ,
  ];
  const offsets = [];
  for (let axis = 0; axis < size.length; axis++) {
    const origin = origins[axis];
    // An axis the object has no extent on (the Z of a 2D object): its box is
    // its position there, whatever the anchor.
    if (origin === null) {
      offsets.push(0);
      continue;
    }
    const sizeOnAxis = size[axis];
    if (!Number.isFinite(sizeOnAxis)) return null;
    let scaledOrigin = 0;
    if (origin !== 0) {
      const defaultSize = defaultSizes[axis];
      // The origin is given at the default size of the object: scale it to
      // the size this instance really has.
      if (!defaultSize) return null;
      scaledOrigin = (origin * sizeOnAxis) / defaultSize;
    }
    offsets.push(scaledOrigin - fractions[axis] * sizeOnAxis);
  }
  return offsets;
};

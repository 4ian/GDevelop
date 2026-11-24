// @flow
import * as THREE from 'three';
import { mapFor } from '../../Utils/MapFor';
import { getObjectSizeInfo } from '../Utils';
import {
  ensureModel3DMeasurementsLoaded,
  isModel3DObjectMeasured,
} from '../Model3DSizeInfo';

const gd: libGDevelop = global.gd;

/**
 * How the area of a variant is fitted to its child instances:
 * - `min_at_origin`: the children are moved so their minimum corner is at
 *   (0;0;0) and the area is 0 to the content size — the convention of the
 *   editor when it extracts instances into a custom object.
 * - `centered_on_origin`: the children are moved so their center is at
 *   (0;0;0) and the area is symmetric (areaMin = -areaMax), which puts the
 *   center of rotation of the custom object on its own position — what a
 *   turret, a wheel or anything spinning around itself needs.
 */
export type FitAreaMode = 'min_at_origin' | 'centered_on_origin';

export const FIT_AREA_MODES: Array<FitAreaMode> = [
  'min_at_origin',
  'centered_on_origin',
];

type Box = {| min: Array<number>, max: Array<number> |};

const roundBound = (value: number): number => Math.round(value * 1e6) / 1e6;

const roundCoordinate = (value: number): number =>
  Math.round(value * 100) / 100;

// What the instances of one child object occupy, all of them together.
type ChildBox = {| objectName: string, box: Box, instancesCount: number |};

// The box of the children (`box` is null when there is no instance at all), or
// the child objects whose size could not be measured: moving the children and
// writing an area on a guessed size would silently shrink the custom object to
// nothing, so nothing is done when there is any.
type ChildInstancesBox = {|
  box: Box | null,
  unmeasurableObjectNames: Array<string>,
  childBoxes: Array<ChildBox>,
|};

const growBox = (box: Box | null, added: Box): Box => {
  if (!box) return { min: [...added.min], max: [...added.max] };
  for (let axis = 0; axis < 3; axis++) {
    box.min[axis] = Math.min(box.min[axis], added.min[axis]);
    box.max[axis] = Math.max(box.max[axis], added.max[axis]);
  }
  return box;
};

const forEachInstance = (
  variant: gdEventsBasedObjectVariant,
  callback: (instance: gdInitialInstance) => void
) => {
  const functor = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[incompatible-type] - invoke is not writable
  // $FlowFixMe[cannot-write]
  functor.invoke = instancePtr => {
    // $FlowFixMe[incompatible-type] - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is incompatible with Functor
  variant.getInitialInstances().iterateOverInstances(functor);
  functor.delete();
};

const getVariantObjects = (
  variant: gdEventsBasedObjectVariant
): Array<gdObject> => {
  const objects = variant.getObjects();
  return mapFor(0, objects.getObjectsCount(), i => objects.getObjectAt(i));
};

/**
 * The box an instance occupies, rotated and flipped as it is placed: the same
 * transformations as `getInstanceAABB` in the instances editor, plus the 3D
 * rotations. Everything turns around the center of the instance, which is
 * `centerX/Y/Z` from its minimum corner - not the middle of its box.
 */
const getInstanceBox = (
  instance: gdInitialInstance,
  minimumCorner: Array<number>,
  size: Array<number>,
  center: Array<number>
): Box => {
  const maximumCorner = minimumCorner.map((min, axis) => min + size[axis]);
  const flips = [
    instance.isFlippedX(),
    instance.isFlippedY(),
    instance.isFlippedZ(),
  ];
  const rotations = [
    instance.getRotationX(),
    instance.getRotationY(),
    instance.getAngle(),
  ];
  if (!flips.some(Boolean) && !rotations.some(rotation => rotation !== 0)) {
    return { min: minimumCorner, max: maximumCorner };
  }

  const centerInSpace = minimumCorner.map((min, axis) => min + center[axis]);
  const box = new THREE.Box3(
    new THREE.Vector3(...minimumCorner),
    new THREE.Vector3(...maximumCorner)
  );
  // A flip mirrors the box around the center, which moves it when the center
  // is not the middle of the box.
  flips.forEach((isFlipped, axis) => {
    if (!isFlipped) return;
    const min = 2 * centerInSpace[axis] - box.max.getComponent(axis);
    const max = 2 * centerInSpace[axis] - box.min.getComponent(axis);
    box.min.setComponent(axis, min);
    box.max.setComponent(axis, max);
  });

  const toCenter = new THREE.Vector3(...centerInSpace);
  // `Box3.applyMatrix4` transforms the 8 corners and takes their bounds.
  box.translate(toCenter.clone().negate());
  box.applyMatrix4(
    new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(
        (rotations[0] * Math.PI) / 180,
        (rotations[1] * Math.PI) / 180,
        (rotations[2] * Math.PI) / 180,
        'ZYX'
      )
    )
  );
  box.translate(toCenter);
  return { min: box.min.toArray(), max: box.max.toArray() };
};

/** The box occupied by the child instances of a variant, in its local space. */
const getChildInstancesBox = (
  project: gdProject,
  variant: gdEventsBasedObjectVariant,
  pixiResourcesLoader: any
): ChildInstancesBox => {
  const objects = variant.getObjects();
  let box: Box | null = null;
  const unmeasurableObjectNames: Array<string> = [];
  const childBoxes: Array<ChildBox> = [];

  forEachInstance(variant, instance => {
    const objectName = instance.getObjectName();
    if (!objects.hasObjectNamed(objectName)) return;
    const object = objects.getObject(objectName);
    // A 3D model that could not be read is given the dimensions and the origin
    // it configures, which are a guess: no instance size makes up for an
    // unknown model origin.
    if (!isModel3DObjectMeasured(object, project)) {
      if (!unmeasurableObjectNames.includes(objectName))
        unmeasurableObjectNames.push(objectName);
      return;
    }
    const sizeInfo = getObjectSizeInfo(object, project, pixiResourcesLoader);
    const defaultSizes = sizeInfo
      ? [sizeInfo.width, sizeInfo.height, sizeInfo.depth]
      : [null, null, null];
    const width = instance.hasCustomSize()
      ? instance.getCustomWidth()
      : defaultSizes[0];
    const height = instance.hasCustomSize()
      ? instance.getCustomHeight()
      : defaultSizes[1];
    const depth = instance.hasCustomDepth()
      ? instance.getCustomDepth()
      : defaultSizes[2];
    // A text without a custom size, a 3D model that could not be read: their
    // size is not known, so neither is the box they occupy (`depth` is null
    // for every 2D object, which is not a missing measure).
    if (width === null || height === null) {
      if (!unmeasurableObjectNames.includes(objectName))
        unmeasurableObjectNames.push(objectName);
      return;
    }
    const positions: Array<number> = [
      instance.getX(),
      instance.getY(),
      instance.getZ(),
    ];
    const size: Array<number> = [width, height, depth || 0];
    const origins: Array<number | null> = sizeInfo
      ? [sizeInfo.originX, sizeInfo.originY, sizeInfo.originZ]
      : [0, 0, 0];
    const centers: Array<number | null> = sizeInfo
      ? [sizeInfo.centerX, sizeInfo.centerY, sizeInfo.centerZ]
      : [null, null, null];
    // The origin and the center are given for the default size of the object:
    // scale them to the size this instance really has.
    const atInstanceSize = (value: number, axis: number): number => {
      const defaultSize = defaultSizes[axis];
      return defaultSize !== null && defaultSize > 0
        ? (value * size[axis]) / defaultSize
        : value;
    };
    const minimumCorner: Array<number> = positions.map((position, axis) => {
      const origin = origins[axis];
      return position - (origin === null ? 0 : atInstanceSize(origin, axis));
    });
    // An object with no center of its own turns around the middle of what it
    // occupies, which is known in the size of the instance itself.
    const center: Array<number> = centers.map((value, axis) =>
      value === null ? size[axis] / 2 : atInstanceSize(value, axis)
    );

    const instanceBox = getInstanceBox(instance, minimumCorner, size, center);
    box = growBox(box, instanceBox);
    const childBox = childBoxes.find(
      candidate => candidate.objectName === objectName
    );
    if (childBox) {
      growBox(childBox.box, instanceBox);
      childBox.instancesCount++;
    } else {
      childBoxes.push({
        objectName,
        box: growBox(null, instanceBox),
        instancesCount: 1,
      });
    }
  });

  if (unmeasurableObjectNames.length > 0)
    return { box: null, unmeasurableObjectNames, childBoxes: [] };
  return { box, unmeasurableObjectNames: [], childBoxes };
};

// At most this many child objects are described: the boxes are there to be
// compared with each other, which nobody does over a long list.
const MAX_DESCRIBED_CHILD_BOXES = 10;

/**
 * Where the children ended up, so that a part meant to be centered on another
 * (a turret on a hull) can be seen not to be. Each child object is given the
 * box of all of its instances, moved like them.
 */
const getChildBoxesDescription = (
  childBoxes: Array<ChildBox>,
  offsets: Array<number>,
  axesCount: number
): string => {
  if (childBoxes.length === 0) return '';
  const axes = ['X', 'Y', 'Z'];
  const described = childBoxes
    .slice(0, MAX_DESCRIBED_CHILD_BOXES)
    .map(({ objectName, box, instancesCount }) => {
      const bounds = [];
      const middle = [];
      for (let axis = 0; axis < axesCount; axis++) {
        const min = box.min[axis] + offsets[axis];
        const max = box.max[axis] + offsets[axis];
        bounds.push(
          `${axes[axis]} ${roundCoordinate(min)} to ${roundCoordinate(max)}`
        );
        middle.push(roundCoordinate((min + max) / 2));
      }
      return `"${objectName}"${
        instancesCount > 1 ? ` (${instancesCount} instances)` : ''
      } ${bounds.join(', ')}, middle ${middle.join(';')}`;
    });
  const notDescribedCount = childBoxes.length - described.length;
  return `Children: ${described.join('; ')}${
    notDescribedCount > 0 ? ` and ${notDescribedCount} more` : ''
  }.`;
};

/**
 * Move the child instances of a variant and set its area from them.
 *
 * @returns a message describing what was done, or null when the variant has
 * no instance to fit the area to.
 */
const fitVariantAreaToChildren = (
  project: gdProject,
  variant: gdEventsBasedObjectVariant,
  isRenderedIn3D: boolean,
  mode: FitAreaMode,
  variantLabel: string,
  pixiResourcesLoader: any
): string | null => {
  const { box, unmeasurableObjectNames, childBoxes } = getChildInstancesBox(
    project,
    variant,
    pixiResourcesLoader
  );
  if (unmeasurableObjectNames.length > 0) {
    return `The area of ${variantLabel} was NOT fitted: the size of ${unmeasurableObjectNames
      .map(objectName => `"${objectName}"`)
      .join(
        ', '
      )} is unknown (an object with no size of its own, or a 3D model that could not be read). Give their instances a size (\`instances_size\`), or set the area by hand with \`changed_settings\`.`;
  }
  if (!box) return null;
  // Nothing is moved on a box that is not a real one: every coordinate written
  // from here (the area, the position of every child) would be meaningless.
  if (![...box.min, ...box.max].every(bound => Number.isFinite(bound))) {
    return `The area of ${variantLabel} was NOT fitted: the box of its children could not be computed from their sizes.`;
  }

  // A rotation leaves the bounds a fraction of a pixel off (a 90 degrees
  // rotation gives a width of 20.0000000001), which would round the area up.
  box.min = box.min.map(roundBound);
  box.max = box.max.map(roundBound);

  const sizes = [
    box.max[0] - box.min[0],
    box.max[1] - box.min[1],
    box.max[2] - box.min[2],
  ];
  // The area is stored as integers: keep it symmetric (so the center of
  // rotation is exactly the origin) by rounding the half-sizes up.
  const areaMin = [0, 0, 0];
  const areaMax = [0, 0, 0];
  const offsets = [0, 0, 0];
  for (let axis = 0; axis < 3; axis++) {
    if (mode === 'centered_on_origin') {
      const halfSize = Math.max(1, Math.ceil(sizes[axis] / 2));
      areaMin[axis] = -halfSize;
      areaMax[axis] = halfSize;
      offsets[axis] = -(box.min[axis] + sizes[axis] / 2);
    } else {
      areaMin[axis] = 0;
      areaMax[axis] = Math.max(1, Math.ceil(sizes[axis]));
      offsets[axis] = -box.min[axis];
    }
  }
  if (!isRenderedIn3D) {
    areaMin[2] = 0;
    areaMax[2] = 0;
    offsets[2] = 0;
  }

  forEachInstance(variant, instance => {
    instance.setX(instance.getX() + offsets[0]);
    instance.setY(instance.getY() + offsets[1]);
    if (isRenderedIn3D) instance.setZ(instance.getZ() + offsets[2]);
  });

  variant.setAreaMinX(areaMin[0]);
  variant.setAreaMinY(areaMin[1]);
  variant.setAreaMinZ(areaMin[2]);
  variant.setAreaMaxX(areaMax[0]);
  variant.setAreaMaxY(areaMax[1]);
  variant.setAreaMaxZ(areaMax[2]);

  const axesCount = isRenderedIn3D ? 3 : 2;
  const formatPoint = (point: Array<number>): string =>
    point
      .slice(0, axesCount)
      .map(roundCoordinate)
      .join(';');
  const area = `${formatPoint(areaMin)} to ${formatPoint(areaMax)}`;
  const zeroPoint = formatPoint([0, 0, 0]);
  // The custom object turns around the center of its area (unless its own
  // events move that center at runtime): said with the area, the one moment
  // the agent can act on it.
  const areaCenter = areaMin.map((min, axis) => (min + areaMax[axis]) / 2);
  const rotationCenter =
    mode === 'centered_on_origin'
      ? `Its center of rotation, the center of that area unless its events set another one, is now its own position (${zeroPoint}).`
      : `Its center of rotation, the center of that area unless its events set another one, is at ${formatPoint(
          areaCenter
        )} from its own position (\`centered_on_origin\` puts the two together).`;

  return [
    `Fitted the area of ${variantLabel} to its children: ${area}${
      mode === 'centered_on_origin'
        ? ` (children moved so (${zeroPoint}) is their center)`
        : ` (children moved so (${zeroPoint}) is their minimum corner)`
    }.`,
    rotationCenter,
    getChildBoxesDescription(childBoxes, offsets, axesCount),
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Fit the area of every variant of a custom object (the default one included)
 * to its own child instances.
 */
export const fitCustomObjectAreaToChildren = async ({
  project,
  eventsBasedObject,
  mode,
  pixiResourcesLoader,
}: {|
  project: gdProject,
  eventsBasedObject: gdEventsBasedObject,
  mode: FitAreaMode,
  pixiResourcesLoader: any,
|}): Promise<Array<string>> => {
  const isRenderedIn3D = eventsBasedObject.isRenderedIn3D();
  const variants = eventsBasedObject.getVariants();
  const variantsToFit = [
    {
      variant: eventsBasedObject.getDefaultVariant(),
      label: 'the default variant',
    },
    ...mapFor(0, variants.getVariantsCount(), i => {
      const variant = variants.getVariantAt(i);
      return { variant, label: `the variant "${variant.getName()}"` };
    }),
  ];

  // The size and the origin of a 3D model come from the model file, and every
  // variant configures its own children: read them all before measuring.
  await ensureModel3DMeasurementsLoaded(
    variantsToFit.reduce(
      (objects, { variant }) => [...objects, ...getVariantObjects(variant)],
      []
    ),
    project,
    pixiResourcesLoader
  );

  const messages = variantsToFit
    .map(({ variant, label }) =>
      fitVariantAreaToChildren(
        project,
        variant,
        isRenderedIn3D,
        mode,
        label,
        pixiResourcesLoader
      )
    )
    .filter(Boolean);

  if (messages.length === 0) {
    messages.push(
      'No area was fitted: no variant of this custom object has a child instance placed yet (place them with `put_3d_instances`/`put_2d_instances` on a `custom_object_variant` scope).'
    );
  }
  return messages;
};

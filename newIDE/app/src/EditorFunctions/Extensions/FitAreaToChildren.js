// @flow
import { mapFor } from '../../Utils/MapFor';
import { getObjectSizeInfo } from '../Utils';
import { ensureModel3DOriginPointsLoaded } from '../Model3DSizeInfo';

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

/**
 * The box occupied by the child instances of a variant, in the local space of
 * the custom object. Rotations are ignored (the box is axis-aligned on the
 * unrotated children), like the "Fit to content" button of the editor.
 */
const getChildInstancesBox = (
  project: gdProject,
  variant: gdEventsBasedObjectVariant,
  pixiResourcesLoader: any
): Box | null => {
  const objects = variant.getObjects();
  let box: Box | null = null;

  forEachInstance(variant, instance => {
    const objectName = instance.getObjectName();
    if (!objects.hasObjectNamed(objectName)) return;
    const sizeInfo = getObjectSizeInfo(
      objects.getObject(objectName),
      project,
      pixiResourcesLoader
    );
    const defaultSizes = sizeInfo
      ? [sizeInfo.width, sizeInfo.height, sizeInfo.depth]
      : [null, null, null];
    const origins = sizeInfo
      ? [sizeInfo.originX, sizeInfo.originY, sizeInfo.originZ]
      : [null, null, null];
    const sizes = [
      instance.hasCustomSize() ? instance.getCustomWidth() : defaultSizes[0],
      instance.hasCustomSize() ? instance.getCustomHeight() : defaultSizes[1],
      instance.hasCustomDepth() ? instance.getCustomDepth() : defaultSizes[2],
    ];
    const positions = [instance.getX(), instance.getY(), instance.getZ()];

    const instanceMin = [0, 0, 0];
    const instanceMax = [0, 0, 0];
    for (let axis = 0; axis < 3; axis++) {
      const size = sizes[axis] || 0;
      const defaultSize = defaultSizes[axis];
      const origin = origins[axis] || 0;
      // The origin is given for the default size: scale it to the actual one.
      const originOffset =
        defaultSize && defaultSize > 0 ? origin * (size / defaultSize) : origin;
      instanceMin[axis] = positions[axis] - originOffset;
      instanceMax[axis] = instanceMin[axis] + size;
    }
    const currentBox = box;
    if (!currentBox) {
      box = { min: [...instanceMin], max: [...instanceMax] };
    } else {
      for (let axis = 0; axis < 3; axis++) {
        currentBox.min[axis] = Math.min(
          currentBox.min[axis],
          instanceMin[axis]
        );
        currentBox.max[axis] = Math.max(
          currentBox.max[axis],
          instanceMax[axis]
        );
      }
    }
  });
  return box;
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
  const box = getChildInstancesBox(project, variant, pixiResourcesLoader);
  if (!box) return null;

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

  const area = isRenderedIn3D
    ? `${areaMin[0]};${areaMin[1]};${areaMin[2]} to ${areaMax[0]};${
        areaMax[1]
      };${areaMax[2]}`
    : `${areaMin[0]};${areaMin[1]} to ${areaMax[0]};${areaMax[1]}`;
  return `Fitted the area of ${variantLabel} to its children: ${area}${
    mode === 'centered_on_origin'
      ? ' (children moved so (0;0;0) is their center, which is also the center of rotation of the custom object)'
      : ' (children moved so (0;0;0) is their minimum corner)'
  }.`;
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
  const objects = eventsBasedObject.getObjects();
  // The origin of a 3D model comes from the model file: load them, otherwise
  // the box of the children would be computed on unknown origins.
  await ensureModel3DOriginPointsLoaded(
    mapFor(0, objects.getObjectsCount(), i => objects.getObjectAt(i)),
    project,
    pixiResourcesLoader
  );

  const isRenderedIn3D = eventsBasedObject.isRenderedIn3D();
  const messages: Array<string> = [];
  const defaultVariantMessage = fitVariantAreaToChildren(
    project,
    eventsBasedObject.getDefaultVariant(),
    isRenderedIn3D,
    mode,
    'the default variant',
    pixiResourcesLoader
  );
  if (defaultVariantMessage) messages.push(defaultVariantMessage);

  const variants = eventsBasedObject.getVariants();
  mapFor(0, variants.getVariantsCount(), i => {
    const variant = variants.getVariantAt(i);
    const message = fitVariantAreaToChildren(
      project,
      variant,
      isRenderedIn3D,
      mode,
      `the variant "${variant.getName()}"`,
      pixiResourcesLoader
    );
    if (message) messages.push(message);
  });

  if (messages.length === 0) {
    messages.push(
      'No area was fitted: no variant of this custom object has a child instance placed yet (place them with `put_3d_instances`/`put_2d_instances` on a `custom_object_variant` scope).'
    );
  }
  return messages;
};

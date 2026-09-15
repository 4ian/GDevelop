// @flow
import * as THREE from 'three';

const gd: libGDevelop = global.gd;

/**
 * Where the origin (the point an instance x;y;z positions) and the center
 * (the point rotations turn around) of a 3D model are, as a fraction of the
 * object size on each axis. `null` on an axis means "the model's own origin",
 * which is only known once the model itself is loaded.
 */
export type LocationPoint = [number | null, number | null, number | null];

// Same locations as `gdjs.Model3DRuntimeObject` (`getPointForLocation`).
const getPointForLocation = (location: string): LocationPoint => {
  switch (location) {
    case 'CenteredOnZ':
      return [null, null, 0.5];
    case 'ObjectCenter':
      return [0.5, 0.5, 0.5];
    case 'BottomCenterZ':
      return [0.5, 0.5, 0];
    case 'BottomCenterY':
      return [0.5, 1, 0.5];
    case 'TopLeft':
      return [0, 0, 0];
    case 'ModelOrigin':
    default:
      return [null, null, null];
  }
};

// The origin point of a model, as a fraction of its size, keyed by the model
// resource and the rotation applied to it (both change the bounding box).
// Filled by `ensureModel3DOriginPointLoaded`, read synchronously afterwards.
const modelOriginPointsByKey: { [string]: [number, number, number] } = {};

const epsilon = 1 / (1 << 16);

const getModelKey = (configuration: gdModel3DObjectConfiguration): string =>
  [
    configuration.getModelResourceName(),
    configuration.getRotationX(),
    configuration.getRotationY(),
    configuration.getRotationZ(),
    configuration.getOriginLocation(),
  ].join('|');

/**
 * The origin of the model inside its bounding box, as a fraction of its size.
 *
 * Same computation as `gdjs.Model3DRuntimeObject3DRenderer`
 * (`stretchModelIntoUnitaryCube` + `_updateDefaultTransformation`) and
 * `Model3DEditor.modelSize`: the model is rotated as configured, its bounding
 * box is measured (kept including the origin when the origin is the model's
 * own one) and the origin is read in that box.
 */
const computeModelOriginPoint = (
  gltfScene: any,
  configuration: gdModel3DObjectConfiguration
): [number, number, number] => {
  // The loaded model is a template that the renderers clone before using:
  // rotate it in place to measure it, then put it back as it was.
  const savedRotation = gltfScene.rotation.clone();
  const savedRotationOrder = gltfScene.rotation.order;
  gltfScene.rotation.order = 'ZYX';
  gltfScene.rotation.set(
    (configuration.getRotationX() * Math.PI) / 180,
    (configuration.getRotationY() * Math.PI) / 180,
    (configuration.getRotationZ() * Math.PI) / 180
  );
  gltfScene.updateMatrixWorld(true);

  const boundingBox = new THREE.Box3().setFromObject(gltfScene);

  gltfScene.rotation.copy(savedRotation);
  gltfScene.rotation.order = savedRotationOrder;
  gltfScene.updateMatrixWorld(true);
  const originPoint = getPointForLocation(configuration.getOriginLocation());
  if (originPoint.some(coordinate => coordinate === null)) {
    // Keep the origin as part of the model (same as the runtime): the object
    // box never excludes the point the instances are positioned by.
    boundingBox.expandByPoint(
      new THREE.Vector3(
        originPoint[0] === null ? 0 : boundingBox.min.x,
        originPoint[1] === null ? 0 : boundingBox.min.y,
        originPoint[2] === null ? 0 : boundingBox.min.z
      )
    );
  }
  const modelWidth = boundingBox.max.x - boundingBox.min.x;
  const modelHeight = boundingBox.max.y - boundingBox.min.y;
  const modelDepth = boundingBox.max.z - boundingBox.min.z;

  return [
    modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth,
    // The model is flipped on the Y axis by the renderer.
    modelHeight < epsilon ? 1 : 1 + boundingBox.min.y / modelHeight,
    modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth,
  ];
};

const asModel3DConfiguration = (
  object: gdObject
): gdModel3DObjectConfiguration | null =>
  object.getType() === 'Scene3D::Model3DObject'
    ? gd.asModel3DConfiguration(object.getConfiguration())
    : null;

/**
 * Load the 3D model of `object` (if it is one) so that its origin can be read
 * synchronously by `getObjectSizeInfo`. Never throws: a model that cannot be
 * loaded simply leaves the origin unknown (reported as `null`).
 */
export const ensureModel3DOriginPointLoaded = async (
  object: gdObject,
  project: gdProject,
  pixiResourcesLoader: any
): Promise<void> => {
  const configuration = asModel3DConfiguration(object);
  if (!configuration) return;
  const key = getModelKey(configuration);
  if (modelOriginPointsByKey[key]) return;
  try {
    const gltf = await pixiResourcesLoader.get3DModel(
      project,
      configuration.getModelResourceName()
    );
    if (!gltf || !gltf.scene) return;
    modelOriginPointsByKey[key] = computeModelOriginPoint(
      gltf.scene,
      configuration
    );
  } catch (error) {
    // The model is unavailable (missing resource, unreadable file...): the
    // origin stays unknown.
  }
};

/** Same as {@link ensureModel3DOriginPointLoaded}, for several objects. */
export const ensureModel3DOriginPointsLoaded = async (
  objects: Array<gdObject>,
  project: gdProject,
  pixiResourcesLoader: any
): Promise<void> => {
  await Promise.all(
    objects.map(object =>
      ensureModel3DOriginPointLoaded(object, project, pixiResourcesLoader)
    )
  );
};

/**
 * The origin and center of a 3D model object, as fractions of its size, with
 * the axes still unknown (the model's own origin, not loaded yet) left `null`.
 */
export const getModel3DLocationPoints = (
  configuration: gdModel3DObjectConfiguration
): {| originPoint: LocationPoint, centerPoint: LocationPoint |} => {
  const modelOriginPoint = modelOriginPointsByKey[getModelKey(configuration)];
  const resolve = (point: LocationPoint): LocationPoint =>
    modelOriginPoint
      ? [
          point[0] === null ? modelOriginPoint[0] : point[0],
          point[1] === null ? modelOriginPoint[1] : point[1],
          point[2] === null ? modelOriginPoint[2] : point[2],
        ]
      : point;

  return {
    originPoint: resolve(
      getPointForLocation(configuration.getOriginLocation())
    ),
    centerPoint: resolve(
      getPointForLocation(configuration.getCenterLocation())
    ),
  };
};

/** For tests: forget every loaded model origin. */
export const clearModel3DOriginPointsCache = () => {
  for (const key in modelOriginPointsByKey) {
    delete modelOriginPointsByKey[key];
  }
};

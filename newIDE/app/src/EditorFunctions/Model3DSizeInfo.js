// @flow
import { getModel3DBoundingBox } from '../ObjectsRendering/Model3DBoundingBox';

/**
 * Where the origin (the point an instance x;y;z positions) and the center (the
 * point rotations turn around) of a 3D model are, as a fraction of the object
 * size on each axis. `null` on an axis means "the origin the model was authored
 * with", only known once the model file itself is read.
 */
export type LocationPoint = [number | null, number | null, number | null];

const MODEL_3D_OBJECT_TYPE = 'Scene3D::Model3DObject';

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

/**
 * The configuration values needed to measure a model, read through the
 * properties of the object: they are the same for every object configuration,
 * where a cast to `gd.Model3DObjectConfiguration` would reinterpret the memory
 * of an object that only has the type of a 3D model (its extension not loaded,
 * an object created before it was installed...).
 */
type Model3DSettings = {|
  modelResourceName: string,
  rotationX: number,
  rotationY: number,
  rotationZ: number,
  originLocation: string,
  centerLocation: string,
|};

const getModel3DSettings = (object: gdObject): Model3DSettings | null => {
  if (object.getType() !== MODEL_3D_OBJECT_TYPE) return null;
  const properties = object.getConfiguration().getProperties();
  const getString = (name: string): string =>
    properties.has(name) ? properties.get(name).getValue() : '';
  const getNumber = (name: string): number => parseFloat(getString(name)) || 0;
  const modelResourceName = getString('modelResourceName');
  if (!modelResourceName) return null;
  return {
    modelResourceName,
    rotationX: getNumber('rotationX'),
    rotationY: getNumber('rotationY'),
    rotationZ: getNumber('rotationZ'),
    originLocation: getString('originLocation'),
    centerLocation: getString('centerLocation'),
  };
};

// The origin of a model inside its box, as a fraction of its size, keyed by the
// model resource and everything changing that box. Filled by
// `ensureModel3DOriginPointLoaded`, read synchronously afterwards.
const modelOriginPointsByKey: { [string]: [number, number, number] } = {};

const epsilon = 1 / (1 << 16);

const getModelKey = (settings: Model3DSettings): string =>
  [
    settings.modelResourceName,
    settings.rotationX,
    settings.rotationY,
    settings.rotationZ,
    settings.originLocation,
  ].join('|');

/**
 * The origin of the model inside its bounding box, as a fraction of its size.
 * Same computation as `_updateDefaultTransformation` in
 * `gdjs.Model3DRuntimeObject3DRenderer`.
 */
const computeModelOriginPoint = (
  gltfScene: any,
  settings: Model3DSettings
): [number, number, number] => {
  const boundingBox = getModel3DBoundingBox(gltfScene, {
    rotationX: settings.rotationX,
    rotationY: settings.rotationY,
    rotationZ: settings.rotationZ,
    keepsModelOrigin: settings.originLocation === 'ModelOrigin',
  });
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

/**
 * Read the 3D model of `object` (if it is one) so that its origin can be given
 * synchronously by `getModel3DLocationPoints`. Never throws: a model that
 * cannot be read simply leaves its origin unknown.
 */
export const ensureModel3DOriginPointLoaded = async (
  object: gdObject,
  project: gdProject,
  pixiResourcesLoader: any
): Promise<void> => {
  const settings = getModel3DSettings(object);
  if (!settings || modelOriginPointsByKey[getModelKey(settings)]) return;
  try {
    const gltf = await pixiResourcesLoader.get3DModel(
      project,
      settings.modelResourceName
    );
    if (!gltf || !gltf.scene) return;
    modelOriginPointsByKey[getModelKey(settings)] = computeModelOriginPoint(
      gltf.scene,
      settings
    );
  } catch (error) {
    // The model is unavailable (missing resource, unreadable file...).
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
 * The origin and the center of a 3D model object, as fractions of its size.
 * The axes that are the origin of the model itself are `null` until the model
 * is read by `ensureModel3DOriginPointLoaded`, and for an object that is not a
 * 3D model at all.
 */
export const getModel3DLocationPoints = (
  object: gdObject
): {| originPoint: LocationPoint, centerPoint: LocationPoint |} => {
  const settings = getModel3DSettings(object);
  const modelOriginPoint = settings
    ? modelOriginPointsByKey[getModelKey(settings)]
    : null;
  const resolve = (location: string): LocationPoint => {
    const point = getPointForLocation(location);
    if (!modelOriginPoint) return point;
    return [
      point[0] === null ? modelOriginPoint[0] : point[0],
      point[1] === null ? modelOriginPoint[1] : point[1],
      point[2] === null ? modelOriginPoint[2] : point[2],
    ];
  };

  return {
    originPoint: resolve(settings ? settings.originLocation : ''),
    centerPoint: resolve(settings ? settings.centerLocation : ''),
  };
};

/** For tests: forget every model origin read so far. */
export const clearModel3DOriginPointsCache = () => {
  for (const key in modelOriginPointsByKey) {
    delete modelOriginPointsByKey[key];
  }
};

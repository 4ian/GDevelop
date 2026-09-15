// @flow
import { getModel3DBoundingBox } from '../ObjectsRendering/Model3DBoundingBox';
import { type ObjectSizeInfo } from './Utils';

const MODEL_3D_OBJECT_TYPE = 'Scene3D::Model3DObject';

const epsilon = 1 / (1 << 16);

/**
 * A point of a 3D model as a fraction of its size on each axis. `null` on an
 * axis means "the origin the model was authored with", only known once the
 * model file itself is read.
 */
type LocationPoint = [number | null, number | null, number | null];

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
 * What a 3D model object configures, read through the properties of its
 * configuration: they are the same for every object configuration, where a
 * cast to `gd.Model3DObjectConfiguration` would reinterpret the memory of an
 * object that only has the type of a 3D model (its extension not loaded, an
 * object created before it was installed...).
 */
type Model3DSettings = {|
  modelResourceName: string,
  // The dimensions configured on the object, which are the ones it really has
  // only when `keepAspectRatio` is false.
  configuredSize: [number, number, number],
  keepAspectRatio: boolean,
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
    configuredSize: [
      getNumber('width'),
      getNumber('height'),
      getNumber('depth'),
    ],
    keepAspectRatio: getString('keepAspectRatio') === 'true',
    rotationX: getNumber('rotationX'),
    rotationY: getNumber('rotationY'),
    rotationZ: getNumber('rotationZ'),
    originLocation: getString('originLocation'),
    centerLocation: getString('centerLocation'),
  };
};

/** What reading a model file tells about it, whatever the object using it. */
type Model3DMeasurement = {|
  // The size of the model once rotated as the object configures it.
  modelSize: [number, number, number],
  // Where the origin of the model is in that size, as a fraction of it.
  modelOriginPoint: [number, number, number],
|};

// Measurements by model resource and everything else changing the box, each
// kept with the model it was made on: the loader hands a new one when its
// cache was burst or the resource reloaded, which invalidates the measurement.
const measurementsByKey: Map<
  string,
  {| gltfScene: any, measurement: Model3DMeasurement |}
> = new Map();
// The measurements being read, so that concurrent calls for the same model
// (`describe_instances` asks for one per instance) read it once.
const pendingMeasurementsByKey: Map<string, Promise<void>> = new Map();

const getModelKey = (settings: Model3DSettings): string =>
  [
    settings.modelResourceName,
    settings.rotationX,
    settings.rotationY,
    settings.rotationZ,
    settings.originLocation,
  ].join('|');

/**
 * Measure a model as `_updateDefaultTransformation` does in
 * `gdjs.Model3DRuntimeObject3DRenderer`.
 */
const measureModel = (
  gltfScene: any,
  settings: Model3DSettings
): Model3DMeasurement => {
  const boundingBox = getModel3DBoundingBox(gltfScene, {
    rotationX: settings.rotationX,
    rotationY: settings.rotationY,
    rotationZ: settings.rotationZ,
    keepsModelOrigin: settings.originLocation === 'ModelOrigin',
  });
  const modelSize = [
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
    boundingBox.max.z - boundingBox.min.z,
  ];
  return {
    modelSize: [modelSize[0], modelSize[1], modelSize[2]],
    modelOriginPoint: [
      modelSize[0] < epsilon ? 0 : -boundingBox.min.x / modelSize[0],
      // The model is flipped on the Y axis by the renderer.
      modelSize[1] < epsilon ? 1 : 1 + boundingBox.min.y / modelSize[1],
      modelSize[2] < epsilon ? 0 : -boundingBox.min.z / modelSize[2],
    ],
  };
};

/**
 * Read the 3D model of `object` (if it is one), so that its real size, origin
 * and center can be given synchronously by `getModel3DObjectSizeInfo`
 * afterwards. Never throws: a model that cannot be read leaves the object
 * measured by what it configures only.
 */
export const ensureModel3DMeasurementLoaded = (
  object: gdObject,
  project: gdProject,
  pixiResourcesLoader: any
): Promise<void> => {
  const settings = getModel3DSettings(object);
  if (!settings) return Promise.resolve();
  const key = getModelKey(settings);
  const pendingMeasurement = pendingMeasurementsByKey.get(key);
  if (pendingMeasurement) return pendingMeasurement;

  const measuring = (async () => {
    try {
      const gltf = await pixiResourcesLoader.get3DModel(
        project,
        settings.modelResourceName
      );
      if (!gltf || !gltf.scene) return;
      const measured = measurementsByKey.get(key);
      if (!measured || measured.gltfScene !== gltf.scene) {
        measurementsByKey.set(key, {
          gltfScene: gltf.scene,
          measurement: measureModel(gltf.scene, settings),
        });
      }
    } catch (error) {
      // The model is unavailable (missing resource, unreadable file...).
    } finally {
      pendingMeasurementsByKey.delete(key);
    }
  })();
  pendingMeasurementsByKey.set(key, measuring);
  return measuring;
};

/** Same as {@link ensureModel3DMeasurementLoaded}, for several objects. */
export const ensureModel3DMeasurementsLoaded = async (
  objects: Array<gdObject>,
  project: gdProject,
  pixiResourcesLoader: any
): Promise<void> => {
  await Promise.all(
    [...new Set(objects)].map(object =>
      ensureModel3DMeasurementLoaded(object, project, pixiResourcesLoader)
    )
  );
};

/**
 * The default size, origin and center of a 3D model object, or null when it is
 * not one.
 *
 * Neither is what the object configures: `keepAspectRatio` fits the dimensions
 * to the model, and the origin and the center follow `originLocation` and
 * `centerLocation`, which are usually the origin the model was authored with.
 * Until the model is read (`ensureModel3DMeasurementLoaded`), the configured
 * dimensions and the usual origin and center are given back.
 */
export const getModel3DObjectSizeInfo = (
  object: gdObject
): ObjectSizeInfo | null => {
  const settings = getModel3DSettings(object);
  if (!settings) return null;
  const measured = measurementsByKey.get(getModelKey(settings));
  const measurement = measured ? measured.measurement : null;

  // `_updateDefaultTransformation`: the model fitted in the configured
  // dimensions, keeping its proportions.
  let size = settings.configuredSize;
  if (measurement && settings.keepAspectRatio) {
    const scaleRatio = Math.min(
      ...measurement.modelSize.map((modelSize, axis) =>
        modelSize < epsilon
          ? Number.POSITIVE_INFINITY
          : settings.configuredSize[axis] / modelSize
      )
    );
    if (Number.isFinite(scaleRatio)) {
      size = [
        scaleRatio * measurement.modelSize[0],
        scaleRatio * measurement.modelSize[1],
        scaleRatio * measurement.modelSize[2],
      ];
    }
  }

  const atSize = (location: string, axis: number, fallback: number): number => {
    const fraction = getPointForLocation(location)[axis];
    if (fraction !== null) return fraction * size[axis];
    if (!measurement) return fallback;
    return measurement.modelOriginPoint[axis] * size[axis];
  };

  return {
    width: size[0],
    height: size[1],
    depth: size[2],
    originX: atSize(settings.originLocation, 0, 0),
    originY: atSize(settings.originLocation, 1, 0),
    originZ: atSize(settings.originLocation, 2, 0),
    centerX: atSize(settings.centerLocation, 0, size[0] / 2),
    centerY: atSize(settings.centerLocation, 1, size[1] / 2),
    centerZ: atSize(settings.centerLocation, 2, size[2] / 2),
  };
};

/** For tests: forget every model read so far. */
export const clearModel3DMeasurementsCache = () => {
  measurementsByKey.clear();
  pendingMeasurementsByKey.clear();
};

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

// What was measured of the models of ONE project, by model resource and
// everything else changing the box. Each measurement is kept with the model it
// was made on: the loader hands a new one when its cache was burst or the
// resource reloaded, which invalidates the measurement.
type ProjectMeasurements = {|
  measured: Map<string, {| gltfScene: any, measurement: Model3DMeasurement |}>,
  // The measurements being read, so that concurrent calls for the same model
  // (`describe_instances` asks for one per instance) read it once.
  pending: Map<string, Promise<void>>,
|};

// Per project, so that two projects using the same resource name never share a
// measurement and nothing (the models included) is held after a project is
// closed.
const measurementsByProject: WeakMap<
  gdProject,
  ProjectMeasurements
> = new WeakMap();

const getProjectMeasurements = (project: gdProject): ProjectMeasurements => {
  const projectMeasurements = measurementsByProject.get(project);
  if (projectMeasurements) return projectMeasurements;
  const newProjectMeasurements: ProjectMeasurements = {
    measured: new Map(),
    pending: new Map(),
  };
  measurementsByProject.set(project, newProjectMeasurements);
  return newProjectMeasurements;
};

/** What was measured of a model for a project, without remembering the read. */
const findMeasurement = (
  project: gdProject,
  settings: Model3DSettings
): Model3DMeasurement | null => {
  const projectMeasurements = measurementsByProject.get(project);
  if (!projectMeasurements) return null;
  const measured = projectMeasurements.measured.get(getModelKey(settings));
  return measured ? measured.measurement : null;
};

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
): Model3DMeasurement | null => {
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
  // A model with nothing to show has an empty box (its bounds are infinite):
  // there is nothing to measure, and every size computed from it would be
  // meaningless rather than merely approximate.
  if (!modelSize.every(size => Number.isFinite(size))) return null;
  return {
    modelSize: [modelSize[0], modelSize[1], modelSize[2]],
    // Where the origin of the model (0;0;0) sits in the box it was measured in.
    modelOriginPoint: [
      modelSize[0] < epsilon ? 0 : (0 - boundingBox.min.x) / modelSize[0],
      // The model is flipped on the Y axis by the renderer.
      modelSize[1] < epsilon ? 1 : 1 + boundingBox.min.y / modelSize[1],
      modelSize[2] < epsilon ? 0 : (0 - boundingBox.min.z) / modelSize[2],
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
  const { measured, pending } = getProjectMeasurements(project);
  const key = getModelKey(settings);
  const pendingMeasurement = pending.get(key);
  if (pendingMeasurement) return pendingMeasurement;

  // Started in a microtask, so that the pending entry below is in place before
  // anything can clear it: a loader throwing synchronously would otherwise
  // leave a settled promise behind and never let a later call read the model.
  const measuring = Promise.resolve().then(async () => {
    try {
      const gltf = await pixiResourcesLoader.get3DModel(
        project,
        settings.modelResourceName
      );
      if (!gltf || !gltf.scene) {
        measured.delete(key);
        return;
      }
      // The very same model as the one already measured: nothing changed about
      // it, and measuring it again would only walk it for the same numbers.
      const alreadyMeasured = measured.get(key);
      if (alreadyMeasured && alreadyMeasured.gltfScene === gltf.scene) return;

      const measurement = measureModel(gltf.scene, settings);
      if (!measurement) {
        measured.delete(key);
        return;
      }
      measured.set(key, { gltfScene: gltf.scene, measurement });
    } catch (error) {
      // The model became unreadable (missing resource, unreadable file...):
      // what was measured on the previous one no longer describes it.
      measured.delete(key);
    } finally {
      pending.delete(key);
    }
  });
  pending.set(key, measuring);
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
  object: gdObject,
  project: gdProject
): ObjectSizeInfo | null => {
  const settings = getModel3DSettings(object);
  if (!settings) return null;
  const measurement = findMeasurement(project, settings);

  // `_updateDefaultTransformation`: the model fitted in the configured
  // dimensions, keeping its proportions.
  let size = settings.configuredSize;
  if (measurement && settings.keepAspectRatio) {
    let scaleRatio = Math.min(
      ...measurement.modelSize.map((modelSize, axis) =>
        modelSize < epsilon
          ? Number.POSITIVE_INFINITY
          : settings.configuredSize[axis] / modelSize
      )
    );
    // A model with no extent at all: the runtime keeps it at its own size.
    if (!Number.isFinite(scaleRatio)) scaleRatio = 1;
    size = [
      scaleRatio * measurement.modelSize[0],
      scaleRatio * measurement.modelSize[1],
      scaleRatio * measurement.modelSize[2],
    ];
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

/**
 * Whether the size, origin and center given for a 3D model object are measured
 * on its model, or still the guess made before it is read. Exact without the
 * model only when nothing about the object depends on its geometry.
 *
 * Callers computing positions from these values (rather than showing them)
 * must check it: an unread model has neither its fitted size nor the origin it
 * was authored with, and no instance size can make up for them.
 */
export const isModel3DObjectMeasured = (
  object: gdObject,
  project: gdProject
): boolean => {
  if (object.getType() !== MODEL_3D_OBJECT_TYPE) return true;
  // A 3D model naming no resource has no geometry to answer for at all.
  const settings = getModel3DSettings(object);
  if (!settings) return false;
  if (findMeasurement(project, settings)) return true;
  const dependsOnModel = (location: string) =>
    getPointForLocation(location).some(fraction => fraction === null);
  return (
    !settings.keepAspectRatio &&
    !dependsOnModel(settings.originLocation) &&
    !dependsOnModel(settings.centerLocation)
  );
};

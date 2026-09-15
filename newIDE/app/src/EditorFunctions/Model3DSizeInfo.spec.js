// @flow
import * as THREE from 'three';
import {
  ensureModel3DMeasurementLoaded,
  getModel3DObjectSizeInfo,
  isModel3DObjectMeasured,
} from './Model3DSizeInfo';

/**
 * A model the size of which and the origin of which are known by construction,
 * standing in for a `.glb` (what the loader hands over is a three.js object,
 * whatever the file it was read from).
 *
 * `boxSize` is the size of the geometry and `boxCenter` where its middle is,
 * so the origin of the model (0;0;0) is at a chosen place in it.
 */
const makeModel = (
  boxSize: [number, number, number],
  boxCenter: [number, number, number]
) => {
  const model = new THREE.Group();
  model.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(...boxSize).translate(...boxCenter),
      new THREE.MeshBasicMaterial()
    )
  );
  return model;
};

// Geometry spanning x -1..3, y -0.5..1.5, z 0..2: the origin of the model is a
// quarter along its width, three quarters along its height (the renderer flips
// the model on Y) and at the very start of its depth.
const OFF_CENTER_MODEL = makeModel([4, 2, 2], [1, 0.5, 1]);
// Geometry spanning x 2..4: the origin of the model is outside it, so the box
// grows to hold it when the object is positioned by that origin.
const ORIGIN_OUTSIDE_MODEL = makeModel([2, 2, 2], [3, 1, 1]);

const makeModel3DObject = (properties: { [string]: string | number }) => ({
  getName: () => 'Model',
  getType: () => 'Scene3D::Model3DObject',
  getConfiguration: () => ({
    getProperties: () => ({
      has: (name: string) => properties[name] !== undefined,
      get: (name: string) => ({ getValue: () => String(properties[name]) }),
    }),
  }),
});

const makeModel3DObjectProperties = (overrides: Object = {}) => ({
  modelResourceName: 'model.glb',
  width: 100,
  height: 50,
  depth: 50,
  keepAspectRatio: 'false',
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  originLocation: 'ModelOrigin',
  centerLocation: 'ModelOrigin',
  ...overrides,
});

const makeLoader = (model: any) => ({
  get3DModel: () => Promise.resolve({ scene: model }),
});
const failingLoader = {
  get3DModel: () => Promise.reject(new Error('unreadable model')),
};
const throwingLoader = {
  get3DModel: () => {
    throw new Error('unreadable model');
  },
};

describe('Model3DSizeInfo', () => {
  describe('getModel3DObjectSizeInfo', () => {
    it('reads the origin a model was authored with', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );

      // The origin fractions (0.25, 0.75, 0) at the size of the object.
      expect(getModel3DObjectSizeInfo(object, project)).toEqual({
        width: 100,
        height: 50,
        depth: 50,
        originX: 25,
        originY: 37.5,
        originZ: 0,
        centerX: 25,
        centerY: 37.5,
        centerZ: 0,
      });
    });

    it('takes the origin and the center from their location when it is a known one', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(
        makeModel3DObjectProperties({
          originLocation: 'TopLeft',
          centerLocation: 'ObjectCenter',
        })
      );
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );

      const sizeInfo = getModel3DObjectSizeInfo(object, project);
      expect(sizeInfo).toMatchObject({
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 50,
        centerY: 25,
        centerZ: 25,
      });
    });

    it('fits the dimensions to the model when it keeps its aspect ratio', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(
        makeModel3DObjectProperties({
          width: 100,
          height: 100,
          depth: 100,
          keepAspectRatio: 'true',
        })
      );
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );

      // A 4x2x2 model in a 100x100x100 box: scaled by 25, not stretched.
      expect(getModel3DObjectSizeInfo(object, project)).toMatchObject({
        width: 100,
        height: 50,
        depth: 50,
        originX: 25,
        originY: 37.5,
      });
    });

    it('keeps the origin of the model inside the box when the object is positioned by it', async () => {
      const project: any = {};
      const properties = makeModel3DObjectProperties({
        width: 100,
        height: 100,
        depth: 100,
        keepAspectRatio: 'true',
      });
      const positionedByTheModelOrigin: any = makeModel3DObject(properties);
      const positionedByItsCorner: any = makeModel3DObject({
        ...properties,
        // Another resource name: the two are measured separately.
        modelResourceName: 'corner.glb',
        originLocation: 'TopLeft',
      });
      const loader = makeLoader(ORIGIN_OUTSIDE_MODEL);
      await ensureModel3DMeasurementLoaded(
        positionedByTheModelOrigin,
        project,
        loader
      );
      await ensureModel3DMeasurementLoaded(
        positionedByItsCorner,
        project,
        loader
      );

      // The geometry is 2x2x2 at x 2..4: holding the origin makes it 4 wide.
      expect(
        getModel3DObjectSizeInfo(positionedByTheModelOrigin, project)
      ).toMatchObject({ width: 100, height: 50, depth: 50, originX: 0 });
      expect(
        getModel3DObjectSizeInfo(positionedByItsCorner, project)
      ).toMatchObject({ width: 100, height: 100, depth: 100 });
    });

    it('gives back what the object configures until its model is read', () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      expect(getModel3DObjectSizeInfo(object, project)).toEqual({
        width: 100,
        height: 50,
        depth: 50,
        originX: 0,
        originY: 0,
        originZ: 0,
        centerX: 50,
        centerY: 25,
        centerZ: 25,
      });
    });

    it('is null for an object that is not a 3D model', () => {
      const project: any = {};
      const object: any = {
        ...makeModel3DObject(makeModel3DObjectProperties()),
        getType: () => 'Sprite',
      };

      expect(getModel3DObjectSizeInfo(object, project)).toBe(null);
    });
  });

  describe('isModel3DObjectMeasured', () => {
    it('is false until the model is read, when anything depends on its geometry', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      expect(isModel3DObjectMeasured(object, project)).toBe(false);
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );
      expect(isModel3DObjectMeasured(object, project)).toBe(true);
    });

    it('is false for a model naming no resource', () => {
      const project: any = {};
      const object: any = makeModel3DObject(
        makeModel3DObjectProperties({ modelResourceName: '' })
      );

      expect(isModel3DObjectMeasured(object, project)).toBe(false);
    });

    it('is true without the model when nothing depends on its geometry', () => {
      const project: any = {};
      const object: any = makeModel3DObject(
        makeModel3DObjectProperties({
          originLocation: 'TopLeft',
          centerLocation: 'ObjectCenter',
          keepAspectRatio: 'false',
        })
      );

      expect(isModel3DObjectMeasured(object, project)).toBe(true);
    });
  });

  describe('reading the models', () => {
    it('measures a model once for concurrent reads of it', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());
      const model = makeModel([4, 2, 2], [1, 0.5, 1]);
      const updateMatrixWorld = jest.spyOn(model, 'updateMatrixWorld');
      const gltf = Promise.resolve({ scene: model });

      await Promise.all(
        Array(20)
          .fill(object)
          .map(() =>
            ensureModel3DMeasurementLoaded(object, project, {
              get3DModel: () => gltf,
            })
          )
      );

      // Rotated and put back once: a single measurement.
      expect(updateMatrixWorld).toHaveBeenCalledTimes(2);
    });

    it('measures a model once for repeated reads of it', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());
      const model = makeModel([4, 2, 2], [1, 0.5, 1]);
      const updateMatrixWorld = jest.spyOn(model, 'updateMatrixWorld');
      const loader = makeLoader(model);

      for (let readCount = 0; readCount < 20; readCount++) {
        await ensureModel3DMeasurementLoaded(object, project, loader);
      }

      // The loader hands the same model every time: it is measured once.
      expect(updateMatrixWorld).toHaveBeenCalledTimes(2);
      expect(getModel3DObjectSizeInfo(object, project)).toMatchObject({
        originX: 25,
      });
    });

    it('measures the model again when the loader hands another one', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );
      expect(getModel3DObjectSizeInfo(object, project)).toMatchObject({
        originX: 25,
      });

      // The resource was reloaded: the loader gives a new model.
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(ORIGIN_OUTSIDE_MODEL)
      );
      expect(getModel3DObjectSizeInfo(object, project)).toMatchObject({
        originX: 0,
      });
    });

    it('forgets a measurement when the model becomes unreadable', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );
      expect(isModel3DObjectMeasured(object, project)).toBe(true);

      await ensureModel3DMeasurementLoaded(object, project, failingLoader);
      expect(isModel3DObjectMeasured(object, project)).toBe(false);
    });

    it('lets a read be tried again after a loader throwing on the spot', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      await ensureModel3DMeasurementLoaded(object, project, throwingLoader);
      expect(isModel3DObjectMeasured(object, project)).toBe(false);

      // The throw must not have left the read marked as still running.
      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(OFF_CENTER_MODEL)
      );
      expect(isModel3DObjectMeasured(object, project)).toBe(true);
    });

    it('measures nothing on a model with nothing to show', async () => {
      const project: any = {};
      const object: any = makeModel3DObject(
        makeModel3DObjectProperties({
          // The box of an empty model is infinite: it has no size to read.
          originLocation: 'TopLeft',
          keepAspectRatio: 'true',
        })
      );

      await ensureModel3DMeasurementLoaded(
        object,
        project,
        makeLoader(new THREE.Group())
      );

      expect(isModel3DObjectMeasured(object, project)).toBe(false);
      expect(getModel3DObjectSizeInfo(object, project)).toMatchObject({
        width: 100,
        height: 50,
        depth: 50,
      });
    });

    it('never shares a measurement between two projects', async () => {
      const firstProject: any = {};
      const secondProject: any = {};
      const object: any = makeModel3DObject(makeModel3DObjectProperties());

      // Both read the same resource name at the same time, from their own
      // loader: each gets its own model.
      await Promise.all([
        ensureModel3DMeasurementLoaded(
          object,
          firstProject,
          makeLoader(OFF_CENTER_MODEL)
        ),
        ensureModel3DMeasurementLoaded(
          object,
          secondProject,
          makeLoader(ORIGIN_OUTSIDE_MODEL)
        ),
      ]);

      expect(getModel3DObjectSizeInfo(object, firstProject)).toMatchObject({
        originX: 25,
      });
      expect(getModel3DObjectSizeInfo(object, secondProject)).toMatchObject({
        originX: 0,
      });
    });
  });
});

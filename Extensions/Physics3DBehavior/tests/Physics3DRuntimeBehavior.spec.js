// @ts-check
describe('gdjs.Physics3DRuntimeBehavior', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const frameDuration = 1000 / 60;

  beforeEach(async function () {
    // Wait for the Jolt library to be loaded.
    for (let index = 0; index < 400 && !window.Jolt; index++) {
      await delay(5);
    }
    if (!window.Jolt) {
      throw new Error('Timeout loading Jolt.');
    }
  });

  const createScene = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.loadFromScene({
      sceneData: {
        layers: [
          {
            name: '',
            visibility: true,
            cameras: [],
            effects: [],
            ambientLightColorR: 127,
            ambientLightColorB: 127,
            ambientLightColorG: 127,
            isLightingLayer: false,
            followBaseLayerCamera: false,
          },
        ],
        variables: [],
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene1',
        name: 'Scene1',
        stopSoundsOnStartup: false,
        title: '',
        renderer3DWorldScale: 100,
        behaviorsSharedData: [],
        objects: [],
        objectsGroups: [],
        instances: [],
        usedResources: [],
        uiSettings: {
          grid: false,
          gridType: 'rectangular',
          gridWidth: 10,
          gridHeight: 10,
          gridDepth: 10,
          gridOffsetX: 0,
          gridOffsetY: 0,
          gridOffsetZ: 0,
          gridColor: 0,
          gridAlpha: 1,
          snap: false,
        },
      },
      usedExtensionsWithVariablesData: [],
    });
    const physics3DSharedData = {
      name: 'Physics3D',
      type: 'Physics3D::Physics3DBehavior',
      gravityX: 0,
      gravityY: 0,
      gravityZ: -9.8,
      worldScale: 100,
    };
    runtimeScene.setInitialSharedDataForBehavior(
      'Physics3D',
      physics3DSharedData
    );
    runtimeScenes.push(runtimeScene);
    return runtimeScene;
  };

  /** @type {gdjs.RuntimeScene[]} */
  const runtimeScenes = [];
  afterEach(() => {
    // Free the memory of the physics engine.
    for (const runtimeScene of runtimeScenes) {
      runtimeScene.unloadScene();
    }
    runtimeScenes.length = 0;
  });

  const physics3DBehaviorData = (bodyType) => ({
    name: 'Physics3D',
    type: 'Physics3D::Physics3DBehavior',
    bodyType,
    bullet: false,
    fixedRotation: false,
    shape: 'Box',
    meshShapeResourceName: '',
    shapeOrientation: 'Z',
    shapeDimensionA: 0,
    shapeDimensionB: 0,
    shapeDimensionC: 0,
    shapeOffsetX: 0,
    shapeOffsetY: 0,
    shapeOffsetZ: 0,
    massCenterOffsetX: 0,
    massCenterOffsetY: 0,
    massCenterOffsetZ: 0,
    massOverride: 0,
    density: 1,
    friction: 0.5,
    restitution: 0,
    linearDamping: 0.1,
    angularDamping: 0.1,
    gravityScale: 1,
    layers: (1 << 4) | (1 << 0),
    masks: (1 << 4) | (1 << 0),
  });

  const addCube = (runtimeScene, name, bodyType, size) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name,
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors: [physics3DBehaviorData(bodyType)],
      // @ts-ignore - the content is not fully typed.
      content: size,
    });
    runtimeScene.addObject(object);
    return object;
  };

  /** @param {gdjs.RuntimeObject} object */
  const getPhysics3D = (object) =>
    /** @type {gdjs.Physics3DRuntimeBehavior} */ (
      object.getBehavior('Physics3D')
    );

  /**
   * A surface given as triangles or as a height field.
   * @param {'triangles' | 'heightField'} representation
   * @param {(x: number, y: number) => number} getHeight The height, from 0
   * to 1, for X and Y from 0 to 1 in the object box.
   */
  const createSurface = (representation, getHeight) => {
    const cellCount = 64;
    const rowSize = cellCount + 1;
    const getHeights = () => {
      const heights = new Float32Array(rowSize * rowSize);
      for (let index = 0; index < heights.length; index++) {
        heights[index] = surface.getHeight(
          (index % rowSize) / cellCount,
          Math.floor(index / rowSize) / cellCount
        );
      }
      return heights;
    };
    const surface = {
      version: 1,
      getHeight,
      /** @type {gdjs.SurfaceArea | null} */
      changedArea: null,
      getVersion: () => surface.version,
      getChangedArea: () => surface.changedArea,
      getHeightField: () =>
        representation === 'heightField'
          ? { columns: rowSize, rows: rowSize, heights: getHeights() }
          : null,
      getTriangles: () => {
        if (representation !== 'triangles') return null;
        const heights = getHeights();
        const positions = new Float32Array(heights.length * 3);
        for (let index = 0; index < heights.length; index++) {
          positions[index * 3] = (index % rowSize) / cellCount;
          positions[index * 3 + 1] = Math.floor(index / rowSize) / cellCount;
          positions[index * 3 + 2] = heights[index] || 0;
        }
        const indices = [];
        for (let row = 0; row < cellCount; row++) {
          for (let column = 0; column < cellCount; column++) {
            const a = row * rowSize + column;
            const b = a + 1;
            const c = a + rowSize;
            const d = c + 1;
            // Holes have no triangles.
            if (Number.isNaN(heights[a] + heights[b] + heights[c] + heights[d]))
              continue;
            indices.push(a, b, c, b, d, c);
          }
        }
        return { positions, indices: new Uint32Array(indices) };
      },
    };
    return surface;
  };

  /**
   * A static ground of 1000 x 1000 x 200 pixels, with its bottom at Z = 0,
   * giving its surface.
   */
  const addGround = (runtimeScene, surface, bodyType = 'Static') => {
    const ground = addCube(runtimeScene, 'Ground', bodyType, {
      width: 1000,
      height: 1000,
      depth: 200,
    });
    ground.setSurface(surface);
    return ground;
  };

  const dropBox = (runtimeScene, x, y) => {
    const box = addCube(runtimeScene, 'Box', 'Dynamic', {
      width: 20,
      height: 20,
      depth: 20,
    });
    box.setCenterXInScene(x);
    box.setCenterYInScene(y);
    box.setZ(250);
    return box;
  };

  const stepSeconds = (runtimeScene, seconds) => {
    for (let index = 0; index < seconds * 60; index++) {
      runtimeScene.renderAndStep(frameDuration);
    }
  };

  // A slope going up to the right, from Z = 50 to Z = 150.
  const getSlopeHeight = (x) => 0.25 + 0.5 * x;

  /** @type {Array<'triangles' | 'heightField'>} */
  const representations = ['triangles', 'heightField'];
  for (const representation of representations) {
    describe(`with surfaces given as ${representation}`, () => {
      it('collides with the surface of an object', () => {
        const runtimeScene = createScene();
        addGround(runtimeScene, createSurface(representation, getSlopeHeight));
        const box = dropBox(runtimeScene, 800, 500);
        stepSeconds(runtimeScene, 3);

        expect(box.getZ()).to.be.within(125, 135);
      });

      it('rotates the surface with the object', () => {
        const runtimeScene = createScene();
        const ground = addGround(
          runtimeScene,
          createSurface(representation, getSlopeHeight)
        );
        ground.setAngle(180);
        const box = dropBox(runtimeScene, 800, 500);
        stepSeconds(runtimeScene, 3);

        expect(box.getZ()).to.be.within(65, 75);
      });

      it('is static, even with a dynamic body type', () => {
        const runtimeScene = createScene();
        const ground = addGround(
          runtimeScene,
          createSurface(representation, () => 0.5),
          'Dynamic'
        );
        stepSeconds(runtimeScene, 1);

        expect(ground.getZ()).to.be(0);
      });

      it('falls through holes', () => {
        const runtimeScene = createScene();
        addGround(
          runtimeScene,
          createSurface(representation, (x) => (x > 0.6 ? NaN : 0.5))
        );
        const box = dropBox(runtimeScene, 800, 500);
        stepSeconds(runtimeScene, 3);

        expect(box.getZ()).to.be.below(0);
      });
    });
  }

  it('changes the heights of height fields in place', () => {
    const runtimeScene = createScene();
    const surface = createSurface('heightField', () => 0.5);
    const ground = addGround(runtimeScene, surface);
    const box = dropBox(runtimeScene, 800, 500);
    stepSeconds(runtimeScene, 3);
    expect(box.getZ()).to.be.within(98, 102);
    const shapePointer = Jolt.getPointer(
      getPhysics3D(ground).getBody().GetShape()
    );

    // The ground is lowered under the box, which was sleeping.
    surface.getHeight = (x, y) =>
      x > 0.7 && x < 0.9 && y > 0.4 && y < 0.6 ? 0.25 : 0.5;
    surface.changedArea = { minX: 0.7, minY: 0.4, maxX: 0.9, maxY: 0.6 };
    surface.version++;
    stepSeconds(runtimeScene, 2);

    expect(box.getZ()).to.be.within(48, 52);
    expect(Jolt.getPointer(getPhysics3D(ground).getBody().GetShape())).to.be(
      shapePointer
    );
  });

  it('recreates the shape when the changed area is unknown', () => {
    const runtimeScene = createScene();
    const surface = createSurface('heightField', () => 0.5);
    const ground = addGround(runtimeScene, surface);
    const box = dropBox(runtimeScene, 800, 500);
    stepSeconds(runtimeScene, 3);
    const shapePointer = Jolt.getPointer(
      getPhysics3D(ground).getBody().GetShape()
    );

    surface.getHeight = () => 0.25;
    surface.version++;
    stepSeconds(runtimeScene, 2);

    expect(box.getZ()).to.be.within(48, 52);
    expect(
      Jolt.getPointer(getPhysics3D(ground).getBody().GetShape())
    ).not.to.be(shapePointer);
  });

  it('uses the box shape again when the surface is removed', () => {
    const runtimeScene = createScene();
    const ground = addGround(
      runtimeScene,
      createSurface('heightField', () => 0.5)
    );
    const box = dropBox(runtimeScene, 800, 500);
    stepSeconds(runtimeScene, 3);
    expect(box.getZ()).to.be.within(98, 102);

    ground.setSurface(null);
    box.setZ(250);
    stepSeconds(runtimeScene, 3);

    expect(box.getZ()).to.be.within(198, 202);
  });
});

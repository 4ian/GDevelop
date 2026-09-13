// @ts-check
describe('Physics3DRuntimeBehavior', () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  beforeEach(async function () {
    // Jolt is loaded asynchronously by the behavior (with a dynamic import).
    for (let index = 0; index < 400 && !window.Jolt; index++) {
      await delay(5);
    }
    if (!window.Jolt) {
      throw new Error('Timeout loading Jolt.');
    }
  });

  /**
   * @param {Object} [sharedDataProperties]
   * @returns {[gdjs.RuntimeGame, gdjs.TestRuntimeScene]}
   */
  function createGameWithSceneWithPhysics3DSharedData(sharedDataProperties) {
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
        behaviorsSharedData: [],
        objects: [],
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
        objectsGroups: [],
      },
      usedExtensionsWithVariablesData: [],
    });

    runtimeScene.setInitialSharedDataForBehavior('Physics3D', {
      gravityX: 0,
      gravityY: 0,
      gravityZ: -9.8,
      worldScale: 100,
      ...sharedDataProperties,
    });
    return [runtimeGame, runtimeScene];
  }

  /**
   * A 3D object with no texture and no material: it only needs a three.js
   * object to be moved around, which avoids requiring a renderer in tests.
   */
  class TestRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    constructor(runtimeObject, instanceContainer) {
      super(runtimeObject, instanceContainer, new THREE.Object3D());
    }
  }

  class TestRuntimeObject3D extends gdjs.RuntimeObject3D {
    constructor(instanceContainer, objectData) {
      super(instanceContainer, objectData, undefined);
      this._renderer = new TestRuntimeObject3DRenderer(this, instanceContainer);
      this.onCreated();
    }

    getRenderer() {
      return this._renderer;
    }
  }

  gdjs.registerObject('Physics3D::TestObject3D', TestRuntimeObject3D);

  /**
   * @param {gdjs.TestRuntimeScene} runtimeScene
   * @param {string} name
   * @param {Object} behaviorProperties
   * @returns {{object: gdjs.RuntimeObject3D, behavior: gdjs.Physics3DRuntimeBehavior}}
   */
  function createCubeWithPhysics3D(runtimeScene, name, behaviorProperties) {
    const object = new TestRuntimeObject3D(runtimeScene, {
      name,
      type: 'Physics3D::TestObject3D',
      variables: [],
      effects: [],
      behaviors: [
        {
          name: 'Physics3D',
          type: 'Physics3D::Physics3DBehavior',
          object3D: 'Object3D',
          bodyType: 'Dynamic',
          bullet: false,
          fixedRotation: false,
          shape: 'Box',
          shapeOrientation: 'Z',
          shapeDimensionA: 0,
          shapeDimensionB: 0,
          shapeDimensionC: 0,
          density: 1,
          friction: 0.3,
          restitution: 0.1,
          linearDamping: 0.1,
          angularDamping: 0.1,
          gravityScale: 1,
          // 1st static layer and 1st dynamic one (this is the editor default).
          layers: 17,
          masks: 17,
          shapeOffsetX: 0,
          shapeOffsetY: 0,
          shapeOffsetZ: 0,
          massCenterOffsetX: 0,
          massCenterOffsetY: 0,
          massCenterOffsetZ: 0,
          massOverride: 0,
          ...behaviorProperties,
        },
      ],
      content: {
        width: 100,
        height: 100,
        depth: 100,
      },
    });
    runtimeScene.addObject(object);
    return {
      object,
      // @ts-ignore
      behavior: object.getBehavior('Physics3D'),
    };
  }

  /**
   * Step the scene and return how much the object moved on Z during the last
   * `measuredFrames` frames.
   * @param {gdjs.TestRuntimeScene} runtimeScene
   * @param {gdjs.RuntimeObject3D} object
   * @param {number} frameCount
   * @param {number} measuredFrames
   */
  function getZAmplitudeAfterSettling(
    runtimeScene,
    object,
    frameCount,
    measuredFrames
  ) {
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;
    for (let frame = 0; frame < frameCount; frame++) {
      runtimeScene.renderAndStep(1000 / 60);
      if (frame >= frameCount - measuredFrames) {
        minZ = Math.min(minZ, object.getZ());
        maxZ = Math.max(maxZ, object.getZ());
      }
    }
    return maxZ - minZ;
  }

  describe('Collision steps', () => {
    it('splits a frame in more steps when the gravity is scaled up', () => {
      const [, runtimeScene] = createGameWithSceneWithPhysics3DSharedData();
      const { behavior } = createCubeWithPhysics3D(runtimeScene, 'obj', {});
      runtimeScene.renderAndStep(1000 / 60);
      const sharedData = behavior._sharedData;

      // The earth gravity at 60 FPS doesn't need to be split.
      expect(sharedData.getCollisionStepCount(1 / 60, 9.8)).to.be(1);
      // A low framerate does.
      expect(sharedData.getCollisionStepCount(1 / 30, 9.8)).to.be(2);
      // So does a gravity scaled up enough for a body to gain a speed
      // comparable to Jolt's restitution threshold during a step.
      expect(sharedData.getCollisionStepCount(1 / 60, 6 * 9.8)).to.be(2);
      expect(sharedData.getCollisionStepCount(1 / 60, 8 * 9.8)).to.be(3);
      // The number of steps stays bounded.
      expect(sharedData.getCollisionStepCount(1 / 60, 1000 * 9.8)).to.be(4);
    });
  });

  describe('Resting bodies', () => {
    // A bouncy body laying on the floor used to bounce for ever when the
    // gravity was scaled up: gravity gave it back, during a single collision
    // step, the speed it needed to reach its contact above the threshold over
    // which Jolt makes bodies bounce.
    [1, 4, 6, 10].forEach((gravityScale) => {
      it(`a bouncy body comes to rest on the floor with a gravity scale of ${gravityScale}`, () => {
        const [, runtimeScene] = createGameWithSceneWithPhysics3DSharedData();

        // Create and destroy a body before the ones of the test, so that the
        // floor reuses its index. Jolt sorts the 2 bodies of a contact by id
        // and the order changes the result of the collision, so the bug only
        // showed with one of the 2 orders. In a game, this happens as soon as
        // a body is destroyed before another one is created - for instance
        // when a behavior is deactivated or when the 3D car behavior replaces
        // the body of its object.
        const { object: temporaryObject } = createCubeWithPhysics3D(
          runtimeScene,
          'TemporaryObject',
          {}
        );
        // The physics world is only stepped from the 2nd frame.
        runtimeScene.renderAndStep(1000 / 60);
        runtimeScene.renderAndStep(1000 / 60);
        temporaryObject.deleteFromScene();

        const { object: floor } = createCubeWithPhysics3D(
          runtimeScene,
          'Floor',
          { bodyType: 'Static', restitution: 0.1, friction: 0.3 }
        );
        floor.setSize(1000, 1000);
        floor.setDepth(30);
        floor.setX(-500);
        floor.setY(-500);
        floor.setZ(-30);

        const { object: box } = createCubeWithPhysics3D(runtimeScene, 'Box', {
          bodyType: 'Dynamic',
          restitution: 0.5,
          friction: 10,
          gravityScale,
          massOverride: 3000,
        });
        box.setSize(160, 85);
        box.setDepth(72);
        box.setZ(60);

        const zAmplitude = getZAmplitudeAfterSettling(
          runtimeScene,
          box,
          600,
          240
        );
        expect(zAmplitude).to.be.below(0.5);
      });
    });
  });
});

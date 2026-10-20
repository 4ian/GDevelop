// @ts-check
describe('gdjs.PhysicsCar3DRuntimeBehavior', () => {
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

  /** @type {gdjs.RuntimeScene[]} */
  const runtimeScenes = [];
  afterEach(() => {
    // Free the memory of the physics engine.
    for (const runtimeScene of runtimeScenes) {
      runtimeScene.unloadScene();
    }
    runtimeScenes.length = 0;
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
    friction: 0.3,
    restitution: 0.1,
    linearDamping: 0.1,
    angularDamping: 0.1,
    gravityScale: 1,
    layers: (1 << 4) | (1 << 0),
    masks: (1 << 4) | (1 << 0),
  });

  const physicsCar3DBehaviorData = {
    name: 'PhysicsCar3D',
    type: 'Physics3D::PhysicsCar3D',
    physics3D: 'Physics3D',
    steerAngleMax: 70,
    beginningSteerSpeed: 140,
    endSteerSpeed: 10,
    engineTorqueMax: 4500,
    engineSpeedMax: 6000,
    engineInertia: 0.5,
    reverseGearRatio1: -2.9,
    gearRatio1: 2.66,
    gearRatio2: 1.78,
    gearRatio3: 1.3,
    gearRatio4: 1,
    gearRatio5: 0.74,
    gearRatio6: 0,
    backWheelOffsetX: 0,
    frontWheelOffsetX: 0,
    wheelOffsetY: 0,
    wheelOffsetZ: 0,
    wheelRadius: 10,
    wheelWidth: 5,
    brakeTorqueMax: 1500,
    handBrakeTorqueMax: 4000,
    hasBackWheelDrive: false,
    hasFrontWheelDrive: true,
    pitchRollAngleMax: 90,
  };

  const physicsCharacter3DBehaviorData = {
    name: 'PhysicsCharacter3D',
    type: 'Physics3D::PhysicsCharacter3D',
    physics3D: 'Physics3D',
    jumpHeight: 200,
    jumpSustainTime: 0.2,
    gravity: 1000,
    fallingSpeedMax: 700,
    forwardAcceleration: 1200,
    forwardDeceleration: 1200,
    forwardSpeedMax: 600,
    sidewaysAcceleration: 800,
    sidewaysDeceleration: 800,
    sidewaysSpeedMax: 400,
    slopeMaxAngle: 50,
    stairHeightMax: 20,
    shouldBindObjectAndForwardAngle: true,
    canBePushed: true,
  };

  const addCube = (runtimeScene, name, behaviors, size) => {
    const object = new gdjs.Cube3DRuntimeObject(runtimeScene, {
      name,
      type: 'Scene3D::Cube3DObject',
      effects: [],
      variables: [],
      behaviors,
      // @ts-ignore - the content is not fully typed.
      content: size,
    });
    runtimeScene.addObject(object);
    return object;
  };

  /** A 3000x1000 platform, with its top at Z = 100. */
  const addPlatform = (runtimeScene) => {
    const platform = addCube(
      runtimeScene,
      'Platform',
      [physics3DBehaviorData('Static')],
      { width: 3000, height: 1000, depth: 100 }
    );
    platform.setPosition(0, 0);
    platform.setZ(0);
    return platform;
  };

  /**
   * A car above the platform.
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {{z: number, isAlsoCharacter?: boolean}} options
   */
  const addCar = (runtimeScene, { z, isAlsoCharacter = false }) => {
    const car = addCube(
      runtimeScene,
      'Car',
      [
        // Heavy enough for the wheels to grip the ground.
        { ...physics3DBehaviorData('Dynamic'), massOverride: 1500 },
        physicsCar3DBehaviorData,
        ...(isAlsoCharacter ? [physicsCharacter3DBehaviorData] : []),
      ],
      { width: 100, height: 50, depth: 30 }
    );
    car.setCenterXInScene(500);
    car.setCenterYInScene(500);
    car.setZ(z);
    return car;
  };

  const getPhysics3D = (object) =>
    /** @type {gdjs.Physics3DRuntimeBehavior} */ (
      object.getBehavior('Physics3D')
    );

  const getPhysicsCar3D = (object) =>
    /** @type {gdjs.PhysicsCar3DRuntimeBehavior} */ (
      object.getBehavior('PhysicsCar3D')
    );

  const getPhysicsCharacter3D = (object) =>
    /** @type {gdjs.PhysicsCharacter3DRuntimeBehavior} */ (
      object.getBehavior('PhysicsCharacter3D')
    );

  const stepSeconds = (runtimeScene, seconds) => {
    for (let index = 0; index < seconds * 60; index++) {
      runtimeScene.renderAndStep(frameDuration);
    }
  };

  const expectToDriveForward = (runtimeScene, car) => {
    expect(getPhysicsCar3D(car).isOnFloor()).to.be(true);
    const xBeforeDriving = car.getCenterXInScene();
    for (let index = 0; index < 60; index++) {
      getPhysicsCar3D(car).simulateForwardKey();
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(car.getCenterXInScene()).to.be.above(xBeforeDriving + 50);
    expect(getPhysicsCar3D(car).isOnFloor()).to.be(true);
  };

  it('never changes the body type of an activated car', () => {
    const runtimeScene = createScene();
    addPlatform(runtimeScene);
    const car = addCar(runtimeScene, { z: 120 });

    // Changed right after the car is created, like an action following the
    // creation of the object, before the car handles its body.
    getPhysics3D(car).setBodyType('Static');
    stepSeconds(runtimeScene, 1);
    getPhysics3D(car).setBodyType('Kinematic');

    expect(getPhysics3D(car).isDynamic()).to.be(true);
    expectToDriveForward(runtimeScene, car);
  });

  it('can change the body type while the car is deactivated, and uses its own body type once activated again', () => {
    const runtimeScene = createScene();
    addPlatform(runtimeScene);
    const car = addCar(runtimeScene, { z: 120 });
    stepSeconds(runtimeScene, 1);

    getPhysicsCar3D(car).activate(false);
    getPhysics3D(car).setBodyType('Kinematic');
    expect(getPhysics3D(car).isKinematic()).to.be(true);
    car.setZ(300);
    stepSeconds(runtimeScene, 1);
    expect(car.getZ()).to.be.within(299.9, 300.1);

    getPhysicsCar3D(car).activate(true);
    expect(getPhysics3D(car).isDynamic()).to.be(true);
    stepSeconds(runtimeScene, 2);
    expect(car.getZ()).to.be.below(150);
    expectToDriveForward(runtimeScene, car);
  });

  it("doesn't take the body back when a deactivated car is changed", () => {
    const runtimeScene = createScene();
    addPlatform(runtimeScene);
    const car = addCar(runtimeScene, { z: 120 });
    stepSeconds(runtimeScene, 1);

    getPhysicsCar3D(car).activate(false);
    getPhysics3D(car).setBodyType('Kinematic');
    getPhysicsCar3D(car).setBackWheelDrive(true);
    car.setZ(300);
    stepSeconds(runtimeScene, 1);

    expect(getPhysics3D(car).isKinematic()).to.be(true);
    expect(car.getZ()).to.be.within(299.9, 300.1);
  });

  it('keeps the body type while a 3D car or a 3D character is activated on the same object', () => {
    const runtimeScene = createScene();
    addPlatform(runtimeScene);
    const car = addCar(runtimeScene, { z: 120, isAlsoCharacter: true });
    const physics3D = getPhysics3D(car);
    const carBehavior = getPhysicsCar3D(car);
    const characterBehavior = getPhysicsCharacter3D(car);

    // Both are activated, for instance by mistake.
    stepSeconds(runtimeScene, 0.5);
    physics3D.setBodyType('Static');
    expect(physics3D.isDynamic()).to.be(true);

    // Only the character is activated.
    carBehavior.activate(false);
    physics3D.setBodyType('Static');
    expect(physics3D.isDynamic()).to.be(true);
    stepSeconds(runtimeScene, 0.5);
    expect(characterBehavior.isOnFloor()).to.be(true);
    const xBeforeWalking = car.getCenterXInScene();
    for (let index = 0; index < 30; index++) {
      characterBehavior.simulateForwardKey();
      runtimeScene.renderAndStep(frameDuration);
    }
    expect(car.getCenterXInScene()).to.be.above(xBeforeWalking + 50);

    // None is activated.
    characterBehavior.activate(false);
    physics3D.setBodyType('Kinematic');
    expect(physics3D.isKinematic()).to.be(true);
    car.setZ(300);
    stepSeconds(runtimeScene, 0.5);
    expect(car.getZ()).to.be.within(299.9, 300.1);

    // The physics behavior is deactivated too.
    physics3D.activate(false);
    physics3D.setBodyType('Static');
    expect(physics3D.isStatic()).to.be(true);

    // Only the car is activated, and the physics behavior is still deactivated.
    carBehavior.activate(true);
    expect(physics3D.isDynamic()).to.be(true);
    physics3D.setBodyType('Kinematic');
    expect(physics3D.isDynamic()).to.be(true);

    physics3D.activate(true);
    stepSeconds(runtimeScene, 2);
    expect(car.getZ()).to.be.below(150);
    expectToDriveForward(runtimeScene, car);
  });
});

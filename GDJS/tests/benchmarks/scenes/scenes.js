// @ts-check

/**
 * Scene benchmarks: scenes run like in a game (objects, behaviors, events
 * and rendering), measured by the gameplay test harness (`harness.benchmark`).
 * Events are written like the code generated for them.
 */
describe('Scene benchmarks', function () {
  const imageResourceName = 'base/GDJS/tests/tests-utils/assets/64x64.jpg';
  // A small resolution and small objects: on machines without GPU, pixels
  // are drawn by the CPU, which is slow and is not the work of the engine
  // being measured (it does not depend on the size of objects).
  const gameWidth = 320;
  const gameHeight = 240;

  /** @param {number} ms */
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * @param {gdjs.RuntimeScene} runtimeScene
   * @param {string} objectName
   */
  const getObjects = (runtimeScene, objectName) =>
    runtimeScene.getObjects(objectName) || [];

  /**
   * @param {string} name
   * @param {Array<BehaviorData & any>} behaviors
   * @returns {gdjs.SpriteObjectData}
   */
  const createSpriteObjectData = (name, behaviors = []) => ({
    name,
    type: 'Sprite',
    variables: [],
    behaviors,
    effects: [],
    updateIfNotVisible: false,
    animations: [
      {
        name: 'Idle',
        useMultipleDirections: false,
        directions: [
          {
            timeBetweenFrames: 0,
            looping: false,
            sprites: [
              {
                image: imageResourceName,
                points: [],
                originPoint: { name: 'origine', x: 0, y: 0 },
                centerPoint: { name: 'centre', x: 0, y: 0, automatic: true },
                hasCustomCollisionMask: false,
                customCollisionMask: [],
              },
            ],
          },
        ],
      },
    ],
  });

  /**
   * @param {string} name
   * @returns {gdjs.TextObjectData}
   */
  const createTextObjectData = (name) => ({
    name,
    type: 'TextObject::Text',
    variables: [],
    behaviors: [],
    effects: [],
    content: {
      characterSize: 12,
      font: '',
      bold: false,
      italic: false,
      underlined: false,
      color: '255;255;255',
      text: 'Score: 0',
      textAlignment: 'left',
      verticalTextAlignment: 'top',
      lineHeight: 0,
      isOutlineEnabled: false,
      outlineThickness: 0,
      outlineColor: '0;0;0',
      isShadowEnabled: false,
      shadowColor: '0;0;0',
      shadowOpacity: 0,
      shadowDistance: 0,
      shadowAngle: 0,
      shadowBlurRadius: 0,
    },
  });

  /**
   * @param {string} name
   * @param {Array<BehaviorData & any>} behaviors
   * @returns {gdjs.Cube3DObjectData}
   */
  const createCubeObjectData = (name, behaviors) =>
    /** @type {gdjs.Cube3DObjectData} */ ({
      name,
      type: 'Scene3D::Cube3DObject',
      variables: [],
      behaviors,
      effects: [],
      content: {
        width: 16,
        height: 16,
        depth: 16,
        enableTextureTransparency: false,
        facesOrientation: 'Y',
        frontFaceResourceName: imageResourceName,
        backFaceResourceName: imageResourceName,
        backFaceUpThroughWhichAxisRotation: 'X',
        leftFaceResourceName: imageResourceName,
        rightFaceResourceName: imageResourceName,
        topFaceResourceName: imageResourceName,
        bottomFaceResourceName: imageResourceName,
        frontFaceResourceRepeat: false,
        backFaceResourceRepeat: false,
        leftFaceResourceRepeat: false,
        rightFaceResourceRepeat: false,
        topFaceResourceRepeat: false,
        bottomFaceResourceRepeat: false,
        tileScale: 1,
        frontFaceVisible: true,
        backFaceVisible: true,
        leftFaceVisible: true,
        rightFaceVisible: true,
        topFaceVisible: true,
        bottomFaceVisible: true,
        tint: '255;255;255',
        isCastingShadow: false,
        isReceivingShadow: false,
        materialType: 'Basic',
      },
    });

  /**
   * @param {string} name
   * @param {{x: number, y: number, z?: number, width: number, height: number, depth?: number}} instance
   * @returns {InstanceData}
   */
  const createInstance = (name, { x, y, z, width, height, depth }) => ({
    persistentUuid: '',
    layer: '',
    name,
    x,
    y,
    z,
    angle: 0,
    zOrder: 0,
    customSize: true,
    width,
    height,
    depth,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /**
   * @param {string} name
   * @param {number} count
   * @param {{width: number, height: number, areaWidth?: number, areaHeight?: number, minY?: number}} options
   * @param {() => number} random
   */
  const createRandomInstances = (name, count, options, random) => {
    const areaWidth = options.areaWidth || gameWidth;
    const areaHeight = options.areaHeight || gameHeight;
    const instances = [];
    for (let i = 0; i < count; i++) {
      instances.push(
        createInstance(name, {
          x: random() * (areaWidth - options.width),
          y: (options.minY || 0) + random() * (areaHeight - options.height),
          width: options.width,
          height: options.height,
        })
      );
    }
    return instances;
  };

  /**
   * Run the scene with the gameplay test harness, and report the measures of
   * `harness.benchmark`.
   * @param {{
   *   name: string,
   *   objects: Array<ObjectData>,
   *   instances: Array<InstanceData>,
   *   behaviorsSharedData?: Array<BehaviorSharedData & any>,
   *   eventsFunction?: (runtimeScene: gdjs.RuntimeScene) => void,
   *   renderingType?: '' | '2d' | '3d' | '2d+3d',
   *   warmupFrames?: number,
   *   frames?: number,
   * }} scene
   */
  const runSceneBenchmark = async ({
    name,
    objects,
    instances,
    behaviorsSharedData,
    eventsFunction,
    renderingType,
    warmupFrames,
    frames,
  }) => {
    // The physics engines are loaded asynchronously, and needed even by games
    // not using them (to dispose them).
    for (let i = 0; i < 400 && !(window.Box2D && window.Jolt); i++) {
      await delay(5);
    }
    const mangledName = 'SceneBenchmark' + name.replace(/[^A-Za-z0-9]/g, '');
    // Where the events of a scene are found (see `setEventsGeneratedCodeFunction`).
    // @ts-ignore
    gdjs[mangledName + 'Code'] = { func: eventsFunction || (() => {}) };
    const runtimeGame = new gdjs.RuntimeGame(
      gdjs.createProjectData({
        layouts: [
          {
            r: 0,
            v: 0,
            b: 0,
            mangledName,
            name,
            stopSoundsOnStartup: false,
            title: '',
            behaviorsSharedData: behaviorsSharedData || [],
            objects,
            objectsGroups: [],
            instances,
            layers: [
              {
                name: '',
                renderingType,
                visibility: true,
                cameras: [],
                effects: [],
                ambientLightColorR: 200,
                ambientLightColorG: 200,
                ambientLightColorB: 200,
                isLightingLayer: false,
                followBaseLayerCamera: false,
              },
            ],
            variables: [],
            usedResources: [],
            renderer3DWorldScale: 100,
            uiSettings: {
              grid: false,
              gridType: 'rectangular',
              gridWidth: 10,
              gridHeight: 10,
              gridOffsetX: 0,
              gridOffsetY: 0,
              gridColor: 0,
              gridAlpha: 1,
              snap: false,
            },
          },
        ],
        resources: {
          resources: [
            {
              kind: 'image',
              name: imageResourceName,
              metadata: '',
              file: imageResourceName,
              userAdded: true,
            },
          ],
        },
        propertiesOverrides: {
          windowWidth: gameWidth,
          windowHeight: gameHeight,
        },
      })
    );
    // The assets of the scene are loaded by `harness.goToScene`.
    runtimeGame.getRenderer().createStandardCanvas(document.body);

    const result = await gdjs.gameplayTests.runGameplayTest(runtimeGame, {
      testName: name,
      timeoutMs: 120000,
      maxScreenshots: 0,
      source: [
        'harness.setRandomSeed(1);',
        `await harness.goToScene(${JSON.stringify(name)});`,
        `await harness.benchmark(${JSON.stringify(name)}, ${JSON.stringify({
          warmupFrames: warmupFrames || 30,
          frames: frames || 200,
        })});`,
      ].join('\n'),
    });
    runtimeGame.dispose(true);
    // @ts-ignore
    delete gdjs[mangledName + 'Code'];

    expect(result.errors).to.eql([]);
    expect(result.status).to.be('passed');
    const benchmarkResult = result.benchmarks[0];
    reportBenchmarkResult({
      name: 'Scene: ' + name,
      samplesMs: benchmarkResult.frameTimesMs,
      counters: {
        drawCallsPerFrame: benchmarkResult.drawCallsPerFrame,
        objectsCount: benchmarkResult.objectsCount,
        stateChecksum: benchmarkResult.stateChecksum,
      },
    });
    console.log(
      `${name}: ${benchmarkResult.medianFrameTimeMs}ms per frame (median), ` +
        `${benchmarkResult.drawCallsPerFrame} draw calls per frame, ` +
        `${benchmarkResult.objectsCount} objects. Slowest sections: ` +
        benchmarkResult.sections
          .slice(0, 4)
          .map((section) => `${section.name} ${section.avgTimeMs}ms`)
          .join(', ')
    );
  };

  it('benchmark static sprites', async function () {
    this.timeout(120000);
    await runSceneBenchmark({
      name: 'Static sprites (10000)',
      objects: [createSpriteObjectData('Tile')],
      instances: createRandomInstances(
        'Tile',
        10000,
        { width: 4, height: 4 },
        makeSeededRandom(1)
      ),
    });
  });

  it('benchmark moving and rotating sprites', async function () {
    this.timeout(120000);
    await runSceneBenchmark({
      name: 'Moving and rotating sprites (5000)',
      objects: [createSpriteObjectData('Ship')],
      instances: createRandomInstances(
        'Ship',
        5000,
        { width: 4, height: 4 },
        makeSeededRandom(1)
      ),
      eventsFunction: (runtimeScene) => {
        for (const ship of getObjects(runtimeScene, 'Ship')) {
          ship.rotate(90);
          ship.addPolarForce(ship.getAngle(), 60, 0);
          ship.setPosition(
            (ship.getX() + gameWidth) % gameWidth,
            (ship.getY() + gameHeight) % gameHeight
          );
        }
      },
    });
  });

  it('benchmark collisions and separation', async function () {
    this.timeout(120000);
    const random = makeSeededRandom(1);
    const area = { width: 10, height: 10, areaWidth: 640, areaHeight: 480 };
    const enemies = [];
    const obstacles = [];
    const enemiesLists = Hashtable.newFrom({ Enemy: enemies });
    const obstaclesLists = Hashtable.newFrom({ Obstacle: obstacles });
    await runSceneBenchmark({
      name: 'Collisions and separation (500 vs 500)',
      objects: [
        createSpriteObjectData('Enemy'),
        createSpriteObjectData('Obstacle'),
      ],
      instances: [
        ...createRandomInstances('Enemy', 500, area, random),
        ...createRandomInstances('Obstacle', 500, area, random),
      ],
      eventsFunction: (runtimeScene) => {
        gdjs.copyArray(getObjects(runtimeScene, 'Enemy'), enemies);
        for (const enemy of enemies) {
          enemy.addForceTowardPosition(320, 240, 40, 0);
        }
        gdjs.copyArray(getObjects(runtimeScene, 'Obstacle'), obstacles);
        if (
          gdjs.evtTools.object.hitBoxesCollisionTest(
            enemiesLists,
            obstaclesLists,
            false,
            runtimeScene,
            false
          )
        ) {
          for (const enemy of enemies) {
            enemy.separateFromObjectsList(obstaclesLists, false);
          }
        }
      },
      warmupFrames: 30,
      frames: 120,
    });
  });

  it('benchmark physics 2D bodies', async function () {
    this.timeout(120000);
    const physicsBehavior = {
      name: 'Physics2',
      type: 'Physics2::Physics2Behavior',
      bodyType: 'Dynamic',
      bullet: false,
      fixedRotation: false,
      canSleep: true,
      shape: 'Box',
      shapeDimensionA: 0,
      shapeDimensionB: 0,
      shapeOffsetX: 0,
      shapeOffsetY: 0,
      polygonOrigin: 'Center',
      vertices: [],
      density: 1,
      friction: 0.3,
      restitution: 0.1,
      linearDamping: 0,
      angularDamping: 0.1,
      gravityScale: 1,
      layers: 1,
      masks: 1,
    };
    await runSceneBenchmark({
      name: 'Physics 2D (500 bodies)',
      objects: [
        createSpriteObjectData('Box', [physicsBehavior]),
        createSpriteObjectData('Ground', [
          { ...physicsBehavior, bodyType: 'Static' },
        ]),
      ],
      instances: [
        ...createRandomInstances(
          'Box',
          500,
          { width: 8, height: 8, areaHeight: 400, minY: -400 },
          makeSeededRandom(1)
        ),
        createInstance('Ground', {
          x: 0,
          y: gameHeight - 16,
          width: gameWidth,
          height: 16,
        }),
      ],
      behaviorsSharedData: [
        {
          name: 'Physics2',
          type: 'Physics2::Physics2Behavior',
          gravityX: 0,
          gravityY: 9.8,
          scaleX: 100,
          scaleY: 100,
        },
      ],
    });
  });

  it('benchmark physics 3D bodies', async function () {
    this.timeout(120000);
    const physicsBehavior = {
      name: 'Physics3D',
      type: 'Physics3D::Physics3DBehavior',
      bodyType: 'Dynamic',
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
    };
    const random = makeSeededRandom(1);
    const boxes = [];
    for (let i = 0; i < 500; i++) {
      boxes.push(
        createInstance('Box', {
          x: random() * gameWidth,
          y: random() * gameHeight,
          z: 50 + random() * 800,
          width: 16,
          height: 16,
          depth: 16,
        })
      );
    }
    await runSceneBenchmark({
      name: 'Physics 3D (500 bodies)',
      objects: [
        createCubeObjectData('Box', [physicsBehavior]),
        createCubeObjectData('Ground', [
          { ...physicsBehavior, bodyType: 'Static' },
        ]),
      ],
      instances: [
        ...boxes,
        createInstance('Ground', {
          x: -100,
          y: -100,
          z: -16,
          width: gameWidth + 200,
          height: gameHeight + 200,
          depth: 16,
        }),
      ],
      renderingType: '3d',
      behaviorsSharedData: [
        {
          name: 'Physics3D',
          type: 'Physics3D::Physics3DBehavior',
          gravityX: 0,
          gravityY: 0,
          gravityZ: -9.8,
          worldScale: 100,
        },
      ],
    });
  });

  it('benchmark platformer characters', async function () {
    this.timeout(120000);
    const platforms = [];
    for (let x = 0; x < gameWidth; x += 32) {
      platforms.push(
        createInstance('Platform', {
          x,
          y: gameHeight - 16,
          width: 32,
          height: 16,
        })
      );
    }
    for (let x = 16; x < gameWidth; x += 96) {
      platforms.push(
        createInstance('Platform', {
          x,
          y: gameHeight - 80,
          width: 48,
          height: 8,
        })
      );
    }
    await runSceneBenchmark({
      name: 'Platformer characters (300)',
      objects: [
        createSpriteObjectData('Player', [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'PlatformerObject',
            gravity: 1000,
            maxFallingSpeed: 700,
            acceleration: 1500,
            deceleration: 1500,
            maxSpeed: 150,
            jumpSpeed: 400,
            canGrabPlatforms: false,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            useLegacyTrajectory: false,
            useRepeatedJump: false,
          },
        ]),
        createSpriteObjectData('Platform', [
          {
            type: 'PlatformBehavior::PlatformBehavior',
            name: 'Platform',
            platformType: 'NormalPlatform',
            canBeGrabbed: false,
            yGrabOffset: 0,
          },
        ]),
      ],
      instances: [
        ...createRandomInstances(
          'Player',
          300,
          { width: 8, height: 16, areaHeight: gameHeight - 100 },
          makeSeededRandom(1)
        ),
        ...platforms,
      ],
      eventsFunction: (runtimeScene) => {
        const timeFromStart = runtimeScene.getTimeManager().getTimeFromStart();
        const isGoingRight = Math.floor(timeFromStart / 2000) % 2 === 0;
        const isJumping = Math.floor(timeFromStart / 500) % 3 === 0;
        for (const player of getObjects(runtimeScene, 'Player')) {
          const platformer =
            /** @type {gdjs.PlatformerObjectRuntimeBehavior} */ (
              player.getBehavior('PlatformerObject')
            );
          if (isGoingRight) platformer.simulateRightKey();
          else platformer.simulateLeftKey();
          if (isJumping && player.id % 2 === 0) platformer.simulateJumpKey();
          if (player.getY() > gameHeight) player.setPosition(player.getX(), 0);
        }
      },
    });
  });

  it('benchmark text updates', async function () {
    this.timeout(120000);
    await runSceneBenchmark({
      name: 'Text updates (1000)',
      objects: [createTextObjectData('Score')],
      instances: createRandomInstances(
        'Score',
        1000,
        { width: 60, height: 12 },
        makeSeededRandom(1)
      ),
      eventsFunction: (runtimeScene) => {
        const score = Math.floor(
          runtimeScene.getTimeManager().getTimeFromStart() / 10
        );
        const texts = getObjects(runtimeScene, 'Score');
        for (let i = 0; i < texts.length; i++) {
          /** @type {gdjs.TextRuntimeObject} */ (texts[i]).setText(
            'Score: ' + gdjs.evtTools.common.toString(score + i)
          );
        }
      },
      warmupFrames: 10,
      frames: 40,
    });
  });

  it('benchmark objects creation and deletion', async function () {
    this.timeout(120000);
    await runSceneBenchmark({
      name: 'Objects creation and deletion (100 per frame)',
      objects: [createSpriteObjectData('Bullet')],
      instances: [],
      eventsFunction: (runtimeScene) => {
        for (let i = 0; i < 100; i++) {
          const bullet = runtimeScene.createObject('Bullet');
          if (bullet) {
            bullet.setPosition(
              Math.random() * gameWidth,
              Math.random() * gameHeight
            );
            bullet.setWidth(8);
            bullet.setHeight(8);
          }
        }
        const bullets = getObjects(runtimeScene, 'Bullet');
        if (bullets.length > 2000) {
          for (const bullet of bullets.slice(0, 100)) {
            bullet.deleteFromScene();
          }
        }
      },
    });
  });

  it('benchmark heavy events', async function () {
    this.timeout(120000);
    await runSceneBenchmark({
      name: 'Heavy events (variables, loops, strings)',
      objects: [createSpriteObjectData('Unit')],
      instances: createRandomInstances(
        'Unit',
        1000,
        { width: 8, height: 8 },
        makeSeededRandom(1)
      ),
      eventsFunction: (runtimeScene) => {
        const data = runtimeScene.getVariables().get('Data');
        for (let i = 0; i < 5000; i++) {
          const item = data.getChild('Item' + gdjs.evtTools.common.toString(i));
          item.setNumber(item.getAsNumber() * 0.99 + Math.sin(i));
        }
        const log = runtimeScene.getVariables().get('Log');
        log.pushValue(
          'Frame ' + gdjs.evtTools.common.toString(data.getChildrenCount())
        );
        if (log.getChildrenCount() > 100) log.removeAtIndex(0);
        for (const unit of getObjects(runtimeScene, 'Unit')) {
          const health = unit.getVariables().get('Health');
          health.add(1);
          if (health.getAsNumber() > 100) {
            health.setNumber(0);
            unit.setX((unit.getX() + 1) % gameWidth);
          }
          unit
            .getVariables()
            .get('Name')
            .setString('Unit ' + gdjs.evtTools.common.toString(unit.id));
        }
      },
    });
  });
});

// @ts-check

/**
 * Tests of how the gameplay test harness draws the game: the rendering modes
 * and the screenshots.
 */
describe('gdjs.gameplayTests rendering', () => {
  /** @type {Array<gdjs.RuntimeGame>} */
  let runtimeGames = [];
  /** @type {Array<HTMLElement>} */
  let gameContainers = [];

  afterEach(() => {
    for (const runtimeGame of runtimeGames) runtimeGame.dispose(true);
    for (const gameContainer of gameContainers) gameContainer.remove();
    runtimeGames = [];
    gameContainers = [];
  });

  /**
   * @param {string} name
   * @param {{width: number, height: number, depth: number}} size
   * @returns {ObjectData}
   */
  const createCubeObjectData = (name, size) => ({
    name,
    type: 'Scene3D::Cube3DObject',
    variables: [],
    behaviors: [],
    effects: [],
    // @ts-ignore - the content is not fully typed.
    content: size,
  });

  /**
   * @param {string} name
   * @param {{x: number, y: number, z: number, layer?: string}} position
   * @returns {InstanceData}
   */
  const createInstanceData = (name, { x, y, z, layer }) => ({
    name,
    persistentUuid: name + '-' + x + '-' + y,
    x,
    y,
    z,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer: layer || '',
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    locked: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /**
   * @param {string} name
   * @param {'2d+3d' | '2d'} renderingType
   * @returns {LayerData}
   */
  const createLayerData = (name, renderingType) => ({
    name,
    visibility: true,
    cameras: [],
    effects: [],
    ambientLightColorR: 255,
    ambientLightColorG: 255,
    ambientLightColorB: 255,
    isLightingLayer: false,
    followBaseLayerCamera: false,
    renderingType,
    camera3DNearPlaneDistance: 3,
    camera3DFarPlaneDistance: 10000,
    camera3DFieldOfView: 45,
    cameraType: 'perspective',
  });

  /**
   * A 3D scene: a house standing on the ground, and a "UI" 2D layer with a
   * badge in its top left corner.
   * @returns {LayoutData}
   */
  const createIslandSceneData = () =>
    /** @type {any} */ ({
      name: 'Island',
      mangledName: 'Island',
      title: '',
      r: 0,
      v: 0,
      b: 0,
      stopSoundsOnStartup: false,
      renderer3DWorldScale: 100,
      variables: [],
      behaviorsSharedData: [],
      usedResources: [],
      objectsGroups: [],
      layers: [createLayerData('', '2d+3d'), createLayerData('UI', '2d')],
      objects: [
        createCubeObjectData('Ground', {
          width: 1000,
          height: 1000,
          depth: 100,
        }),
        createCubeObjectData('House', { width: 100, height: 100, depth: 100 }),
        {
          name: 'Badge',
          type: 'PrimitiveDrawing::Drawer',
          variables: [],
          behaviors: [],
          effects: [],
          fillOpacity: 255,
          outlineSize: 0,
          outlineOpacity: 255,
          fillColor: { r: 255, g: 0, b: 0 },
          outlineColor: { r: 255, g: 0, b: 0 },
          absoluteCoordinates: false,
          clearBetweenFrames: false,
          antialiasing: 'none',
        },
      ],
      instances: [
        createInstanceData('Ground', { x: 0, y: 0, z: 0 }),
        createInstanceData('House', { x: 100, y: 100, z: 100 }),
        createInstanceData('Badge', { x: 0, y: 0, z: 0, layer: 'UI' }),
      ],
    });

  /**
   * A game drawing in a canvas, with the island scene.
   * @returns {gdjs.RuntimeGame}
   */
  const makeRuntimeGameWithIsland = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createIslandSceneData()],
    });
    const gameContainer = document.createElement('div');
    document.body.appendChild(gameContainer);
    runtimeGame.getRenderer().createStandardCanvas(gameContainer);
    runtimeGames.push(runtimeGame);
    gameContainers.push(gameContainer);
    return runtimeGame;
  };

  /**
   * @param {gdjs.RuntimeGame} runtimeGame
   * @param {string} source
   * @param {Object=} extraPayload
   */
  const runTestScript = (runtimeGame, source, extraPayload) =>
    gdjs.gameplayTests.runGameplayTest(runtimeGame, {
      testName: 'Test',
      source,
      timeoutMs: 10000,
      .../** @type {any} */ (extraPayload || {}),
    });

  // Counts the draws of the scene (the call of the scene renderer drawing
  // the layers) and the updates of the objects for rendering.
  const countDrawsAndPreRenderUpdatesSource = `
    const scene = harness.getCurrentRuntimeScene();
    const sceneRenderer = scene.getRenderer();
    const draw = sceneRenderer.render.bind(sceneRenderer);
    const counts = { draws: 0, preRenderUpdates: 0 };
    sceneRenderer.render = () => {
      counts.draws++;
      draw();
    };
    const house = harness.getRuntimeObject('House');
    const updatePreRender = house.updatePreRender.bind(house);
    house.updatePreRender = (instanceContainer) => {
      counts.preRenderUpdates++;
      updatePreRender(instanceContainer);
    };
  `;

  describe('rendering modes', () => {
    it('draws nothing in stepped frames by default, but updates the objects for rendering', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        harness.assert(harness.getRenderingMode() === 'onScreenshot', 'Draws only for screenshots by default.');
        ${countDrawsAndPreRenderUpdatesSource}
        await harness.stepFrames(3);
        // The paused main loop draws nothing either.
        harness.getRuntimeGame().getSceneStack().renderWithoutStep();
        harness.assert(counts.draws === 0, 'Drew ' + counts.draws + ' times.');
        harness.assert(counts.preRenderUpdates === 3, 'Updated ' + counts.preRenderUpdates + ' times for rendering.');

        await harness.takeScreenshot('Drawn');
        harness.assert(counts.draws === 1, 'Drew ' + counts.draws + ' times for the screenshot.');
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });

    it('draws every stepped frame in the everyFrame mode', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        harness.setRenderingMode('everyFrame');
        ${countDrawsAndPreRenderUpdatesSource}
        await harness.stepFrames(3);
        harness.assert(counts.draws === 3, 'Drew ' + counts.draws + ' times.');
        harness.assert(counts.preRenderUpdates === 3, 'Updated ' + counts.preRenderUpdates + ' times for rendering.');
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });

    it('draws every frame by default when the run is paced for a human', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        harness.assert(harness.getRenderingMode() === 'everyFrame', 'Draws every frame.');
        `,
        { speedFactor: 100 }
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });

    it('refuses an unknown rendering mode', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        harness.setRenderingMode('never');
        `
      );

      expect(result.status).to.be('error');
      expect(result.errors[0]).to.contain(
        `Unknown rendering mode "never". Use 'onScreenshot' or 'everyFrame'.`
      );
    });

    // Raycasts against 3D objects (like the ones of the Raycaster3D
    // extension) read the world matrices that Three.js updates when it draws.
    const raycastSource = `
      await harness.goToScene('Island');
      const house = harness.getRuntimeObject('House');
      const raycaster = new THREE.Raycaster();
      const hits = [];
      for (let i = 0; i < 4; i++) {
        house.setX(house.getX() + 150);
        await harness.stepFrames(1);
        // Straight down, from above the center of the house.
        const inverseWorldScale = harness.getCurrentRuntimeScene().getRenderer3DInverseWorldScale();
        raycaster.set(
          new THREE.Vector3((house.getX() + 50) * inverseWorldScale, -(house.getY() + 50) * inverseWorldScale, 1000 * inverseWorldScale),
          new THREE.Vector3(0, 0, -1)
        );
        const intersections = raycaster.intersectObject(house.get3DRendererObject(), true);
        hits.push(intersections.length > 0 ? Math.round(intersections[0].distance / inverseWorldScale) : null);
      }
      console.log(JSON.stringify({ hits, x: house.getX() }));
    `;

    it('gives the same 3D raycasts whether frames are drawn or not', async () => {
      const results = [];
      for (const renderingMode of ['everyFrame', 'onScreenshot']) {
        results.push(
          await runTestScript(makeRuntimeGameWithIsland(), raycastSource, {
            renderingMode,
          })
        );
      }

      for (const result of results) {
        expect(result.errors).to.eql([]);
        expect(result.status).to.be('passed');
      }
      const [everyFrameLog, onScreenshotLog] = results.map((result) => {
        const scriptLog = result.consoleLogs.find((log) =>
          log.message.startsWith('{')
        );
        return scriptLog ? JSON.parse(scriptLog.message) : null;
      });
      // The top of the house is 1000 - 200 below the origin of the ray.
      expect(everyFrameLog).to.eql({ hits: [800, 800, 800, 800], x: 700 });
      expect(onScreenshotLog).to.eql(everyFrameLog);
    });

    it('keeps the seeded random numbers of the game logic away from the drawing', async () => {
      const getFirstRandomNumberAfterSeeding = async (shouldDraw) => {
        const result = await runTestScript(
          makeRuntimeGameWithIsland(),
          `
          await harness.goToScene('Island');
          // Something drawing random numbers while the game is drawn, like
          // Three.js creating identifiers for what it draws the first time.
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
          mesh.onBeforeRender = () => Math.random();
          harness.getCurrentRuntimeScene().getLayer('').getRenderer().getThreeScene().add(mesh);
          harness.setRandomSeed(1);
          if (${shouldDraw}) await harness.takeScreenshot('Drawn');
          console.log('{"randomNumber": ' + Math.random() + '}');
          `
        );
        expect(result.errors).to.eql([]);
        const scriptLog = result.consoleLogs.find((log) =>
          log.message.startsWith('{')
        );
        return scriptLog ? JSON.parse(scriptLog.message).randomNumber : null;
      };

      const randomNumberWithoutDrawing =
        await getFirstRandomNumberAfterSeeding(false);
      expect(typeof randomNumberWithoutDrawing).to.be('number');
      expect(await getFirstRandomNumberAfterSeeding(true)).to.be(
        randomNumberWithoutDrawing
      );
    });

    it('draws the benchmarked frames whatever the rendering mode', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        const benchmarkResult = await harness.benchmark('Island', { warmupFrames: 1, frames: 3 });
        harness.assert(benchmarkResult.drawCallsPerFrame > 0, 'Drew the frames (' + benchmarkResult.drawCallsPerFrame + ' draw calls per frame).');
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });
  });
});

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

  /**
   * The pixels of a screenshot.
   * @param {string} base64
   * @param {'jpeg' | 'png'} format
   * @returns {Promise<ImageData>}
   */
  const decodeImage = (base64, format) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) return reject(new Error('No 2D context.'));
        context.drawImage(image, 0, 0);
        resolve(context.getImageData(0, 0, image.width, image.height));
      };
      image.onerror = reject;
      image.src = `data:image/${format};base64,${base64}`;
    });

  /**
   * The color of a pixel, at a position given in proportion of the image size.
   * @param {ImageData} imageData
   * @param {number} relativeX
   * @param {number} relativeY
   */
  const getPixel = (imageData, relativeX, relativeY) => {
    const x = Math.floor(relativeX * imageData.width);
    const y = Math.floor(relativeY * imageData.height);
    const index = (y * imageData.width + x) * 4;
    return Array.from(imageData.data.slice(index, index + 4));
  };

  /** @param {Array<number>} color */
  const isRed = ([r, g, b]) => r > 200 && g < 60 && b < 60;

  // The badge of the UI layer is a red square of 80x60 pixels in the top
  // left corner of the 800x600 game: 10% of the width and of the height.
  const drawBadgeSource = `
    await harness.goToScene('Island');
    harness.getRuntimeObject('Badge').drawRectangle(0, 0, 80, 60);
    await harness.stepFrames(1);
  `;

  describe('screenshots', () => {
    it('draws the game at the size asked, with every layer where it is at the game resolution', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        ${drawBadgeSource}
        await harness.takeScreenshot('Default');
        await harness.takeScreenshot('Larger', { width: 1600 });
        await harness.takeScreenshot('Smaller', { height: 150 });
        `
      );

      expect(result.errors).to.eql([]);
      expect(
        result.screenshots.map(({ width, height }) => [width, height])
      ).to.eql([
        [768, 576],
        [1600, 1200],
        [200, 150],
      ]);
      for (const screenshot of result.screenshots) {
        const imageData = await decodeImage(screenshot.jpegBase64, 'jpeg');
        expect(isRed(getPixel(imageData, 0.05, 0.05))).to.be(true);
        expect(isRed(getPixel(imageData, 0.15, 0.15))).to.be(false);
      }
      // The game itself is drawn at its own size again.
      const runtimeGame = runtimeGames[0];
      const canvas = runtimeGame.getRenderer().getCanvas();
      expect(canvas && [canvas.width, canvas.height]).to.eql([800, 600]);
    });

    it('refuses a size with another aspect ratio than the game resolution', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        await harness.takeScreenshot('Wrong', { width: 1920, height: 1080 });
        `
      );

      expect(result.status).to.be('error');
      expect(result.errors[0]).to.contain(
        'A screenshot of 1920x1080 does not have the aspect ratio of the game resolution (800x600): give only a width (1920x1440) or only a height'
      );
    });

    it('hides layers and objects for the screenshot only', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        ${drawBadgeSource}
        const house = harness.getObjects('House')[0];
        await harness.takeScreenshot('Without the UI', { hideLayers: ['UI'] });
        await harness.takeScreenshot('Only the house', { onlyObjects: [house.id] });
        harness.assert(harness.getRuntimeLayer('UI').isVisible(), 'The UI layer is visible again.');
        harness.assert(!harness.getRuntimeObject('Badge').isHidden() && !harness.getRuntimeObject('Ground').isHidden(), 'The objects are visible again.');
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
      for (const screenshot of result.screenshots) {
        const imageData = await decodeImage(screenshot.jpegBase64, 'jpeg');
        expect(isRed(getPixel(imageData, 0.05, 0.05))).to.be(false);
      }
    });

    it('cuts out objects on a transparent background', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        // The cubes have no texture: paint them, the ground in green and
        // the house in blue.
        for (const [name, color] of [['Ground', 0x00ff00], ['House', 0x0000ff]]) {
          for (const material of harness.getRuntimeObject(name).get3DRendererObject().material) {
            material.transparent = false;
            material.opacity = 1;
            material.color.setHex(color);
          }
        }
        // Right above the house, looking down at it.
        harness.setCamera({ x: 150, y: 150, z: 600 });
        await harness.takeScreenshot('House', { onlyObjects: ['House'], transparentBackground: true });
        `
      );

      expect(result.errors).to.eql([]);
      const [screenshot] = result.screenshots;
      expect(typeof screenshot.pngBase64).to.be('string');
      const imageData = await decodeImage(screenshot.pngBase64 || '', 'png');
      // The house, opaque, in the center; nothing, transparent, around
      // (the ground is not drawn).
      expect(getPixel(imageData, 0.5, 0.5)).to.eql([0, 0, 255, 255]);
      expect(getPixel(imageData, 0.05, 0.05)[3]).to.be(0);
      // The JPEG version is flattened on gray.
      const flattenedImageData = await decodeImage(
        screenshot.jpegBase64,
        'jpeg'
      );
      const [r, g, b] = getPixel(flattenedImageData, 0.05, 0.05);
      expect([r, g, b].every((value) => Math.abs(value - 128) < 8)).to.be(true);
    });

    it('restores the camera after the screenshot, unless asked to keep it', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        const initialCamera = harness.getCameraState('');
        harness.setCamera({ x: 150, y: 150, z: 600, rotationX: 30, angle: 45 });
        const shotCamera = harness.getCameraState('');
        harness.assert(shotCamera.x === 150 && shotCamera.z === 600 && Math.abs(shotCamera.rotationX - 30) < 0.001 && shotCamera.angle === 45, 'The camera is placed: ' + JSON.stringify(shotCamera));
        await harness.takeScreenshot('Placed');
        harness.assert(JSON.stringify(harness.getCameraState('')) === JSON.stringify(initialCamera), 'The camera is restored: ' + JSON.stringify(harness.getCameraState('')) + ' instead of ' + JSON.stringify(initialCamera));

        harness.setCamera({ x: 300, keepAfterScreenshot: true });
        await harness.takeScreenshot('Kept');
        harness.assert(harness.getCameraState('').x === 300, 'The camera is kept.');
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });

    it('points the camera at a position or an instance', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        const house = harness.getObjects('House')[0];
        const threeCamera = harness.getRuntimeLayer('').getRenderer().getThreeCamera();
        for (const from of [{ x: 150, y: 600, z: 300 }, { x: -400, y: -100, z: 50 }, { x: 900, y: 150, z: 1000 }]) {
          harness.lookAt({ from, to: house.id, keepAfterScreenshot: true });
          await harness.stepFrames(1);
          const direction = threeCamera.getWorldDirection(new THREE.Vector3());
          // In the Three.js world, Y is mirrored.
          const towardHouse = new THREE.Vector3(house.centerX - from.x, -(house.centerY - from.y), house.centerZ - from.z).normalize();
          harness.assert(direction.dot(towardHouse) > 0.9999, 'Looks at the house from ' + JSON.stringify(from) + ': ' + JSON.stringify(direction) + ' instead of ' + JSON.stringify(towardHouse));
        }
        `
      );

      expect(result.errors).to.eql([]);
      expect(result.status).to.be('passed');
    });

    it('lists the screenshots not kept, and lets a test keep more of them', async () => {
      const result = await runTestScript(
        makeRuntimeGameWithIsland(),
        `
        await harness.goToScene('Island');
        for (let i = 1; i <= 6; i++) await harness.takeScreenshot('Shot ' + i);
        harness.setMaxScreenshots(6);
        for (let i = 7; i <= 9; i++) await harness.takeScreenshot('Shot ' + i);
        `
      );

      expect(result.screenshots.map(({ label }) => label)).to.eql([
        'Shot 1',
        'Shot 5',
        'Shot 6',
        'Shot 7',
        'Shot 8',
        'Shot 9',
      ]);
      expect(result.droppedScreenshots.map(({ label }) => label)).to.eql([
        'Shot 2',
        'Shot 3',
        'Shot 4',
      ]);
      expect(result.warnings[0]).to.contain(
        '3 screenshot(s) were taken but not kept'
      );
    });
  });

  it('gives the box of what is drawn for a 3D instance', async () => {
    const result = await runTestScript(
      makeRuntimeGameWithIsland(),
      `
      await harness.goToScene('Island');
      const house = harness.getObjects('House')[0];
      console.log(JSON.stringify({
        house: harness.getRenderedBounds(house.id),
        badge: harness.getRenderedBounds(harness.getObjects('Badge')[0].id),
      }));
      `
    );

    expect(result.errors).to.eql([]);
    const scriptLog = result.consoleLogs.find((log) =>
      log.message.startsWith('{')
    );
    const { house, badge } = JSON.parse(scriptLog ? scriptLog.message : '{}');
    expect(
      Object.values(house).map((value) => Math.round(Number(value)))
    ).to.eql([100, 100, 100, 200, 200, 200]);
    expect(badge).to.be(null);
  });
});

// @ts-check

/**
 * Rendering snapshots: scenes covering the rendering features of the game
 * engine (2D, 3D, lights, shadows, fog, post-processing effects, layers
 * drawn on top of each other, stencil...), drawn by the gameplay test harness
 * and compared to the images in `GDJS/tests/rendering-snapshots/`.
 *
 * The images are only compared when drawn by SwiftShader (the software
 * renderer of Chrome) on a x86 processor ("Subzero"), which draws the same
 * pixels on every machine and with every version of Chrome. A graphics card,
 * or SwiftShader on an ARM processor (Apple Silicon), draws slightly different
 * pixels: the images are not compared there. Run
 * `npm run test:rendering-snapshots` to draw with SwiftShader.
 *
 * After a change of the rendering made on purpose, update the images with
 * `npm run test:rendering-snapshots:update` and check them in the diff.
 * When an image differs, the image drawn and the differences are written in
 * `GDJS/tests/rendering-snapshots-results/`.
 */
const isDrawnBySwiftShaderOnX86 = () => {
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return false;
  const debugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName = gl.getParameter(
    debugRendererInfo ? debugRendererInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER
  );
  const loseContext = gl.getExtension('WEBGL_lose_context');
  if (loseContext) loseContext.loseContext();
  return /SwiftShader.*Subzero/i.test(rendererName);
};

const isComparingRenderingSnapshots = isDrawnBySwiftShaderOnX86();
if (!isComparingRenderingSnapshots) {
  console.warn(
    'Rendering snapshots skipped: the images are only compared when drawn by SwiftShader on a x86 processor. Run `npm run test:rendering-snapshots` (on a x86 processor).'
  );
}

(isComparingRenderingSnapshots ? describe : describe.skip)(
  'Rendering snapshots',
  function () {
    this.timeout(60000);

    const gameWidth = 480;
    const gameHeight = 270;
    // A pixel differs when one of its channels changed by more than this.
    const channelTolerance = 8;
    // An image differs when more than this proportion of its pixels differs.
    const maxDifferingPixelsRatio = 0.001;

    const woodTextureResourceName = 'wood-64x64';
    const plankTextureResourceName = 'wood-32x128';
    // For the boxes of a single color (their tint).
    const whiteTextureResourceName = 'white-16x16';
    /** @type {ResourcesData} */
    const resources = {
      resources: [
        {
          kind: 'image',
          name: woodTextureResourceName,
          metadata: '',
          file: 'base/GDJS/tests/tests-utils/assets/64x64.jpg',
          userAdded: true,
        },
        {
          kind: 'image',
          name: plankTextureResourceName,
          metadata: '',
          file: 'base/GDJS/tests/tests-utils/assets/32x128.jpg',
          userAdded: true,
        },
        {
          kind: 'image',
          name: whiteTextureResourceName,
          metadata: '',
          file: 'base/GDJS/tests/tests-utils/assets/white-16x16.jpg',
          userAdded: true,
        },
      ],
    };

    /** @type {{ update: boolean }} */
    const renderingSnapshotsConfig = Object.assign(
      { update: false },
      // @ts-ignore - set by karma.conf.js.
      window.__karma__.config.renderingSnapshots
    );

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
     * @param {string} effectType
     * @param {{doubleParameters?: {[name: string]: number}, stringParameters?: {[name: string]: string}, booleanParameters?: {[name: string]: boolean}}} parameters
     * @returns {EffectData}
     */
    const createEffectData = (name, effectType, parameters = {}) => ({
      name,
      effectType,
      doubleParameters: parameters.doubleParameters || {},
      stringParameters: parameters.stringParameters || {},
      booleanParameters: parameters.booleanParameters || {},
    });

    /**
     * @param {string} name
     * @param {'' | '2d' | '3d' | '2d+3d'} renderingType
     * @param {EffectData[]} effects
     * @returns {LayerData}
     */
    const createLayerData = (name, renderingType, effects = []) => ({
      name,
      visibility: true,
      cameras: [],
      effects,
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
     * @param {string} name
     * @param {{width: number, height: number, depth: number}} size
     * @param {{textureResourceName?: string, tint?: string, materialType?: 'Basic' | 'StandardWithoutMetalness'}} appearance
     * @returns {ObjectData}
     */
    const createCubeObjectData = (name, size, appearance) => {
      const textureResourceName = appearance.textureResourceName || '';
      return {
        name,
        type: 'Scene3D::Cube3DObject',
        variables: [],
        behaviors: [],
        effects: [],
        // @ts-ignore - the content is not fully typed.
        content: {
          ...size,
          enableTextureTransparency: false,
          facesOrientation: 'Y',
          frontFaceResourceName: textureResourceName,
          backFaceResourceName: textureResourceName,
          leftFaceResourceName: textureResourceName,
          rightFaceResourceName: textureResourceName,
          topFaceResourceName: textureResourceName,
          bottomFaceResourceName: textureResourceName,
          frontFaceResourceRepeat: true,
          backFaceResourceRepeat: true,
          leftFaceResourceRepeat: true,
          rightFaceResourceRepeat: true,
          topFaceResourceRepeat: true,
          bottomFaceResourceRepeat: true,
          frontFaceVisible: true,
          backFaceVisible: true,
          leftFaceVisible: true,
          rightFaceVisible: true,
          topFaceVisible: true,
          bottomFaceVisible: true,
          tint: appearance.tint || '255;255;255',
          isCastingShadow: true,
          isReceivingShadow: true,
          materialType: appearance.materialType || 'StandardWithoutMetalness',
        },
      };
    };

    /**
     * @param {string} name
     * @param {string} imageResourceName
     * @param {EffectData[]} effects
     * @returns {ObjectData}
     */
    const createSpriteObjectData = (name, imageResourceName, effects = []) =>
      /** @type {any} */ ({
        name,
        type: 'Sprite',
        variables: [],
        behaviors: [],
        effects,
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
                    centerPoint: {
                      name: 'centre',
                      x: 0,
                      y: 0,
                      automatic: true,
                    },
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
     * @returns {ObjectData}
     */
    const createShapePainterObjectData = (name) =>
      /** @type {any} */ ({
        name,
        type: 'PrimitiveDrawing::Drawer',
        variables: [],
        behaviors: [],
        effects: [],
        fillOpacity: 255,
        outlineSize: 2,
        outlineOpacity: 255,
        fillColor: { r: 255, g: 200, b: 0 },
        outlineColor: { r: 40, g: 40, b: 40 },
        absoluteCoordinates: false,
        clearBetweenFrames: false,
        antialiasing: 'none',
      });

    /**
     * @param {string} name
     * @param {{x: number, y: number, z?: number, layer?: string, angle?: number, width?: number, height?: number, zOrder?: number}} placement
     * @returns {InstanceData}
     */
    const createInstanceData = (name, placement) => ({
      name,
      persistentUuid: [name, placement.x, placement.y, placement.z || 0].join(
        '-'
      ),
      x: placement.x,
      y: placement.y,
      z: placement.z || 0,
      angle: placement.angle || 0,
      rotationX: 0,
      rotationY: 0,
      layer: placement.layer || '',
      zOrder: placement.zOrder || 0,
      customSize: placement.width !== undefined,
      width: placement.width || 0,
      height: placement.height || 0,
      locked: false,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
    });

    /**
     * @param {LayerData[]} layers
     * @param {ObjectData[]} objects
     * @param {InstanceData[]} instances
     * @returns {LayoutData}
     */
    const createSceneData = (layers, objects, instances) =>
      /** @type {any} */ ({
        name: 'Playground',
        mangledName: 'Playground',
        title: '',
        r: 120,
        v: 170,
        b: 230,
        stopSoundsOnStartup: false,
        renderer3DWorldScale: 100,
        variables: [],
        behaviorsSharedData: [],
        usedResources: [
          { name: woodTextureResourceName },
          { name: plankTextureResourceName },
          { name: whiteTextureResourceName },
        ],
        objectsGroups: [],
        layers,
        objects,
        instances,
      });

    // A ground, boxes of different sizes, colors and materials, and a few
    // flying boxes, to see shadows, ambient occlusion, depth and fog.
    const groundAndBoxesObjects = [
      createCubeObjectData(
        'Ground',
        { width: 1600, height: 1600, depth: 20 },
        { textureResourceName: plankTextureResourceName, tint: '170;200;140' }
      ),
      createCubeObjectData(
        'Box',
        { width: 100, height: 100, depth: 100 },
        { textureResourceName: woodTextureResourceName }
      ),
      createCubeObjectData(
        'RedBox',
        { width: 60, height: 60, depth: 160 },
        {
          textureResourceName: whiteTextureResourceName,
          tint: '230;70;60',
        }
      ),
      createCubeObjectData(
        'FlatBlueBox',
        { width: 80, height: 80, depth: 80 },
        {
          textureResourceName: whiteTextureResourceName,
          tint: '60;110;230',
          materialType: 'Basic',
        }
      ),
      // Unlit and white: bright enough for the bloom to make it glow.
      createCubeObjectData(
        'GlowingBox',
        { width: 50, height: 50, depth: 50 },
        {
          textureResourceName: whiteTextureResourceName,
          tint: '255;255;255',
          materialType: 'Basic',
        }
      ),
    ];
    const groundAndBoxesInstances = [
      createInstanceData('Ground', { x: -800, y: -800, z: -20 }),
      createInstanceData('Box', { x: -150, y: -50 }),
      createInstanceData('Box', { x: -40, y: -60, z: 100 }),
      createInstanceData('Box', { x: 150, y: 100, angle: 30 }),
      createInstanceData('RedBox', { x: 20, y: 250 }),
      createInstanceData('RedBox', { x: -400, y: 600 }),
      createInstanceData('FlatBlueBox', { x: -300, y: 150 }),
      createInstanceData('FlatBlueBox', { x: 300, y: -300, z: 250 }),
      createInstanceData('Box', { x: 500, y: 900 }),
      createInstanceData('Box', { x: -700, y: -600 }),
      createInstanceData('GlowingBox', { x: 220, y: 380 }),
      createInstanceData('GlowingBox', { x: -260, y: -200, z: 150 }),
    ];

    const sun = createEffectData('Sun', 'Scene3D::DirectionalLight', {
      doubleParameters: { intensity: 1.2, elevation: 50, rotation: 30 },
      stringParameters: {
        color: '255;245;230',
        top: 'Z+',
        shadowQuality: 'high',
      },
      booleanParameters: { isCastingShadow: true },
    });
    const skyLight = createEffectData('Sky light', 'Scene3D::HemisphereLight', {
      doubleParameters: { intensity: 0.6, elevation: 90, rotation: 0 },
      stringParameters: {
        skyColor: '200;220;255',
        groundColor: '120;100;80',
        top: 'Z+',
      },
    });
    const lights = [sun, skyLight];
    const ambientOcclusion = createEffectData(
      'Ambient occlusion',
      'Scene3D::N8AO',
      {
        doubleParameters: { radius: 60, distanceFalloff: 1, intensity: 3 },
        stringParameters: { quality: 'Medium', color: '0;0;0' },
      }
    );
    const depthOfField = createEffectData(
      'Depth of field',
      'Scene3D::DepthOfField',
      {
        doubleParameters: {
          focusDistance: 900,
          focusRange: 300,
          maxBlur: 6,
          transitionDistance: 600,
        },
      }
    );
    const bloom = createEffectData('Bloom', 'Scene3D::Bloom', {
      doubleParameters: { strength: 1.5, radius: 0.6, threshold: 0.7 },
    });
    const toneMapping = createEffectData(
      'Tone mapping',
      'Scene3D::ToneMapping',
      {
        doubleParameters: { exposure: 1 },
        stringParameters: { mode: 'AgX' },
      }
    );
    const colorAdjustments = [
      createEffectData('Exposure', 'Scene3D::Exposure', {
        doubleParameters: { exposure: 1.3 },
      }),
      createEffectData(
        'Brightness and contrast',
        'Scene3D::BrightnessAndContrast',
        {
          doubleParameters: { brightness: 0.05, contrast: 0.2 },
        }
      ),
      createEffectData('Hue and saturation', 'Scene3D::HueAndSaturation', {
        doubleParameters: { hue: 30, saturation: 0.3 },
      }),
    ];
    const allPostProcessingEffects = [
      ambientOcclusion,
      depthOfField,
      bloom,
      ...colorAdjustments,
      toneMapping,
    ];

    // Looking at the boxes from above, from the front left of the ground.
    const lookAtBoxesSource = `
    harness.lookAt({
      from: { x: -650, y: 850, z: 550 },
      to: { x: 0, y: 100, z: 0 },
      keepAfterScreenshot: true,
    });
  `;

    /**
     * @param {string} base64
     * @returns {Promise<ImageData>}
     */
    const decodePng = async (base64) => {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = `data:image/png;base64,${base64}`;
      });
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to decode the image.');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height);
    };

    /**
     * @param {ImageData} imageData
     * @returns {string}
     */
    const encodePng = (imageData) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to encode the image.');
      context.putImageData(imageData, 0, 0);
      return canvas
        .toDataURL('image/png')
        .replace(/^data:image\/png;base64,/, '');
    };

    /**
     * @param {Blob} blob
     * @returns {Promise<string>}
     */
    const readBlobAsBase64 = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve(String(reader.result).replace(/^data:[^,]*,/, ''));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    /**
     * Send an image to be written by the karma server (see
     * `RenderingSnapshotsMiddleware` in `karma.conf.js`).
     * @param {'baseline' | 'actual' | 'diff'} kind
     * @param {string} snapshotName
     * @param {string} pngBase64
     */
    const writeImage = async (kind, snapshotName, pngBase64) => {
      const response = await fetch(
        `/rendering-snapshots/${kind}/${snapshotName}`,
        { method: 'POST', body: pngBase64 }
      );
      if (!response.ok)
        throw new Error(
          `Unable to write the ${kind} image of ${snapshotName}.`
        );
    };

    /**
     * The actual image, darkened, with the differing pixels in magenta.
     * @param {ImageData} actual
     * @param {ImageData} expected
     * @returns {{ differingPixelsCount: number, diff: ImageData }}
     */
    const compareImages = (actual, expected) => {
      const diff = new ImageData(actual.width, actual.height);
      let differingPixelsCount = 0;
      for (let index = 0; index < actual.data.length; index += 4) {
        let maxChannelDifference = 0;
        for (let channel = 0; channel < 4; channel++) {
          maxChannelDifference = Math.max(
            maxChannelDifference,
            Math.abs(
              actual.data[index + channel] - expected.data[index + channel]
            )
          );
        }
        const isDiffering = maxChannelDifference > channelTolerance;
        if (isDiffering) differingPixelsCount++;
        diff.data[index] = isDiffering ? 255 : actual.data[index] * 0.3;
        diff.data[index + 1] = isDiffering ? 0 : actual.data[index + 1] * 0.3;
        diff.data[index + 2] = isDiffering ? 255 : actual.data[index + 2] * 0.3;
        diff.data[index + 3] = 255;
      }
      return { differingPixelsCount, diff };
    };

    /**
     * @param {string} snapshotName
     * @param {string} pngBase64
     */
    const expectToMatchSnapshot = async (snapshotName, pngBase64) => {
      if (renderingSnapshotsConfig.update) {
        await writeImage('baseline', snapshotName, pngBase64);
        return;
      }
      const response = await fetch(
        `/base/GDJS/tests/rendering-snapshots/${snapshotName}.png`
      );
      if (!response.ok) {
        await writeImage('actual', snapshotName, pngBase64);
        throw new Error(
          `No image to compare "${snapshotName}" with: create it with \`npm run test:rendering-snapshots:update\`.`
        );
      }
      const expected = await decodePng(
        await readBlobAsBase64(await response.blob())
      );
      const actual = await decodePng(pngBase64);
      if (
        actual.width !== expected.width ||
        actual.height !== expected.height
      ) {
        await writeImage('actual', snapshotName, pngBase64);
        throw new Error(
          `"${snapshotName}" is ${actual.width}x${actual.height} instead of ${expected.width}x${expected.height}.`
        );
      }
      const { differingPixelsCount, diff } = compareImages(actual, expected);
      const differingPixelsRatio =
        differingPixelsCount / (actual.width * actual.height);
      if (differingPixelsRatio > maxDifferingPixelsRatio) {
        await writeImage('actual', snapshotName, pngBase64);
        await writeImage('diff', snapshotName, encodePng(diff));
        throw new Error(
          `"${snapshotName}" differs from the expected image on ${(
            differingPixelsRatio * 100
          ).toFixed(
            2
          )}% of its pixels (see GDJS/tests/rendering-snapshots-results/). ` +
            'If the change is on purpose, update the images with `npm run test:rendering-snapshots:update`.'
        );
      }
    };

    /**
     * Run the scene with a gameplay test, and compare each screenshot it takes
     * with the image named after the label of the screenshot.
     * @param {{ scene: LayoutData, source: string, antialiasing?: boolean }} options
     */
    const expectScreenshotsToMatchSnapshots = async ({
      scene,
      source,
      antialiasing = true,
    }) => {
      const runtimeGame = gdjs.getPixiRuntimeGame({
        layouts: [scene],
        resources,
        propertiesOverrides: {
          windowWidth: gameWidth,
          windowHeight: gameHeight,
          antialiasingMode: antialiasing ? 'MSAA' : 'none',
        },
      });
      const gameContainer = document.createElement('div');
      document.body.appendChild(gameContainer);
      runtimeGame.getRenderer().createStandardCanvas(gameContainer);
      runtimeGames.push(runtimeGame);
      gameContainers.push(gameContainer);

      const result = await gdjs.gameplayTests.runGameplayTest(runtimeGame, {
        testName: 'Rendering snapshot',
        timeoutMs: 50000,
        source: `
        await harness.goToScene('Playground');
        harness.setMaxScreenshots(20);
        await harness.stepFrames(2);
        ${source}
      `,
      });
      expect(result.errors).to.eql([]);
      expect(result.screenshots.length).to.be.greaterThan(0);
      for (const screenshot of result.screenshots) {
        if (!screenshot.pngBase64)
          throw new Error(`The screenshot "${screenshot.label}" is not a PNG.`);
        await expectToMatchSnapshot(screenshot.label, screenshot.pngBase64);
      }
    };

    /**
     * @param {string} snapshotName The name of the image (the screenshot label).
     */
    const takeScreenshotSource = (snapshotName) =>
      `await harness.takeScreenshot('${snapshotName}', { fullResolution: true, format: 'png' });`;

    describe('3D', () => {
      it('draws lights and shadows', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [createLayerData('', '3d', lights)],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-lights-and-shadows')}
        `,
        });
      });

      it('draws without lights (basic material only) and with an ambient light', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                createEffectData('Ambient light', 'Scene3D::AmbientLight', {
                  doubleParameters: { intensity: 0.8 },
                  stringParameters: { color: '255;230;200' },
                }),
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-ambient-light')}
        `,
        });
      });

      it('draws fog', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                createEffectData('Fog', 'Scene3D::LinearFog', {
                  doubleParameters: { near: 600, far: 2000 },
                  stringParameters: { color: '200;210;230' },
                }),
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-linear-fog')}
        `,
        });
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                createEffectData('Fog', 'Scene3D::ExponentialFog', {
                  doubleParameters: { density: 0.0008 },
                  stringParameters: { color: '200;210;230' },
                }),
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-exponential-fog')}
        `,
        });
      });
    });

    describe('3D post-processing effects', () => {
      /** @type {Array<[string, EffectData[]]>} */
      const effectsCases = [
        ['3d-ambient-occlusion', [ambientOcclusion]],
        ['3d-depth-of-field', [depthOfField]],
        ['3d-bloom', [bloom]],
        ['3d-tone-mapping', [toneMapping]],
        ['3d-color-adjustments', colorAdjustments],
        ['3d-all-effects', allPostProcessingEffects],
      ];
      for (const [snapshotName, effects] of effectsCases) {
        it(`draws ${snapshotName}`, async () => {
          await expectScreenshotsToMatchSnapshots({
            scene: createSceneData(
              [createLayerData('', '3d', [...lights, ...effects])],
              groundAndBoxesObjects,
              groundAndBoxesInstances
            ),
            source: `
            ${lookAtBoxesSource}
            ${takeScreenshotSource(snapshotName)}
          `,
          });
        });
      }

      it('draws every effect without antialiasing', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                ...allPostProcessingEffects,
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          antialiasing: false,
          source: `
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-all-effects-without-antialiasing')}
        `,
        });
      });

      it('draws the same with effects disabled during the game', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                ...allPostProcessingEffects,
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          const layer = harness.getCurrentRuntimeScene().getLayer('');
          for (const effectName of ${JSON.stringify(
            allPostProcessingEffects.map((effect) => effect.name)
          )}) layer.enableEffect(effectName, false);
          await harness.stepFrames(1);
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-lights-and-shadows')}
        `,
        });
      });
    });

    describe('2D and 3D together', () => {
      const spritesAndBoxesScene = (/** @type {EffectData[]} */ effects) =>
        createSceneData(
          [createLayerData('', '2d+3d', [...lights, ...effects])],
          [
            ...groundAndBoxesObjects,
            createSpriteObjectData('Sprite', woodTextureResourceName),
            createShapePainterObjectData('Shape'),
          ],
          [
            // The ground is lowered under the plane where the 2D objects are drawn.
            createInstanceData('Ground', { x: -800, y: -800, z: -60 }),
            ...groundAndBoxesInstances.filter(
              (instance) => instance.name !== 'Ground'
            ),
            createInstanceData('Sprite', {
              x: 20,
              y: 20,
              width: 96,
              height: 96,
            }),
            createInstanceData('Sprite', {
              x: 360,
              y: 150,
              angle: 20,
              width: 64,
              height: 64,
            }),
            createInstanceData('Shape', { x: 0, y: 0 }),
          ]
        );
      // Shapes drawn in the 2D plane, to see colors and transparency.
      const drawShapesSource = `
      const shape = harness.getRuntimeObject('Shape');
      shape.drawRectangle(150, 20, 230, 80);
      shape.setFillOpacity(128);
      shape.setFillColor('0;180;255');
      shape.drawCircle(300, 60, 40);
      await harness.stepFrames(1);
    `;

      it('draws the 2D objects of a 2D+3D layer above its 3D objects', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: spritesAndBoxesScene([]),
          source: `
          ${drawShapesSource}
          ${takeScreenshotSource('2d-and-3d-layer')}
        `,
        });
      });

      // The 2D objects are washed out by the effects: they are drawn with their
      // sRGB colors in the linear colors of the effects (a known issue, to fix).
      it('draws the 2D objects of a 2D+3D layer with post-processing effects', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: spritesAndBoxesScene([ambientOcclusion, bloom, toneMapping]),
          source: `
          ${drawShapesSource}
          ${takeScreenshotSource('2d-and-3d-layer-with-effects')}
        `,
        });
      });
    });

    describe('stencil', () => {
      // A circle on the ground writes in the stencil, without being drawn. Then
      // a red square, bigger than the circle, is drawn only where the stencil
      // was written: a red circle must appear (not a red square).
      const drawMaskedSquareSource = `
      const threeGroup = harness.getCurrentRuntimeScene().getLayer('').getRenderer().getThreeGroup();
      const mask = new THREE.Mesh(
        new THREE.CircleGeometry(150, 48),
        new THREE.MeshBasicMaterial({
          colorWrite: false,
          depthWrite: false,
          stencilWrite: true,
          stencilRef: 1,
          stencilFunc: THREE.AlwaysStencilFunc,
          stencilZPass: THREE.ReplaceStencilOp,
        })
      );
      mask.position.set(-100, 300, 2);
      mask.renderOrder = 1;
      threeGroup.add(mask);
      const maskedSquare = new THREE.Mesh(
        new THREE.PlaneGeometry(600, 600),
        new THREE.MeshBasicMaterial({
          color: 0xff0000,
          depthTest: false,
          stencilWrite: true,
          stencilRef: 1,
          stencilFunc: THREE.EqualStencilFunc,
        })
      );
      maskedSquare.position.set(-100, 300, 3);
      maskedSquare.renderOrder = 2;
      threeGroup.add(maskedSquare);
      await harness.stepFrames(1);
      ${lookAtBoxesSource}
    `;

      it('draws only where the stencil is written', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [createLayerData('', '3d', lights)],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${drawMaskedSquareSource}
          ${takeScreenshotSource('3d-stencil')}
        `,
        });
      });

      it('draws only where the stencil is written, with post-processing effects', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                ...allPostProcessingEffects,
              ]),
            ],
            groundAndBoxesObjects,
            groundAndBoxesInstances
          ),
          source: `
          ${drawMaskedSquareSource}
          ${takeScreenshotSource('3d-stencil-with-effects')}
        `,
        });
      });
    });

    describe('2D', () => {
      it('draws sprites, shapes and 2D effects on layers above each other', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '2d'),
              createLayerData('Blurred', '2d', [
                createEffectData('Blur', 'KawaseBlur', {
                  doubleParameters: {
                    pixelizeX: 1,
                    pixelizeY: 1,
                    blur: 2,
                    quality: 3,
                  },
                }),
              ]),
              createLayerData('UI', '2d'),
            ],
            [
              createSpriteObjectData('Sprite', woodTextureResourceName),
              createSpriteObjectData(
                'OutlinedSprite',
                woodTextureResourceName,
                [
                  createEffectData('Outline', 'Outline', {
                    doubleParameters: { thickness: 4, padding: 4 },
                    stringParameters: { color: '255;0;80' },
                  }),
                ]
              ),
              createShapePainterObjectData('Shape'),
            ],
            [
              createInstanceData('Sprite', { x: 30, y: 30 }),
              createInstanceData('Sprite', {
                x: 120,
                y: 40,
                angle: 30,
                width: 128,
                height: 64,
              }),
              createInstanceData('OutlinedSprite', { x: 280, y: 40 }),
              createInstanceData('Sprite', { x: 60, y: 150, layer: 'Blurred' }),
              createInstanceData('Shape', { x: 0, y: 0, layer: 'UI' }),
            ]
          ),
          source: `
          const sprite = harness.getRuntimeObject('Sprite');
          sprite.setColor('255;120;120');
          sprite.setOpacity(160);
          const shape = harness.getRuntimeObject('Shape');
          shape.drawRectangle(250, 150, 450, 250);
          shape.setFillColor('0;180;255');
          shape.setFillOpacity(128);
          shape.drawCircle(250, 200, 50);
          await harness.stepFrames(1);
          ${takeScreenshotSource('2d-layers-and-effects')}
        `,
        });
      });

      it('draws 2D layers above a 3D layer with post-processing effects', async () => {
        await expectScreenshotsToMatchSnapshots({
          scene: createSceneData(
            [
              createLayerData('', '3d', [
                ...lights,
                ...allPostProcessingEffects,
              ]),
              createLayerData('Overlay 3D', '3d', [
                createEffectData('Overlay light', 'Scene3D::AmbientLight', {
                  doubleParameters: { intensity: 1 },
                  stringParameters: { color: '255;255;255' },
                }),
                toneMapping,
              ]),
              createLayerData('UI', '2d'),
            ],
            [...groundAndBoxesObjects, createShapePainterObjectData('Shape')],
            [
              ...groundAndBoxesInstances,
              createInstanceData('FlatBlueBox', {
                x: 140,
                y: 40,
                z: 0,
                layer: 'Overlay 3D',
              }),
              createInstanceData('Shape', { x: 0, y: 0, layer: 'UI' }),
            ]
          ),
          source: `
          const shape = harness.getRuntimeObject('Shape');
          shape.drawRectangle(10, 10, 170, 50);
          shape.setFillOpacity(128);
          shape.drawCircle(440, 230, 30);
          await harness.stepFrames(1);
          ${lookAtBoxesSource}
          ${takeScreenshotSource('3d-layers-and-2d-layer-above')}
        `,
        });
      });
    });
  }
);

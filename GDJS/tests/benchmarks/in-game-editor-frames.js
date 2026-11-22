// @ts-check

/**
 * Full-frame benchmarks of the in-game 3D editor.
 *
 * The scene is edited like in the IDE: the game is paused, and each frame is
 * an `InGameEditor.updateAndRender()` call (selection, hover picking, hidden
 * instances markers, rendering...). The profiler sections added to
 * `updateAndRender` give the cost of each part of the editor frame.
 *
 * Rendering goes through SwiftShader in `ChromeHeadlessBenchmark`: the frame
 * times therefore include software rendering. The editor sections
 * (`in-game editor: ...`) are CPU-only and stay meaningful, while the draw
 * calls are machine-independent counters.
 */
describe('In-game editor frames', function () {
  const gameWidth = 320;
  const gameHeight = 240;
  const imageResourceName = 'base/GDJS/tests/tests-utils/assets/64x64.jpg';

  /**
   * @param {string} name
   * @returns {gdjs.Cube3DObjectData}
   */
  const createCubeObjectData = (name) =>
    /** @type {gdjs.Cube3DObjectData} */ ({
      name,
      type: 'Scene3D::Cube3DObject',
      variables: [],
      behaviors: [],
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
   * @param {string} persistentUuid
   * @param {{x: number, y: number, z: number}} position
   * @returns {InstanceData}
   */
  const createInstanceData = (name, persistentUuid, { x, y, z }) => ({
    name,
    persistentUuid,
    x,
    y,
    z,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer: '',
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    depth: 0,
    locked: false,
    sealed: false,
    hidden: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  /**
   * @param {number} instanceCount
   * @returns {LayoutData}
   */
  const createSceneData = (instanceCount) => {
    const random = makeSeededRandom(1);
    const instances = [];
    // A cube of 16 pixels in a 320x240x320 volume: the instances don't all
    // overlap, so that the broad phase can actually skip some of them.
    for (let index = 0; index < instanceCount; index++) {
      instances.push(
        createInstanceData('Cube', 'cube-' + index, {
          x: random() * gameWidth,
          y: random() * gameHeight,
          z: random() * 320,
        })
      );
    }

    return {
      name: 'BenchmarkScene',
      mangledName: 'BenchmarkScene',
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
      layers: [
        {
          name: '',
          visibility: true,
          cameras: [],
          effects: [],
          ambientLightColorR: 255,
          ambientLightColorG: 255,
          ambientLightColorB: 255,
          isLightingLayer: false,
          followBaseLayerCamera: false,
          renderingType: '2d+3d',
          camera3DNearPlaneDistance: 3,
          camera3DFarPlaneDistance: 10000,
          camera3DFieldOfView: 45,
          cameraType: 'perspective',
        },
      ],
      objects: [createCubeObjectData('Cube')],
      instances,
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
    };
  };

  /**
   * Flatten the profiler tree into `name -> average ms per frame`, keeping the
   * parent path so that nested sections are readable.
   * @param {gdjs.FrameMeasureOutput} measure
   * @param {string} path
   * @param {{[name: string]: number}} result
   */
  const flattenMeasures = (measure, path, result) => {
    for (const name in measure.subsections) {
      const fullName = path ? path + ' > ' + name : name;
      const subsection = measure.subsections[name];
      result[fullName] = subsection.time;
      flattenMeasures(subsection, fullName, result);
    }
  };

  for (const instanceCount of [100, 500, 1000]) {
    it(`benchmark a full editor frame with ${instanceCount} cubes`, async function () {
      this.timeout(300000);

      const projectData = gdjs.createProjectData({
        layouts: [createSceneData(instanceCount)],
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
      });
      const runtimeGame = new gdjs.RuntimeGame(projectData, {
        initialRuntimeGameStatus: {
          isPaused: true,
          isInGameEdition: true,
          sceneName: 'BenchmarkScene',
          injectedExternalLayoutName: null,
          skipCreatingInstancesFromScene: false,
          eventsBasedObjectType: null,
          eventsBasedObjectVariantName: null,
          editorId: 'scene-editor',
        },
      });
      runtimeGame.loadFirstAssetsAndStartBackgroundLoading = async () => {};
      const gameContainer = document.createElement('div');
      document.body.appendChild(gameContainer);
      runtimeGame.getRenderer().createStandardCanvas(gameContainer);

      try {
        const inGameEditor = runtimeGame.getInGameEditor();
        if (!inGameEditor) throw new Error('The game has no in-game editor.');
        await inGameEditor.switchToSceneOrVariant(
          'scene-editor',
          'BenchmarkScene',
          null,
          null,
          null,
          null
        );

        // Warm up the renderer (shaders, materials, matrices) without
        // profiling, so that the measured frames are not start-up costs.
        for (let index = 0; index < 10; index++) {
          inGameEditor.updateAndRender();
        }

        const currentScene = inGameEditor.getCurrentScene();
        if (!currentScene) throw new Error('The editor has no current scene.');
        currentScene.startProfiler(() => {});

        const framesCount = 60;
        const frameTimesMs = [];
        for (let index = 0; index < framesCount; index++) {
          const startTime = performance.now();
          inGameEditor.updateAndRender();
          frameTimesMs.push(performance.now() - startTime);
        }

        const profiler = currentScene.getProfiler();
        const averageMeasures = profiler
          ? profiler.getFramesAverageMeasures()
          : null;
        currentScene.stopProfiler();

        const sortedFrameTimes = [...frameTimesMs].sort((a, b) => a - b);
        const medianFrameTimeMs =
          sortedFrameTimes[Math.floor(sortedFrameTimes.length / 2)];

        /** @type {{[name: string]: number}} */
        const sections = {};
        if (averageMeasures) {
          flattenMeasures(averageMeasures, '', sections);
        }
        const sortedSections = Object.entries(sections)
          .map(([name, averageTimeMs]) => ({ name, averageTimeMs }))
          .sort((a, b) => b.averageTimeMs - a.averageTimeMs);

        const threeRenderer = runtimeGame.getRenderer().getThreeRenderer();
        const rendererInfo = threeRenderer ? threeRenderer.info : null;

        reportBenchmarkResult({
          name: `In-game editor frame (${instanceCount} cubes)`,
          samplesMs: frameTimesMs,
          counters: {
            medianFrameTimeMs: Math.round(medianFrameTimeMs * 100) / 100,
            objectsCount: currentScene.getAdhocListOfAllInstances().length,
            drawCallsPerFrame: rendererInfo ? rendererInfo.render.calls : null,
            trianglesPerFrame: rendererInfo
              ? rendererInfo.render.triangles
              : null,
            programsCount:
              rendererInfo && rendererInfo.programs
                ? rendererInfo.programs.length
                : null,
          },
        });

        console.log(
          `${instanceCount} cubes: ${medianFrameTimeMs.toFixed(2)}ms/frame ` +
            `(median of ${framesCount}), ` +
            `${
              rendererInfo ? rendererInfo.render.calls : '?'
            } draw calls. Slowest sections: ` +
            sortedSections
              .slice(0, 6)
              .map(
                (section) =>
                  `${section.name} ${section.averageTimeMs.toFixed(2)}ms`
              )
              .join(', ')
        );
      } finally {
        runtimeGame.dispose(true);
        gameContainer.remove();
      }
    });
  }
});

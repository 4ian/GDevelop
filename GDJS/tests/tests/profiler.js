// @ts-check

/**
 * Tests for gdjs.Profiler.
 */
describe('gdjs.Profiler', () => {
  /**
   * A profiler driven by a fake clock, so that durations are exact.
   */
  const makeProfilerWithFakeClock = () => {
    let now = 1000;
    const gameStartTime = 1000;
    const profiler = new gdjs.Profiler(() => now - gameStartTime);
    profiler._getTimeNow = () => now;
    profiler._recordingStartTime = now;
    profiler._lastChunkFlushTime = now;
    /** @type {gdjs.ProfilerChunk[]} */
    const chunks = [];
    profiler.setOnChunk((chunk) => chunks.push(chunk));
    return {
      profiler,
      chunks,
      advance: (/** @type {number} */ ms) => {
        now += ms;
      },
    };
  };

  it('records the ordered spans of a frame, with their depth, start and duration', () => {
    const { profiler, chunks, advance } = makeProfilerWithFakeClock();
    profiler.setCurrentSceneName('Scene1');

    profiler.beginFrame();
    profiler.begin('events');
    advance(2);
    profiler.begin('My group');
    advance(3);
    profiler.end('My group');
    advance(1);
    profiler.end('events');
    profiler.begin('render');
    advance(4);
    profiler.end('render');
    profiler.endFrame();
    profiler.flushChunk();

    expect(chunks.length).to.be(1);
    const chunk = chunks[0];
    expect(chunk.chunkIndex).to.be(0);
    expect(chunk.newNames).to.eql([
      { id: 0, name: 'events' },
      { id: 1, name: 'My group' },
      { id: 2, name: 'render' },
    ]);
    expect(chunk.frames.length).to.be(1);
    const frame = chunk.frames[0];
    expect(frame.frameIndex).to.be(0);
    expect(frame.sceneName).to.be('Scene1');
    expect(frame.frameStartTimeMs).to.be(0);
    expect(frame.frameDurationMs).to.be(10);
    expect(frame.nameIds).to.eql([0, 1, 2]);
    expect(frame.depths).to.eql([0, 1, 0]);
    expect(frame.startsMs).to.eql([0, 2, 6]);
    expect(frame.durationsMs).to.eql([6, 3, 4]);
    expect(chunk.samples.length).to.be(1);

    // The tree of the averages is still available, as before.
    const averages = profiler.getFramesAverageMeasures();
    expect(averages.time).to.be(10);
    expect(averages.subsections['events'].time).to.be(6);
    expect(averages.subsections['events'].subsections['My group'].time).to.be(
      3
    );
    expect(averages.subsections['render'].time).to.be(4);
  });

  it('sends a chunk every 30 frames and keeps averages and maximums over any number of frames', () => {
    const { profiler, chunks, advance } = makeProfilerWithFakeClock();

    const framesCount = 1000;
    for (let frameIndex = 0; frameIndex < framesCount; frameIndex++) {
      profiler.beginFrame();
      profiler.begin('events');
      // One spike, far beyond the 600 frames the profiler used to keep.
      advance(frameIndex === 100 ? 50 : 10);
      profiler.end('events');
      profiler.endFrame();
    }
    expect(chunks.length).to.be(Math.floor(framesCount / 30));
    profiler.flushChunk();
    expect(chunks.length).to.be(Math.ceil(framesCount / 30));
    expect(chunks[0].newNames).to.eql([{ id: 0, name: 'events' }]);
    // Names are interned once.
    expect(chunks[1].newNames).to.eql([]);
    expect(chunks[1].chunkIndex).to.be(1);
    expect(chunks[0].samples[0].fps).to.be(100);

    const recordedFramesCount = chunks.reduce(
      (count, chunk) => count + chunk.frames.length,
      0
    );
    expect(recordedFramesCount).to.be(framesCount);
    expect(profiler.getRecordedFramesCount()).to.be(framesCount);

    const expectedAverage = (999 * 10 + 50) / framesCount;
    expect(profiler.getFramesAverageMeasures().time).to.be(expectedAverage);
    expect(
      profiler.getFramesAverageMeasures().subsections['events'].time
    ).to.be(expectedAverage);
    expect(profiler.getFramesMaxMeasures().time).to.be(50);
    expect(profiler.getFramesMaxMeasures().subsections['events'].time).to.be(
      50
    );
    expect(profiler.getFrameTimes().length).to.be(framesCount);
    expect(profiler.getFrameTimes()[100]).to.be(50);
    expect(profiler.getStats().framesCount).to.be(framesCount);
  });

  it('stops by itself when the recording reaches its maximum duration', () => {
    const { profiler, chunks, advance } = makeProfilerWithFakeClock();
    let capReachedCount = 0;
    profiler.setOnRecordingCapReached(() => capReachedCount++);

    profiler.beginFrame();
    advance(10);
    profiler.endFrame();
    expect(profiler.isStoppedByCap()).to.be(false);
    expect(capReachedCount).to.be(0);

    advance(gdjs.PROFILER_MAX_RECORDING_DURATION_MS);
    profiler.beginFrame();
    advance(10);
    profiler.endFrame();

    expect(profiler.isStoppedByCap()).to.be(true);
    expect(capReachedCount).to.be(1);
    const lastChunk = chunks[chunks.length - 1];
    expect(lastChunk.stoppedByCap).to.be(true);
    expect(lastChunk.frames.length).to.be(2);
  });

  it('is owned by the game and survives scene changes', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    expect(runtimeScene.getProfiler()).to.be(null);

    let stoppedProfiler = null;
    expect(
      runtimeGame.startProfiler({
        onStopped: (profiler) => {
          stoppedProfiler = profiler;
        },
      })
    ).to.be(true);
    expect(runtimeGame.startProfiler({})).to.be(false);
    const profiler = runtimeGame.getProfiler();
    if (!profiler) throw new Error('A profiler is expected to be running.');
    expect(runtimeScene.getProfiler()).to.be(profiler);

    // Unloading a scene used to stop the profiler: not anymore.
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
        variables: [],
        usedResources: [],
        objectsGroups: [],
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
    runtimeScene.renderAndStep(16);
    runtimeScene.unloadScene();
    expect(runtimeGame.getProfiler()).to.be(profiler);
    expect(profiler.getRecordedFramesCount()).to.be(1);

    runtimeGame.stopProfiler();
    expect(runtimeGame.getProfiler()).to.be(null);
    expect(stoppedProfiler).to.be(profiler);
  });
});

describe('gdjs.evtTools.debuggerTools.pause', () => {
  it('stops the recording of the game, so that the debugger stops moving', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

    let stoppedProfiler = null;
    expect(
      runtimeGame.startProfiler({
        onStopped: (profiler) => {
          stoppedProfiler = profiler;
        },
      })
    ).to.be(true);

    // The "pause" action used as a breakpoint: the game stops, and so does
    // what the debugger records, so that its panels can be read.
    gdjs.evtTools.debuggerTools.pause(runtimeScene);

    expect(runtimeGame.isPaused()).to.be(true);
    expect(runtimeGame.getProfiler()).to.be(null);
    expect(stoppedProfiler).not.to.be(null);

    runtimeGame.pause(false);
  });
});

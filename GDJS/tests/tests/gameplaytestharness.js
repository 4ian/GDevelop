// @ts-check

/**
 * Tests for gdjs.gameplayTests (the gameplay test harness).
 */
describe('gdjs.gameplayTests', () => {
  const createSceneData = (name) =>
    /** @type {any} */ ({
      r: 0,
      v: 0,
      b: 0,
      mangledName: name,
      name,
      objects: [
        {
          name: 'MyObject',
          type: '',
          behaviors: [],
          variables: [],
          effects: [],
        },
      ],
      objectsGroups: [],
      layers: [{ name: '', visibility: true, effects: [], cameras: [] }],
      instances: [],
      behaviorsSharedData: [],
      stopSoundsOnStartup: false,
      title: '',
      variables: [],
      usedResources: [],
    });

  const makeRuntimeGame = () =>
    gdjs.getPixiRuntimeGame({
      layouts: [createSceneData('Scene 1'), createSceneData('Scene 2')],
    });

  /**
   * @param {gdjs.RuntimeGame} runtimeGame
   * @param {string} source
   * @param {Object=} extraPayload
   */
  const runTestScript = (runtimeGame, source, extraPayload) =>
    gdjs.gameplayTests.runGameplayTest(runtimeGame, {
      testName: 'Test',
      source,
      timeoutMs: 5000,
      .../** @type {any} */ (extraPayload || {}),
    });

  it('runs a passing test and reports its result', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(5);
      console.log('Hello from the test');
      harness.assert(harness.getSceneName() === 'Scene 1', 'Scene is running');
      `
    );

    expect(result.status).to.be('passed');
    expect(result.framesExecuted).to.be(6); // 1 (goToScene) + 5.
    expect(result.assertions.length).to.be(1);
    expect(result.assertions[0].passed).to.be(true);
    expect(
      result.consoleLogs.some(
        (log) => log.message.indexOf('Hello from the test') !== -1
      )
    ).to.be(true);
    expect(result.finalState.sceneName).to.be('Scene 1');
    expect(result.gameTimeMs).to.be(Math.round((6 * 1000) / 60));
  });

  it('reports a failed assertion and stops the script immediately', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.assert(false, 'This must fail');
      console.log('This must never be logged');
      `
    );

    expect(result.status).to.be('failed');
    expect(result.assertions.length).to.be(1);
    expect(result.assertions[0].passed).to.be(false);
    expect(
      result.consoleLogs.some(
        (log) => log.message.indexOf('never be logged') !== -1
      )
    ).to.be(false);
  });

  it('reports a script error', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.thisMethodDoesNotExist();
      `
    );

    expect(result.status).to.be('error');
    expect(result.errors.length).to.be(1);
  });

  it('reports a syntax error as an error', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(runtimeGame, `this is not valid JS {`);

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain('could not be parsed');
  });

  it('stops with a timeout when the maximum frames count is reached', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(100000);
      `,
      { maxFrames: 50, speedFactor: 10 }
    );

    expect(result.status).to.be('timeout');
    expect(result.framesExecuted).to.be(50);
  });

  it('can be stopped while the script awaits something else than the harness', async () => {
    const runtimeGame = makeRuntimeGame();
    const resultPromise = runTestScript(
      runtimeGame,
      `
      console.log('Before the long wait');
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      console.log('This must never be logged');
      `,
      { timeoutMs: 120 * 1000 }
    );

    // Let the script start and reach its `await`.
    await new Promise((resolve) => setTimeout(resolve, 50));
    gdjs.gameplayTests.stopCurrentGameplayTest();

    const result = await resultPromise;
    expect(result.status).to.be('stopped');
    expect(
      result.consoleLogs.some(
        (log) => log.message.indexOf('Before the long wait') !== -1
      )
    ).to.be(true);
    expect(
      result.consoleLogs.some(
        (log) => log.message.indexOf('never be logged') !== -1
      )
    ).to.be(false);
  });

  it('leaves the game paused when freezeWhenFinished is set', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      `,
      { freezeWhenFinished: true }
    );

    expect(result.status).to.be('passed');
    expect(runtimeGame.isPaused()).to.be(true);
  });

  it('supports scene changes, spawning objects and reading them back', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 2');
      const spawned = harness.spawn('MyObject', 100, 200);
      harness.assert(spawned.name === 'MyObject', 'Object was spawned');
      await harness.stepFrames(1);

      const objects = harness.getObjects('MyObject');
      harness.assert(objects.length === 1, 'One instance is live');
      harness.assert(objects[0].x === 100, 'X position is set');
      harness.assert(objects[0].y === 200, 'Y position is set');
      harness.watch('MyObject');

      harness.setSceneVariable('Score', 42);
      const score = harness.getSceneVariable('Score');
      harness.assert(!!score && score.value === 42, 'Scene variable is set');
      `
    );

    expect(result.status).to.be('passed');
    expect(result.finalState.sceneName).to.be('Scene 2');
    expect(result.finalState.objectCounts['MyObject']).to.be(1);
    expect(result.finalState.watchedObjects['MyObject'].length).to.be(1);
    expect(result.finalState.watchedObjects['MyObject'][0].x).to.be(100);
    expect(
      result.eventLog.some(
        (event) => event.event === 'spawned' && event.object === 'MyObject'
      )
    ).to.be(true);
  });

  it('supports stepUntil with a condition', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      let frames = 0;
      const done = await harness.stepUntil(() => frames >= 10, {
        maxFrames: 100,
        onFrame: () => frames++,
      });
      harness.assert(done === true, 'Condition was reached');
      harness.assert(frames === 10, 'Stepped 10 frames');
      `,
      { speedFactor: 10 }
    );

    expect(result.status).to.be('passed');
  });

  describe('GameplayTestHarness inputs', () => {
    /**
     * @param {gdjs.RuntimeGame} runtimeGame
     */
    const makeStartedHarness = (runtimeGame) => {
      const harness = new gdjs.gameplayTests.GameplayTestHarness(runtimeGame, {
        testName: 'Test',
        source: '',
        timeoutMs: 5000,
      });
      harness._startTimeMs = Date.now();
      return harness;
    };

    it('simulates keyboard keys (with GDevelop and Web API names)', async () => {
      const runtimeGame = makeRuntimeGame();
      const inputManager = runtimeGame.getInputManager();
      const harness = makeStartedHarness(runtimeGame);
      await harness.goToScene('Scene 1');

      harness.setKeyPressed('Space', true);
      expect(inputManager.isKeyPressed(32)).to.be(true);
      expect(inputManager.wasKeyJustPressed(32)).to.be(true);
      await harness.stepFrames(1);
      expect(inputManager.isKeyPressed(32)).to.be(true);
      expect(inputManager.wasKeyJustPressed(32)).to.be(false);
      harness.setKeyPressed('Space', false);
      expect(inputManager.isKeyPressed(32)).to.be(false);

      // Web API names are accepted:
      harness.setKeyPressed('ArrowLeft', true);
      expect(inputManager.isKeyPressed(37)).to.be(true);
      harness.setKeyPressed('ArrowLeft', false);

      // Location aware keys:
      harness.setKeyPressed('LShift', true);
      expect(inputManager.isKeyPressed(1016)).to.be(true);
      harness.setKeyPressed('RShift', true);
      expect(inputManager.isKeyPressed(2016)).to.be(true);

      // Unknown key names throw:
      expect(() => harness.setKeyPressed('NotAKey', true)).to.throwError();

      harness.releaseAllInputs();
      expect(inputManager.isKeyPressed(1016)).to.be(false);
      expect(inputManager.isKeyPressed(2016)).to.be(false);
    });

    it('simulates mouse buttons and position', async () => {
      const runtimeGame = makeRuntimeGame();
      const inputManager = runtimeGame.getInputManager();
      const harness = makeStartedHarness(runtimeGame);
      await harness.goToScene('Scene 1');

      harness.setMouseButtonPressed(true, 'left');
      expect(inputManager.isMouseButtonPressed(0)).to.be(true);
      harness.setMouseButtonPressed(false, 'left');
      expect(inputManager.isMouseButtonPressed(0)).to.be(false);

      harness.setMousePositionScreen(120, 60);
      expect(inputManager.getMouseX()).to.be(120);
      expect(inputManager.getMouseY()).to.be(60);

      // World position on the base layer (camera is centered by default,
      // so this maps back to game resolution coordinates).
      harness.setMousePosition(100, 50, '');
      expect(typeof inputManager.getMouseX()).to.be('number');
    });
  });
});

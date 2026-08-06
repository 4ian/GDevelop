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

  const createSceneDataWithPlatformerObject = (name) => {
    const sceneData = createSceneData(name);
    sceneData.objects.push({
      name: 'Player',
      type: '',
      behaviors: [
        {
          type: 'PlatformBehavior::PlatformerObjectBehavior',
          name: 'PlatformerObject',
          gravity: 1500,
          maxFallingSpeed: 1500,
          acceleration: 500,
          deceleration: 1500,
          maxSpeed: 500,
          jumpSpeed: 900,
          canGrabPlatforms: false,
          ignoreDefaultControls: false,
          slopeMaxAngle: 60,
          jumpSustainTime: 0.2,
          useLegacyTrajectory: false,
          useRepeatedJump: false,
        },
      ],
      variables: [],
      effects: [],
    });
    return sceneData;
  };

  // The state inspectors as the editor would derive them from the extensions
  // metadata (see `GameplayTestStateInspectors.js` in the editor).
  const platformerStateInspectors = {
    behaviors: {
      'PlatformBehavior::PlatformerObjectBehavior': [
        { name: 'IsOnFloor', functionName: 'isOnFloor', kind: 'boolean' },
        { name: 'IsJumping', functionName: 'isJumping', kind: 'boolean' },
        { name: 'IsFalling', functionName: 'isFalling', kind: 'boolean' },
        { name: 'CanJump', functionName: 'canJump', kind: 'boolean' },
        {
          name: 'CurrentFallSpeed',
          functionName: 'getCurrentFallSpeed',
          kind: 'number',
        },
        { name: 'Gravity', functionName: 'getGravity', kind: 'number' },
        // A stale entry (e.g. an outdated editor): silently skipped.
        { name: 'DoesNotExist', functionName: 'doesNotExist', kind: 'number' },
      ],
    },
    objects: {
      '': [{ name: 'X', functionName: 'getX', kind: 'number' }],
    },
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

  it('auto-unwraps a source wrapped in `async (harness) => {...}` and runs it', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `async (harness) => {
        await harness.goToScene('Scene 1');
        await harness.stepFrames(3);
        harness.assert(harness.getSceneName() === 'Scene 1', 'Scene is running');
      }`
    );

    expect(result.status).to.be('passed');
    expect(result.framesExecuted).to.be(4); // 1 (goToScene) + 3.
    expect(result.assertions.length).to.be(1);
  });

  it('reports a no-op script (no frame stepped, no assertion) as an error', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      // A function definition that is never called: without the guard, this
      // would complete instantly and be reported as a false "passed".
      `const runIt = async () => {
        await harness.stepFrames(5);
        harness.assert(true, 'Never reached');
      };`
    );

    expect(result.status).to.be('error');
    expect(result.framesExecuted).to.be(0);
    expect(result.errors[0]).to.contain('did nothing');
  });

  it('evaluates readable object and behavior state in snapshots', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createSceneDataWithPlatformerObject('Scene 1')],
    });
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const player = harness.spawn('Player', 100, 50);
      await harness.stepFrames(10);

      const snapshot = harness.getObjects('Player')[0];
      const state = snapshot.behaviors.PlatformerObject.state;
      harness.assert(state.IsFalling === true, 'Falling');
      harness.assert(state.IsOnFloor === false, 'Not on floor');
      harness.assert(state.CurrentFallSpeed > 0, 'Fall speed > 0');
      harness.assert(state.Gravity === 1500, 'Configured gravity');
      harness.assert(!('DoesNotExist' in state), 'Stale entry skipped');
      harness.assert(
        snapshot.behaviors.PlatformerObject.act === true,
        'Behavior activated'
      );
      harness.assert(snapshot.state.X === snapshot.x, 'Object-level state');
      console.log(JSON.stringify(state));
      `,
      { stateInspectors: platformerStateInspectors }
    );

    expect(result.status).to.be('passed');
    // The state serializes transparently (through the self-describing proxy).
    expect(
      result.consoleLogs.some(
        (log) => log.message.indexOf('"IsFalling":true') !== -1
      )
    ).to.be(true);
  }).timeout(10000);

  it('throws with the available names when reading an unknown state', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createSceneDataWithPlatformerObject('Scene 1')],
    });
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.spawn('Player', 100, 50);
      await harness.stepFrames(2);
      // Wrong casing: must throw with the list of available names.
      const isOnFloor =
        harness.getObjects('Player')[0].behaviors.PlatformerObject.state
          .isOnFloor;
      `,
      { stateInspectors: platformerStateInspectors }
    );

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain('Unknown state "isOnFloor"');
    expect(result.errors[0]).to.contain('IsOnFloor');
  }).timeout(10000);

  it('gives the raw behavior data as a last-resort escape hatch', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createSceneDataWithPlatformerObject('Scene 1')],
    });
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.spawn('Player', 100, 50);
      await harness.stepFrames(2);
      const rawData = harness.getRawBehaviorData('Player', 'PlatformerObject');
      harness.assert(!!rawData.props, 'Raw sync data returned');
      try {
        harness.getRawBehaviorData('Player', 'Nope');
        harness.fail('Should have thrown');
      } catch (error) {
        harness.assert(
          error.message.indexOf('PlatformerObject') !== -1,
          'Unknown behavior error lists available behaviors'
        );
      }
      `,
      { stateInspectors: platformerStateInspectors }
    );

    expect(result.status).to.be('passed');
  }).timeout(10000);

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

  it('records a sceneReset event when the same scene is restarted', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(2);
      // Restart the same scene: objects are back to their initial state.
      await harness.goToScene('Scene 1');
      await harness.stepFrames(2);
      harness.assert(true, 'done');
      `
    );

    expect(result.status).to.be('passed');
    const sceneEvents = result.eventLog.filter(
      (event) => event.event === 'sceneChanged' || event.event === 'sceneReset'
    );
    expect(sceneEvents.length).to.be(2);
    expect(sceneEvents[0].event).to.be('sceneChanged');
    expect(sceneEvents[0].sceneName).to.be('Scene 1');
    expect(sceneEvents[1].event).to.be('sceneReset');
    expect(sceneEvents[1].sceneName).to.be('Scene 1');
  });

  it('records a sceneChanged event when another scene replaces the current one', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(2);
      await harness.goToScene('Scene 2');
      await harness.stepFrames(2);
      harness.assert(true, 'done');
      `
    );

    expect(result.status).to.be('passed');
    const sceneEvents = result.eventLog.filter(
      (event) => event.event === 'sceneChanged' || event.event === 'sceneReset'
    );
    expect(sceneEvents.length).to.be(2);
    expect(sceneEvents[0].event).to.be('sceneChanged');
    expect(sceneEvents[0].sceneName).to.be('Scene 1');
    expect(sceneEvents[1].event).to.be('sceneChanged');
    expect(sceneEvents[1].sceneName).to.be('Scene 2');
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

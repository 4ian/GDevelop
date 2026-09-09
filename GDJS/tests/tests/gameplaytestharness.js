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
   * A harness ready to be stepped, without going through `runGameplayTest`.
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

  const createSceneDataWithInitialPlayerInstance = (name) => {
    const sceneData = createSceneDataWithPlatformerObject(name);
    sceneData.instances.push(
      /** @type {any} */ ({
        persistentUuid: 'player-1',
        layer: '',
        locked: false,
        name: 'Player',
        x: 100,
        y: 100,
        angle: 0,
        zOrder: 0,
        customSize: false,
        width: 0,
        height: 0,
        numberProperties: [],
        stringProperties: [],
        initialVariables: [],
      })
    );
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
    expect(result.timeoutMs).to.be(5000);
    expect(typeof result.loadingMs).to.be('number');
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

  it('gives the raw runtime objects and behaviors as escape hatches', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createSceneDataWithPlatformerObject('Scene 1')],
    });
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const spawned = harness.spawn('Player', 100, 50);
      await harness.stepFrames(2);

      const playerByName = harness.getRuntimeObject('Player');
      harness.assert(
        playerByName instanceof gdjs.RuntimeObject,
        'getRuntimeObject returns the gdjs.RuntimeObject'
      );
      harness.assert(
        harness.getRuntimeObject(spawned.id) === playerByName,
        'The same instance is found by id'
      );
      harness.assert(
        harness.getRuntimeObject(-1) === null &&
          harness.getRuntimeObject('Nothing') === null,
        'Unknown id or object name gives null'
      );

      const behavior = playerByName.getBehavior('PlatformerObject');
      harness.assert(
        behavior instanceof gdjs.RuntimeBehavior,
        'getBehavior returns the gdjs.RuntimeBehavior'
      );
      harness.assert(
        !playerByName.getBehavior('Nope'),
        'Unknown behavior gives nothing'
      );
      `,
      { stateInspectors: platformerStateInspectors }
    );

    expect(result.status).to.be('passed');
  }).timeout(10000);

  it('gives the raw runtime game, scene and layers as escape hatches', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.assert(
        harness.getRuntimeGame() instanceof gdjs.RuntimeGame,
        'getRuntimeGame returns the gdjs.RuntimeGame'
      );
      harness.assert(
        harness.getCurrentRuntimeScene() instanceof gdjs.RuntimeScene,
        'getCurrentRuntimeScene returns the gdjs.RuntimeScene'
      );

      const baseLayer = harness.getRuntimeLayer('');
      harness.assert(
        baseLayer instanceof gdjs.RuntimeLayer,
        'getRuntimeLayer returns the gdjs.RuntimeLayer'
      );
      harness.assert(baseLayer.isVisible(), 'Base layer starts visible');
      baseLayer.show(false);
      harness.assert(
        !harness.getRuntimeLayer('').isVisible(),
        'Layer visibility can be checked after being changed'
      );
      harness.assert(
        harness.getRuntimeLayer('Nope') === null,
        'Unknown layer gives null'
      );
      `
    );

    expect(result.status).to.be('passed');
  }).timeout(10000);

  it('waits for a starting game to be done starting up (libraries, first scene)', async () => {
    /** @type {any} */ (window).__gameplayTestLibraryLoaded = false;
    gdjs.registerAsynchronouslyLoadingLibraryPromise(
      new Promise((resolve) =>
        setTimeout(() => {
          /** @type {any} */ (window).__gameplayTestLibraryLoaded = true;
          resolve(undefined);
        }, 150)
      )
    );
    const runtimeGame = makeRuntimeGame();
    // Start the game like a real game launch does - and don't await it:
    // the test run request arrives while the game is still starting.
    runtimeGame.loadAllAssets(() => runtimeGame.startGameLoop());
    const result = await runTestScript(
      runtimeGame,
      `
      harness.assert(
        window.__gameplayTestLibraryLoaded === true,
        'Asynchronously loaded libraries are ready before the test starts'
      );
      harness.assert(
        !harness.getRuntimeGame().isStartingUp(),
        'The game is done starting up'
      );
      harness.assert(
        harness.getSceneName() === 'Scene 1',
        'The first scene of the game is running'
      );
      `
    );
    delete (/** @type {any} */ (window).__gameplayTestLibraryLoaded);

    expect(result.status).to.be('passed');
  });

  it('waits for a started game to have loaded its first scene', async () => {
    const runtimeGame = makeRuntimeGame();
    // Simulate a game whose startup is in progress: the first scene is
    // pushed a bit later (as startGameLoop does after the initial loading).
    runtimeGame._hasGameStartupBegun = true;
    setTimeout(() => {
      runtimeGame
        .getSceneStack()
        .replace({ sceneName: 'Scene 2', clear: true });
    }, 100);
    const result = await runTestScript(
      runtimeGame,
      `
      harness.assert(
        harness.getRuntimeGame().getSceneStack().wasFirstSceneLoaded(),
        'The game finished starting before the test began'
      );
      harness.assert(
        harness.getSceneName() === 'Scene 2',
        'The first scene of the game is running'
      );
      `,
      // A budget smaller than the startup delay: the wait for the game to
      // finish starting is loading, excluded from the timeout budget.
      { timeoutMs: 50 }
    );

    expect(result.status).to.be('passed');
    // The startup wait is measured and reported as loading time.
    expect(result.loadingMs >= 90).to.be(true);
  });

  it('fails with a clear error when a started game never finishes starting', async () => {
    const runtimeGame = makeRuntimeGame();
    runtimeGame._hasGameStartupBegun = true;
    const result = await runTestScript(
      runtimeGame,
      'await harness.stepFrames(1);',
      // The bound on this wait is the LOADING timeout, not the test budget.
      { timeoutMs: 5000, loadingTimeoutMs: 300 }
    );

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain('did not finish starting');
  }).timeout(10000);

  it('excludes slow scene-asset loading from the timeout budget', async () => {
    const runtimeGame = makeRuntimeGame();
    // Override members to mock scene assets that take longer to load than
    // the whole test budget (like the first run of a web preview
    // downloading resources).
    let slowLoadDone = false;
    // @ts-ignore
    runtimeGame.areSceneAssetsReady = () => slowLoadDone;
    // @ts-ignore
    runtimeGame.loadSceneAssets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      slowLoadDone = true;
    };
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(2);
      harness.assert(harness.getSceneName() === 'Scene 1', 'Scene is running');
      `,
      { timeoutMs: 200 }
    );

    expect(result.status).to.be('passed');
    expect(result.loadingMs >= 280).to.be(true);
    // The wall-clock duration includes the loading time.
    expect(result.durationMs >= result.loadingMs).to.be(true);
  }).timeout(10000);

  it('waits through a game-driven scene change whose scene is still loading', async () => {
    const runtimeGame = makeRuntimeGame();
    // Override members to mock "Scene 2" assets that take longer to load
    // than the whole test budget: when the game changes to it, the scene
    // stack stays empty until the load finishes (the gap that made real
    // tests throw "No scene is running").
    const originalAreSceneAssetsReady =
      runtimeGame.areSceneAssetsReady.bind(runtimeGame);
    let slowLoadDone = false;
    // @ts-ignore
    runtimeGame.areSceneAssetsReady = (/** @type {string} */ sceneName) =>
      sceneName === 'Scene 2'
        ? slowLoadDone
        : originalAreSceneAssetsReady(sceneName);
    // @ts-ignore
    runtimeGame.loadSceneAssets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      slowLoadDone = true;
    };
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      // Simulate the game's own logic changing the scene (a "Scene" action).
      harness.getRuntimeGame().getSceneStack().replace({ sceneName: 'Scene 2', clear: true });
      await harness.stepFrames(2);
      harness.assert(
        harness.getSceneName() === 'Scene 2',
        'The new scene is running right after stepping through the switch'
      );
      `,
      // Smaller than the scene load: the wait is loading, not budget.
      { timeoutMs: 200 }
    );

    expect(result.status).to.be('passed');
    expect(result.loadingMs >= 280).to.be(true);
    // The transient empty stack is never recorded: Scene 1 (goToScene)
    // then Scene 2 (the game's change), no '' scene in between.
    const sceneEvents = result.eventLog.filter(
      (event) => event.event === 'sceneChanged' || event.event === 'sceneReset'
    );
    expect(sceneEvents.length).to.be(2);
    expect(sceneEvents[0].sceneName).to.be('Scene 1');
    expect(sceneEvents[1].sceneName).to.be('Scene 2');
  }).timeout(10000);

  it('gives a clear error when the game removed its last scene (game over)', async () => {
    const runtimeGame = makeRuntimeGame();
    const sceneStack = runtimeGame.getSceneStack();
    // Override members to mock a game that ended: a first scene was loaded
    // but no scene is running anymore (and none is loading).
    // @ts-ignore
    sceneStack.getCurrentScene = () => null;
    // @ts-ignore
    sceneStack.wasFirstSceneLoaded = () => true;
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.stepFrames(1);
      harness.getSceneName();
      `
    );

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain('ended or quit');
  });

  it('fails with a clear error when scene assets never finish loading', async () => {
    const runtimeGame = makeRuntimeGame();
    // Override members to mock a scene-asset load that never completes.
    // @ts-ignore
    runtimeGame.areSceneAssetsReady = () => false;
    // @ts-ignore
    runtimeGame.loadSceneAssets = () => new Promise(() => {});
    const result = await runTestScript(
      runtimeGame,
      `await harness.goToScene('Scene 1');`,
      { timeoutMs: 5000, loadingTimeoutMs: 200 }
    );

    expect(result.status).to.be('error');
    expect(result.errors[0]).to.contain('did not finish loading');
  }).timeout(10000);

  it('gives the camera state and camera/heading-relative positions', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const camera = harness.getCameraState('');
      harness.assert(!!camera, 'The base layer camera exists');
      harness.assert(
        typeof camera.x === 'number' && camera.zoom === 1 &&
          camera.rotationX === 0 && camera.angle === 0,
        'The camera state is JSON-safe with the expected defaults'
      );
      harness.assert(harness.getCameraState('Nope') === null, 'Unknown layer gives null');

      const spawned = harness.spawn('MyObject', 100, 100);
      // Target straight to the right: yawDiff 0 against the object's
      // angle (0), -90 against a heading of 90.
      const straight = harness.getRelativePosition('MyObject', { x: 300, y: 100 });
      harness.assert(Math.abs(straight.yawDiff) < 0.001, 'yawDiff is 0 toward the right');
      const withHeading = harness.getRelativePosition('MyObject', { x: 300, y: 100 }, { heading: 90 });
      harness.assert(Math.abs(withHeading.yawDiff + 90) < 0.001, 'heading is used for yawDiff');

      // fromZ gives an eye height even for a 2D object: a target at the
      // same height as the eye needs no pitch, one below needs to look down.
      const level = harness.getRelativePosition('MyObject', { x: 300, y: 100, z: 50 }, { fromZ: 50 });
      harness.assert(Math.abs(level.pitchDiff) < 0.001, 'No pitch toward a target at eye height');
      const below = harness.getRelativePosition('MyObject', { x: 300, y: 100, z: 0 }, { fromZ: 50 });
      harness.assert(below.pitchDiff < -10, 'Negative pitch toward a target below the eye');
      `
    );

    expect(result.status).to.be('passed');
  }).timeout(10000);

  it('reads and writes object variables, event log, played sounds, stability', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const spawned = harness.spawn('MyObject', 100, 100);

      // Object variables: write then read, by name and by id.
      harness.assert(
        harness.getObjectVariable('MyObject', 'Level') === undefined,
        'Unknown object variable gives undefined'
      );
      harness.setObjectVariable(spawned.id, 'Level', 3);
      harness.assert(
        harness.getObjectVariable('MyObject', 'Level').value === 3,
        'The object variable was written and read back'
      );
      harness.setObjectVariable('MyObject', 'Locked', true);
      harness.assert(
        harness.getObjectVariable(spawned.id, 'Locked').value === true,
        'Boolean object variables are real booleans'
      );

      // Event log: readable from the script, with causes.
      const eventLog = harness.getEventLog();
      harness.assert(
        eventLog.some((e) => e.event === 'sceneChanged' && e.cause === 'harness'),
        'The scene change appears in the readable event log'
      );

      // Played sounds: the wrapper records the public play methods.
      harness.getRuntimeGame().getSoundManager().playSound('pickup.aac', false, 100, 1);
      const playedSounds = harness.getPlayedSounds();
      harness.assert(
        playedSounds.length === 1 && playedSounds[0].sound === 'pickup.aac',
        'The played sound was recorded with its name'
      );

      // Stability: a still object settles, within the asked frames.
      const settled = await harness.stepUntilObjectIsStable('MyObject', {
        stableFrames: 5,
        maxFrames: 60,
      });
      harness.assert(settled === true, 'A still object is reported stable');
      `
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
      { maxFrames: 50 }
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
    expect(sceneEvents[0].cause).to.be('harness');
    expect(sceneEvents[1].event).to.be('sceneReset');
    expect(sceneEvents[1].sceneName).to.be('Scene 1');
    expect(sceneEvents[1].cause).to.be('harness');
  });

  it('returns a flat JSON-safe profiling summary', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.startProfiling();
      await harness.stepFrames(10);
      const profile = harness.stopProfiling();
      harness.assert(!!profile, 'A profile is returned');
      harness.assert(
        typeof profile.avgStepTimeMs === 'number',
        'avgStepTimeMs is a number'
      );
      harness.assert(Array.isArray(profile.sections), 'sections is an array');
      harness.assert(
        profile.sections.every(
          (section) =>
            typeof section.name === 'string' &&
            typeof section.avgTimeMs === 'number' &&
            typeof section.maxTimeMs === 'number' &&
            section.maxTimeMs >= section.avgTimeMs
        ),
        'sections have a name, an avgTimeMs and a maxTimeMs >= avgTimeMs'
      );
      harness.assert(
        profile.maxStepTimeMs >= profile.avgStepTimeMs,
        'The worst frame is at least the average'
      );
      harness.assert(
        Array.isArray(profile.frameTimesMs) &&
          profile.frameTimesMs.length === 10 &&
          profile.frameTimesMs.every((time) => typeof time === 'number'),
        'The frame-by-frame timeline is returned (10 profiled frames)'
      );
      harness.assert(
        profile.frameTimesBucketSize === 1,
        'A short window is not downsampled'
      );
      harness.assert(
        profile.startFrame === 1 && profile.endFrame === 11,
        'The profiled window is reported in harness frames (got ' +
          profile.startFrame + '..' + profile.endFrame + ')'
      );
      harness.assert(
        Array.isArray(profile.worstFrames) &&
          profile.worstFrames.length === 5 &&
          profile.worstFrames.every(
            (worst) =>
              worst.frame > profile.startFrame &&
              worst.frame <= profile.endFrame &&
              typeof worst.timeMs === 'number'
          ),
        'The worst frames are reported with harness frame numbers'
      );
      harness.assert(
        profile.objectCounts && typeof profile.objectCounts === 'object',
        'Object counts are returned'
      );
      harness.assert(profile.renderer === null, 'No 3D renderer in this game');
      // The whole profile is JSON-safe (no circular structure).
      harness.assert(
        JSON.stringify(profile).length > 0,
        'The profile can be stringified'
      );
      `
    );

    expect(result.status).to.be('passed');
  });

  it('reports an aim result object with the mouse responsiveness', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.spawn('MyObject', 100, 200);
      await harness.stepFrames(1);

      // This game has no mouse-look: the aim fails and reports that the
      // mouse showed no response.
      const aim = await harness.lookTowardWithMouseDelta('MyObject', { x: 100, y: 600 });
      harness.assert(!!aim, 'An aim result is returned');
      harness.assert(aim.aimed === false, 'The aim did not succeed');
      harness.assert(aim.sawYawResponse === false, 'No yaw response was seen');
      harness.assert(typeof aim.yawDiff === 'number', 'The remaining yawDiff is reported');

      const missing = await harness.lookTowardWithMouseDelta('Nothing', { x: 0, y: 0 });
      harness.assert(missing === null, 'A missing object gives null');
      `,
      { timeoutMs: 20000 }
    );

    expect(result.status).to.be('passed');
    // The one-time hint about mouse deltas without pointer lock is recorded.
    expect(
      result.consoleLogs.some(
        (log) =>
          log.level === 'warn' &&
          log.message.indexOf('never requested the pointer lock') !== -1
      )
    ).to.be(true);
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

  it('reports the relative position of a target (pure geometry, no advice)', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      harness.spawn('MyObject', 100, 200);
      await harness.stepFrames(1);

      const rel = harness.getRelativePosition('MyObject', { x: 400, y: 200 });
      harness.assert(!!rel, 'Relative position is computed');
      harness.assert(Math.abs(rel.relativeX - 300) < 1, 'relativeX is 300');
      harness.assert(Math.abs(rel.relativeY) < 1, 'relativeY is 0');
      harness.assert(Math.abs(rel.distance - 300) < 1, 'distance is 300');
      harness.assert(
        Math.abs(rel.horizontalDistance - 300) < 1,
        'horizontalDistance equals distance in 2D'
      );
      harness.assert(rel.dominantAxis === 'x', 'dominant axis is x');
      harness.assert(rel.reached === false, 'target is not reached');
      harness.assert(
        !('shouldMoveRight' in rel) && !('shouldJump' in rel),
        'no navigation advice fields'
      );

      const closeRel = harness.getRelativePosition('MyObject', { x: 110, y: 200 });
      harness.assert(closeRel.reached === true, 'close target is reached');

      const missing = harness.getRelativePosition('MyObject', { name: 'Nothing' });
      harness.assert(missing === null, 'missing target gives null');
      `
    );

    expect(result.status).to.be('passed');
  });

  it('resets the scene and probes controls, measuring each key effect against a baseline', async () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [createSceneDataWithInitialPlayerInstance('Scene 1')],
    });
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const probes = await harness.resetSceneAndProbeControls('Player', ['Right', 'Left'], {
        frames: 30,
      });
      harness.assert(!!probes.baseline, 'Baseline was measured');
      harness.assert(!!probes.keys.Right && !!probes.keys.Left, 'Both keys were measured');
      // The player free-falls in this scene: the fall affects the baseline
      // and every key the same way, only dx differs.
      harness.assert(
        probes.keys.Right.dx - probes.baseline.dx > 20,
        'Right moves the player right vs baseline'
      );
      harness.assert(
        probes.keys.Left.dx - probes.baseline.dx < -20,
        'Left moves the player left vs baseline'
      );
      harness.assert(
        Math.abs(probes.keys.Right.dy - probes.baseline.dy) < 5,
        'Right does not change the fall'
      );
      harness.assert(
        probes.keys.Right.maxDx >= probes.keys.Right.dx - 1,
        'Extremes are tracked'
      );
      `
    );

    expect(result.status).to.be('passed');
    // Each probe (baseline + 2 keys + final cleanup) restarts the scene,
    // and each restart is labelled as caused by the probe itself (not a
    // plain 'harness' goToScene) so it's clearly expected in the event log.
    const resets = result.eventLog.filter(
      (event) => event.event === 'sceneReset'
    );
    expect(resets.length >= 3).to.be(true);
    expect(resets.every((event) => event.cause === 'controlsProbe')).to.be(
      true
    );
  }).timeout(10000);

  it('tracks progress toward a target and detects stalls', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      const spawned = harness.spawn('MyObject', 0, 0);
      await harness.stepFrames(1);

      const tracker = harness.makeProgressTracker(
        'MyObject',
        { x: 500, y: 0 },
        { windowFrames: 10, minProgress: 5, reachRadius: 30 }
      );

      // Moving toward the target: never stalled.
      let sawStallWhileMoving = false;
      for (let i = 0; i < 20; i++) {
        harness.setObjectPosition(spawned.id, i * 10, 0);
        await harness.stepFrames(1);
        const progress = tracker.update();
        if (progress && progress.stalled) sawStallWhileMoving = true;
      }
      harness.assert(!sawStallWhileMoving, 'No stall while progressing');

      // Standing still: a stall is detected after the window.
      let stalledAfterStop = false;
      for (let i = 0; i < 15; i++) {
        await harness.stepFrames(1);
        const progress = tracker.update();
        if (progress && progress.stalled) stalledAfterStop = true;
      }
      harness.assert(stalledAfterStop, 'Stall detected when not progressing');

      // Reaching the target.
      harness.setObjectPosition(spawned.id, 495, 0);
      await harness.stepFrames(1);
      const finalProgress = tracker.update();
      harness.assert(!!finalProgress && finalProgress.reached, 'Target reached');

      // reset() forgets the stall history.
      tracker.reset();
      const afterReset = tracker.update();
      harness.assert(!!afterReset && !afterReset.stalled, 'No stall after reset');
      `
    );

    expect(result.status).to.be('passed');
    expect(
      result.eventLog.some(
        (event) => event.event === 'stuck' && event.object === 'MyObject'
      )
    ).to.be(true);
  });

  it('paces the run when a speedFactor is set in the payload', async () => {
    const runtimeGame = makeRuntimeGame();
    const result = await runTestScript(
      runtimeGame,
      `
      await harness.goToScene('Scene 1');
      await harness.stepFrames(12);
      harness.assert(true, 'done');
      `,
      { speedFactor: 1 }
    );

    expect(result.status).to.be('passed');
    // 13 frames at normal speed take ~216ms of wall-clock time (a run at
    // full speed takes a few milliseconds).
    expect(result.durationMs >= 120).to.be(true);
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
      `
    );

    expect(result.status).to.be('passed');
  });

  describe('GameplayTestHarness inputs', () => {
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

    it('records the cause of scene changes (harness vs external)', async () => {
      const runtimeGame = makeRuntimeGame();
      const harness = makeStartedHarness(runtimeGame);
      await harness.goToScene('Scene 1');
      await harness.stepFrames(2);
      // An external actor (not the harness, not the game logic) replaces
      // the scene.
      runtimeGame.getSceneStack().replace({
        sceneName: 'Scene 1',
        clear: true,
      });
      await harness.stepFrames(1);

      const sceneEvents = harness._eventLog.filter(
        (event) =>
          event.event === 'sceneChanged' || event.event === 'sceneReset'
      );
      expect(sceneEvents.length).to.be(2);
      expect(sceneEvents[0].event).to.be('sceneChanged');
      expect(sceneEvents[0].cause).to.be('harness');
      expect(sceneEvents[1].event).to.be('sceneReset');
      expect(sceneEvents[1].cause).to.be('external');
      expect(typeof sceneEvents[1].causeDetail).to.be('string');
    });

    it('fakes pointer lock at the DOM level and feeds mouse deltas as pointermove events', async () => {
      const runtimeGame = makeRuntimeGame();
      // Attach a canvas like a real game has (tests run without one).
      const canvas = document.createElement('canvas');
      /** @type {any} */ (runtimeGame.getRenderer())._gameCanvas = canvas;

      // A DOM listener like the ones of mouse-look extensions: accumulates
      // movement only while the pointer is locked.
      let movementX = 0;
      let movementY = 0;
      canvas.addEventListener('pointermove', (event) => {
        if (document.pointerLockElement === canvas) {
          movementX += event.movementX || 0;
          movementY += event.movementY || 0;
        }
      });

      const harness = makeStartedHarness(runtimeGame);
      harness._installPointerLockShim();
      try {
        await harness.goToScene('Scene 1');

        // Deltas sent before the game requests the lock are not accumulated
        // by the listener (the extension sees an unlocked pointer).
        harness.setMouseDelta(100, 100);
        expect(movementX).to.be(0);

        // The game (or an extension) requests the pointer lock: no real
        // lock happens, but the DOM reports one.
        canvas.requestPointerLock();
        expect(document.pointerLockElement).to.be(canvas);

        harness.setMouseDelta(12, -6);
        harness.setMouseDelta(3, 0);
        expect(movementX).to.be(15);
        expect(movementY).to.be(-6);

        document.exitPointerLock();
        expect(document.pointerLockElement).to.be(null);
      } finally {
        harness._uninstallPointerLockShim();
      }

      // The document is restored once the test is done.
      expect(document.pointerLockElement).to.be(null);
      expect(canvas.requestPointerLock).to.not.be(undefined);
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

  describe('GameplayTestHarness snapshots of nested custom objects', () => {
    // A hierarchy an extension would declare: CombinedTank (a custom object)
    // contains TankTop_Combined (a custom object too) which contains
    // TankCanon (a plain object).
    const TANK_EXTENSION_NAME = 'TankConfiguration';
    /** How many custom objects the deep chain used to test the depth cap has. */
    const DEEP_LEVELS_COUNT = 10;
    /** Same as `MAX_CHILDREN_DEPTH` in `gameplay-test-runner.ts`. */
    const MAX_CHILDREN_DEPTH = 8;
    /** The size of the sized child of `BoxTurret` (see `SizedBox`). */
    const BOX_WIDTH = 10;
    const BOX_HEIGHT = 6;
    /** The size of the 3D cube child of `Barrel3D`. */
    const CUBE_WIDTH = 10;
    const CUBE_HEIGHT = 6;
    const CUBE_DEPTH = 4;
    /** Positions are compared through rotations: they are only nearly equal. */
    const POSITION_EPSILON = 1e-9;

    /**
     * @param {string} name
     * @param {number} x
     * @param {number} y
     * @returns {InstanceData}
     */
    const createChildInstanceData = (name, x, y) => ({
      persistentUuid: `${name}-${x}-${y}`,
      layer: '',
      locked: false,
      name,
      x,
      y,
      angle: 0,
      zOrder: 0,
      customSize: false,
      width: 0,
      height: 0,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
    });

    /**
     * The object data of a plain (not custom) child object. It has no size,
     * so its center is at its position.
     * @param {string} name
     * @returns {ObjectData}
     */
    const createPlainChildObjectData = (name) => ({
      name,
      type: '',
      variables: [],
      behaviors: [],
      effects: [],
    });

    /**
     * The object data of a child object with a size (a plain 2D object whose
     * width and height can be set), to check the world geometry of a child.
     * @param {string} name
     * @returns {ObjectData}
     */
    const createSizedChildObjectData = (name) => ({
      name,
      type: 'TestObject::TestObject',
      variables: [],
      behaviors: [],
      effects: [],
    });

    /**
     * The object data of a 3D cube child object, with a size on the three
     * axes, to check the world geometry inside a 3D custom object.
     * @param {string} name
     * @returns {ObjectData}
     */
    const createCube3DChildObjectData = (name) =>
      /** @type {any} */ ({
        name,
        type: 'Scene3D::Cube3DObject',
        variables: [],
        behaviors: [],
        effects: [],
        content: {
          width: CUBE_WIDTH,
          height: CUBE_HEIGHT,
          depth: CUBE_DEPTH,
        },
      });

    /**
     * The object data of an instance of a custom object (as the editor
     * serializes it in a scene or in another custom object).
     * @param {string} name
     * @param {string} type
     * @returns {ObjectData & gdjs.CustomObjectConfiguration}
     */
    const createCustomObjectData = (name, type) => ({
      name,
      type,
      variant: '',
      isInnerAreaFollowingParentSize: false,
      variables: [],
      behaviors: [],
      effects: [],
      content: {},
    });

    /**
     * @param {string} name
     * @param {Array<ObjectData>} objects
     * @param {Array<InstanceData>} instances
     * @param {number} areaMax
     * @returns {EventsBasedObjectData}
     */
    const createEventsBasedObjectData = (
      name,
      objects,
      instances,
      areaMax
    ) => ({
      name,
      objects,
      instances,
      objectsGroups: [],
      layers: [],
      variables: [],
      areaMinX: 0,
      areaMinY: 0,
      areaMinZ: 0,
      areaMaxX: areaMax,
      areaMaxY: areaMax,
      areaMaxZ: 0,
      _initialInnerArea: null,
      isInnerAreaFollowingParentSize: false,
      variants: [],
      usedResources: [],
      editionSettings: {
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
    });

    /** @returns {EventsFunctionsExtensionData} */
    const createTankExtensionData = () => {
      const eventsBasedObjects = [
        createEventsBasedObjectData(
          'TankTop',
          [createPlainChildObjectData('TankCanon')],
          [createChildInstanceData('TankCanon', 10, 20)],
          64
        ),
        createEventsBasedObjectData(
          'CombinedTank',
          [
            createCustomObjectData(
              'TankTop_Combined',
              TANK_EXTENSION_NAME + '::TankTop'
            ),
          ],
          [createChildInstanceData('TankTop_Combined', 30, 40)],
          128
        ),
        // Two instances of the same child object, to check they are all
        // snapshotted.
        createEventsBasedObjectData(
          'TwinTank',
          [createPlainChildObjectData('TankCanon')],
          [
            createChildInstanceData('TankCanon', 10, 20),
            createChildInstanceData('TankCanon', 50, 60),
          ],
          128
        ),
        // A 2D chain with a child that has a size, to check the world
        // geometry of descendants: BoxTank > BoxTurret_Inner > SizedBox.
        createEventsBasedObjectData(
          'BoxTurret',
          [createSizedChildObjectData('SizedBox')],
          [createChildInstanceData('SizedBox', 10, 20)],
          64
        ),
        createEventsBasedObjectData(
          'BoxTank',
          [
            createCustomObjectData(
              'BoxTurret_Inner',
              TANK_EXTENSION_NAME + '::BoxTurret'
            ),
          ],
          [createChildInstanceData('BoxTurret_Inner', 30, 40)],
          128
        ),
        // The same chain in 3D (rendered by `CustomRuntimeObject3D`), to
        // check the rotations around X and Y: Turret3D > Barrel3D_Inner >
        // Cube3D.
        createEventsBasedObjectData(
          'Barrel3D',
          [createCube3DChildObjectData('Cube3D')],
          [createChildInstanceData('Cube3D', 10, 20)],
          64
        ),
        createEventsBasedObjectData(
          'Turret3D',
          [
            createCustomObjectData(
              'Barrel3D_Inner',
              TANK_EXTENSION_NAME + '::Barrel3D'
            ),
          ],
          [createChildInstanceData('Barrel3D_Inner', 30, 40)],
          128
        ),
      ];
      // A chain of custom objects deeper than MAX_CHILDREN_DEPTH, to check
      // snapshots stop there: DeepLevel0 > Child > Child > ...
      for (let level = 0; level < DEEP_LEVELS_COUNT; level++) {
        const isDeepest = level === DEEP_LEVELS_COUNT - 1;
        eventsBasedObjects.push(
          createEventsBasedObjectData(
            'DeepLevel' + level,
            [
              isDeepest
                ? createPlainChildObjectData('Child')
                : createCustomObjectData(
                    'Child',
                    TANK_EXTENSION_NAME + '::DeepLevel' + (level + 1)
                  ),
            ],
            [createChildInstanceData('Child', 1, 1)],
            32
          )
        );
      }
      return {
        name: TANK_EXTENSION_NAME,
        eventsBasedObjects,
        sceneVariables: [],
        globalVariables: [],
      };
    };

    /**
     * Register the object classes an extension would generate for its custom
     * objects (see `MockedCustomObject.js`).
     */
    const registerCustomObjectClasses = () => {
      const types = [
        TANK_EXTENSION_NAME + '::TankTop',
        TANK_EXTENSION_NAME + '::CombinedTank',
        TANK_EXTENSION_NAME + '::TwinTank',
        TANK_EXTENSION_NAME + '::BoxTurret',
        TANK_EXTENSION_NAME + '::BoxTank',
      ];
      for (let level = 0; level < DEEP_LEVELS_COUNT; level++) {
        types.push(TANK_EXTENSION_NAME + '::DeepLevel' + level);
      }
      for (const type of types) {
        if (gdjs.objectsTypes.containsKey(type)) continue;
        gdjs.registerObject(
          type,
          class extends gdjs.CustomRuntimeObject2D {
            constructor(parent, objectData, instanceData) {
              super(parent, objectData, instanceData);
              // The generated code calls onCreated at the constructor end.
              this.onCreated();
            }
          }
        );
      }
      // The custom objects of a 3D extension are rendered with a THREE group
      // holding their complete transformation.
      const types3D = [
        TANK_EXTENSION_NAME + '::Barrel3D',
        TANK_EXTENSION_NAME + '::Turret3D',
      ];
      for (const type of types3D) {
        if (gdjs.objectsTypes.containsKey(type)) continue;
        gdjs.registerObject(
          type,
          class extends gdjs.CustomRuntimeObject3D {
            constructor(parent, objectData, instanceData) {
              super(parent, objectData, instanceData);
              // The generated code calls onCreated at the constructor end.
              this.onCreated();
            }
          }
        );
      }
    };

    const makeRuntimeGameWithCustomObjects = () => {
      registerCustomObjectClasses();
      const sceneData = createSceneData('Scene 1');
      sceneData.layers.push({
        name: 'UI',
        visibility: true,
        effects: [],
        cameras: [],
      });
      sceneData.objects.push(
        createCustomObjectData(
          'CombinedTank',
          TANK_EXTENSION_NAME + '::CombinedTank'
        ),
        createCustomObjectData('TwinTank', TANK_EXTENSION_NAME + '::TwinTank'),
        createCustomObjectData(
          'DeepTank',
          TANK_EXTENSION_NAME + '::DeepLevel0'
        ),
        createCustomObjectData(
          'BoxTurret',
          TANK_EXTENSION_NAME + '::BoxTurret'
        ),
        createCustomObjectData('BoxTank', TANK_EXTENSION_NAME + '::BoxTank'),
        createCustomObjectData('Barrel3D', TANK_EXTENSION_NAME + '::Barrel3D'),
        createCustomObjectData('Turret3D', TANK_EXTENSION_NAME + '::Turret3D')
      );
      const projectData = gdjs.createProjectData({ layouts: [sceneData] });
      projectData.eventsFunctionsExtensions = [createTankExtensionData()];
      return new gdjs.RuntimeGame(projectData);
    };

    /**
     * The snapshots of the children of an object, by child object name.
     * @param {gdjs.gameplayTests.GameplayTestObjectSnapshot} snapshot
     * @param {string} childName
     * @returns {Array<gdjs.gameplayTests.GameplayTestObjectSnapshot>}
     */
    const getChildren = (snapshot, childName) => {
      const children = snapshot.children && snapshot.children[childName];
      if (!children) {
        throw new Error(
          `No child "${childName}" in the snapshot of "${snapshot.name}".`
        );
      }
      return children;
    };

    /**
     * A harness with a `CombinedTank` spawned at (100 ; 200) on the UI layer.
     * @returns {Promise<gdjs.gameplayTests.GameplayTestHarness>}
     */
    const makeHarnessWithSpawnedTank = async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('CombinedTank', 100, 200, undefined, 'UI');
      await harness.stepFrames(1);
      return harness;
    };

    /**
     * The scene position the harness is expected to report for a grandchild,
     * computed with the runtime transformations of the two custom objects.
     * @param {any} tank
     * @param {number} x
     * @param {number} y
     * @returns {Array<number>}
     */
    const toSceneCoordinates = (tank, x, y) => {
      const tankTop = tank
        .getChildrenContainer()
        .getObjects('TankTop_Combined')[0];
      const point = [0, 0];
      tankTop.applyObjectTransformation(x, y, point);
      tank.applyObjectTransformation(point[0], point[1], point);
      return point;
    };

    /**
     * The scene position expected for a point given in the local space of
     * the deepest custom object of `parentsFromInnermost`, computed with the
     * runtime transformation of each of them.
     * @param {Array<any>} parentsFromInnermost
     * @param {number} x
     * @param {number} y
     * @returns {Array<number>}
     */
    const toSceneCoordinatesThrough = (parentsFromInnermost, x, y) => {
      const point = [x, y];
      for (const parent of parentsFromInnermost) {
        parent.applyObjectTransformation(point[0], point[1], point);
      }
      return point;
    };

    /**
     * The scene bounds expected for a child object: the corners of its own
     * box, moved with the runtime transformation of every custom object
     * above it (innermost first).
     * @param {Array<any>} parentsFromInnermost
     * @param {gdjs.RuntimeObject} childObject
     * @returns {gdjs.gameplayTests.GameplayTestWorldBounds}
     */
    const toSceneBounds = (parentsFromInnermost, childObject) => {
      const localBox = childObject.getAABB();
      const bounds = {
        minX: Number.MAX_VALUE,
        minY: Number.MAX_VALUE,
        // These 2D children have no Z: they stay on the Z of their parents.
        minZ: 0,
        maxX: -Number.MAX_VALUE,
        maxY: -Number.MAX_VALUE,
        maxZ: 0,
      };
      for (const x of [localBox.min[0], localBox.max[0]]) {
        for (const y of [localBox.min[1], localBox.max[1]]) {
          const point = toSceneCoordinatesThrough(parentsFromInnermost, x, y);
          bounds.minX = Math.min(bounds.minX, point[0]);
          bounds.minY = Math.min(bounds.minY, point[1]);
          bounds.maxX = Math.max(bounds.maxX, point[0]);
          bounds.maxY = Math.max(bounds.maxY, point[1]);
        }
      }
      return bounds;
    };

    /**
     * A position going through rotations is only nearly equal to the
     * expected one.
     * @param {number|undefined} actual
     * @param {number} expected
     */
    const expectNearlyEqual = (actual, expected) => {
      expect(actual).to.be.within(
        expected - POSITION_EPSILON,
        expected + POSITION_EPSILON
      );
    };

    /**
     * The first child instance of a custom object with this object name.
     * @param {any} customObject
     * @param {string} childName
     * @returns {any}
     */
    const getChildInstance = (customObject, childName) =>
      customObject.getChildrenContainer().getObjects(childName)[0];

    /**
     * The world bounds of the snapshot of a child (every child of a custom
     * object has some).
     * @param {gdjs.gameplayTests.GameplayTestObjectSnapshot} snapshot
     * @returns {gdjs.gameplayTests.GameplayTestWorldBounds}
     */
    const getWorldBounds = (snapshot) => {
      const worldBounds = snapshot.worldBounds;
      if (!worldBounds) {
        throw new Error(
          `No world bounds in the snapshot of "${snapshot.name}".`
        );
      }
      return worldBounds;
    };

    it('snapshots only the direct children by default', async () => {
      const harness = await makeHarnessWithSpawnedTank();

      const tank = harness.getObjects('CombinedTank')[0];
      const tankTops = getChildren(tank, 'TankTop_Combined');
      expect(tankTops.length).to.be(1);
      // Depth 1: the child of the child custom object is not snapshotted.
      expect(tankTops[0].children).to.be(undefined);
    });

    it('snapshots nested custom objects with childrenDepth', async () => {
      const harness = await makeHarnessWithSpawnedTank();

      const tank = harness.getObjects('CombinedTank', { childrenDepth: 2 })[0];
      const tankTop = getChildren(tank, 'TankTop_Combined')[0];
      const tankCanon = getChildren(tankTop, 'TankCanon')[0];

      // The child is at (30 ; 40) in the tank, the grandchild at (10 ; 20)
      // in the child: both are reported in scene coordinates.
      expect(tank.x).to.be(100);
      expect(tank.y).to.be(200);
      expect(tankTop.x).to.be(130);
      expect(tankTop.y).to.be(240);
      expect(tankCanon.x).to.be(140);
      expect(tankCanon.y).to.be(260);
      // These children have no size: their center is at their position.
      expect(tankCanon.centerX).to.be(140);
      expect(tankCanon.centerY).to.be(260);

      // The internal layers of a custom object mean nothing outside of it:
      // every descendant reports the layer of the custom object.
      expect(tank.layer).to.be('UI');
      expect(tankTop.layer).to.be('UI');
      expect(tankCanon.layer).to.be('UI');
    });

    it('snapshots every instance of a child object', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('TwinTank', 100, 200);
      await harness.stepFrames(1);

      const canons = getChildren(
        harness.getObjects('TwinTank')[0],
        'TankCanon'
      );
      expect(canons.length).to.be(2);
      expect(canons.map((canon) => canon.x).sort()).to.eql([110, 150]);
      expect(canons.map((canon) => canon.y).sort()).to.eql([220, 260]);
    });

    it('converts nested children with the transformation of every level', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('CombinedTank', 100, 200);
      // Rotate and scale the tank: the whole subtree must follow.
      const runtimeTank = harness.getRuntimeObject('CombinedTank');
      if (!runtimeTank) throw new Error('The tank was not spawned.');
      runtimeTank.setAngle(90);
      runtimeTank.setWidth(runtimeTank.getWidth() * 2);
      await harness.stepFrames(1);

      const tank = harness.getObjects('CombinedTank', { childrenDepth: 2 })[0];
      const tankCanon = getChildren(
        getChildren(tank, 'TankTop_Combined')[0],
        'TankCanon'
      )[0];
      const expectedPosition = toSceneCoordinates(runtimeTank, 10, 20);
      expect(tankCanon.x).to.be(expectedPosition[0]);
      expect(tankCanon.y).to.be(expectedPosition[1]);
    });

    it('snapshots no children with a childrenDepth of 0', async () => {
      const harness = await makeHarnessWithSpawnedTank();

      const tank = harness.getObjects('CombinedTank', { childrenDepth: 0 })[0];
      expect(tank).to.not.have.key('children');
    });

    it('rounds a fractional childrenDepth down', async () => {
      const harness = await makeHarnessWithSpawnedTank();

      // 1.9 is the default depth 1: the direct children only.
      const tank = harness.getObjects('CombinedTank', {
        childrenDepth: 1.9,
      })[0];
      const tankTops = getChildren(tank, 'TankTop_Combined');
      expect(tankTops.length).to.be(1);
      expect(tankTops[0].children).to.be(undefined);
    });

    it('throws on malformed snapshot options', async () => {
      const harness = await makeHarnessWithSpawnedTank();

      expect(() =>
        harness.getObjects('CombinedTank', /** @type {any} */ (2))
      ).to.throwError(/childrenDepth/);
      expect(() =>
        harness.getObjects('CombinedTank', {
          childrenDepth: /** @type {any} */ ('2'),
        })
      ).to.throwError(/childrenDepth/);
    });

    it('caps the children depth', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('DeepTank', 0, 0);
      await harness.stepFrames(1);

      let snapshot = harness.getObjects('DeepTank', { childrenDepth: 50 })[0];
      let depth = 0;
      while (snapshot.children && snapshot.children.Child) {
        snapshot = snapshot.children.Child[0];
        depth++;
      }
      expect(depth).to.be(MAX_CHILDREN_DEPTH);
    });

    it('snapshots nested children in getNearby too', async () => {
      const harness = await makeHarnessWithSpawnedTank();
      harness.spawn('MyObject', 100, 200);
      await harness.stepFrames(1);

      const nearby = harness.getNearby('CombinedTank', 'MyObject', 1000, {
        childrenDepth: 2,
      });
      expect(nearby.length).to.be(1);
      const tankCanon = getChildren(
        getChildren(nearby[0], 'TankTop_Combined')[0],
        'TankCanon'
      )[0];
      expect(tankCanon.x).to.be(140);
    });

    it('moves a point with the Z and Z scale of a parent without a THREE object', () => {
      const harness = makeStartedHarness(makeRuntimeGame());
      // A 3D custom object places its children at
      // parentZ + childZ * parentScaleZ (see
      // `CustomRuntimeObject3DRenderer._updateThreeGroup`) - the fallback
      // used when the object has no THREE object (no 3D rendering).
      const parentObject = /** @type {any} */ ({
        applyObjectTransformation: (x, y, destination) => {
          destination[0] = x + 1000;
          destination[1] = y + 2000;
        },
        getZ: () => 50,
        getScaleZ: () => 2,
        getLayer: () => 'UI',
      });

      const space = harness['_makeChildrenSpace'](parentObject, null);
      const point = { x: 1, y: 2, z: 10 };
      harness['_transformPointToScene'](space, point);

      expect(point.x).to.be(1001);
      expect(point.y).to.be(2002);
      expect(point.z).to.be(70);
      expect(space.layer).to.be('UI');
    });

    it('applies the transformation of every level to the children of a nested parent', () => {
      const harness = makeStartedHarness(makeRuntimeGame());
      const outerParentObject = /** @type {any} */ ({
        applyObjectTransformation: (x, y, destination) => {
          destination[0] = x + 1000;
          destination[1] = y + 2000;
        },
        getZ: () => 50,
        getScaleZ: () => 2,
        getLayer: () => 'UI',
      });
      const innerParentObject = /** @type {any} */ ({
        applyObjectTransformation: (x, y, destination) => {
          destination[0] = x * 2;
          destination[1] = y * 3;
        },
        getZ: () => 5,
        getScaleZ: () => 10,
        // The internal layers of a custom object mean nothing outside of it.
        getLayer: () => 'Internal layer',
      });

      const outerSpace = harness['_makeChildrenSpace'](outerParentObject, null);
      const innerSpace = harness['_makeChildrenSpace'](
        innerParentObject,
        outerSpace
      );
      const point = { x: 1, y: 2, z: 3 };
      harness['_transformPointToScene'](innerSpace, point);

      // The innermost transformation is applied first: (1 ; 2 ; 3) becomes
      // (2 ; 6 ; 35) in the outer parent, then (1002 ; 2006 ; 120).
      expect(point.x).to.be(1002);
      expect(point.y).to.be(2006);
      expect(point.z).to.be(120);
      expect(innerSpace.layer).to.be('UI');
    });

    it('reports the world bounds of a child scaled by its parent', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('BoxTurret', 100, 200);
      await harness.stepFrames(1);

      const runtimeTurret = /** @type {any} */ (
        harness.getRuntimeObject('BoxTurret')
      );
      if (!runtimeTurret) throw new Error('The turret was not spawned.');
      getChildInstance(runtimeTurret, 'SizedBox').setCustomWidthAndHeight(
        BOX_WIDTH,
        BOX_HEIGHT
      );
      runtimeTurret.setScale(2);

      const turret = harness.getObjects('BoxTurret')[0];
      const box = getChildren(turret, 'SizedBox')[0];

      // A 10x6 child at (10 ; 20) in a turret scaled by 2 at (100 ; 200).
      expect(box.x).to.be(120);
      expect(box.y).to.be(240);
      // Its size stays its own, local value...
      expect(box.width).to.be(BOX_WIDTH);
      expect(box.height).to.be(BOX_HEIGHT);
      expect(box.isLocalGeometry).to.be(true);
      // ...while the world geometry reflects the scale of the parent.
      expect(getWorldBounds(box)).to.eql({
        minX: 120,
        minY: 240,
        minZ: 0,
        maxX: 140,
        maxY: 252,
        maxZ: 0,
      });
      expect(getWorldBounds(box).maxX - getWorldBounds(box).minX).to.be(
        2 * BOX_WIDTH
      );
      // The turret is in the scene: its own geometry needs no world box.
      expect(turret.worldBounds).to.be(undefined);
      expect(turret.isLocalGeometry).to.be(undefined);
    });

    it('places a child of a 3D parent rotated around X with the complete transformation', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('Barrel3D', 100, 200, 50);
      const runtimeBarrel = /** @type {any} */ (
        harness.getRuntimeObject('Barrel3D')
      );
      if (!runtimeBarrel) throw new Error('The barrel was not spawned.');
      // Rotate around the origin of the barrel, to keep the expected
      // positions readable.
      runtimeBarrel.setRotationCenter3D(0, 0, 0);
      getChildInstance(runtimeBarrel, 'Cube3D').setZ(5);
      await harness.stepFrames(1);
      runtimeBarrel.setRotationX(90);

      const cube = getChildren(harness.getObjects('Barrel3D')[0], 'Cube3D')[0];

      // A rotation of 90° around X maps (x ; y ; z) to (x ; -z ; y): the
      // child at (10 ; 20 ; 5) of a barrel at (100 ; 200 ; 50) is at
      // (110 ; 195 ; 70) in the scene.
      expectNearlyEqual(cube.x, 110);
      expectNearlyEqual(cube.y, 195);
      expectNearlyEqual(cube.z, 70);
      // Its center is at (15 ; 23 ; 7) in the barrel (a 10x6x4 cube).
      expectNearlyEqual(cube.centerX, 115);
      expectNearlyEqual(cube.centerY, 193);
      expectNearlyEqual(cube.centerZ, 73);
      // Its box, 10x6x4 in the barrel, is 10x4x6 in the scene.
      const worldBounds = getWorldBounds(cube);
      expectNearlyEqual(worldBounds.minX, 110);
      expectNearlyEqual(worldBounds.maxX, 120);
      expectNearlyEqual(worldBounds.minY, 191);
      expectNearlyEqual(worldBounds.maxY, 195);
      expectNearlyEqual(worldBounds.minZ, 70);
      expectNearlyEqual(worldBounds.maxZ, 76);
      // The sizes and angles of the child stay its own, local values: the
      // rotation of the parent is not summed into them.
      expect(cube.width).to.be(CUBE_WIDTH);
      expect(cube.height).to.be(CUBE_HEIGHT);
      expect(cube.depth).to.be(CUBE_DEPTH);
      expect(cube.rotationX).to.be(0);
      expect(cube.isLocalGeometry).to.be(true);
    });

    it('places descendants of nested parents combining rotation, scale and flips', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('BoxTank', 100, 200);
      await harness.stepFrames(1);

      const runtimeTank = /** @type {any} */ (
        harness.getRuntimeObject('BoxTank')
      );
      if (!runtimeTank) throw new Error('The tank was not spawned.');
      const runtimeTurret = getChildInstance(runtimeTank, 'BoxTurret_Inner');
      const runtimeBox = getChildInstance(runtimeTurret, 'SizedBox');
      runtimeBox.setCustomWidthAndHeight(BOX_WIDTH, BOX_HEIGHT);
      // Two levels of translation, rotation, non-uniform scale and flip.
      runtimeTank.setAngle(30);
      runtimeTank.setScaleX(2);
      runtimeTank.setScaleY(3);
      runtimeTank.flipX(true);
      runtimeTurret.setAngle(45);
      runtimeTurret.setScaleY(0.5);
      runtimeTurret.flipY(true);

      const tank = harness.getObjects('BoxTank', { childrenDepth: 2 })[0];
      const turret = getChildren(tank, 'BoxTurret_Inner')[0];
      const box = getChildren(turret, 'SizedBox')[0];
      const parentsFromInnermost = [runtimeTurret, runtimeTank];

      // Every level of the chain is applied, to the origins...
      expect([turret.x, turret.y]).to.eql(
        toSceneCoordinatesThrough(
          [runtimeTank],
          runtimeTurret.getX(),
          runtimeTurret.getY()
        )
      );
      expect([box.x, box.y]).to.eql(
        toSceneCoordinatesThrough(
          parentsFromInnermost,
          runtimeBox.getX(),
          runtimeBox.getY()
        )
      );
      // ...to the centers...
      expect([box.centerX, box.centerY]).to.eql(
        toSceneCoordinatesThrough(
          parentsFromInnermost,
          runtimeBox.getCenterXInScene(),
          runtimeBox.getCenterYInScene()
        )
      );
      // ...and to the corners of the box of the child.
      expect(getWorldBounds(box)).to.eql(
        toSceneBounds(parentsFromInnermost, runtimeBox)
      );
      // The size of the child stays local: its world box is wider than it.
      expect(box.width).to.be(BOX_WIDTH);
      const worldBounds = getWorldBounds(box);
      expect(worldBounds.maxX - worldBounds.minX).to.be.greaterThan(BOX_WIDTH);
    });

    it('places a descendant of nested 3D parents through the rotation and translation of each level', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('Turret3D', 0, 0, 0);
      const runtimeTurret = /** @type {any} */ (
        harness.getRuntimeObject('Turret3D')
      );
      if (!runtimeTurret) throw new Error('The turret was not spawned.');
      const runtimeBarrel = getChildInstance(runtimeTurret, 'Barrel3D_Inner');
      // Rotate both custom objects around their own origin, to keep the
      // expected positions readable.
      runtimeTurret.setRotationCenter3D(0, 0, 0);
      runtimeBarrel.setRotationCenter3D(0, 0, 0);
      getChildInstance(runtimeBarrel, 'Cube3D').setZ(5);
      await harness.stepFrames(1);

      // A translation and a rotation on each of the two levels.
      runtimeTurret.setX(100);
      runtimeTurret.setY(200);
      runtimeTurret.setZ(50);
      runtimeTurret.setRotationX(90);
      runtimeBarrel.setX(50);
      runtimeBarrel.setY(60);
      runtimeBarrel.setZ(10);
      runtimeBarrel.setRotationY(90);

      const turret = harness.getObjects('Turret3D', { childrenDepth: 2 })[0];
      const barrel = getChildren(turret, 'Barrel3D_Inner')[0];
      const cube = getChildren(barrel, 'Cube3D')[0];

      // The turret is rotated by 90° around X, which maps (x ; y ; z) to
      // (x ; -z ; y): the barrel at (50 ; 60 ; 10) in it is at
      // (150 ; 190 ; 110) in the scene.
      expectNearlyEqual(barrel.x, 150);
      expectNearlyEqual(barrel.y, 190);
      expectNearlyEqual(barrel.z, 110);

      // The barrel is rotated by 90° around Y, which maps (x ; y ; z) to
      // (z ; y ; -x): the cube at (10 ; 20 ; 5) in it is at (55 ; 80 ; 0)
      // in the turret, and the two rotations together map it to
      // (155 ; 200 ; 130) in the scene.
      expectNearlyEqual(cube.x, 155);
      expectNearlyEqual(cube.y, 200);
      expectNearlyEqual(cube.z, 130);
      // Its center is at (15 ; 23 ; 7) in the barrel (a 10x6x4 cube).
      expectNearlyEqual(cube.centerX, 157);
      expectNearlyEqual(cube.centerY, 205);
      expectNearlyEqual(cube.centerZ, 133);
      // Composed, the two rotations map (x ; y ; z) of the barrel to
      // (z ; x ; y) in the scene: the 10x6x4 box of the cube is 4x10x6
      // there.
      const worldBounds = getWorldBounds(cube);
      expectNearlyEqual(worldBounds.minX, 155);
      expectNearlyEqual(worldBounds.maxX, 159);
      expectNearlyEqual(worldBounds.minY, 200);
      expectNearlyEqual(worldBounds.maxY, 210);
      expectNearlyEqual(worldBounds.minZ, 130);
      expectNearlyEqual(worldBounds.maxZ, 136);
      // The rotations of the two parents are not summed into the angles of
      // the cube: they stay its own, local values.
      expect(cube.rotationX).to.be(0);
      expect(cube.rotationY).to.be(0);
      expect(cube.isLocalGeometry).to.be(true);
    });

    it('applies a parent transformation changed just before the snapshot', async () => {
      const harness = makeStartedHarness(makeRuntimeGameWithCustomObjects());
      await harness.goToScene('Scene 1');
      harness.spawn('Barrel3D', 100, 200, 50);
      const runtimeBarrel = /** @type {any} */ (
        harness.getRuntimeObject('Barrel3D')
      );
      if (!runtimeBarrel) throw new Error('The barrel was not spawned.');
      runtimeBarrel.setRotationCenter3D(0, 0, 0);
      getChildInstance(runtimeBarrel, 'Cube3D').setZ(5);
      await harness.stepFrames(1);

      // This first snapshot leaves the renderer of the barrel up to date.
      const cubeBefore = getChildren(
        harness.getObjects('Barrel3D')[0],
        'Cube3D'
      )[0];
      expectNearlyEqual(cubeBefore.x, 110);
      expectNearlyEqual(cubeBefore.y, 220);
      expectNearlyEqual(cubeBefore.z, 55);

      // Move and rotate the barrel without stepping a frame: the snapshot
      // must not use the transformation of the last rendered frame.
      runtimeBarrel.setX(300);
      runtimeBarrel.setZ(80);
      runtimeBarrel.setRotationY(90);

      const cubeAfter = getChildren(
        harness.getObjects('Barrel3D')[0],
        'Cube3D'
      )[0];
      // A rotation of 90° around Y maps (x ; y ; z) to (z ; y ; -x): the
      // child at (10 ; 20 ; 5) of a barrel at (300 ; 200 ; 80) is at
      // (305 ; 220 ; 70) in the scene.
      expectNearlyEqual(cubeAfter.x, 305);
      expectNearlyEqual(cubeAfter.y, 220);
      expectNearlyEqual(cubeAfter.z, 70);
    });
  });
});

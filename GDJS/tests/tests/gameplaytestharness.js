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
    // Each probe (baseline + 2 keys + final cleanup) restarts the scene.
    const resets = result.eventLog.filter(
      (event) => event.event === 'sceneReset'
    );
    expect(resets.length >= 3).to.be(true);
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
});

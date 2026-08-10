/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Gameplay tests');

  /**
   * Gameplay tests: run a JavaScript test script against the running game,
   * stepping frames deterministically, simulating inputs and asserting on the
   * game state. Used by the editor (and the AI) through the debugger client
   * (`gameplayTest.run` command) - see `gdjs.gameplayTests.runGameplayTest`.
   *
   * @category Gameplay tests
   */
  export namespace gameplayTests {
    /**
     * One readable state entry, derived by the editor from an extension's own
     * declarations: `name` is the event-sheet name of a condition or
     * expression ('IsOnFloor', 'CurrentSpeed', 'PropertyHealth'...) and
     * `functionName` the runtime method evaluating it.
     */
    export type GameplayTestStateInspectorEntry = {
      name: string;
      functionName: string;
      kind: 'boolean' | 'number' | 'string';
    };

    /**
     * The state inspectors for the behavior and object types used in the
     * project, computed by the editor from the extensions metadata (single
     * source of truth) and sent with the run payload.
     */
    export type GameplayTestStateInspectors = {
      behaviors: {
        [behaviorType: string]: Array<GameplayTestStateInspectorEntry>;
      };
      objects: {
        [objectType: string]: Array<GameplayTestStateInspectorEntry>;
      };
    };

    /**
     * The state of an object or behavior: its conditions and expressions,
     * evaluated at snapshot time, under the exact names used in the game's
     * events. Reading an unknown name throws with the list of available ones.
     */
    export type GameplayTestEvaluatedState = {
      [conditionOrExpressionName: string]: boolean | number | string;
    };

    export type GameplayTestRunPayload = {
      testName: string;
      /** The body of `async (harness) => { ... }`. */
      source: string;
      /** Readable state to evaluate on object/behavior snapshots. */
      stateInspectors?: GameplayTestStateInspectors;
      /** Wall-clock timeout for the RUNNING part of the test: the time
       * spent waiting for the game to boot or for scene assets to load is
       * excluded (bounded separately by `loadingTimeoutMs`). Default: 30000. */
      timeoutMs?: number;
      /** Wall-clock bound on each loading wait (game boot, scene assets),
       * which is excluded from `timeoutMs`. Default: 300000. */
      loadingTimeoutMs?: number;
      /** Maximum number of frames stepped. Default: 20000. */
      maxFrames?: number;
      /**
       * Pace the run for a human watching it: game seconds simulated per
       * real second (1 = normal speed, 4 = 4x...). Omitted: run as fast
       * as possible.
       */
      speedFactor?: number;
      /** Maximum number of screenshots kept. Default: 5. */
      maxScreenshots?: number;
      /**
       * When true, the game is left paused and muted when the test finishes,
       * instead of resuming. Used when the game only exists to run tests
       * (the editor gameplay test frame), so the last frame stays visible.
       */
      freezeWhenFinished?: boolean;
    };

    export type GameplayTestAssertion = {
      message: string;
      passed: boolean;
    };

    export type GameplayTestLog = {
      level: 'log' | 'warn' | 'error';
      message: string;
    };

    export type GameplayTestEvent = {
      frame: integer;
      /**
       * `sceneReset` is recorded when the running scene was replaced by a NEW
       * instance of the same scene: objects are back to their initial state.
       * Legitimate when the game restarts the level; a symptom of external
       * interference otherwise.
       */
      event: 'spawned' | 'removed' | 'stuck' | 'sceneChanged' | 'sceneReset';
      object?: string;
      count?: integer;
      sceneName?: string;
      /**
       * Who changed the scene: the test itself (`harness` - a `goToScene`,
       * or `controlsProbe` for the scene restarts that
       * `resetSceneAndProbeControls` performs itself - expected, not a
       * malfunction), the game's own logic (`game` - a scene change/restart
       * action), multiplayer state (`networkSync`), or something outside of
       * the game (`external` - a symptom of interference with the test).
       */
      cause?:
        | 'harness'
        | 'controlsProbe'
        | 'game'
        | 'networkSync'
        | 'external'
        | 'unknown';
      /** For an `external` cause: where the change came from (call stack). */
      causeDetail?: string;
    };

    export type GameplayTestScreenshot = {
      label: string;
      frame: integer;
      jpegBase64: string;
    };

    export type GameplayTestObjectSnapshot = {
      id: integer;
      name: string;
      x: float;
      y: float;
      z?: float;
      angle: float;
      rotationX?: float;
      rotationY?: float;
      width: float;
      height: float;
      depth?: float;
      centerX: float;
      centerY: float;
      centerZ?: float;
      layer: string;
      hidden: boolean;
      animation?: string;
      text?: string;
      opacity?: float;
      variables: Array<Object>;
      /** The object's own conditions/expressions, evaluated (see
       * `GameplayTestEvaluatedState`). */
      state: GameplayTestEvaluatedState;
      behaviors: {
        [behaviorName: string]: {
          act: boolean;
          /** The behavior's conditions/expressions, evaluated: current state
           * and configuration, under their event-sheet names
           * (e.g. `behaviors.PlatformerObject.state.IsOnFloor`). Prefer these
           * over inferring state from coordinates. */
          state: GameplayTestEvaluatedState;
        };
      };
      flippedX?: boolean;
      flippedY?: boolean;
      children?: { [objectName: string]: Array<GameplayTestObjectSnapshot> };
    };

    export type GameplayTestNearbyObjectSnapshot =
      GameplayTestObjectSnapshot & {
        distance: float;
        relativeX: float;
        relativeY: float;
        relativeZ?: float;
        above: boolean;
        below: boolean;
        left: boolean;
        right: boolean;
        bearingFromReference: float;
      };

    /**
     * The position of a target relative to a reference object (2D and 3D).
     * How to move toward the target (which keys, when to jump...) is up to
     * the test script - see `resetSceneAndProbeControls` to discover the
     * controls and `makeProgressTracker` to detect a lack of progress.
     */
    export type GameplayTestRelativePosition = {
      relativeX: float;
      relativeY: float;
      relativeZ?: float;
      /** Full distance to the target (3D when Z is available). */
      distance: float;
      /** Distance to the target ignoring Z (equals `distance` in 2D). */
      horizontalDistance: float;
      /** Difference between the reference object's angle (yaw) and the
       * direction of the target, in degrees, normalized to [-180, 180]. */
      yawDiff: float;
      /** Vertical aim difference in degrees (3D only, 0 in 2D). */
      pitchDiff: float;
      dominantAxis: 'x' | 'y';
      /** True when the target is within `reachRadius` (default: 30). */
      reached: boolean;
      targetX: float;
      targetY: float;
      targetZ?: float;
    };

    /**
     * The measured effect of holding one key (or nothing, for the
     * baseline): the net displacement after the probe, the extreme
     * displacements observed during it (a jump shows as a negative
     * `minDy` even if the object lands back), and the yaw change.
     */
    export type GameplayTestControlProbeResult = {
      dx: float;
      dy: float;
      dz?: float;
      minDx: float;
      maxDx: float;
      minDy: float;
      maxDy: float;
      minDz?: float;
      maxDz?: float;
      yawDelta: float;
    };

    /**
     * A flat, JSON-safe profiling summary, also attached to the test result
     * (`result.profiles`). Sections are sorted by average time descending
     * (nested sections flattened as "parent > child"); `maxTimeMs` is the
     * worst single frame of a section - spikes that averages hide.
     * `worstFrames` and the timeline use the harness frame numbers:
     * correlate a spike with the `eventLog` frames.
     */
    export type GameplayTestProfilingResult = {
      /** The profiled window, in harness frame numbers (like `eventLog`). */
      startFrame: integer;
      endFrame: integer;
      avgStepTimeMs: number;
      /** The worst single frame (total). */
      maxStepTimeMs: number;
      sections: Array<{ name: string; avgTimeMs: number; maxTimeMs: number }>;
      /** The most expensive profiled frames, worst first. */
      worstFrames: Array<{ frame: integer; timeMs: number }>;
      /** The frame-by-frame timeline, in order. When the window is longer
       * than 120 frames, each entry is the MAX of `frameTimesBucketSize`
       * consecutive frames (spikes are preserved). */
      frameTimesMs: Array<number>;
      frameTimesBucketSize: integer;
      /** Live instances per object at the time profiling stopped. */
      objectCounts: { [objectName: string]: integer };
      /** 3D renderer counters (last rendered frame), when the game uses 3D. */
      renderer: {
        drawCalls: number;
        triangles: number;
        geometries: number;
        textures: number;
      } | null;
      /** JS heap in use (Chromium only), to spot leaks across a long run. */
      jsHeapUsedMb?: number;
    };

    /**
     * The outcome of `lookTowardWithMouseDelta`: whether the aim succeeded,
     * the remaining aim error, and whether the game responded to the mouse
     * at all. `sawYawResponse: false` usually means the game ignores mouse
     * deltas (e.g. the pointer lock was never engaged: click once first).
     * `sawPitchResponse: false` (with a yaw response) means the vertical
     * aim could not be measured: the aim automatically fell back to
     * yaw-only.
     */
    export type GameplayTestAimResult = {
      aimed: boolean;
      yawDiff: float;
      pitchDiff: float;
      sawYawResponse: boolean;
      sawPitchResponse: boolean;
      /** What the aim was measured on: the camera of the object's layer
       * (first-person views) or the object's own rotations. */
      measuredFrom: 'camera' | 'object';
    };

    export type GameplayTestProgressStatus = {
      frame: integer;
      distance: float;
      reached: boolean;
      /** True when the distance to the target shrank by less than
       * `minProgress` over the last `windowFrames` frames. */
      stalled: boolean;
    };

    export type GameplayTestProgressTracker = {
      /** Sample the current distance to the target and return the current
       * progress status (null if the reference or target is gone). */
      update: () => GameplayTestProgressStatus | null;
      /** Forget the history (call after switching to another target). */
      reset: () => void;
    };

    export type GameplayTestResult = {
      testName: string;
      status: 'passed' | 'failed' | 'error' | 'stopped' | 'timeout';
      framesExecuted: integer;
      durationMs: number;
      /** Time spent waiting for the game to boot and for scene assets to
       * load, excluded from the `timeoutMs` budget. `durationMs` includes
       * it: `durationMs - loadingMs` is what counted against the budget. */
      loadingMs: number;
      /** The wall-clock budget the run had, loading excluded
       * (`durationMs - loadingMs` close to it means the test is at risk of
       * timing out on a slower machine). */
      timeoutMs: number;
      gameTimeMs: number;
      assertions: Array<GameplayTestAssertion>;
      errors: Array<string>;
      consoleLogs: Array<GameplayTestLog>;
      eventLog: Array<GameplayTestEvent>;
      finalState: {
        sceneName: string;
        objectCounts: { [objectName: string]: integer };
        watchedObjects: {
          [objectName: string]: Array<GameplayTestObjectSnapshot>;
        };
        sceneVariables: Array<Object>;
      };
      screenshots: Array<GameplayTestScreenshot>;
      /** The `stopProfiling()` summaries captured during the run. */
      profiles: Array<GameplayTestProfilingResult>;
      performance: {
        avgStepMs: number;
        worstStepMs: number;
      } | null;
    };

    const DEFAULT_TIMEOUT_MS = 30000;
    /** Loading (game boot, scene assets) is excluded from `timeoutMs` -
     * on the web, a first preview can download assets for minutes - but
     * still bounded, so a dead network cannot hang a run forever. */
    const DEFAULT_LOADING_TIMEOUT_MS = 300000;
    const DEFAULT_MAX_FRAMES = 20000;
    /** How long frames are stepped before yielding once to the browser:
     * the game visibly plays (a rendered frame per refresh), stop/progress
     * messages flow, while keeping near-full stepping throughput. */
    const YIELD_BUDGET_MS = 12;
    // In fast (unpaced) runs, let the game render at most this often...
    const FAST_RUN_RENDER_INTERVAL_MS = 250;
    // ...and never spend more than ~1/(1+multiplier) of the wall clock
    // rendering: when a single render costs more than the interval itself
    // (a 3D scene on software WebGL can take 350ms), an interval cap alone
    // skips nothing - after such a render, wait for multiplier times its
    // cost before the next one.
    const FAST_RUN_RENDER_DUTY_MULTIPLIER = 4;
    const MAX_PLAYED_SOUNDS = 500;
    const DEFAULT_MAX_SCREENSHOTS = 5;
    const DEFAULT_PROBE_FRAMES = 30;
    const MAX_PROFILING_SECTIONS = 50;
    const MAX_PROFILING_TIMELINE_ENTRIES = 120;
    const MAX_PROFILING_WORST_FRAMES = 5;
    const MAX_PROFILES_PER_RESULT = 5;
    /** The scene change cause declared by the harness (see
     * `SceneStack.runWithSceneChangeCause`). */
    const GAMEPLAY_TEST_SCENE_CHANGE_CAUSE = 'gameplayTest';
    const DEFAULT_PROGRESS_WINDOW_FRAMES = 60;
    const DEFAULT_PROGRESS_MIN_PROGRESS = 8;
    const DEFAULT_REACH_RADIUS = 30;
    const MAX_CONSOLE_LOGS = 100;
    const MAX_CONSOLE_LOGS_TOTAL_CHARS = 8000;
    const MAX_ASSERTIONS = 200;
    const MAX_EVENT_LOG_ENTRIES = 500;
    const MAX_ERRORS = 20;
    const SCREENSHOT_MAX_SIZE = 512;
    const DEFAULT_FRAME_DT_MS = 1000 / 60;

    // Keys that must never throw on the self-describing state, so language
    // internals (JSON.stringify, await inspection, string coercion...) keep
    // working transparently.
    const STATE_SAFE_INSPECTION_KEYS: { [key: string]: boolean } = {
      toJSON: true,
      then: true,
      constructor: true,
      hasOwnProperty: true,
      toString: true,
      valueOf: true,
      inspect: true,
    };

    /**
     * Wrap an evaluated state so reading an unknown name (a typo, a wrong
     * casing, a hallucinated key) throws immediately with the list of
     * available names, instead of silently returning undefined.
     */
    const makeSelfDescribingState = (
      state: GameplayTestEvaluatedState,
      ownerDescription: string
    ): GameplayTestEvaluatedState => {
      return new Proxy(state, {
        get(target, key) {
          if (
            typeof key === 'string' &&
            !(key in target) &&
            !STATE_SAFE_INSPECTION_KEYS[key]
          ) {
            const availableKeys = Object.keys(target);
            throw new Error(
              `Unknown state "${key}" on ${ownerDescription}. Available: ` +
                (availableKeys.length > 0
                  ? availableKeys.join(', ')
                  : '(no state for this ' + ownerDescription + ')') +
                '.'
            );
          }
          // @ts-ignore - keys are indexable.
          return target[key];
        },
      });
    };

    /**
     * Evaluate the state inspector entries on an object or behavior: each
     * entry calls the same public getter the game's events call. An entry
     * must never break a snapshot: mismatching or throwing ones are skipped.
     */
    const evaluateStateInspector = (
      target: any,
      entries: Array<GameplayTestStateInspectorEntry> | null,
      ownerDescription: string
    ): GameplayTestEvaluatedState => {
      const state: GameplayTestEvaluatedState = {};
      if (entries) {
        for (const entry of entries) {
          const method = target[entry.functionName];
          if (typeof method !== 'function') continue;
          try {
            const value = method.call(target);
            if (
              typeof value === 'boolean' ||
              typeof value === 'number' ||
              typeof value === 'string'
            ) {
              state[entry.name] = value;
            }
          } catch (error) {
            // Skip the entry: an inspector must never break a snapshot.
          }
        }
      }
      return makeSelfDescribingState(state, ownerDescription);
    };

    class GameplayTestAssertionError extends Error {
      isGameplayTestAssertionError = true;
    }
    class GameplayTestStoppedError extends Error {
      isGameplayTestStoppedError = true;
    }
    class GameplayTestTimeoutError extends Error {
      isGameplayTestTimeoutError = true;
    }

    /** Map both GDevelop event-sheet key names and Web API key names to
     * a location-aware key code usable with the InputManager. */
    const getLocationAwareKeyCodeForName = (keyName: string): number | null => {
      const keysNameToCode: { [name: string]: number } =
        gdjs.evtTools.input.keysNameToCode;
      const webApiKeyNamesAliases: { [name: string]: string } = {
        ArrowLeft: 'Left',
        ArrowRight: 'Right',
        ArrowUp: 'Up',
        ArrowDown: 'Down',
        Enter: 'Return',
        Backspace: 'Back',
        Shift: 'LShift',
        ShiftLeft: 'LShift',
        ShiftRight: 'RShift',
        Control: 'LControl',
        ControlLeft: 'LControl',
        ControlRight: 'RControl',
        Alt: 'LAlt',
        AltLeft: 'LAlt',
        AltRight: 'RAlt',
        ' ': 'Space',
        Minus: 'Dash',
        Semicolon: 'SemiColon',
      };
      let name = keyName;
      if (webApiKeyNamesAliases.hasOwnProperty(name)) {
        name = webApiKeyNamesAliases[name];
      }
      // Web API "KeyA".."KeyZ" and "Digit0".."Digit9".
      if (/^Key[A-Z]$/.test(name)) name = name[3].toLowerCase();
      if (/^Digit[0-9]$/.test(name)) name = 'Num' + name[5];
      // Single letters are stored lowercase, digits as "Num0".."Num9".
      if (/^[A-Z]$/.test(name)) name = name.toLowerCase();
      if (/^[0-9]$/.test(name)) name = 'Num' + name;

      if (!keysNameToCode.hasOwnProperty(name)) return null;
      return keysNameToCode[name];
    };

    const mouseButtonNameToCode = (button: string): number => {
      if (button === 'right') return gdjs.InputManager.MOUSE_RIGHT_BUTTON;
      if (button === 'middle') return gdjs.InputManager.MOUSE_MIDDLE_BUTTON;
      return gdjs.InputManager.MOUSE_LEFT_BUTTON;
    };

    const normalizeAngleDifference = (angleInDegrees: float): float => {
      let angle = angleInDegrees % 360;
      if (angle > 180) angle -= 360;
      if (angle < -180) angle += 360;
      return angle;
    };

    /**
     * The object passed as `harness` to a gameplay test script.
     */
    export class GameplayTestHarness {
      _runtimeGame: gdjs.RuntimeGame;
      _payload: GameplayTestRunPayload;

      // Run state:
      _framesExecuted: integer = 0;
      _gameTimeMs: number = 0;
      _startTimeMs: number = 0;
      _stopped: boolean = false;
      _assertions: Array<GameplayTestAssertion> = [];
      _consoleLogs: Array<GameplayTestLog> = [];
      _consoleLogsTotalChars: number = 0;
      _eventLog: Array<GameplayTestEvent> = [];
      _screenshots: Array<GameplayTestScreenshot> = [];
      _watchedObjectNames: Array<string> = [];
      /** The harness frame at which the current profiling started (see
       * `startProfiling`), or null when not profiling. */
      _profilingStartFrame: integer | null = null;
      /** The profiling summaries captured during the run (attached to the
       * result as `profiles`). */
      _profiles: Array<GameplayTestProfilingResult> = [];
      _timeoutMs: number;
      _loadingTimeoutMs: number;
      /** Time spent waiting for loading (game boot, scene assets) so far:
       * excluded from the `_timeoutMs` budget, reported as `loadingMs`. */
      _loadingTimeMs: number = 0;
      _maxFrames: integer;
      /** Last time the stepping loop yielded to the browser (see
       * `_maybeYield`). */
      _lastYieldTimeMs: number = 0;
      /** The last time an animation frame was awaited (rendering the game). */
      _lastRenderTimeMs: number = 0;
      /** How long the last render (animation frame tick) took. */
      _lastRenderDurationMs: number = 0;
      /** True while resetSceneAndProbeControls runs: its scene restarts are
       * recorded with the `controlsProbe` cause. */
      _isProbingControls: boolean = false;
      _playedSounds: Array<{ sound: string; frame: integer }> = [];
      /** Entries of the sound manager log already copied to `_playedSounds`. */
      _playedSoundsReadCount: integer = 0;
      /** Game seconds simulated per real second, or null to run as fast
       * as possible (see `_maybeYield`). */
      _paceSpeedFactor: float | null = null;
      _paceReferenceWallTimeMs: number = 0;
      _paceReferenceGameTimeMs: number = 0;
      _maxScreenshots: integer;
      _totalStepTimeMs: number = 0;
      _worstStepTimeMs: number = 0;
      _lastTrackedSceneName: string | null = null;
      /** The scene instance itself is tracked (not only its name) so a
       * replacement by a new instance of the SAME scene is detected too
       * (recorded as a `sceneReset` event). */
      _lastTrackedScene: gdjs.RuntimeScene | null = null;
      _lastTrackedObjectCounts: { [objectName: string]: integer } = {};
      _pointerLockRequestedByGame: boolean = false;
      /** Whether the one-time "mouse deltas without pointer lock" hint was
       * already recorded (see `setMouseDelta`). */
      _hasWarnedMouseDelta: boolean = false;
      _onProgress: ((frame: integer) => void) | null = null;
      _lastProgressTimeMs: number = 0;
      /** Rejects the promise raced against the test script, so a stop
       * interrupts the script even when it awaits something else than the
       * harness (a timer, a fetch...). */
      _rejectOnStop: ((error: Error) => void) | null = null;
      /** How to notify the input manager of the end of a stepped frame.
       * Replaced when the game main loop's own call is neutralized. */
      _callOnFrameEnded: () => void;

      constructor(
        runtimeGame: gdjs.RuntimeGame,
        payload: GameplayTestRunPayload
      ) {
        this._runtimeGame = runtimeGame;
        this._payload = payload;
        this._timeoutMs = payload.timeoutMs || DEFAULT_TIMEOUT_MS;
        this._loadingTimeoutMs =
          payload.loadingTimeoutMs || DEFAULT_LOADING_TIMEOUT_MS;
        this._maxFrames = payload.maxFrames || DEFAULT_MAX_FRAMES;
        this._lastYieldTimeMs = Date.now();
        this._paceSpeedFactor = payload.speedFactor
          ? Math.max(0.1, Math.min(100, payload.speedFactor))
          : null;
        this._paceReferenceWallTimeMs = Date.now();
        this._paceReferenceGameTimeMs = 0;
        this._maxScreenshots =
          payload.maxScreenshots === undefined
            ? DEFAULT_MAX_SCREENSHOTS
            : payload.maxScreenshots;
        const inputManager = runtimeGame.getInputManager();
        this._callOnFrameEnded = () => inputManager.onFrameEnded();
      }

      private _getCurrentScene(): gdjs.RuntimeScene {
        const currentScene = this._runtimeGame
          .getSceneStack()
          .getCurrentScene();
        if (!currentScene) {
          throw new Error(
            'No scene is running. Call `await harness.goToScene(sceneName)` first.'
          );
        }
        return currentScene;
      }

      /**
       * Request the test to stop as soon as possible: the next stepped frame
       * throws, and any pending `await` of the script is interrupted (see
       * `_rejectOnStop`).
       */
      requestStop(): void {
        this._stopped = true;
        if (this._rejectOnStop) {
          this._rejectOnStop(
            new GameplayTestStoppedError('The test was stopped.')
          );
          this._rejectOnStop = null;
        }
      }

      private _checkGuards(): void {
        if (this._stopped) {
          throw new GameplayTestStoppedError('The test was stopped.');
        }
        if (this._framesExecuted >= this._maxFrames) {
          throw new GameplayTestTimeoutError(
            `The test reached the maximum number of frames (${this._maxFrames}).`
          );
        }
        if (
          Date.now() - this._startTimeMs - this._loadingTimeMs >
          this._timeoutMs
        ) {
          throw new GameplayTestTimeoutError(
            `The test timed out after ${this._timeoutMs}ms ` +
              '(wall-clock, loading time excluded).'
          );
        }
      }

      /**
       * Await a loading promise (game boot, scene assets...) WITHOUT
       * counting the wait against the `timeoutMs` budget: the timeout is
       * about the running game, not about how long a web preview takes to
       * download its resources. The wait is still bounded (by
       * `loadingTimeoutMs`) so a dead network cannot hang the run, and
       * progress heartbeats keep flowing so the editor knows the run is
       * alive.
       */
      async _awaitLoading(
        loadingPromise: Promise<unknown>,
        description: string
      ): Promise<void> {
        const loadingStartTimeMs = Date.now();
        const heartbeatIntervalId = setInterval(() => {
          if (this._onProgress) this._onProgress(this._framesExecuted);
        }, 1000);
        let loadingTimeoutId: any = null;
        try {
          await Promise.race([
            loadingPromise,
            new Promise<never>((_, reject) => {
              loadingTimeoutId = setTimeout(
                () =>
                  reject(
                    new Error(
                      `${description} did not finish loading within ` +
                        `${this._loadingTimeoutMs}ms.`
                    )
                  ),
                this._loadingTimeoutMs
              );
            }),
          ]);
        } finally {
          clearInterval(heartbeatIntervalId);
          if (loadingTimeoutId) clearTimeout(loadingTimeoutId);
          this._loadingTimeMs += Date.now() - loadingStartTimeMs;
        }
      }

      private _recordEvent(event: GameplayTestEvent): void {
        if (this._eventLog.length >= MAX_EVENT_LOG_ENTRIES) return;
        this._eventLog.push(event);
      }

      private _getObjectCounts(): { [objectName: string]: integer } {
        const objectCounts: { [objectName: string]: integer } = {};
        const currentScene = this._runtimeGame
          .getSceneStack()
          .getCurrentScene();
        if (!currentScene) return objectCounts;
        const objectNames: Array<string> = [];
        // Access the protected map of the instances of the container.
        const instances = (currentScene as any)._instances as Hashtable<
          Array<gdjs.RuntimeObject>
        >;
        instances.keys(objectNames);
        for (const objectName of objectNames) {
          const objectInstances = instances.get(objectName);
          if (objectInstances.length > 0) {
            objectCounts[objectName] = objectInstances.length;
          }
        }
        return objectCounts;
      }

      private _trackChangesAfterStep(): void {
        const currentScene = this._runtimeGame
          .getSceneStack()
          .getCurrentScene();
        const sceneName = currentScene ? currentScene.getName() : '';
        if (currentScene !== this._lastTrackedScene) {
          const lastChangeCause = this._runtimeGame
            .getSceneStack()
            .consumeLastSceneChangeCause();
          this._recordEvent({
            frame: this._framesExecuted,
            // A new instance of the SAME scene means the scene was restarted
            // (all objects back to their initial state): record it as a
            // `sceneReset` so it never goes unnoticed in the event log.
            event:
              sceneName === this._lastTrackedSceneName
                ? 'sceneReset'
                : 'sceneChanged',
            sceneName,
            cause: !lastChangeCause
              ? 'unknown'
              : lastChangeCause.cause === GAMEPLAY_TEST_SCENE_CHANGE_CAUSE
                ? this._isProbingControls
                  ? 'controlsProbe'
                  : 'harness'
                : lastChangeCause.cause === 'game' ||
                    lastChangeCause.cause === 'networkSync'
                  ? lastChangeCause.cause
                  : 'external',
            ...(lastChangeCause && lastChangeCause.stack
              ? { causeDetail: lastChangeCause.stack }
              : {}),
          });
          this._lastTrackedScene = currentScene;
          this._lastTrackedSceneName = sceneName;
          this._lastTrackedObjectCounts = this._getObjectCounts();
          return;
        }

        const newCounts = this._getObjectCounts();
        for (const objectName in newCounts) {
          const previousCount = this._lastTrackedObjectCounts[objectName] || 0;
          if (newCounts[objectName] > previousCount) {
            this._recordEvent({
              frame: this._framesExecuted,
              event: 'spawned',
              object: objectName,
              count: newCounts[objectName],
            });
          }
        }
        for (const objectName in this._lastTrackedObjectCounts) {
          const newCount = newCounts[objectName] || 0;
          if (newCount < this._lastTrackedObjectCounts[objectName]) {
            this._recordEvent({
              frame: this._framesExecuted,
              event: 'removed',
              object: objectName,
              count: newCount,
            });
          }
        }
        this._lastTrackedObjectCounts = newCounts;
      }

      /**
       * Step a single game frame (game logic + rendering) with a fixed
       * time delta.
       */
      _stepSingleFrame(dtMs: float): void {
        this._checkGuards();
        const stepStartTimeMs = Date.now();
        this._runtimeGame.getSceneStack().step(dtMs);
        this._callOnFrameEnded();
        this._framesExecuted++;
        this._gameTimeMs += dtMs;
        const stepTimeMs = Date.now() - stepStartTimeMs;
        this._totalStepTimeMs += stepTimeMs;
        if (stepTimeMs > this._worstStepTimeMs) {
          this._worstStepTimeMs = stepTimeMs;
        }
        this._trackChangesAfterStep();
        this._drainPlayedSounds();
        if (this._onProgress && Date.now() - this._lastProgressTimeMs > 500) {
          this._lastProgressTimeMs = Date.now();
          this._onProgress(this._framesExecuted);
        }
      }

      /**
       * Let an animation frame happen (the paused main loop renders the
       * game in it) and measure its cost, which drives how often fast runs
       * render (see FAST_RUN_RENDER_DUTY_MULTIPLIER).
       */
      private async _renderOnce(): Promise<void> {
        const renderStartTimeMs = Date.now();
        await this._waitForNextAnimationFrame();
        // Pass the whole animation frame tick (game render included)
        // before measuring: a slow render must lower the render rate.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        this._lastRenderDurationMs = Date.now() - renderStartTimeMs;
        this._lastRenderTimeMs = Date.now();
      }

      private _waitForNextAnimationFrame(): Promise<void> {
        return new Promise((resolve) => {
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => resolve());
          } else {
            setTimeout(() => resolve(), 0);
          }
        });
      }

      /**
       * Yield once to the browser when frames were stepped for more than
       * `YIELD_BUDGET_MS` of wall-clock time: the game gets rendered (the
       * test is visible while it runs) and pending events/messages (like a
       * stop request) get processed - whatever the stepping pattern of the
       * test script (one big `stepFrames`, a `stepUntil` or a manual
       * `stepFrames(1)` loop).
       *
       * When the run is paced (`speedFactor` in the payload), also wait
       * until the wall clock catches up with the game time simulated at
       * the desired speed.
       */
      private async _maybeYield(): Promise<void> {
        if (this._paceSpeedFactor !== null) {
          const targetWallTimeMs =
            this._paceReferenceWallTimeMs +
            (this._gameTimeMs - this._paceReferenceGameTimeMs) /
              this._paceSpeedFactor;
          if (Date.now() < targetWallTimeMs) {
            while (Date.now() < targetWallTimeMs) {
              await this._waitForNextAnimationFrame();
            }
            this._lastYieldTimeMs = Date.now();
            return;
          }
          // The run fell behind its pace (a heavy frame, or work outside of
          // frame stepping like a scene load): re-anchor the pace instead
          // of rushing at full speed to catch up.
          this._paceReferenceWallTimeMs = Date.now();
          this._paceReferenceGameTimeMs = this._gameTimeMs;
        }
        if (Date.now() - this._lastYieldTimeMs < YIELD_BUDGET_MS) return;
        // Fast (unpaced) run: don't wait for an animation frame at every
        // yield - with a slow renderer (software WebGL...), rendering would
        // dominate the wall-clock time of the run. Yield through a timer
        // (pending events, like a stop request, are still processed) and
        // only let an animation frame - which renders the game - happen a
        // few times per second.
        if (
          Date.now() - this._lastRenderTimeMs >=
          Math.max(
            FAST_RUN_RENDER_INTERVAL_MS,
            FAST_RUN_RENDER_DUTY_MULTIPLIER * this._lastRenderDurationMs
          )
        ) {
          await this._renderOnce();
        } else {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
        this._lastYieldTimeMs = Date.now();
      }

      /**
       * Load and start the given scene, replacing any running scene.
       */
      async goToScene(
        sceneName: string,
        options?: { skipCreatingInstances?: boolean }
      ): Promise<void> {
        if (!this._runtimeGame.hasScene(sceneName)) {
          throw new Error(
            `The scene "${sceneName}" does not exist in the game.`
          );
        }
        if (!this._runtimeGame.areSceneAssetsReady(sceneName)) {
          // On the web, this can download assets for a long time (notably
          // the first run of a preview): waited for as loading, outside of
          // the `timeoutMs` budget.
          await this._awaitLoading(
            this._runtimeGame.loadSceneAssets(sceneName),
            `The assets of the scene "${sceneName}"`
          );
        }
        this._checkGuards();
        this._runtimeGame
          .getSceneStack()
          .runWithSceneChangeCause(GAMEPLAY_TEST_SCENE_CHANGE_CAUSE, () =>
            this._runtimeGame.getSceneStack().replace({
              sceneName,
              clear: true,
              skipCreatingInstances: options
                ? options.skipCreatingInstances
                : undefined,
            })
          );
        // Step one frame so the scene is fully initialized ("beginning of
        // scene" events have run) before the test continues.
        await this.stepFrames(1);
      }

      /**
       * Step the given number of game frames.
       */
      async stepFrames(
        frameCount: integer,
        options?: {
          dtMs?: float;
          onFrame?: (context: { frame: integer }) => void;
        }
      ): Promise<void> {
        const dtMs = (options && options.dtMs) || DEFAULT_FRAME_DT_MS;
        for (let i = 0; i < frameCount; i++) {
          this._stepSingleFrame(dtMs);
          if (options && options.onFrame) {
            options.onFrame({ frame: this._framesExecuted });
          }
          await this._maybeYield();
        }
      }

      /**
       * Step frames until the condition returns true, or `maxFrames` frames
       * were stepped. Returns true if the condition was met.
       */
      async stepUntil(
        condition: () => boolean,
        options: {
          maxFrames: integer;
          onFrame?: (context: { frame: integer }) => void;
          stuckDetection?: {
            objectName: string;
            windowFrames?: integer;
            minDisplacement?: float;
            onStuck?: (context: {
              frame: integer;
              x: float;
              y: float;
              z: float;
            }) => void;
          };
        }
      ): Promise<boolean> {
        const stuckDetection = options.stuckDetection || null;
        const windowFrames =
          (stuckDetection && stuckDetection.windowFrames) || 30;
        const minDisplacement =
          (stuckDetection && stuckDetection.minDisplacement) || 5;
        let lastCheckPosition: { x: float; y: float; z: float } | null = null;
        let framesSinceLastCheck = 0;

        for (let i = 0; i < options.maxFrames; i++) {
          if (condition()) return true;
          this._stepSingleFrame(DEFAULT_FRAME_DT_MS);
          if (options.onFrame) {
            options.onFrame({ frame: this._framesExecuted });
          }

          if (stuckDetection) {
            const instances = this.getObjects(stuckDetection.objectName);
            if (instances.length > 0) {
              const position = {
                x: instances[0].x,
                y: instances[0].y,
                z: instances[0].z || 0,
              };
              framesSinceLastCheck++;
              if (framesSinceLastCheck >= windowFrames) {
                if (lastCheckPosition) {
                  const displacement = Math.hypot(
                    position.x - lastCheckPosition.x,
                    position.y - lastCheckPosition.y,
                    position.z - lastCheckPosition.z
                  );
                  if (displacement < minDisplacement) {
                    this._recordEvent({
                      frame: this._framesExecuted,
                      event: 'stuck',
                      object: stuckDetection.objectName,
                    });
                    // Give a clean slate to the `onStuck` handler.
                    this.releaseAllInputs();
                    if (stuckDetection.onStuck) {
                      stuckDetection.onStuck({
                        frame: this._framesExecuted,
                        ...position,
                      });
                    }
                  }
                }
                lastCheckPosition = position;
                framesSinceLastCheck = 0;
              }
            }
          }

          await this._maybeYield();
        }
        return condition();
      }

      /**
       * Step until the first instance of the object stops moving: its
       * position changed less than `tolerance` (default 0.5) per frame for
       * `stableFrames` (default 20) consecutive frames. Returns whether it
       * settled within `maxFrames` (default 300). Use this for physics
       * objects instead of a hand-written "read, compare, update"
       * condition in `stepUntil` (which can silently pass without
       * stepping a frame).
       */
      async stepUntilObjectIsStable(
        objectName: string,
        options?: {
          tolerance?: float;
          stableFrames?: integer;
          maxFrames?: integer;
        }
      ): Promise<boolean> {
        const tolerance = (options && options.tolerance) || 0.5;
        const stableFrames = (options && options.stableFrames) || 20;
        const maxFrames = (options && options.maxFrames) || 300;
        let previous: [float, float, float] | null = null;
        let stillFrames = 0;
        return await this.stepUntil(() => stillFrames >= stableFrames, {
          maxFrames,
          onFrame: () => {
            const instance = this._getInstances(objectName)[0];
            if (!instance) {
              previous = null;
              stillFrames = 0;
              return;
            }
            const anyInstance = instance as any;
            const x = instance.getX();
            const y = instance.getY();
            const z =
              typeof anyInstance.getZ === 'function' ? anyInstance.getZ() : 0;
            if (
              previous &&
              Math.abs(x - previous[0]) < tolerance &&
              Math.abs(y - previous[1]) < tolerance &&
              Math.abs(z - previous[2]) < tolerance
            ) {
              stillFrames++;
            } else {
              stillFrames = 0;
            }
            previous = [x, y, z];
          },
        });
      }

      /**
       * Get the name of the scene being run.
       */
      getSceneName(): string {
        return this._getCurrentScene().getName();
      }

      /**
       * Get the names of all the scenes on the scene stack (the last one
       * is the current scene).
       */
      getSceneStack(): Array<string> {
        return this._runtimeGame.getSceneStack().getAllSceneNames();
      }

      // INPUT:

      /**
       * Press or release a keyboard key. Accepts GDevelop event-sheet key
       * names ("Left", "Space", "a"...) and Web API names ("ArrowLeft"...).
       */
      setKeyPressed(keyName: string, pressed: boolean): void {
        const locationAwareKeyCode = getLocationAwareKeyCodeForName(keyName);
        if (locationAwareKeyCode === null) {
          throw new Error(
            `Unknown key name: "${keyName}". Use GDevelop key names (like "Left", "Space", "a", "Num1") or Web API names (like "ArrowLeft").`
          );
        }
        const inputManager = this._runtimeGame.getInputManager();
        const rawKeyCode = locationAwareKeyCode % 1000;
        const location = Math.floor(locationAwareKeyCode / 1000);
        if (pressed) {
          inputManager.onKeyPressed(rawKeyCode, location);
        } else {
          inputManager.onKeyReleased(rawKeyCode, location);
        }
      }

      /**
       * Move the mouse cursor to a position, expressed in the scene
       * coordinates of the given layer (pass the layer of the object you
       * want to point at).
       */
      setMousePosition(x: float, y: float, layerName: string = ''): void {
        const currentScene = this._getCurrentScene();
        if (!currentScene.hasLayer(layerName)) {
          throw new Error(`The layer "${layerName}" does not exist.`);
        }
        const layer = currentScene.getLayer(layerName);
        const screenPosition = this._convertSceneToScreenPosition(layer, x, y);
        this._runtimeGame
          .getInputManager()
          .onMouseMove(screenPosition[0], screenPosition[1]);
      }

      /**
       * Convert a position in scene coordinates of a layer to screen
       * coordinates - through the actual 3D camera when the layer has a
       * 3D-rotated one: the engine's 2D conversion
       * (`convertInverseCoords`) does not handle 3D rotations, while games
       * read the cursor back through the 3D-aware `convertCoords`, so the
       * 2D conversion would place the cursor somewhere else than asked.
       * TODO: this inversion belongs in GDJS itself
       * (`RuntimeLayer.convertInverseCoords`), so that every consumer gets
       * the right conversion - do it there and remove this.
       */
      private _convertSceneToScreenPosition(
        layer: gdjs.RuntimeLayer,
        x: float,
        y: float
      ): FloatPoint {
        if (
          Math.abs(layer.getCameraRotationX()) > 0.001 ||
          Math.abs(layer.getCameraRotationY()) > 0.001
        ) {
          const renderer = layer.getRenderer() as any;
          const threeCamera =
            renderer && typeof renderer.getThreeCamera === 'function'
              ? renderer.getThreeCamera()
              : null;
          if (threeCamera && typeof THREE !== 'undefined') {
            threeCamera.updateMatrixWorld();
            // The three.js world Y axis is the opposite of the scene one
            // (see `transformTo3DWorld`, the inverse of this projection).
            const vector = new THREE.Vector3(x, -y, 0);
            vector.project(threeCamera);
            if (Number.isFinite(vector.x) && Number.isFinite(vector.y)) {
              return [
                ((vector.x + 1) / 2) * layer.getWidth(),
                ((1 - vector.y) / 2) * layer.getHeight(),
              ];
            }
          }
        }
        return layer.convertInverseCoords(x, y, 0, [0, 0]);
      }

      /**
       * Move the mouse cursor to a position in game resolution ("screen")
       * coordinates.
       */
      setMousePositionScreen(screenX: float, screenY: float): void {
        this._runtimeGame.getInputManager().onMouseMove(screenX, screenY);
      }

      /**
       * Apply a mouse movement delta (for pointer-lock/FPS mouse look).
       * Call once per frame, from `onFrame`.
       */
      setMouseDelta(deltaX: float, deltaY: float): void {
        if (!this._pointerLockRequestedByGame && !this._hasWarnedMouseDelta) {
          this._hasWarnedMouseDelta = true;
          this._recordConsoleLog(
            'warn',
            'setMouseDelta was called but the game never requested the pointer lock. ' +
              'If the camera does not rotate, the game probably engages mouse-look after a click: ' +
              'send one first (press, step 1 frame, release, step 1 frame).'
          );
        }
        const inputManager = this._runtimeGame.getInputManager();
        inputManager.onMouseMove(
          inputManager.getMouseX(),
          inputManager.getMouseY(),
          { movementX: deltaX, movementY: deltaY }
        );
        // Mouse-look extensions often listen to the canvas `pointermove`
        // DOM events directly (instead of the input manager): dispatch a
        // real event carrying the deltas so they receive them too.
        const renderer = this._runtimeGame.getRenderer() as any;
        const canvas =
          typeof renderer.getCanvas === 'function'
            ? renderer.getCanvas()
            : null;
        if (canvas && typeof PointerEvent !== 'undefined') {
          const event = new PointerEvent('pointermove', { bubbles: true });
          Object.defineProperty(event, 'movementX', { value: deltaX });
          Object.defineProperty(event, 'movementY', { value: deltaY });
          canvas.dispatchEvent(event);
        }
      }

      /**
       * Press or release a mouse button ('left', 'right' or 'middle').
       */
      setMouseButtonPressed(
        pressed: boolean,
        button: 'left' | 'right' | 'middle' = 'left'
      ): void {
        const inputManager = this._runtimeGame.getInputManager();
        const buttonCode = mouseButtonNameToCode(button);
        if (pressed) {
          inputManager.onMouseButtonPressed(buttonCode);
        } else {
          inputManager.onMouseButtonReleased(buttonCode);
        }
      }

      /**
       * Start a touch at a position expressed in the scene coordinates of
       * the given layer.
       */
      touchStart(
        identifier: integer,
        x: float,
        y: float,
        layerName: string = ''
      ): void {
        const layer = this._getCurrentScene().getLayer(layerName);
        const screenPosition = this._convertSceneToScreenPosition(layer, x, y);
        this._runtimeGame
          .getInputManager()
          .onTouchStart(identifier, screenPosition[0], screenPosition[1]);
      }

      /**
       * Move a touch to a position expressed in the scene coordinates of
       * the given layer.
       */
      touchMove(
        identifier: integer,
        x: float,
        y: float,
        layerName: string = ''
      ): void {
        const layer = this._getCurrentScene().getLayer(layerName);
        const screenPosition = this._convertSceneToScreenPosition(layer, x, y);
        this._runtimeGame
          .getInputManager()
          .onTouchMove(identifier, screenPosition[0], screenPosition[1]);
      }

      /**
       * End a touch.
       */
      touchEnd(identifier: integer): void {
        this._runtimeGame.getInputManager().onTouchEnd(identifier);
      }

      /**
       * Get the game resolution width, in pixels.
       */
      getGameResolutionWidth(): float {
        return this._runtimeGame.getGameResolutionWidth();
      }

      /**
       * Get the game resolution height, in pixels.
       */
      getGameResolutionHeight(): float {
        return this._runtimeGame.getGameResolutionHeight();
      }

      /**
       * Release all pressed keys, mouse buttons and touches.
       */
      releaseAllInputs(): void {
        const inputManager = this._runtimeGame.getInputManager();
        inputManager.releaseAllPressedKeys();
        inputManager.onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
        inputManager.onMouseButtonReleased(
          gdjs.InputManager.MOUSE_RIGHT_BUTTON
        );
        inputManager.onMouseButtonReleased(
          gdjs.InputManager.MOUSE_MIDDLE_BUTTON
        );
        for (const identifier of inputManager.getAllTouchIdentifiers()) {
          // Public identifiers are raw identifiers + 2.
          inputManager.onTouchEnd(identifier - 2);
        }
      }

      // INSPECTION:

      private _makeObjectSnapshot(
        object: gdjs.RuntimeObject,
        includeChildren: boolean
      ): GameplayTestObjectSnapshot {
        const anyObject = object as any;
        const stateInspectors = this._payload.stateInspectors || null;
        const behaviors: {
          [behaviorName: string]: {
            act: boolean;
            state: GameplayTestEvaluatedState;
          };
        } = {};
        // Access the protected list of behaviors of the object.
        const objectBehaviors =
          anyObject._behaviors as Array<gdjs.RuntimeBehavior>;
        for (const behavior of objectBehaviors) {
          behaviors[behavior.getName()] = {
            act: behavior.activated(),
            state: evaluateStateInspector(
              behavior,
              (stateInspectors &&
                stateInspectors.behaviors[(behavior as any).type]) ||
                null,
              `the behavior "${behavior.getName()}"`
            ),
          };
        }
        const objectState = evaluateStateInspector(
          object,
          (stateInspectors && stateInspectors.objects[object.type]) || null,
          `the object "${object.getName()}"`
        );

        const snapshot: GameplayTestObjectSnapshot = {
          id: object.id,
          name: object.getName(),
          x: object.getX(),
          y: object.getY(),
          angle: object.getAngle(),
          width: object.getWidth(),
          height: object.getHeight(),
          centerX: object.getCenterXInScene(),
          centerY: object.getCenterYInScene(),
          layer: object.getLayer(),
          hidden: object.isHidden(),
          variables: object.getVariables().getNetworkSyncData({}),
          state: objectState,
          behaviors,
        };
        if (typeof anyObject.getZ === 'function') {
          snapshot.z = anyObject.getZ();
          if (typeof anyObject.getCenterZInScene === 'function') {
            snapshot.centerZ = anyObject.getCenterZInScene();
          }
        }
        if (typeof anyObject.getRotationX === 'function') {
          snapshot.rotationX = anyObject.getRotationX();
        }
        if (typeof anyObject.getRotationY === 'function') {
          snapshot.rotationY = anyObject.getRotationY();
        }
        if (typeof anyObject.getDepth === 'function') {
          snapshot.depth = anyObject.getDepth();
        }
        if (typeof anyObject.getAnimationName === 'function') {
          snapshot.animation = anyObject.getAnimationName();
        }
        if (typeof anyObject.getText === 'function') {
          snapshot.text = anyObject.getText();
        } else if (typeof anyObject.getString === 'function') {
          snapshot.text = anyObject.getString();
        }
        if (typeof anyObject.getOpacity === 'function') {
          snapshot.opacity = anyObject.getOpacity();
        }
        if (typeof anyObject.isFlippedX === 'function') {
          snapshot.flippedX = anyObject.isFlippedX();
        }
        if (typeof anyObject.isFlippedY === 'function') {
          snapshot.flippedY = anyObject.isFlippedY();
        }
        if (
          includeChildren &&
          typeof anyObject.getChildrenContainer === 'function'
        ) {
          const childrenContainer: gdjs.RuntimeInstanceContainer =
            anyObject.getChildrenContainer();
          const children: {
            [objectName: string]: Array<GameplayTestObjectSnapshot>;
          } = {};
          const canTransformToScene =
            typeof anyObject.applyObjectTransformation === 'function';
          for (const child of childrenContainer.getAdhocListOfAllInstances()) {
            const childName = child.getName();
            if (!children[childName]) children[childName] = [];
            const childSnapshot = this._makeObjectSnapshot(child, false);
            // The children live in the coordinates space of the custom
            // object: convert to scene coordinates, like every other
            // snapshot (so clicking a child at its centerX/centerY works).
            if (canTransformToScene) {
              const point: FloatPoint = [0, 0];
              anyObject.applyObjectTransformation(
                childSnapshot.x,
                childSnapshot.y,
                point
              );
              childSnapshot.x = point[0];
              childSnapshot.y = point[1];
              anyObject.applyObjectTransformation(
                childSnapshot.centerX,
                childSnapshot.centerY,
                point
              );
              childSnapshot.centerX = point[0];
              childSnapshot.centerY = point[1];
              if (typeof anyObject.getZ === 'function') {
                if (childSnapshot.z !== undefined)
                  childSnapshot.z += anyObject.getZ();
                if (childSnapshot.centerZ !== undefined)
                  childSnapshot.centerZ += anyObject.getZ();
              }
            }
            // The internal layer name of the parent means nothing outside
            // of it: report the layer of the custom object itself.
            childSnapshot.layer = object.getLayer();
            children[childName].push(childSnapshot);
          }
          snapshot.children = children;
        }
        return snapshot;
      }

      private _getInstances(objectName: string): Array<gdjs.RuntimeObject> {
        return this._getCurrentScene().getObjects(objectName) || [];
      }

      /**
       * Get a state snapshot of all the instances of an object.
       * Instances are returned in an unspecified order.
       */
      getObjects(objectName: string): Array<GameplayTestObjectSnapshot> {
        return this._getInstances(objectName).map((object) =>
          this._makeObjectSnapshot(object, true)
        );
      }

      /**
       * Get the instances of `objectName` within `radius` of the first
       * instance of `referenceObjectName`, sorted by distance.
       */
      getNearby(
        objectName: string,
        referenceObjectName: string,
        radius: float
      ): Array<GameplayTestNearbyObjectSnapshot> {
        const referenceInstances = this._getInstances(referenceObjectName);
        if (referenceInstances.length === 0) return [];
        const reference = this._makeObjectSnapshot(
          referenceInstances[0],
          false
        );
        const referenceZ = reference.centerZ || 0;

        const nearby: Array<GameplayTestNearbyObjectSnapshot> = [];
        for (const object of this._getInstances(objectName)) {
          const snapshot = this._makeObjectSnapshot(object, true);
          const relativeX = snapshot.centerX - reference.centerX;
          const relativeY = snapshot.centerY - reference.centerY;
          const relativeZ = (snapshot.centerZ || 0) - referenceZ;
          const distance = Math.hypot(relativeX, relativeY, relativeZ);
          if (distance > radius) continue;
          nearby.push({
            ...snapshot,
            distance,
            relativeX,
            relativeY,
            relativeZ: snapshot.centerZ === undefined ? undefined : relativeZ,
            above: relativeY < 0,
            below: relativeY > 0,
            left: relativeX < 0,
            right: relativeX > 0,
            bearingFromReference: gdjs.toDegrees(
              Math.atan2(relativeY, relativeX)
            ),
          });
        }
        nearby.sort((a, b) => a.distance - b.distance);
        return nearby;
      }

      /**
       * Check if the straight segment between the first instance of
       * `referenceObjectName` and the first instance of `targetObjectName`
       * is clear of the given blocker objects. 2D ONLY: the test uses the
       * 2D hitboxes in the X/Y plane and ignores Z.
       */
      has2dLineOfSight(
        referenceObjectName: string,
        targetObjectName: string,
        blockerObjectNames: Array<string>
      ): {
        clear: boolean;
        blockedBy?: string;
        blockedAt?: { x: float; y: float };
      } {
        const referenceInstances = this._getInstances(referenceObjectName);
        const targetInstances = this._getInstances(targetObjectName);
        if (referenceInstances.length === 0 || targetInstances.length === 0) {
          return { clear: false, blockedBy: 'missing-object' };
        }
        const x0 = referenceInstances[0].getCenterXInScene();
        const y0 = referenceInstances[0].getCenterYInScene();
        const x1 = targetInstances[0].getCenterXInScene();
        const y1 = targetInstances[0].getCenterYInScene();

        let closestResult: {
          blockedBy: string;
          x: float;
          y: float;
          sqDistance: float;
        } | null = null;
        for (const blockerObjectName of blockerObjectNames) {
          for (const blocker of this._getInstances(blockerObjectName)) {
            const result = blocker.raycastTest(x0, y0, x1, y1, true);
            if (result.collision) {
              const sqDistance =
                (result.closeX - x0) * (result.closeX - x0) +
                (result.closeY - y0) * (result.closeY - y0);
              if (!closestResult || sqDistance < closestResult.sqDistance) {
                closestResult = {
                  blockedBy: blockerObjectName,
                  x: result.closeX,
                  y: result.closeY,
                  sqDistance,
                };
              }
            }
          }
        }
        if (closestResult) {
          return {
            clear: false,
            blockedBy: closestResult.blockedBy,
            blockedAt: { x: closestResult.x, y: closestResult.y },
          };
        }
        return { clear: true };
      }

      /**
       * LAST RESORT: the raw `gdjs.RuntimeGame` being tested. Prefer the
       * harness APIs (snapshots, inputs, stepping...) - direct mutations
       * can invalidate what the test asserts.
       */
      getRuntimeGame(): gdjs.RuntimeGame {
        return this._runtimeGame;
      }

      /**
       * LAST RESORT: the raw `gdjs.RuntimeScene` currently being played
       * (throws if no scene is running). Prefer the harness APIs.
       */
      getCurrentRuntimeScene(): gdjs.RuntimeScene {
        return this._getCurrentScene();
      }

      /**
       * The raw `gdjs.RuntimeLayer` of the current scene, or null if the
       * layer does not exist. Useful to check the layer visibility
       * (`isVisible()`) or read the camera (`getCameraX()`, `getCameraZoom()`...).
       */
      getRuntimeLayer(layerName: string): gdjs.RuntimeLayer | null {
        const currentScene = this._getCurrentScene();
        if (!currentScene.hasLayer(layerName)) return null;
        return currentScene.getLayer(layerName);
      }

      /**
       * The camera of a layer (JSON-safe), or null if the layer does not
       * exist. `angle` is the 2D rotation (the yaw of the view, same
       * convention as object angles). `rotationX`/`rotationY` are the 3D
       * camera rotations: `rotationX` is 0 looking straight down (the 2D
       * default) and 90 at the horizon, so the pitch of a first-person
       * view is `rotationX - 90` (positive = looking up).
       */
      getCameraState(layerName: string = ''): {
        x: float;
        y: float;
        z: float;
        rotationX: float;
        rotationY: float;
        angle: float;
        zoom: float;
      } | null {
        const currentScene = this._getCurrentScene();
        if (!currentScene.hasLayer(layerName)) return null;
        const layer = currentScene.getLayer(layerName);
        return {
          x: layer.getCameraX(),
          y: layer.getCameraY(),
          z: layer.getCameraZ(null),
          rotationX: layer.getCameraRotationX(),
          rotationY: layer.getCameraRotationY(),
          angle: layer.getCameraRotation(),
          zoom: layer.getCameraZoom(),
        };
      }

      /**
       * The raw `gdjs.RuntimeObject` of an instance, or null if not found.
       * Behaviors can be reached with `getBehavior(behaviorName)` (also null
       * if not found). Prefer the harness APIs (snapshots, inputs...) -
       * direct mutations can invalidate what the test asserts.
       * @param objectIdOrName An instance id (from `getObjects`) or an object
       * name (first instance).
       */
      getRuntimeObject(
        objectIdOrName: integer | string
      ): gdjs.RuntimeObject | null {
        const currentScene = this._getCurrentScene();
        if (typeof objectIdOrName === 'number') {
          for (const candidate of currentScene.getAdhocListOfAllInstances()) {
            if (candidate.id === objectIdOrName) {
              return candidate;
            }
          }
          return null;
        }
        return currentScene.getObjects(objectIdOrName)?.[0] || null;
      }

      /**
       * Get a scene variable, or undefined if it does not exist.
       */
      getSceneVariable(
        variableName: string
      ): VariableNetworkSyncData | undefined {
        return this._getCurrentScene()
          .getVariables()
          .getNetworkSyncData({})
          .find((variable) => variable.name === variableName);
      }

      /**
       * Get a global variable, or undefined if it does not exist.
       */
      getGlobalVariable(
        variableName: string
      ): VariableNetworkSyncData | undefined {
        return this._runtimeGame
          .getVariables()
          .getNetworkSyncData({})
          .find((variable) => variable.name === variableName);
      }

      /**
       * The notable events recorded so far (scene changes and resets with
       * their cause, stuck detections...), as a JSON-safe copy: lets a
       * test assert, for example, that the game restarted its scene.
       */
      getEventLog(): Array<GameplayTestEvent> {
        return this._eventLog.map((event) => ({ ...event }));
      }

      /**
       * The sounds and musics played during the test so far, with the
       * frame they were played at - a direct signal that a mechanic fired
       * (a pickup, a shot, an explosion...).
       */
      getPlayedSounds(): Array<{ sound: string; frame: integer }> {
        this._drainPlayedSounds();
        return this._playedSounds.slice();
      }

      _installSoundLog(): void {
        this._runtimeGame.getSoundManager().setPlayedSoundsLogEnabled(true);
      }

      _uninstallSoundLog(): void {
        this._runtimeGame.getSoundManager().setPlayedSoundsLogEnabled(false);
      }

      /** Copy the new entries of the sound manager log, stamped with the
       * current frame. */
      private _drainPlayedSounds(): void {
        const log = this._runtimeGame.getSoundManager().getPlayedSoundsLog();
        while (
          this._playedSoundsReadCount < log.length &&
          this._playedSounds.length < MAX_PLAYED_SOUNDS
        ) {
          this._playedSounds.push({
            sound: log[this._playedSoundsReadCount].soundName,
            frame: this._framesExecuted,
          });
          this._playedSoundsReadCount++;
        }
      }

      /**
       * Include full snapshots of this object's instances in the final
       * state of the test result.
       */
      watch(objectName: string): void {
        if (!this._watchedObjectNames.includes(objectName)) {
          this._watchedObjectNames.push(objectName);
        }
      }

      // NAVIGATION INTENT:

      private _resolveNavigationTarget(
        target:
          | { name: string; id?: integer }
          | { x: float; y: float; z?: float }
      ): { x: float; y: float; z: float | undefined } | null {
        if ('name' in target) {
          const instances = this._getInstances(target.name);
          let instance =
            target.id !== undefined
              ? instances.find((object) => object.id === target.id)
              : instances[0];
          if (!instance) return null;
          const anyInstance = instance as any;
          return {
            x: instance.getCenterXInScene(),
            y: instance.getCenterYInScene(),
            z:
              typeof anyInstance.getCenterZInScene === 'function'
                ? anyInstance.getCenterZInScene()
                : undefined,
          };
        }
        return { x: target.x, y: target.y, z: target.z };
      }

      /**
       * Get the position of a target (an object or a position) relative to
       * the first instance of `referenceObjectName` (2D and 3D). Deciding
       * how to move toward the target with the game's actual controls is
       * the job of the test script (use `resetSceneAndProbeControls` to
       * discover the controls, `makeProgressTracker` to detect a lack of
       * progress).
       */
      getRelativePosition(
        referenceObjectName: string,
        target:
          | { name: string; id?: integer }
          | { x: float; y: float; z?: float },
        options?: {
          reachRadius?: float;
          /** Measure from the camera of this layer (position, yaw and
           * pitch) instead of the object: what a first-person view aims
           * with. */
          fromCamera?: string;
          /** Measure from this Z instead of the object's center Z (an eye
           * or muzzle height). */
          fromZ?: float;
          /** Compute `yawDiff` against this heading (in degrees) instead of
           * the object's angle - for turrets and weapons with their own
           * rotation. */
          heading?: float;
        }
      ): GameplayTestRelativePosition | null {
        const referenceInstances = this._getInstances(referenceObjectName);
        if (referenceInstances.length === 0) return null;
        const reference = referenceInstances[0];
        const anyReference = reference as any;
        const resolvedTarget = this._resolveNavigationTarget(target);
        if (!resolvedTarget) return null;

        const reachRadius =
          (options && options.reachRadius) || DEFAULT_REACH_RADIUS;
        const camera =
          options && options.fromCamera !== undefined
            ? this.getCameraState(options.fromCamera)
            : null;

        const referenceX =
          camera !== null ? camera.x : reference.getCenterXInScene();
        const referenceY =
          camera !== null ? camera.y : reference.getCenterYInScene();
        const referenceZ =
          options && options.fromZ !== undefined
            ? options.fromZ
            : camera !== null
              ? camera.z
              : typeof anyReference.getCenterZInScene === 'function'
                ? anyReference.getCenterZInScene()
                : undefined;

        const relativeX = resolvedTarget.x - referenceX;
        const relativeY = resolvedTarget.y - referenceY;
        const relativeZ =
          resolvedTarget.z !== undefined && referenceZ !== undefined
            ? resolvedTarget.z - referenceZ
            : undefined;

        const distance = Math.hypot(relativeX, relativeY, relativeZ || 0);

        // The world direction a 3D camera looks at is its angle minus 90
        // (with the ZYX rotation order, at the horizon the view direction
        // is the former screen-up - games set the camera angle to
        // "facing + 90", e.g. LookFromObjectEyes).
        const currentYaw =
          options && options.heading !== undefined
            ? options.heading
            : camera !== null
              ? camera.angle - 90
              : reference.getAngle();
        const desiredAngle = gdjs.toDegrees(Math.atan2(relativeY, relativeX));
        const yawDiff = normalizeAngleDifference(desiredAngle - currentYaw);
        const horizontalDistance = Math.hypot(relativeX, relativeY);
        const desiredPitch =
          relativeZ === undefined
            ? 0
            : gdjs.toDegrees(Math.atan2(relativeZ, horizontalDistance));
        // The pitch of a camera view: rotationX - 90 (rotationX is 0
        // looking straight down - a pitch of -90 - and 90 at the horizon).
        const currentPitch =
          camera !== null
            ? camera.rotationX - 90
            : typeof anyReference.getRotationX === 'function'
              ? anyReference.getRotationX()
              : 0;
        const pitchDiff =
          relativeZ === undefined
            ? 0
            : normalizeAngleDifference(desiredPitch - currentPitch);

        return {
          relativeX,
          relativeY,
          relativeZ,
          distance,
          horizontalDistance,
          yawDiff,
          pitchDiff,
          dominantAxis: Math.abs(relativeX) >= Math.abs(relativeY) ? 'x' : 'y',
          reached: distance <= reachRadius,
          targetX: resolvedTarget.x,
          targetY: resolvedTarget.y,
          targetZ: resolvedTarget.z,
        };
      }

      /**
       * Measure what each key actually does to the first instance of
       * `objectName` (2D and 3D: dz is measured when the object has a Z
       * coordinate): for the baseline (no key) and then each key, the
       * scene is restarted, the key held for `frames` frames, and the
       * displacement (net + extremes: a jump shows as a negative `minDy`
       * even if the object lands back) and yaw change are measured.
       * Compare each key's result to `baseline` (gravity or idle drift
       * affects both). The scene is restarted again at the end, so call
       * this BEFORE the scenario of the test. An entry is null if the
       * instance disappeared during that probe.
       */
      async resetSceneAndProbeControls(
        objectName: string,
        keyNames: Array<string>,
        options?: { frames?: integer }
      ): Promise<{
        baseline: GameplayTestControlProbeResult | null;
        keys: { [keyName: string]: GameplayTestControlProbeResult | null };
      }> {
        const frames = (options && options.frames) || DEFAULT_PROBE_FRAMES;
        const sceneName = this._getCurrentScene().getName();
        this._isProbingControls = true;
        try {
          return await this._probeControls(sceneName, objectName, keyNames, {
            frames,
          });
        } finally {
          this._isProbingControls = false;
        }
      }

      private async _probeControls(
        sceneName: string,
        objectName: string,
        keyNames: Array<string>,
        { frames }: { frames: integer }
      ): Promise<{
        baseline: GameplayTestControlProbeResult | null;
        keys: { [keyName: string]: GameplayTestControlProbeResult | null };
      }> {
        const probe = async (
          keyName: string | null
        ): Promise<GameplayTestControlProbeResult | null> => {
          await this.goToScene(sceneName);
          this.releaseAllInputs();
          const getPosition = () => {
            const instances = this._getInstances(objectName);
            if (instances.length === 0) return null;
            const instance = instances[0];
            const anyInstance = instance as any;
            return {
              x: instance.getX(),
              y: instance.getY(),
              z:
                typeof anyInstance.getZ === 'function'
                  ? (anyInstance.getZ() as float)
                  : undefined,
              angle: instance.getAngle(),
            };
          };
          const start = getPosition();
          if (!start) {
            throw new Error(
              `No instance of "${objectName}" found to probe controls on (after restarting the scene "${sceneName}").`
            );
          }
          let minDx = 0;
          let maxDx = 0;
          let minDy = 0;
          let maxDy = 0;
          let minDz: float | undefined = start.z === undefined ? undefined : 0;
          let maxDz: float | undefined = start.z === undefined ? undefined : 0;
          if (keyName) this.setKeyPressed(keyName, true);
          await this.stepFrames(frames, {
            onFrame: () => {
              const current = getPosition();
              if (!current) return;
              minDx = Math.min(minDx, current.x - start.x);
              maxDx = Math.max(maxDx, current.x - start.x);
              minDy = Math.min(minDy, current.y - start.y);
              maxDy = Math.max(maxDy, current.y - start.y);
              if (current.z !== undefined && start.z !== undefined) {
                minDz = Math.min(minDz || 0, current.z - start.z);
                maxDz = Math.max(maxDz || 0, current.z - start.z);
              }
            },
          });
          if (keyName) this.setKeyPressed(keyName, false);
          const end = getPosition();
          if (!end) return null;
          return {
            dx: end.x - start.x,
            dy: end.y - start.y,
            dz:
              end.z !== undefined && start.z !== undefined
                ? end.z - start.z
                : undefined,
            minDx,
            maxDx,
            minDy,
            maxDy,
            minDz,
            maxDz,
            yawDelta: normalizeAngleDifference(end.angle - start.angle),
          };
        };

        const baseline = await probe(null);
        const keys: {
          [keyName: string]: GameplayTestControlProbeResult | null;
        } = {};
        for (const keyName of keyNames) {
          keys[keyName] = await probe(keyName);
        }
        // Leave a clean state for the actual test scenario.
        await this.goToScene(sceneName);
        this.releaseAllInputs();
        return { baseline, keys };
      }

      /**
       * Make a tracker measuring the progress of the first instance of
       * `referenceObjectName` toward a target (the distance is 3D when the
       * object has a Z coordinate). Call `update()` regularly (e.g. once
       * per loop iteration): it reports the current `distance`, whether
       * the target is `reached`, and whether progress `stalled` (distance
       * shrank by less than `minProgress` over the last `windowFrames`
       * frames - time to try an escape strategy). The first update of a
       * stall also records a `stuck` event in the event log. Call
       * `reset()` after switching to another target.
       */
      makeProgressTracker(
        referenceObjectName: string,
        target:
          | { name: string; id?: integer }
          | { x: float; y: float; z?: float },
        options?: {
          windowFrames?: integer;
          minProgress?: float;
          reachRadius?: float;
        }
      ): GameplayTestProgressTracker {
        const windowFrames =
          (options && options.windowFrames) || DEFAULT_PROGRESS_WINDOW_FRAMES;
        const minProgress =
          (options && options.minProgress) || DEFAULT_PROGRESS_MIN_PROGRESS;
        const reachRadius =
          (options && options.reachRadius) || DEFAULT_REACH_RADIUS;

        let samples: Array<{ frame: integer; distance: float }> = [];
        let wasStalled = false;

        return {
          update: () => {
            const relativePosition = this.getRelativePosition(
              referenceObjectName,
              target,
              { reachRadius }
            );
            if (!relativePosition) return null;
            const frame = this._framesExecuted;
            const distance = relativePosition.distance;
            samples.push({ frame, distance });
            // Keep only the window (plus the sample right before it, to
            // always have a reference point `windowFrames` old).
            while (
              samples.length > 1 &&
              samples[1].frame <= frame - windowFrames
            ) {
              samples.shift();
            }
            const oldest = samples[0];
            const stalled =
              frame - oldest.frame >= windowFrames &&
              oldest.distance - distance < minProgress;
            if (stalled && !wasStalled) {
              this._recordEvent({
                frame,
                event: 'stuck',
                object: referenceObjectName,
              });
            }
            wasStalled = stalled;
            return {
              frame,
              distance,
              reached: relativePosition.reached,
              stalled,
            };
          },
          reset: () => {
            samples = [];
            wasStalled = false;
          },
        };
      }

      /**
       * Turn the first instance of `referenceObjectName` toward the target,
       * by applying mouse movement deltas (FPS/pointer-lock style, yaw and
       * pitch in 3D) until it is aiming at it. The aim is measured on the
       * camera of the object's layer when it is a 3D one (the ground truth
       * of a first-person view: right eye height, right rotations whatever
       * the game drives to move it - see `measuredFrom` in the result),
       * with a fallback to the object's own rotations. The mouse
       * sensitivity and direction of the game are measured and adapted to
       * live, per axis. When the vertical aim shows no measurable response,
       * the vertical input is undone and the aim falls back to yaw-only,
       * reported as `sawPitchResponse: false`. Returns null if the object
       * or the target is missing.
       */
      async lookTowardWithMouseDelta(
        referenceObjectName: string,
        target:
          | { name: string; id?: integer }
          | { x: float; y: float; z?: float },
        options?: {
          yawOnly?: boolean;
          fromCamera?: string;
          /** Consider the aim done when both angles are within this
           * tolerance (default 3 degrees - lower it to hit a small or far
           * target). */
          toleranceDegrees?: float;
        }
      ): Promise<GameplayTestAimResult | null> {
        const maxAimFrames = 180;
        const toleranceDegrees = (options && options.toleranceDegrees) || 3;
        const responseThresholdDegrees = 0.1;
        const maxPixelsPerDegree = 64;
        // Frames tolerated with a demand on an axis, a maxed-out gain and
        // no measured response, before reacting (giving up the vertical
        // aim, or falling back from the camera to the object).
        const maxUnresponsiveFrames = 10;
        // Pixels of mouse movement per degree of desired rotation: adapted
        // live (per axis) by measuring the actual rotation achieved.
        let yawPixelsPerDegree = 2;
        let pitchPixelsPerDegree = 2;
        // Mouse direction giving a positive rotation on each axis: flipped
        // when a measured response moves the aim away from the target.
        let yawDirection = 1;
        let pitchDirection = 1;

        // Measure the aim on the camera of the object's layer (the ground
        // truth of a first-person view: right eye height, right rotations
        // whatever the game drives to move it) when it is a 3D camera, on
        // the object's own rotations otherwise - falling back to the
        // object if the camera turns out not to respond to the mouse.
        const firstInstance = this._getInstances(referenceObjectName)[0];
        if (!firstInstance) return null;
        const objectLayerName =
          options && options.fromCamera !== undefined
            ? options.fromCamera
            : firstInstance.getLayer();
        const layerCamera = this.getCameraState(objectLayerName);
        let aimOptions: { fromCamera?: string } =
          layerCamera && Math.abs(layerCamera.rotationX) > 0.5
            ? { fromCamera: objectLayerName }
            : {};

        let sawYawResponse = false;
        let sawPitchResponse = false;
        let pitchGivenUp = false;
        let unresponsivePitchFrames = 0;
        let unresponsiveYawFrames = 0;
        let appliedPitchPixels = 0;

        const clamp = (value: float, maximum: float) =>
          Math.max(-maximum, Math.min(maximum, value));
        const makeResult = (
          aimed: boolean,
          relativePosition: GameplayTestRelativePosition
        ): GameplayTestAimResult => ({
          aimed,
          yawDiff: relativePosition.yawDiff,
          pitchDiff: relativePosition.pitchDiff,
          sawYawResponse,
          sawPitchResponse,
          measuredFrom:
            aimOptions.fromCamera !== undefined ? 'camera' : 'object',
        });

        // Undo the vertical input applied so far: when the measured pitch
        // never responded, the actual view may still have been pitched
        // (e.g. toward the ground) - restore it.
        const unwindAppliedPitch = async () => {
          while (Math.abs(appliedPitchPixels) > 1) {
            const chunk = clamp(-appliedPitchPixels, 100);
            this.setMouseDelta(0, chunk);
            appliedPitchPixels += chunk;
            await this.stepFrames(1);
          }
        };

        let lastRelativePosition: GameplayTestRelativePosition | null = null;
        for (let i = 0; i < maxAimFrames; i++) {
          const relativePosition = this.getRelativePosition(
            referenceObjectName,
            target,
            aimOptions
          );
          if (!relativePosition) return null;
          lastRelativePosition = relativePosition;
          const yawDiff = relativePosition.yawDiff;
          const wantPitch = !(options && options.yawOnly) && !pitchGivenUp;
          const pitchDiff = wantPitch ? relativePosition.pitchDiff : 0;
          if (
            Math.abs(yawDiff) <= toleranceDegrees &&
            Math.abs(pitchDiff) <= toleranceDegrees
          ) {
            return makeResult(true, relativePosition);
          }

          const pitchDeltaPixels =
            clamp(pitchDiff * pitchPixelsPerDegree, 100) * pitchDirection;
          this.setMouseDelta(
            clamp(yawDiff * yawPixelsPerDegree, 100) * yawDirection,
            pitchDeltaPixels
          );
          appliedPitchPixels += pitchDeltaPixels;
          await this.stepFrames(1);

          const newRelativePosition = this.getRelativePosition(
            referenceObjectName,
            target,
            aimOptions
          );
          if (newRelativePosition) {
            const achievedYawRotation = Math.abs(
              yawDiff - newRelativePosition.yawDiff
            );
            if (achievedYawRotation >= responseThresholdDegrees) {
              sawYawResponse = true;
              unresponsiveYawFrames = 0;
              // The mouse turned the view AWAY from the target: the game
              // maps this axis in the other direction.
              if (
                Math.abs(newRelativePosition.yawDiff) >
                Math.abs(yawDiff) + responseThresholdDegrees
              ) {
                yawDirection = -yawDirection;
              }
            }
            if (Math.abs(yawDiff) > toleranceDegrees) {
              if (achievedYawRotation < responseThresholdDegrees) {
                // No response to the mouse: increase the gain (the game may
                // have a low mouse sensitivity).
                if (yawPixelsPerDegree < maxPixelsPerDegree) {
                  yawPixelsPerDegree = Math.min(
                    yawPixelsPerDegree * 2,
                    maxPixelsPerDegree
                  );
                } else {
                  unresponsiveYawFrames++;
                  if (
                    unresponsiveYawFrames >= maxUnresponsiveFrames &&
                    aimOptions.fromCamera !== undefined
                  ) {
                    // The camera never responds to the mouse (it may not be
                    // driven by this object): fall back to measuring on the
                    // object's own rotations and start over.
                    aimOptions = {};
                    yawPixelsPerDegree = 2;
                    pitchPixelsPerDegree = 2;
                    sawYawResponse = false;
                    sawPitchResponse = false;
                    unresponsiveYawFrames = 0;
                    unresponsivePitchFrames = 0;
                    await unwindAppliedPitch();
                  }
                }
              } else {
                const ratio = Math.abs(yawDiff) / achievedYawRotation;
                yawPixelsPerDegree = Math.max(
                  0.25,
                  Math.min(
                    maxPixelsPerDegree,
                    yawPixelsPerDegree * Math.min(2, ratio)
                  )
                );
              }
            }

            if (wantPitch && Math.abs(pitchDiff) > toleranceDegrees) {
              const achievedPitchRotation = Math.abs(
                pitchDiff - newRelativePosition.pitchDiff
              );
              if (achievedPitchRotation >= responseThresholdDegrees) {
                sawPitchResponse = true;
                unresponsivePitchFrames = 0;
                if (
                  Math.abs(newRelativePosition.pitchDiff) >
                  Math.abs(pitchDiff) + responseThresholdDegrees
                ) {
                  pitchDirection = -pitchDirection;
                }
                const ratio = Math.abs(pitchDiff) / achievedPitchRotation;
                pitchPixelsPerDegree = Math.max(
                  0.25,
                  Math.min(
                    maxPixelsPerDegree,
                    pitchPixelsPerDegree * Math.min(2, ratio)
                  )
                );
              } else if (pitchPixelsPerDegree < maxPixelsPerDegree) {
                pitchPixelsPerDegree = Math.min(
                  pitchPixelsPerDegree * 2,
                  maxPixelsPerDegree
                );
              } else {
                unresponsivePitchFrames++;
                if (unresponsivePitchFrames >= maxUnresponsiveFrames) {
                  // The measured pitch never responds (the game may map the
                  // vertical aim to another axis): stop driving it - and
                  // undo what was applied, in case the actual view WAS
                  // pitched without the measure seeing it.
                  pitchGivenUp = true;
                  await unwindAppliedPitch();
                }
              }
            }
          }
        }
        return lastRelativePosition
          ? makeResult(false, lastRelativePosition)
          : null;
      }

      // SCENARIO SETUP:

      /**
       * Create a new instance of an object at the given position.
       * Use for test setup only - do not use it to fake a game behavior
       * you are supposed to test.
       */
      spawn(
        objectName: string,
        x: float,
        y: float,
        z?: float,
        layerName?: string
      ): GameplayTestObjectSnapshot {
        const currentScene = this._getCurrentScene();
        const object = currentScene.createObject(objectName);
        if (!object) {
          throw new Error(
            `Could not create an instance of "${objectName}" - check the object exists in the scene (or as a global object).`
          );
        }
        object.setX(x);
        object.setY(y);
        const anyObject = object as any;
        if (z !== undefined && typeof anyObject.setZ === 'function') {
          anyObject.setZ(z);
        }
        if (layerName !== undefined) {
          object.setLayer(layerName);
        }
        return this._makeObjectSnapshot(object, false);
      }

      /**
       * Remove the instance with the given id (from `getObjects`).
       */
      removeObject(id: integer): void {
        const currentScene = this._getCurrentScene();
        for (const object of currentScene.getAdhocListOfAllInstances()) {
          if (object.id === id) {
            object.deleteFromScene();
            return;
          }
        }
        throw new Error(`No instance with id ${id} found.`);
      }

      /**
       * Move the instance with the given id to a position.
       * Use for test setup only. The move takes effect immediately (physics
       * bodies included), but the game's logic keeps acting on the object
       * each stepped frame (forces, AI...): to hold an object somewhere,
       * re-apply the position every frame via `onFrame`.
       */
      setObjectPosition(id: integer, x: float, y: float, z?: float): void {
        const currentScene = this._getCurrentScene();
        for (const object of currentScene.getAdhocListOfAllInstances()) {
          if (object.id === id) {
            object.setX(x);
            object.setY(y);
            const anyObject = object as any;
            if (z !== undefined && typeof anyObject.setZ === 'function') {
              anyObject.setZ(z);
            }
            return;
          }
        }
        throw new Error(`No instance with id ${id} found.`);
      }

      private _setVariableFromValue(
        variable: gdjs.Variable,
        value: string | number | boolean
      ): void {
        if (typeof value === 'number') variable.setNumber(value);
        else if (typeof value === 'boolean') variable.setBoolean(value);
        else variable.setString(value);
      }

      /**
       * Set a scene variable (number, string or boolean).
       * Use for test setup only.
       */
      setSceneVariable(
        variableName: string,
        value: string | number | boolean
      ): void {
        this._setVariableFromValue(
          this._getCurrentScene().getVariables().get(variableName),
          value
        );
      }

      /**
       * Get a variable of an object (same entry shape as `getSceneVariable`),
       * or undefined if the object or the variable does not exist.
       * @param objectIdOrName An instance id (from `getObjects`) or an object
       * name (first instance).
       */
      getObjectVariable(
        objectIdOrName: integer | string,
        variableName: string
      ): VariableNetworkSyncData | undefined {
        const object = this.getRuntimeObject(objectIdOrName);
        if (!object) return undefined;
        return object
          .getVariables()
          .getNetworkSyncData({})
          .find((variable) => variable.name === variableName);
      }

      /**
       * Set a variable of an object (number, string or boolean).
       * Use for test setup only. Throws if the object does not exist.
       * @param objectIdOrName An instance id (from `getObjects`) or an object
       * name (first instance).
       */
      setObjectVariable(
        objectIdOrName: integer | string,
        variableName: string,
        value: string | number | boolean
      ): void {
        const object = this.getRuntimeObject(objectIdOrName);
        if (!object) {
          throw new Error(
            `No instance "${objectIdOrName}" found to set the variable "${variableName}".`
          );
        }
        this._setVariableFromValue(
          object.getVariables().get(variableName),
          value
        );
      }

      /**
       * Set a global variable (number, string or boolean).
       * Use for test setup only.
       */
      setGlobalVariable(
        variableName: string,
        value: string | number | boolean
      ): void {
        this._setVariableFromValue(
          this._runtimeGame.getVariables().get(variableName),
          value
        );
      }

      /**
       * Create the instances of an external layout in the current scene.
       */
      loadExternalLayout(
        externalLayoutName: string,
        x: float = 0,
        y: float = 0,
        z: float = 0
      ): void {
        const currentScene = this._getCurrentScene();
        const externalLayoutData =
          this._runtimeGame.getExternalLayoutData(externalLayoutName);
        if (!externalLayoutData) {
          throw new Error(
            `The external layout "${externalLayoutName}" does not exist.`
          );
        }
        currentScene.createObjectsFrom(
          externalLayoutData.instances,
          x,
          y,
          z,
          /*trackByPersistentUuid=*/ false
        );
      }

      // VERDICTS AND EVIDENCE:

      /**
       * Record a named assertion. Throws immediately on failure, stopping
       * the script (wrap in try/catch if the check is optional).
       */
      assert(condition: boolean, message: string): void {
        if (this._assertions.length >= MAX_ASSERTIONS) {
          throw new GameplayTestAssertionError(
            `Too many assertions (max ${MAX_ASSERTIONS}).`
          );
        }
        this._assertions.push({ message, passed: !!condition });
        if (!condition) {
          throw new GameplayTestAssertionError(`Assertion failed: ${message}`);
        }
      }

      /**
       * Unconditionally record a failure and throw immediately, stopping
       * the script.
       */
      fail(message: string): void {
        this._assertions.push({ message, passed: false });
        throw new GameplayTestAssertionError(message);
      }

      /**
       * Take a screenshot of the game canvas (downscaled). It's returned
       * in the test result.
       */
      async takeScreenshot(label: string = ''): Promise<void> {
        if (this._screenshots.length >= this._maxScreenshots) {
          logger.warn(
            `Ignoring screenshot "${label}": already ${this._maxScreenshots} screenshots taken.`
          );
          return;
        }
        // Let an animation frame happen so the canvas shows the current
        // state of the game (fast runs only render a few times per second).
        await this._renderOnce();
        const canvas = this._runtimeGame.getRenderer().getCanvas();
        if (!canvas) {
          logger.warn('No canvas found: unable to take a screenshot.');
          return;
        }
        try {
          const scale = Math.min(
            1,
            SCREENSHOT_MAX_SIZE / Math.max(canvas.width, canvas.height, 1)
          );
          const targetWidth = Math.max(1, Math.round(canvas.width * scale));
          const targetHeight = Math.max(1, Math.round(canvas.height * scale));
          const downscaledCanvas = document.createElement('canvas');
          downscaledCanvas.width = targetWidth;
          downscaledCanvas.height = targetHeight;
          const context = downscaledCanvas.getContext('2d');
          if (!context) return;
          context.drawImage(canvas, 0, 0, targetWidth, targetHeight);
          const dataUrl = downscaledCanvas.toDataURL('image/jpeg', 0.7);
          this._screenshots.push({
            label,
            frame: this._framesExecuted,
            jpegBase64: dataUrl.replace(/^data:image\/jpeg;base64,/, ''),
          });
        } catch (error) {
          logger.warn('Error while taking a screenshot: ' + error);
        }
      }

      /**
       * Start profiling the current scene (see `stopProfiling`).
       */
      startProfiling(): void {
        this._profilingStartFrame = this._framesExecuted;
        this._runtimeGame.startCurrentSceneProfiler(() => {});
      }

      /**
       * Stop profiling and return a flat, JSON-safe summary: average and
       * worst-frame time per profiled section (events, physics,
       * rendering... - nested sections are flattened as "parent > child",
       * sorted by average time descending), the frame-by-frame timeline (to
       * correlate a spike with the `eventLog` frames), the live object
       * counts, and renderer/memory counters when available.
       */
      stopProfiling(): GameplayTestProfilingResult | null {
        const currentScene = this._runtimeGame
          .getSceneStack()
          .getCurrentScene();
        const profiler = currentScene ? currentScene.getProfiler() : null;
        if (!profiler) return null;
        const framesAverageMeasures = profiler.getFramesAverageMeasures();
        const framesMaxMeasures = profiler.getFramesMaxMeasures();
        const frameTimes = profiler.getFrameTimes();
        this._runtimeGame.stopCurrentSceneProfiler();

        const roundMs = (timeMs: float) => Math.round(timeMs * 100) / 100;
        const sections: Array<{
          name: string;
          avgTimeMs: number;
          maxTimeMs: number;
        }> = [];
        const visitSubsections = (
          averageMeasure: gdjs.FrameMeasureOutput,
          maxMeasure: gdjs.FrameMeasureOutput | null,
          path: string
        ) => {
          const subsections = averageMeasure.subsections;
          for (const name in subsections) {
            const fullName = path ? path + ' > ' + name : name;
            const maxSubsection =
              (maxMeasure && maxMeasure.subsections[name]) || null;
            sections.push({
              name: fullName,
              avgTimeMs: roundMs(subsections[name].time || 0),
              maxTimeMs: roundMs((maxSubsection && maxSubsection.time) || 0),
            });
            visitSubsections(subsections[name], maxSubsection, fullName);
          }
        };
        visitSubsections(framesAverageMeasures, framesMaxMeasures, '');
        sections.sort((a, b) => b.avgTimeMs - a.avgTimeMs);

        const threeRenderer = (this._runtimeGame.getRenderer() as any)
          .getThreeRenderer
          ? (this._runtimeGame.getRenderer() as any).getThreeRenderer()
          : null;
        const threeInfo = threeRenderer ? threeRenderer.info : null;

        const performanceMemory =
          typeof performance !== 'undefined' && (performance as any).memory
            ? (performance as any).memory
            : null;

        // The frames profiled, in harness frame numbers (like `eventLog`):
        // the frame times captured are for frames startFrame+1..endFrame.
        const endFrame = this._framesExecuted;
        const startFrame =
          this._profilingStartFrame !== null
            ? this._profilingStartFrame
            : Math.max(0, endFrame - frameTimes.length);
        this._profilingStartFrame = null;

        // The most expensive frames, worst first, with their harness frame
        // numbers so they can be correlated with the `eventLog`.
        const worstFrames = frameTimes
          .map((timeMs, index) => ({
            frame: startFrame + 1 + index,
            timeMs: roundMs(timeMs),
          }))
          .sort((a, b) => b.timeMs - a.timeMs)
          .slice(0, MAX_PROFILING_WORST_FRAMES);

        // Keep the timeline compact: past 120 frames, downsample by buckets
        // keeping the MAX of each bucket (spikes are preserved).
        const frameTimesBucketSize = Math.max(
          1,
          Math.ceil(frameTimes.length / MAX_PROFILING_TIMELINE_ENTRIES)
        );
        const frameTimesMs: Array<number> = [];
        for (let i = 0; i < frameTimes.length; i += frameTimesBucketSize) {
          let bucketMax = 0;
          for (
            let j = i;
            j < Math.min(i + frameTimesBucketSize, frameTimes.length);
            j++
          ) {
            bucketMax = Math.max(bucketMax, frameTimes[j]);
          }
          frameTimesMs.push(roundMs(bucketMax));
        }

        const profile: GameplayTestProfilingResult = {
          startFrame,
          endFrame,
          avgStepTimeMs: roundMs(framesAverageMeasures.time || 0),
          maxStepTimeMs: roundMs(framesMaxMeasures.time || 0),
          sections: sections.slice(0, MAX_PROFILING_SECTIONS),
          worstFrames,
          frameTimesMs,
          frameTimesBucketSize,
          objectCounts: this._getObjectCounts(),
          renderer: threeInfo
            ? {
                drawCalls: threeInfo.render.calls,
                triangles: threeInfo.render.triangles,
                geometries: threeInfo.memory.geometries,
                textures: threeInfo.memory.textures,
              }
            : null,
          ...(performanceMemory
            ? {
                jsHeapUsedMb:
                  Math.round(
                    (performanceMemory.usedJSHeapSize / (1024 * 1024)) * 10
                  ) / 10,
              }
            : {}),
        };
        // Also attach the profile to the test result (keeping the last
        // ones), so it reaches the report even if the script does not log it.
        this._profiles.push(profile);
        if (this._profiles.length > MAX_PROFILES_PER_RESULT) {
          this._profiles.shift();
        }
        return profile;
      }

      /**
       * Record a console log in the test result (also shown in the
       * browser console). Used by the `console` given to the script.
       */
      _recordConsoleLog(
        level: 'log' | 'warn' | 'error',
        message: string
      ): void {
        if (
          this._consoleLogs.length >= MAX_CONSOLE_LOGS ||
          this._consoleLogsTotalChars >= MAX_CONSOLE_LOGS_TOTAL_CHARS
        ) {
          return;
        }
        const cappedMessage = message.slice(0, 1000);
        this._consoleLogsTotalChars += cappedMessage.length;
        this._consoleLogs.push({ level, message: cappedMessage });
      }

      /** Undo the pointer lock shim (see `_installPointerLockShim`). */
      _uninstallPointerLockShim: () => void = () => {};

      /**
       * Patch pointer lock during the test: `requestPointerLock` never
       * really locks the OS mouse, but as soon as the game requests it, a
       * locked pointer is seen by the game AND by anything reading
       * `document.pointerLockElement` directly or listening to canvas
       * `pointermove` events (like mouse-look extensions) - which then
       * receive the `setMouseDelta` deltas as real DOM events.
       */
      _installPointerLockShim(): void {
        const restorers: Array<() => void> = [];
        const harness = this;
        const setFakePointerLock = (locked: boolean) => {
          if (harness._pointerLockRequestedByGame === locked) return;
          harness._pointerLockRequestedByGame = locked;
          try {
            document.dispatchEvent(new Event('pointerlockchange'));
          } catch (error) {
            // Ignore: no DOM support.
          }
        };

        const renderer = this._runtimeGame.getRenderer() as any;
        if (typeof renderer.requestPointerLock === 'function') {
          const original = {
            requestPointerLock: renderer.requestPointerLock,
            exitPointerLock: renderer.exitPointerLock,
            isPointerLocked: renderer.isPointerLocked,
          };
          renderer.requestPointerLock = function () {
            setFakePointerLock(true);
            return true;
          };
          renderer.exitPointerLock = function () {
            setFakePointerLock(false);
          };
          renderer.isPointerLocked = function () {
            return harness._pointerLockRequestedByGame;
          };
          restorers.push(() => {
            renderer.requestPointerLock = original.requestPointerLock;
            renderer.exitPointerLock = original.exitPointerLock;
            renderer.isPointerLocked = original.isPointerLocked;
          });
        }

        const canvas =
          typeof renderer.getCanvas === 'function'
            ? renderer.getCanvas()
            : null;
        if (canvas && typeof document !== 'undefined') {
          const originalCanvasRequestPointerLock = canvas.requestPointerLock;
          canvas.requestPointerLock = () => setFakePointerLock(true);
          restorers.push(() => {
            canvas.requestPointerLock = originalCanvasRequestPointerLock;
          });

          const originalDocumentExitPointerLock = document.exitPointerLock;
          (document as any).exitPointerLock = () => setFakePointerLock(false);
          restorers.push(() => {
            (document as any).exitPointerLock = originalDocumentExitPointerLock;
          });

          try {
            Object.defineProperty(document, 'pointerLockElement', {
              get: () => (harness._pointerLockRequestedByGame ? canvas : null),
              configurable: true,
            });
            restorers.push(() => {
              delete (document as any).pointerLockElement;
            });
          } catch (error) {
            // Ignore: `pointerLockElement` cannot be faked in this browser.
          }
        }

        this._uninstallPointerLockShim = () => {
          restorers.forEach((restore) => restore());
          this._uninstallPointerLockShim = () => {};
        };
      }

      _makeResult(
        status: GameplayTestResult['status'],
        errors: Array<string>
      ): GameplayTestResult {
        const currentScene = this._runtimeGame
          .getSceneStack()
          .getCurrentScene();
        const watchedObjects: {
          [objectName: string]: Array<GameplayTestObjectSnapshot>;
        } = {};
        if (currentScene) {
          for (const objectName of this._watchedObjectNames) {
            try {
              watchedObjects[objectName] = this.getObjects(objectName);
            } catch (error) {
              // Ignore snapshot errors when building the result.
            }
          }
        }
        return {
          testName: this._payload.testName,
          status,
          framesExecuted: this._framesExecuted,
          durationMs: this._startTimeMs ? Date.now() - this._startTimeMs : 0,
          loadingMs: Math.round(this._loadingTimeMs),
          timeoutMs: this._timeoutMs,
          gameTimeMs: Math.round(this._gameTimeMs),
          assertions: this._assertions,
          errors: errors.slice(0, MAX_ERRORS),
          consoleLogs: this._consoleLogs,
          eventLog: this._eventLog,
          finalState: {
            sceneName: currentScene ? currentScene.getName() : '',
            objectCounts: this._getObjectCounts(),
            watchedObjects,
            sceneVariables: currentScene
              ? currentScene.getVariables().getNetworkSyncData({})
              : [],
          },
          screenshots: this._screenshots,
          profiles: this._profiles,
          performance:
            this._framesExecuted > 0
              ? {
                  avgStepMs:
                    Math.round(
                      (this._totalStepTimeMs / this._framesExecuted) * 100
                    ) / 100,
                  worstStepMs: this._worstStepTimeMs,
                }
              : null,
        };
      }
    }

    /**
     * The gameplay test being currently run, if any.
     */
    let currentlyRunningHarness: GameplayTestHarness | null = null;

    /**
     * Request the running gameplay test (if any) to stop as soon as
     * possible.
     */
    export const stopCurrentGameplayTest = (): void => {
      if (currentlyRunningHarness) {
        currentlyRunningHarness.requestStop();
      }
    };

    /**
     * True while a gameplay test is running (the harness owns the game
     * stepping: external state mutations must be avoided).
     */
    export const isGameplayTestRunning = (): boolean =>
      !!currentlyRunningHarness;

    /**
     * Run a gameplay test script against the game and return its result.
     *
     * The game main loop keeps rendering (paused) while the test steps the
     * game logic deterministically at full speed, yielding to the browser
     * regularly so the run stays visible and interruptible (see
     * `_maybeYield`).
     */
    export const runGameplayTest = async (
      runtimeGame: gdjs.RuntimeGame,
      payload: GameplayTestRunPayload,
      onProgress?: (frame: integer) => void
    ): Promise<GameplayTestResult> => {
      if (currentlyRunningHarness) {
        const failedResult = new GameplayTestHarness(
          runtimeGame,
          payload
        )._makeResult('error', [
          'A gameplay test is already running. Wait for it to finish or stop it first.',
        ]);
        return failedResult;
      }

      const harness = new GameplayTestHarness(runtimeGame, payload);
      currentlyRunningHarness = harness;
      harness._onProgress = onProgress || null;

      // The source must be the BODY of `async (harness) => { ... }`, but
      // AI models (and users pasting code) sometimes send the whole function
      // instead. Evaluated as-is it would be a no-op expression: detect the
      // wrapper and call it instead.
      let source = payload.source;
      if (
        /^\s*(?:async\s*)?(?:\(\s*harness\s*(?:,\s*console\s*)?\)|harness)\s*=>/.test(
          source
        )
      ) {
        source = 'return (\n' + source + '\n)(harness, console);';
      }

      // Compile the script first, so a syntax error is reported cleanly.
      let scriptFunction: Function;
      try {
        scriptFunction = new Function(
          'harness',
          'console',
          '"use strict"; return (async () => {\n' + source + '\n})();'
        );
      } catch (error) {
        currentlyRunningHarness = null;
        return harness._makeResult('error', [
          'The test script could not be parsed: ' + error,
        ]);
      }

      // Wait for the game to be done starting up: a run request can arrive
      // while the game is still starting. Without this, the test could
      // create scenes before asynchronously loaded libraries (Jolt
      // physics...) are ready, or the startup could push the game's first
      // scene in the middle of the test.
      // This wait is loading: excluded from the `timeoutMs` budget (counted
      // in `loadingMs` instead), bounded by `loadingTimeoutMs`, with
      // progress heartbeats so the editor knows the run is alive.
      harness._startTimeMs = Date.now();
      const bootWaitStartTimeMs = Date.now();
      const bootDeadlineMs = bootWaitStartTimeMs + harness._loadingTimeoutMs;
      let lastBootHeartbeatTimeMs = 0;
      while (runtimeGame.isStartingUp()) {
        if (harness._stopped) {
          currentlyRunningHarness = null;
          return harness._makeResult('stopped', ['The test was stopped.']);
        }
        if (Date.now() > bootDeadlineMs) {
          currentlyRunningHarness = null;
          harness._loadingTimeMs += Date.now() - bootWaitStartTimeMs;
          return harness._makeResult('error', [
            `The game did not finish starting within ` +
              `${harness._loadingTimeoutMs}ms (the first scene was never ` +
              'created).',
          ]);
        }
        if (
          harness._onProgress &&
          Date.now() - lastBootHeartbeatTimeMs > 1000
        ) {
          lastBootHeartbeatTimeMs = Date.now();
          harness._onProgress(0);
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      harness._loadingTimeMs += Date.now() - bootWaitStartTimeMs;

      const inputManager = runtimeGame.getInputManager();
      const wasPaused = runtimeGame.isPaused();

      // Pause the game: the main loop keeps rendering (`renderWithoutStep`)
      // but stops stepping the game logic - the harness owns stepping.
      runtimeGame.pause(true);

      // The paused main loop still calls `onFrameEnded` every animation
      // frame, which would clear the inputs simulated by the test between
      // two manually stepped frames. Neutralize it during the test: the
      // harness calls the original after each stepped frame instead.
      const originalOnFrameEnded = inputManager.onFrameEnded.bind(inputManager);
      inputManager.onFrameEnded = () => {};
      harness._callOnFrameEnded = originalOnFrameEnded;

      harness._installPointerLockShim();
      harness._installSoundLog();

      // Capture the logs of the game itself (in addition to the `console`
      // passed to the script).
      const existingLoggerOutput = gdjs.Logger.getLoggerOutput();
      gdjs.Logger.setLoggerOutput({
        log: (
          group: string,
          message: string,
          type: 'info' | 'warning' | 'error' = 'info',
          internal = true
        ) => {
          existingLoggerOutput.log(group, message, type, internal);
          harness._recordConsoleLog(
            type === 'warning' ? 'warn' : type === 'error' ? 'error' : 'log',
            `[${group}] ${message}`
          );
        },
      });

      const stringifyConsoleArguments = (args: Array<any>): string =>
        args
          .map((value) => {
            if (typeof value === 'string') return value;
            try {
              return JSON.stringify(value);
            } catch (error) {
              return String(value);
            }
          })
          .join(' ');
      const scriptConsole = {
        log: (...args: Array<any>) => {
          console.log(...args);
          harness._recordConsoleLog('log', stringifyConsoleArguments(args));
        },
        warn: (...args: Array<any>) => {
          console.warn(...args);
          harness._recordConsoleLog('warn', stringifyConsoleArguments(args));
        },
        error: (...args: Array<any>) => {
          console.error(...args);
          harness._recordConsoleLog('error', stringifyConsoleArguments(args));
        },
      };

      let result: GameplayTestResult;
      try {
        // A wall-clock watchdog, in case the script awaits something that
        // never resolves. Checked periodically (not a one-shot timer) so
        // the time spent loading - which grows `_loadingTimeMs` - stays
        // excluded from the budget. A synchronous infinite loop can NOT be
        // interrupted (this is a limit of running in the same thread as
        // the game).
        let watchdogIntervalId: any = null;
        const watchdog = new Promise<never>((_, reject) => {
          watchdogIntervalId = setInterval(() => {
            if (
              Date.now() - harness._startTimeMs - harness._loadingTimeMs >
              harness._timeoutMs + 1000
            ) {
              reject(
                new GameplayTestTimeoutError(
                  `The test timed out after ${harness._timeoutMs}ms ` +
                    '(wall-clock, loading time excluded).'
                )
              );
            }
          }, 250);
        });
        // A stop rejects this promise, interrupting the script even when
        // it awaits something else than the harness (a timer, a fetch...).
        const stopSignal = new Promise<never>((_, reject) => {
          harness._rejectOnStop = reject;
        });
        // Report the test as started (frame 0): a test can legitimately
        // spend time without stepping any frame.
        if (harness._onProgress) harness._onProgress(0);
        try {
          await Promise.race([
            scriptFunction(harness, scriptConsole),
            watchdog,
            stopSignal,
          ]);
        } finally {
          if (watchdogIntervalId) clearInterval(watchdogIntervalId);
          harness._rejectOnStop = null;
        }

        const hasFailedAssertion = harness._assertions.some(
          (assertion) => !assertion.passed
        );
        if (
          !hasFailedAssertion &&
          harness._framesExecuted === 0 &&
          harness._assertions.length === 0
        ) {
          // A "passed" run that stepped no frame and asserted nothing is a
          // no-op script, not a passing test: never report a false green.
          result = harness._makeResult('error', [
            'The test completed without stepping a single frame nor making any assertion — it did nothing. ' +
              'The test source must be the BODY of `async (harness) => { ... }` (statements starting with `await harness...`), not a function definition.',
          ]);
        } else {
          result = harness._makeResult(
            hasFailedAssertion ? 'failed' : 'passed',
            []
          );
        }
      } catch (error) {
        // (No type annotation on `error`: this file must stay parseable by
        // the older TypeScript bundled in the Monaco editor, which reads it
        // to provide autocompletions in the test editor.)
        if (error && error.isGameplayTestAssertionError) {
          result = harness._makeResult('failed', [String(error.message)]);
        } else if (error && error.isGameplayTestStoppedError) {
          result = harness._makeResult('stopped', [
            'The test was stopped before completing.',
          ]);
        } else if (error && error.isGameplayTestTimeoutError) {
          result = harness._makeResult('timeout', [String(error.message)]);
        } else {
          result = harness._makeResult('error', [
            (error && error.stack ? String(error.stack) : String(error)).slice(
              0,
              2000
            ),
          ]);
        }
      } finally {
        // Restore everything, whatever happened:
        try {
          harness.releaseAllInputs();
        } catch (error) {
          // Ignore errors during cleanup.
        }
        inputManager.onFrameEnded = originalOnFrameEnded;
        harness._uninstallPointerLockShim();
        harness._uninstallSoundLog();
        gdjs.Logger.setLoggerOutput(existingLoggerOutput);
        if (payload.freezeWhenFinished) {
          // Keep the game paused (the main loop keeps rendering the last
          // frame) and muted, so it can stay visible without playing.
          runtimeGame.pause(true);
          try {
            runtimeGame.getSoundManager().setGlobalVolume(0);
          } catch (error) {
            // Ignore errors while muting the game.
          }
        } else {
          runtimeGame.pause(wasPaused);
        }
        currentlyRunningHarness = null;
      }

      return result;
    };
  }
}

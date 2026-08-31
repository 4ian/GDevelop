// @flow
import * as React from 'react';
import {
  type PreviewDebuggerServer,
  type PreviewLauncherInterface,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  enumerateGameplayTestStateInspectors,
  type GameplayTestStateInspectors,
} from './GameplayTestStateInspectors';
import {
  clearGameplayTestFramePreview,
  setGameplayTestFrameRunStatus,
  setGameplayTestFrameHiddenPause,
  type GameplayTestFrameRunStatus,
} from './GameplayTestFrame';
import {
  getIsPageHidden,
  addPageVisibilityListener,
} from '../Utils/PageVisibility';

export type GameplayTestScope =
  | {| type: 'project' |}
  | {| type: 'extension', extensionName: string |};

export const projectGameplayTestScope: GameplayTestScope = { type: 'project' };

/**
 * A short human-readable description of a scope, for error messages.
 */
export const getGameplayTestScopeDescription = (
  scope: GameplayTestScope
): string =>
  scope.type === 'project'
    ? 'the project'
    : `the extension "${scope.extensionName}"`;

export type GameplayTestAssertion = {|
  message: string,
  passed: boolean,
|};

export type GameplayTestResult = {
  testName: string,
  // 'paused': the run was interrupted because the editor stayed in the
  // background, where the browser stops running the game. Not a failure of
  // the test: it must simply be run again.
  status: 'passed' | 'failed' | 'error' | 'stopped' | 'timeout' | 'paused',
  framesExecuted: number,
  durationMs: number,
  // Time spent waiting for the game to boot and for scene assets to load,
  // excluded from the `timeoutMs` budget (`durationMs` includes it).
  loadingMs: number,
  // The wall-clock budget the run had, loading excluded
  // (`durationMs - loadingMs` close to it means the test is at risk of
  // timing out on a slower machine).
  timeoutMs: number,
  // Time during which the game was frozen because the editor was in the
  // background (browsers stop animation frames in a hidden page, so the
  // game stops stepping). Excluded from the `timeoutMs` budget.
  hiddenStallMs: number,
  gameTimeMs: number,
  assertions: Array<GameplayTestAssertion>,
  errors: Array<string>,
  consoleLogs: Array<{ level: 'log' | 'warn' | 'error', message: string }>,
  eventLog: Array<Object>,
  finalState: Object | null,
  screenshots: Array<{ label: string, frame: number, jpegBase64: string }>,
  // The `stopProfiling()` summaries captured during the run.
  profiles: Array<Object>,
  performance: Object | null,
};

export type GameplayTestToRun = {|
  scope: GameplayTestScope,
  testName: string,
  // When provided, this source is run (used for unsaved test code or tests
  // being created by the AI). Otherwise the source of the stored test is used.
  source?: string,
|};

export type GameplayTestRunOptions = {|
  timeoutMs?: number,
  screenshots?: 'off' | 'on-failure',
  // Pace the run for a human watching it: game seconds simulated per real
  // second (1 = normal speed, 4 = 4x...). Omitted: run as fast as possible.
  speedFactor?: number,
  onTestStarted?: (test: GameplayTestToRun) => void,
  onProgress?: (test: GameplayTestToRun, frame: number) => void,
|};

/**
 * Callbacks to open/rename/delete/run gameplay tests of any scope, provided
 * by the MainFrame (which owns the editor tabs and the runner) to the
 * editors listing tests.
 */
export type GameplayTestsCallbacks = {|
  onOpenGameplayTest: (scope: GameplayTestScope, testName: string) => void,
  onRenameGameplayTest: (
    scope: GameplayTestScope,
    oldName: string,
    newName: string
  ) => void,
  onDeleteGameplayTest: (scope: GameplayTestScope, test: gdTest) => void,
  onRunGameplayTest: (
    scope: GameplayTestScope,
    testName: string
  ) => void | Promise<void>,
|};

const GAMEPLAY_TEST_FRAME_DEBUGGER_ID = 'gameplay-test-frame';
const GAME_READY_TIMEOUT_MS = 60 * 1000;
const GAME_READY_POLL_INTERVAL_MS = 300;
const RESULT_EXTRA_TIMEOUT_MS = 10 * 1000;
// A silence shorter than this while the editor is in the background is not
// considered a stall: the game sends progress every 500ms, so a quick tab
// switch can pass unnoticed by the game.
const HIDDEN_STALL_THRESHOLD_MS = 1500;
// How long a run is allowed to stay frozen because the editor is in the
// background before it is given up on (as 'paused', not as a failure).
// Generous: the run resumes by itself as soon as the editor is looked at
// again, and giving up means the test has to be run from the start.
const MAX_HIDDEN_STALL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 30 * 1000;
// Paced runs are slow by design (a human is watching): give them room.
// They can always be stopped with the stop button.
const PACED_RUN_DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

let nextRunMessageId = 1;

// Only one gameplay test run (which can run multiple tests sequentially)
// at a time: subsequent calls are queued.
let lastRunPromise: Promise<mixed> = Promise.resolve();

// The stop controller of the batch being currently run, allowing to stop
// it even when the game is not started yet (still exporting or booting)
// or between two tests.
type BatchStopController = {|
  stopRequested: boolean,
  abortBootWait: () => void,
|};
let currentBatchStopController: BatchStopController | null = null;

// Whether a gameplay test batch is currently running (exporting, booting
// or running tests). Launching or hot-reloading previews meanwhile would
// interfere with the run: use `useIsGameplayTestRunInProgress` to disable
// these actions in the UI (the game also ignores state-mutating debugger
// commands while a test runs, as a backstop).
let isRunInProgress = false;
const runInProgressListeners: Set<() => void> = new Set();
const setRunInProgress = (running: boolean) => {
  if (isRunInProgress === running) return;
  isRunInProgress = running;
  runInProgressListeners.forEach(listener => listener());
};

/** Non-hook variant, for code outside React components. */
export const getIsGameplayTestRunInProgress = (): boolean => isRunInProgress;

export const useIsGameplayTestRunInProgress = (): boolean => {
  const [running, setRunning] = React.useState(isRunInProgress);
  React.useEffect(() => {
    const listener = () => setRunning(isRunInProgress);
    runInProgressListeners.add(listener);
    listener();
    return () => {
      runInProgressListeners.delete(listener);
    };
  }, []);
  return running;
};

const makeResultWithoutRun = (
  testName: string,
  status: 'error' | 'stopped' | 'paused',
  errorMessage: string
): GameplayTestResult => ({
  testName,
  status,
  framesExecuted: 0,
  durationMs: 0,
  loadingMs: 0,
  timeoutMs: 0,
  hiddenStallMs: 0,
  gameTimeMs: 0,
  assertions: [],
  errors: [errorMessage],
  consoleLogs: [],
  eventLog: [],
  finalState: null,
  screenshots: [],
  profiles: [],
  performance: null,
});

const makeErrorResult = (
  testName: string,
  errorMessage: string
): GameplayTestResult => makeResultWithoutRun(testName, 'error', errorMessage);

/**
 * The full, readable output of a gameplay test run - the same content the
 * GDevelop AI reads after a run (console logs flattened to strings).
 */
export const makeGameplayTestResultReadableOutput = (
  result: GameplayTestResult
): Object => ({
  status: result.status,
  testName: result.testName,
  framesExecuted: result.framesExecuted,
  durationMs: result.durationMs,
  loadingMs: result.loadingMs,
  timeoutMs: result.timeoutMs,
  hiddenStallMs: result.hiddenStallMs,
  gameTimeMs: result.gameTimeMs,
  assertions: result.assertions,
  errors: result.errors,
  consoleLogs: result.consoleLogs.map(log => `[${log.level}] ${log.message}`),
  eventLog: result.eventLog,
  finalState: result.finalState,
  screenshots: result.screenshots,
  profiles: result.profiles,
  performance: result.performance,
});

const makeStoppedResult = (testName: string): GameplayTestResult =>
  makeResultWithoutRun(
    testName,
    'stopped',
    'The test was not run because the run was stopped.'
  );

/**
 * The run was interrupted because the editor was left in the background:
 * browsers stop animation frames in a hidden page, so the game stopped
 * stepping and never finished. This says nothing about the game: the test
 * has to be run again, with the editor visible.
 */
const makePausedResult = (
  testName: string,
  hiddenStallMs: number
): GameplayTestResult => ({
  ...makeResultWithoutRun(
    testName,
    'paused',
    'The test did not finish: it was paused because GDevelop was left in ' +
      'the background, where the browser stops running games. This is not a ' +
      'test failure and says nothing about the game - run the test again ' +
      'with the GDevelop window visible.'
  ),
  hiddenStallMs,
});

/**
 * Get the tests container for a scope ('project' or an extension name),
 * or null if the scope does not exist.
 */
export const getTestsContainer = (
  project: gdProject,
  scope: GameplayTestScope
): gdTestsContainer | null => {
  if (scope.type === 'project') return project.getTests();
  if (project.hasEventsFunctionsExtensionNamed(scope.extensionName)) {
    return project.getEventsFunctionsExtension(scope.extensionName).getTests();
  }
  return null;
};

/**
 * The name of a gameplay test in editor tabs is either the name of a
 * project test, or `ExtensionName::TestName` for an extension test.
 */
export const getGameplayTestProjectItemName = (
  scope: GameplayTestScope,
  testName: string
): string =>
  scope.type === 'project' ? testName : scope.extensionName + '::' + testName;

/**
 * Update the last run summary persisted on a test.
 */
export const updateTestLastRun = (
  project: gdProject,
  test: GameplayTestToRun,
  result: GameplayTestResult
): void => {
  const testsContainer = getTestsContainer(project, test.scope);
  if (!testsContainer || !testsContainer.hasTestNamed(test.testName)) return;

  const storedTest = testsContainer.getTest(test.testName);
  storedTest.setLastRunStatus(result.status);
  storedTest.setLastRunAt(Date.now());
  storedTest.setLastRunDurationMs(result.durationMs);
  storedTest.setLastRunFramesExecuted(result.framesExecuted);
};

/**
 * Wait for the game in the gameplay test frame to be booted, by polling
 * it with `getStatus` until it answers.
 */
const waitForGameToBeReady = async (
  previewDebuggerServer: PreviewDebuggerServer,
  stopController: BatchStopController
): Promise<void> => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    let pollIntervalId: ?IntervalID = null;
    const unregisterCallbacks: () => void = previewDebuggerServer.registerCallbacks(
      {
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: () => {},
        onConnectionOpened: () => {},
        onConnectionErrored: () => {},
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (id !== GAMEPLAY_TEST_FRAME_DEBUGGER_ID) return;
          // Any message coming from the frame means the game (and its
          // debugger client) is up.
          if (pollIntervalId !== null) clearInterval(pollIntervalId);
          unregisterCallbacks();
          resolve();
        },
      }
    );

    // Allow a stop to interrupt the wait (the game may take a long time
    // to export and boot).
    stopController.abortBootWait = () => {
      if (pollIntervalId !== null) clearInterval(pollIntervalId);
      unregisterCallbacks();
      const error = new Error('The gameplay test run was stopped.');
      // $FlowFixMe[prop-missing] - tag the error so the runner knows this is a stop, not a failure.
      error.isStopRequested = true;
      reject(error);
    };

    pollIntervalId = setInterval(() => {
      if (Date.now() - startTime > GAME_READY_TIMEOUT_MS) {
        if (pollIntervalId !== null) clearInterval(pollIntervalId);
        unregisterCallbacks();
        reject(
          new Error(
            'The game preview for the gameplay test did not boot in time.'
          )
        );
        return;
      }
      previewDebuggerServer.sendMessage(GAMEPLAY_TEST_FRAME_DEBUGGER_ID, {
        command: 'getStatus',
      });
    }, GAME_READY_POLL_INTERVAL_MS);
  });
};

export type HiddenStallTracker = {|
  /** Call on every sign of life from the game (a progress message). */
  reportProgress: () => void,
  /** Call when the editor goes to the background. */
  reportHidden: () => void,
  /**
   * Call when the editor comes back. Returns how long the game was actually
   * frozen during the period that just ended (0 when it kept running, or
   * when the editor was only away for an instant).
   */
  reportVisible: () => number,
  /** The total stall so far, hidden period in progress included. */
  getTotalStallMs: () => number,
|};

/**
 * Measures how long a run is frozen because the editor is in the
 * background. Browsers stop animation frames in a hidden page, so the game
 * stops stepping - but being hidden is not enough to conclude it was
 * frozen: the desktop app disables background throttling, and the game then
 * keeps running. Only the silence *after the last sign of life* counts.
 */
export const createHiddenStallTracker = ({
  isHiddenAtStart,
  getNowMs = () => Date.now(),
}: {|
  isHiddenAtStart: boolean,
  getNowMs?: () => number,
|}): HiddenStallTracker => {
  let hiddenSinceMs: number | null = isHiddenAtStart ? getNowMs() : null;
  let lastProgressAtMs = getNowMs();
  let totalStallMs = 0;

  /** The stall of the hidden period in progress, if any. */
  const getOngoingStallMs = (): number => {
    const startedBeingHiddenAtMs = hiddenSinceMs;
    if (startedBeingHiddenAtMs === null) return 0;
    return Math.max(
      0,
      getNowMs() - Math.max(startedBeingHiddenAtMs, lastProgressAtMs)
    );
  };

  return {
    reportProgress: () => {
      lastProgressAtMs = getNowMs();
    },
    reportHidden: () => {
      hiddenSinceMs = getNowMs();
    },
    reportVisible: () => {
      if (hiddenSinceMs === null) return 0;
      const stalledMs = getOngoingStallMs();
      hiddenSinceMs = null;
      // A short gap is not a stall: the game only heartbeats every 500ms,
      // so a quick look at another tab can pass completely unnoticed.
      if (stalledMs <= HIDDEN_STALL_THRESHOLD_MS) return 0;

      totalStallMs += stalledMs;
      return stalledMs;
    },
    getTotalStallMs: () => totalStallMs + getOngoingStallMs(),
  };
};

const runSingleTest = async ({
  previewDebuggerServer,
  test,
  source,
  timeoutMs,
  screenshots,
  speedFactor,
  stateInspectors,
  onProgress,
}: {|
  previewDebuggerServer: PreviewDebuggerServer,
  test: GameplayTestToRun,
  source: string,
  timeoutMs: number,
  screenshots: 'off' | 'on-failure',
  speedFactor: number | null,
  stateInspectors: GameplayTestStateInspectors,
  onProgress: ?(test: GameplayTestToRun, frame: number) => void,
|}): Promise<GameplayTestResult> => {
  const messageId = 'gameplay-test-' + nextRunMessageId++;

  return new Promise(resolve => {
    let watchdogTimeoutId: ?TimeoutID = null;
    const hiddenStallTracker = createHiddenStallTracker({
      isHiddenAtStart: getIsPageHidden(),
    });
    const unregisterCallbacks: () => void = previewDebuggerServer.registerCallbacks(
      {
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: ({ id }) => {
          if (id !== GAMEPLAY_TEST_FRAME_DEBUGGER_ID) return;
          finish(
            makeErrorResult(
              test.testName,
              'The game preview was closed while the test was running.'
            )
          );
        },
        onConnectionOpened: () => {},
        onConnectionErrored: () => {},
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (id !== GAMEPLAY_TEST_FRAME_DEBUGGER_ID) return;
          if (parsedMessage.messageId !== messageId) return;

          if (parsedMessage.command === 'gameplayTest.progress') {
            // The game is alive (stepping frames, or heartbeating while it
            // loads assets - loading is not counted against the test
            // timeout): give it a full budget again.
            hiddenStallTracker.reportProgress();
            armWatchdog();
            if (onProgress && parsedMessage.payload) {
              onProgress(test, parsedMessage.payload.frame || 0);
            }
          } else if (parsedMessage.command === 'gameplayTest.result') {
            finish({
              ...makeErrorResult(test.testName, ''),
              errors: [],
              ...(parsedMessage.payload || {}),
            });
          }
        },
      }
    );

    const finish = (result: GameplayTestResult) => {
      if (watchdogTimeoutId !== null) clearTimeout(watchdogTimeoutId);
      unregisterVisibilityListener();
      unregisterCallbacks();
      resolve({
        ...result,
        // The game measures the same thing on its side; keep the longest,
        // as each can miss a stall the other saw (the game is frozen while
        // hidden, the editor only learns about it when it comes back).
        hiddenStallMs: Math.max(
          result.hiddenStallMs || 0,
          hiddenStallTracker.getTotalStallMs()
        ),
      });
    };

    // An editor-side watchdog, in case the game dies without sending its
    // result. Re-armed by every progress message: a game legitimately
    // spends long over its own timeout while loading assets (loading is
    // excluded from the test budget), but it heartbeats while doing so - a
    // full silence is what means it crashed.
    //
    // Unless the editor is in the background: browsers then stop animation
    // frames, so the game stops stepping and goes silent for a reason that
    // has nothing to do with the game. The watchdog then waits much longer
    // and gives up on the run as 'paused' rather than blaming the game.
    const armWatchdog = () => {
      if (watchdogTimeoutId !== null) clearTimeout(watchdogTimeoutId);
      const wasHidden = getIsPageHidden();
      watchdogTimeoutId = setTimeout(
        () => {
          // Visibility changed while waiting (the timer itself is throttled
          // in a hidden page, so it can fire long after it was armed): the
          // budget that just elapsed was not the right one.
          if (getIsPageHidden() !== wasHidden) {
            armWatchdog();
            return;
          }
          if (wasHidden) {
            const totalHiddenStallMs = hiddenStallTracker.getTotalStallMs();
            setGameplayTestFrameHiddenPause({
              pausedMs: totalHiddenStallMs,
              isRunInterrupted: true,
            });
            finish(makePausedResult(test.testName, totalHiddenStallMs));
            return;
          }
          finish(
            makeErrorResult(
              test.testName,
              `No result nor progress received from the game after ${timeoutMs +
                RESULT_EXTRA_TIMEOUT_MS}ms - the game may have crashed or been closed.`
            )
          );
        },
        wasHidden ? MAX_HIDDEN_STALL_MS : timeoutMs + RESULT_EXTRA_TIMEOUT_MS
      );
    };

    // Follow the editor being hidden and shown again, to tell a frozen run
    // apart from a crashed one and to nudge the user about it (see the
    // banner on the gameplay test frame).
    const unregisterVisibilityListener = addPageVisibilityListener(isHidden => {
      if (isHidden) {
        hiddenStallTracker.reportHidden();
      } else if (hiddenStallTracker.reportVisible() > 0) {
        // The game really was frozen while the editor was away: nudge the
        // user about it, so a run that took much longer than it should - or
        // a game that looks stuck on an old frame - is never a mystery.
        setGameplayTestFrameHiddenPause({
          pausedMs: hiddenStallTracker.getTotalStallMs(),
          isRunInterrupted: false,
        });
      }
      // The run only resumes when the editor is looked at again: give it a
      // full budget from now on, not from when it was frozen.
      armWatchdog();
    });

    armWatchdog();

    const payload: Object = {
      testName: test.testName,
      source,
      timeoutMs,
      // Readable state for object/behavior snapshots, derived from the
      // extensions metadata.
      stateInspectors,
      // The game in the gameplay test frame only exists to run tests: leave
      // it paused and muted when the test finishes, showing the last frame.
      freezeWhenFinished: true,
    };
    if (speedFactor) payload.speedFactor = speedFactor;
    if (screenshots === 'off') payload.maxScreenshots = 0;

    previewDebuggerServer.sendMessage(GAMEPLAY_TEST_FRAME_DEBUGGER_ID, {
      command: 'gameplayTest.run',
      messageId,
      payload,
    });
  });
};

/**
 * Run gameplay tests sequentially in a fresh preview of the project,
 * displayed in the gameplay test frame. Runs are globally serialized:
 * a second call waits for the first one to complete.
 *
 * The last-run summary of each stored test is updated: the caller is
 * responsible for triggering the unsaved changes tracking and UI refreshes.
 */
export const runGameplayTests = async ({
  project,
  tests,
  previewLauncher,
  previewDebuggerServer,
  options,
}: {|
  project: gdProject,
  tests: Array<GameplayTestToRun>,
  previewLauncher: PreviewLauncherInterface,
  previewDebuggerServer: PreviewDebuggerServer,
  options: GameplayTestRunOptions,
|}): Promise<Array<GameplayTestResult>> => {
  const runPromise = lastRunPromise.then(
    async (): Promise<Array<GameplayTestResult>> => {
      const results: Array<GameplayTestResult> = [];
      const timeoutMs =
        options.timeoutMs ||
        (options.speedFactor
          ? PACED_RUN_DEFAULT_TIMEOUT_MS
          : DEFAULT_TIMEOUT_MS);
      const stopController: BatchStopController = {
        stopRequested: false,
        abortBootWait: () => {},
      };
      currentBatchStopController = stopController;
      setRunInProgress(true);
      let anyTestRan = false;

      // Close any frame left open by a previous run, so the new preview
      // always loads in a fresh frame (and a stale game can never answer
      // in place of the new one).
      clearGameplayTestFramePreview();
      setGameplayTestFrameHiddenPause(null);

      // Readable state for object/behavior snapshots, derived once per batch
      // from the extensions metadata.
      const stateInspectors = enumerateGameplayTestStateInspectors(project);

      // Resolve the sources of the tests first, so an unknown test does not
      // interrupt the batch in the middle.
      const testsWithSources = tests.map(test => {
        if (test.source !== undefined) {
          return { test, source: test.source, error: null };
        }
        const testsContainer = getTestsContainer(project, test.scope);
        if (!testsContainer) {
          return {
            test,
            source: null,
            error: `The scope (${getGameplayTestScopeDescription(
              test.scope
            )}) does not exist in the project.`,
          };
        }
        if (!testsContainer.hasTestNamed(test.testName)) {
          return {
            test,
            source: null,
            error: `No test named "${
              test.testName
            }" in ${getGameplayTestScopeDescription(test.scope)}.`,
          };
        }
        return {
          test,
          source: testsContainer.getTest(test.testName).getSource(),
          error: null,
        };
      });

      const firstTest = testsWithSources[0];
      if (firstTest) {
        setGameplayTestFrameRunStatus({
          testName: firstTest.test.testName,
          status: 'launching',
          frame: null,
          durationMs: null,
          testIndex: 0,
          testsCount: testsWithSources.length,
        });
      }

      try {
        // Export and launch a fresh preview into the gameplay test frame.
        await previewLauncher.launchPreview(
          // $FlowFixMe[prop-missing] - the launchers accept partial preview options for gameplay tests.
          ({
            project,
            sceneName: project.getFirstLayout(),
            externalLayoutName: null,
            eventsBasedObjectType: null,
            eventsBasedObjectVariantName: null,
            networkPreview: false,
            hotReload: false,
            shouldReloadProjectData: true,
            shouldReloadLibraries: true,
            shouldGenerateScenesEventsCode: true,
            shouldReloadResources: false,
            shouldHardReload: false,
            fullLoadingScreen: false,
            fallbackAuthor: null,
            authenticatedPlayer: null,
            isForInGameEdition: false,
            isForGameplayTest: true,
            editorId: '',
            getIsMenuBarHiddenInPreview: () => true,
            getIsAlwaysOnTopInPreview: () => false,
            captureOptions: null,
            onCaptureFinished: async () => {},
            inAppTutorialMessageInPreview: '',
            inAppTutorialMessagePositionInPreview: '',
            editorCameraState3D: null,
            inGameEditorSettings: null,
            numberOfWindows: 0,
            previewWindows: null,
          }: any)
        );

        await waitForGameToBeReady(previewDebuggerServer, stopController);

        for (
          let testIndex = 0;
          testIndex < testsWithSources.length;
          testIndex++
        ) {
          const { test, source, error } = testsWithSources[testIndex];
          if (stopController.stopRequested) {
            // The run was stopped: don't run the remaining tests.
            results.push(makeStoppedResult(test.testName));
            continue;
          }
          if (error !== null || source === null) {
            results.push(
              makeErrorResult(test.testName, error || 'No source found.')
            );
            continue;
          }

          if (options.onTestStarted) options.onTestStarted(test);
          anyTestRan = true;
          const frameRunStatus: GameplayTestFrameRunStatus = {
            testName: test.testName,
            status: 'launching',
            frame: null,
            durationMs: null,
            testIndex,
            testsCount: testsWithSources.length,
          };
          setGameplayTestFrameRunStatus(frameRunStatus);

          const result = await runSingleTest({
            previewDebuggerServer,
            test,
            source,
            timeoutMs,
            screenshots: options.screenshots || 'off',
            speedFactor: options.speedFactor || null,
            stateInspectors,
            onProgress: (test: GameplayTestToRun, frame: number) => {
              setGameplayTestFrameRunStatus({
                ...frameRunStatus,
                status: 'running',
                frame,
              });
              if (options.onProgress) options.onProgress(test, frame);
            },
          });
          updateTestLastRun(project, test, result);
          setGameplayTestFrameRunStatus({
            ...frameRunStatus,
            status: result.status,
            frame: result.framesExecuted,
            durationMs: result.durationMs,
          });
          results.push(result);

          if (result.status === 'paused') {
            // The editor is (still) in the background, so the game is not
            // running: the remaining tests would all be paused the same
            // way. Report them as such rather than pretending to run them.
            for (const { test: remainingTest } of testsWithSources.slice(
              testIndex + 1
            )) {
              results.push(
                makePausedResult(remainingTest.testName, result.hiddenStallMs)
              );
            }
            break;
          }
        }
      } catch (error) {
        if (error.isStopRequested) {
          // The run was stopped while the game was still exporting or
          // booting: mark the tests that could not be run as stopped.
          for (const { test } of testsWithSources.slice(results.length)) {
            results.push(makeStoppedResult(test.testName));
          }
        } else {
          const errorMessage =
            'Unable to run the gameplay tests: ' +
            (error.message || String(error));
          console.error('[GameplayTestRunner] ' + errorMessage, error);
          // Fill the results of the tests that could not be run.
          for (const { test } of testsWithSources.slice(results.length)) {
            results.push(makeErrorResult(test.testName, errorMessage));
          }
        }
      } finally {
        currentBatchStopController = null;
        setRunInProgress(false);
        // When at least one test ran, the frame stays open (showing the
        // frozen game and the outcome of the run) until its close button
        // is used or another run starts. Otherwise (the game could not
        // boot, or the run was stopped before the first test), close it.
        if (!anyTestRan) {
          clearGameplayTestFramePreview();
        }
      }

      return results;
    }
  );

  // Keep the queue going even if this run fails.
  lastRunPromise = runPromise.catch(() => {});

  return runPromise;
};

/**
 * Stop the gameplay test run being currently run, if any: the test being
 * run in the game is interrupted, the remaining tests of the batch are not
 * run, and a run still exporting or booting the game is aborted.
 */
export const stopRunningGameplayTest = (
  previewDebuggerServer: PreviewDebuggerServer
): void => {
  if (currentBatchStopController) {
    currentBatchStopController.stopRequested = true;
    currentBatchStopController.abortBootWait();
  }
  previewDebuggerServer.sendMessage(GAMEPLAY_TEST_FRAME_DEBUGGER_ID, {
    command: 'gameplayTest.stop',
  });
};

/**
 * Close the gameplay test frame (unloading the game running in it).
 */
export const closeGameplayTestFrame = (): void => {
  clearGameplayTestFramePreview();
};

// The dependencies needed to run gameplay tests are registered by the
// MainFrame (which owns the preview launcher), so that any part of the
// editor (project manager, test editor, command palette, CLI, AI function
// calls) can run tests without threading everything through props.
type GameplayTestRunnerDependencies = {|
  getPreviewLauncher: () => ?PreviewLauncherInterface,
  // Called after tests were run (last-run summaries were updated on the
  // project): trigger unsaved changes and refresh the UI.
  onTestsRunFinished: () => void,
|};

let gameplayTestRunnerDependencies: GameplayTestRunnerDependencies | null = null;

export const registerGameplayTestRunnerDependencies = (
  dependencies: GameplayTestRunnerDependencies | null
): void => {
  gameplayTestRunnerDependencies = dependencies;
};

/**
 * Run gameplay tests using the dependencies registered by the MainFrame.
 * See `runGameplayTests`.
 */
export const runProjectGameplayTests = async ({
  project,
  tests,
  options,
}: {|
  project: gdProject,
  tests: Array<GameplayTestToRun>,
  options: GameplayTestRunOptions,
|}): Promise<Array<GameplayTestResult>> => {
  const dependencies = gameplayTestRunnerDependencies;
  if (!dependencies) {
    throw new Error(
      'Gameplay tests can not be run (no editor registered to run them).'
    );
  }
  const previewLauncher = dependencies.getPreviewLauncher();
  const previewDebuggerServer = previewLauncher
    ? previewLauncher.getPreviewDebuggerServer()
    : null;
  if (!previewLauncher || !previewDebuggerServer) {
    throw new Error(
      'Gameplay tests can not be run (no preview launcher available).'
    );
  }

  try {
    return await runGameplayTests({
      project,
      tests,
      previewLauncher,
      previewDebuggerServer,
      options,
    });
  } finally {
    dependencies.onTestsRunFinished();
  }
};

/**
 * Ask the game to stop the gameplay test being currently run, if any,
 * using the dependencies registered by the MainFrame.
 */
export const stopRunningProjectGameplayTest = (): void => {
  const dependencies = gameplayTestRunnerDependencies;
  if (!dependencies) return;
  const previewLauncher = dependencies.getPreviewLauncher();
  const previewDebuggerServer = previewLauncher
    ? previewLauncher.getPreviewDebuggerServer()
    : null;
  if (!previewDebuggerServer) return;
  stopRunningGameplayTest(previewDebuggerServer);
};

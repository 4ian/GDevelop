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
  type GameplayTestFrameRunStatus,
} from './GameplayTestFrame';

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
  status: 'passed' | 'failed' | 'error' | 'stopped' | 'timeout',
  framesExecuted: number,
  durationMs: number,
  // Time spent waiting for the game to boot and for scene assets to load,
  // excluded from the `timeoutMs` budget (`durationMs` includes it).
  loadingMs: number,
  // The wall-clock budget the run had, loading excluded
  // (`durationMs - loadingMs` close to it means the test is at risk of
  // timing out on a slower machine).
  timeoutMs: number,
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

const makeStopRequestedError = (): Error => {
  const error: any = new Error('The gameplay test run was stopped.');
  error.isStopRequested = true;
  return error;
};

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
  status: 'error' | 'stopped',
  errorMessage: string
): GameplayTestResult => ({
  testName,
  status,
  framesExecuted: 0,
  durationMs: 0,
  loadingMs: 0,
  timeoutMs: 0,
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
  if (stopController.stopRequested) {
    throw makeStopRequestedError();
  }

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
      reject(makeStopRequestedError());
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
      unregisterCallbacks();
      resolve(result);
    };

    // An editor-side watchdog, in case the game dies without sending its
    // result. Re-armed by every progress message: a game legitimately
    // spends long over its own timeout while loading assets (loading is
    // excluded from the test budget), but it heartbeats while doing so - a
    // full silence is what means it crashed.
    const armWatchdog = () => {
      if (watchdogTimeoutId !== null) clearTimeout(watchdogTimeoutId);
      watchdogTimeoutId = setTimeout(() => {
        finish(
          makeErrorResult(
            test.testName,
            `No result nor progress received from the game after ${timeoutMs +
              RESULT_EXTRA_TIMEOUT_MS}ms - the game may have crashed or been closed.`
          )
        );
      }, timeoutMs + RESULT_EXTRA_TIMEOUT_MS);
    };
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
        await previewLauncher.launchPreview({
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
          displayCollisionShapes: false,
          displaySignalAnimations: false,
          fullLoadingScreen: false,
          forceAlwaysOnTopInPreview: false,
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
          isLaunchCancelled: () => stopController.stopRequested,
          onWillWritePreviewFiles: () => !stopController.stopRequested,
          previewWindows: null,
        });

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
  // project): persist them or trigger unsaved changes, then refresh the UI.
  onTestsRunFinished: (project: gdProject) => Promise<void> | void,
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
    await dependencies.onTestsRunFinished(project);
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

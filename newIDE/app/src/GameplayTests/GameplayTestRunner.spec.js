// @flow
import {
  createHiddenStallTracker,
  runGameplayTests,
} from './GameplayTestRunner';

const gd: libGDevelop = global.gd;

const setSystemTimeMs = (timeMs: number) => {
  // $FlowFixMe[prop-missing] - Missing in Flow types of Jest.
  jest.setSystemTime(timeMs);
};

describe('runGameplayTests', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  // A launcher whose preview fails to start, like the browser one when its
  // storage is full: no game will ever boot.
  const runWithFailingPreviewLaunch = (launchError: Error) => {
    const previewDebuggerServer: any = {
      registerCallbacks: () => () => {},
      sendMessage: () => {},
    };
    const previewLauncher: any = {
      launchPreview: () => Promise.reject(launchError),
      getPreviewDebuggerServer: () => previewDebuggerServer,
    };
    return runGameplayTests({
      project,
      tests: [
        { scope: { type: 'project' }, testName: 'First', source: '' },
        { scope: { type: 'project' }, testName: 'Second', source: '' },
      ],
      previewLauncher,
      previewDebuggerServer,
      options: {},
    });
  };

  it('reports the tests as not run, without waiting for the game, when the browser storage is full', async () => {
    const quotaError = new Error('Quota exceeded.');
    quotaError.name = 'QuotaExceededError';

    const results = await runWithFailingPreviewLaunch(quotaError);

    expect(results.map(result => [result.testName, result.status])).toEqual([
      ['First', 'unavailable'],
      ['Second', 'unavailable'],
    ]);
    expect(results[0].errors).toEqual([
      'The game preview could not be started: the browser storage used by GDevelop is full, so the files of the game could not be stored. No preview nor gameplay test can run until the user frees this storage (in the site settings of the browser) and reloads GDevelop.',
    ]);
  });

  it('gives the cause of any other failure to start the preview', async () => {
    const results = await runWithFailingPreviewLaunch(
      new Error('Export failed.')
    );

    expect(results[0].status).toBe('unavailable');
    expect(results[0].errors).toEqual([
      'The game preview could not be started: Export failed.',
    ]);
  });
});

describe('runGameplayTests watchdog', () => {
  let project: gdProject;

  beforeEach(() => {
    jest.useFakeTimers();
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
    jest.useRealTimers();
  });

  /**
   * A game in the gameplay test frame, answering the debugger commands of
   * the editor: `onRun` is called when a test is run, with a function
   * sending a message of the game to the editor.
   */
  const makeFakeGame = (
    onRun: (runMessage: Object, sendToEditor: (message: Object) => void) => void
  ) => {
    const sentMessages: Array<Object> = [];
    let callbacksList: Array<Object> = [];
    const sendToEditor = (parsedMessage: Object) => {
      for (const callbacks of callbacksList.slice()) {
        callbacks.onHandleParsedMessage({
          id: 'gameplay-test-frame',
          parsedMessage,
        });
      }
    };
    const previewDebuggerServer: any = {
      registerCallbacks: callbacks => {
        callbacksList.push(callbacks);
        return () => {
          callbacksList = callbacksList.filter(other => other !== callbacks);
        };
      },
      sendMessage: (id, message) => {
        sentMessages.push(message);
        if (message.command === 'getStatus') {
          sendToEditor({ command: 'status' });
        } else if (message.command === 'gameplayTest.run') {
          onRun(message, sendToEditor);
        }
      },
    };
    const previewLauncher: any = {
      launchPreview: () => Promise.resolve(),
      getPreviewDebuggerServer: () => previewDebuggerServer,
    };
    return { previewDebuggerServer, previewLauncher, sentMessages };
  };

  /** Let the time pass, giving a chance to the promises to settle. */
  const letTimePass = async (durationMs: number) => {
    for (let elapsedMs = 0; elapsedMs < durationMs; elapsedMs += 100) {
      jest.advanceTimersByTime(100);
      for (let i = 0; i < 20; i++) await Promise.resolve();
    }
  };

  const runTest = ({
    previewLauncher,
    previewDebuggerServer,
  }: {
    previewLauncher: any,
    previewDebuggerServer: any,
    ...
  }) =>
    runGameplayTests({
      project,
      tests: [{ scope: { type: 'project' }, testName: 'Test', source: '' }],
      previewLauncher,
      previewDebuggerServer,
      options: { timeoutMs: 1000, loadingTimeoutMs: 60 * 1000 },
    });

  const passedResult = {
    testName: 'Test',
    status: 'passed',
    framesExecuted: 1,
  };

  it('waits longer than the test budget for a game that is loading', async () => {
    const game = makeFakeGame(({ messageId }, sendToEditor) => {
      sendToEditor({
        command: 'gameplayTest.progress',
        messageId,
        payload: { frame: 0, isLoading: true },
      });
      // Silent for much longer than the test budget, like a game creating a
      // big 3D scene.
      setTimeout(
        () =>
          sendToEditor({
            command: 'gameplayTest.result',
            messageId,
            payload: passedResult,
          }),
        30 * 1000
      );
    });

    const resultsPromise = runTest(game);
    await letTimePass(31 * 1000);
    const results = await resultsPromise;

    expect(results.map(result => result.status)).toEqual(['passed']);
  });

  it('gives up on a game silent for longer than the loading budget, and stops its test', async () => {
    const game = makeFakeGame(({ messageId }, sendToEditor) => {
      sendToEditor({
        command: 'gameplayTest.progress',
        messageId,
        payload: { frame: 0, isLoading: true },
      });
    });

    const resultsPromise = runTest(game);
    await letTimePass(71 * 1000);
    const results = await resultsPromise;

    expect(results[0].status).toBe('error');
    expect(results[0].errors).toEqual([
      'No result nor progress received from the game after 70000ms while it was loading (booting, loading the assets of a scene, creating a scene or drawing its first frames) - the game may have crashed or been closed.',
    ]);
    expect(
      game.sentMessages.some(message => message.command === 'gameplayTest.stop')
    ).toBe(true);
  });

  it('gives up on a running game silent for longer than the test budget', async () => {
    const game = makeFakeGame(({ messageId }, sendToEditor) => {
      sendToEditor({
        command: 'gameplayTest.progress',
        messageId,
        payload: { frame: 10, isLoading: false },
      });
    });

    const resultsPromise = runTest(game);
    await letTimePass(12 * 1000);
    const results = await resultsPromise;

    expect(results[0].errors).toEqual([
      'No result nor progress received from the game after 11000ms - the game may have crashed or been closed.',
    ]);
  });

  it('does not give up when the editor was frozen with the game', async () => {
    const game = makeFakeGame(({ messageId }, sendToEditor) => {
      sendToEditor({
        command: 'gameplayTest.progress',
        messageId,
        payload: { frame: 10, isLoading: false },
      });
      // The game blocks the thread it shares with the editor for 20
      // seconds: the watchdog of the editor fires late, once the game is
      // done, right before the message of the game is received.
      setTimeout(() => setSystemTimeMs(Date.now() + 20 * 1000), 500);
      setTimeout(
        () =>
          sendToEditor({
            command: 'gameplayTest.result',
            messageId,
            payload: passedResult,
          }),
        11500
      );
    });

    const resultsPromise = runTest(game);
    await letTimePass(12 * 1000);
    const results = await resultsPromise;

    expect(results.map(result => result.status)).toEqual(['passed']);
  });
});

describe('createHiddenStallTracker', () => {
  /** A clock that can be moved forward by the test. */
  const makeFakeClock = (startMs: number = 1000) => {
    let nowMs = startMs;
    return {
      getNowMs: () => nowMs,
      advanceBy: (durationMs: number) => {
        nowMs += durationMs;
      },
    };
  };

  it('reports no stall when the editor is never hidden', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    clock.advanceBy(5000);
    tracker.reportProgress();

    expect(tracker.getTotalStallMs()).toBe(0);
  });

  it('counts the time the game was frozen while the editor was hidden', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    tracker.reportProgress();
    tracker.reportHidden();
    clock.advanceBy(30000);

    expect(tracker.reportVisible()).toBe(30000);
    expect(tracker.getTotalStallMs()).toBe(30000);
  });

  it('adds up several hidden periods', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    tracker.reportHidden();
    clock.advanceBy(10000);
    tracker.reportVisible();

    tracker.reportProgress();
    clock.advanceBy(2000);
    tracker.reportHidden();
    clock.advanceBy(5000);
    tracker.reportVisible();

    expect(tracker.getTotalStallMs()).toBe(15000);
  });

  it('ignores a hidden period too short to have frozen anything', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    tracker.reportProgress();
    tracker.reportHidden();
    clock.advanceBy(400);

    expect(tracker.reportVisible()).toBe(0);
    expect(tracker.getTotalStallMs()).toBe(0);
  });

  it('does not count a hidden period during which the game kept running', () => {
    // What happens in the desktop app, where background throttling is
    // disabled: the window is hidden, but the game keeps stepping and
    // sending progress.
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    tracker.reportHidden();
    for (let i = 0; i < 20; i++) {
      clock.advanceBy(500);
      tracker.reportProgress();
    }

    expect(tracker.reportVisible()).toBe(0);
    expect(tracker.getTotalStallMs()).toBe(0);
  });

  it('only counts the silence following the last sign of life', () => {
    // The game stepped a few more frames after the editor was hidden,
    // then froze: only the freeze is a stall.
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    tracker.reportHidden();
    clock.advanceBy(600);
    tracker.reportProgress();
    clock.advanceBy(20000);

    expect(tracker.reportVisible()).toBe(20000);
  });

  it('counts a run started while the editor was already hidden', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: true,
      getNowMs: clock.getNowMs,
    });

    clock.advanceBy(45000);

    // The stall is readable before the editor comes back: this is what the
    // watchdog uses to give up on a run as 'paused'.
    expect(tracker.getTotalStallMs()).toBe(45000);
    expect(tracker.reportVisible()).toBe(45000);
    expect(tracker.getTotalStallMs()).toBe(45000);
  });

  it('reports nothing when the editor comes back without having been hidden', () => {
    const clock = makeFakeClock();
    const tracker = createHiddenStallTracker({
      isHiddenAtStart: false,
      getNowMs: clock.getNowMs,
    });

    clock.advanceBy(30000);

    expect(tracker.reportVisible()).toBe(0);
    expect(tracker.getTotalStallMs()).toBe(0);
  });
});

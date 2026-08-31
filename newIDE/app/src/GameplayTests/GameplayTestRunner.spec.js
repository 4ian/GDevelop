// @flow
import { createHiddenStallTracker } from './GameplayTestRunner';

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

// @flow
import {
  EventsExecutionTrackingStore,
  getInstructionExecutionId,
} from './EventsExecutionTrackingStore';

/** Longer than the highlight duration: everything reported has expired. */
const AFTER_HIGHLIGHT_DURATION_MS = 1000;

const makeOutput = (eventPtr: number, durationMs: number) => ({
  instructionDurations: {
    [getInstructionExecutionId(eventPtr, false, 0)]: durationMs,
  },
});

describe('EventsExecutionTrackingStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('expiration', () => {
    it('forgets what a preview reported once it is old enough', () => {
      const store = new EventsExecutionTrackingStore();
      store.ingest(makeOutput(42, 1.5));
      expect(store.getEventExecution(42)).not.toBeNull();
      expect(store.getInstructionExecution(42, false, 0)).not.toBeNull();

      jest.advanceTimersByTime(AFTER_HIGHLIGHT_DURATION_MS);

      expect(store.getEventExecution(42)).toBeNull();
      expect(store.getInstructionExecution(42, false, 0)).toBeNull();
    });

    it('wakes up the event of an instruction that expired', () => {
      const store = new EventsExecutionTrackingStore();
      const listener = jest.fn();
      store.ingest(makeOutput(42, 1.5));
      store.subscribe(42, listener);

      jest.advanceTimersByTime(AFTER_HIGHLIGHT_DURATION_MS);

      // Without it, the row keeps showing a duration that is no longer there.
      expect(listener).toHaveBeenCalled();
    });

    it('keeps the last frame while the highlights are persistent', () => {
      const store = new EventsExecutionTrackingStore();
      store.ingest(makeOutput(42, 1.5));
      store.setHighlightsPersistent(true);

      jest.advanceTimersByTime(AFTER_HIGHLIGHT_DURATION_MS);

      expect(store.getEventExecution(42)).not.toBeNull();
    });
  });

  describe('events modified while a preview runs', () => {
    it('shows nothing until the code of the game is generated again', () => {
      const store = new EventsExecutionTrackingStore();
      store.ingest(makeOutput(42, 1.5));
      expect(store.getEventExecution(42)).not.toBeNull();

      // The event is deleted, and a new one takes its address: the game,
      // still running the old code, reports the old event under this address.
      store.onEventsModified();
      expect(store.getEventExecution(42)).toBeNull();
      store.ingest(makeOutput(42, 1.5));
      expect(store.getEventExecution(42)).toBeNull();

      // Launched or hot-reloaded: the addresses match the events again.
      store.onEventsCodeGenerated();
      store.ingest(makeOutput(42, 2));
      expect(store.getEventExecution(42)).not.toBeNull();
    });
  });

  describe('setDebuggerOpened', () => {
    it('forgets everything when the debugger is closed', () => {
      const store = new EventsExecutionTrackingStore();
      store.setDebuggerOpened(true);
      store.ingest(makeOutput(42, 1.5));
      // The preview was closed: its last frame is kept for the debugger.
      store.onAllPreviewsClosed();
      expect(store.getEventExecution(42)).not.toBeNull();

      store.setDebuggerOpened(false);

      expect(store.getEventExecution(42)).toBeNull();
      expect(store.getInstructionExecution(42, false, 0)).toBeNull();
    });

    it('keeps what is shown when the debugger is opened again', () => {
      const store = new EventsExecutionTrackingStore();
      store.setDebuggerOpened(true);
      store.ingest(makeOutput(42, 1.5));

      // Setting the same value again must not throw the last frame away.
      store.setDebuggerOpened(true);

      expect(store.getEventExecution(42)).not.toBeNull();
    });
  });

  describe('onAllPreviewsClosed', () => {
    it('keeps the last frame shown while the debugger is opened', () => {
      const store = new EventsExecutionTrackingStore();
      store.setDebuggerOpened(true);
      store.ingest(makeOutput(42, 1.5));

      store.onAllPreviewsClosed();
      jest.advanceTimersByTime(AFTER_HIGHLIGHT_DURATION_MS);

      expect(store.getEventExecution(42)).not.toBeNull();
      expect(store.getRunningSceneName()).toBeNull();
    });

    it('forgets the last frame when no debugger is opened', () => {
      const store = new EventsExecutionTrackingStore();
      store.ingest(makeOutput(42, 1.5));

      store.onAllPreviewsClosed();

      // Nobody is looking: leaving it would show durations forever.
      expect(store.getEventExecution(42)).toBeNull();
    });
  });

  describe('cumulated executions', () => {
    /** A group (1) holding two events (2 and 3), one of them nested (4). */
    const registerHierarchy = (store: EventsExecutionTrackingStore) => {
      const parentEventPtrs = new Map([[2, 1], [3, 1], [4, 3]]);
      store.registerEventsHierarchy(parentEventPtrs);
      return parentEventPtrs;
    };

    it('sums what the sub-events took, at every level', () => {
      const store = new EventsExecutionTrackingStore();
      registerHierarchy(store);
      store.setHighlightsPersistent(true);
      store.ingest({
        instructionDurations: {
          [getInstructionExecutionId(2, false, 0)]: 1,
          [getInstructionExecutionId(4, false, 0)]: 3,
        },
      });

      const group = store.getCumulatedEventExecution(1);
      expect(group && group.durationMs).toBe(4);
      // The event holding the nested one carries what it took.
      const nestingEvent = store.getCumulatedEventExecution(3);
      expect(nestingEvent && nestingEvent.durationMs).toBe(3);
      const leaf = store.getCumulatedEventExecution(4);
      expect(leaf && leaf.durationMs).toBe(3);
    });

    it('gives each event its share of what was tracked', () => {
      const store = new EventsExecutionTrackingStore();
      registerHierarchy(store);
      store.setHighlightsPersistent(true);
      store.ingest({
        instructionDurations: {
          [getInstructionExecutionId(2, false, 0)]: 1,
          [getInstructionExecutionId(4, false, 0)]: 3,
        },
      });

      const group = store.getCumulatedEventExecution(1);
      expect(group && group.sharePercent).toBe(100);
      const leaf = store.getCumulatedEventExecution(4);
      expect(leaf && leaf.sharePercent).toBe(75);
    });

    it('shows the exact value of the frame when the game is paused', () => {
      const store = new EventsExecutionTrackingStore();
      registerHierarchy(store);
      // Frame by frame: smoothing would show a value no frame ever had.
      store.setHighlightsPersistent(true);
      store.ingest(makeOutput(2, 10));
      store.ingest(makeOutput(2, 20));

      const group = store.getCumulatedEventExecution(1);
      expect(group && group.durationMs).toBe(20);
    });

    it('smooths the value while the game runs', () => {
      const store = new EventsExecutionTrackingStore();
      registerHierarchy(store);
      store.ingest(makeOutput(2, 10));
      store.ingest(makeOutput(2, 20));

      const group = store.getCumulatedEventExecution(1);
      // Between the two, and not the raw last value.
      expect(group && group.durationMs).toBeGreaterThan(10);
      expect(group && group.durationMs).toBeLessThan(20);
    });

    it('stops following a sheet that was closed', () => {
      const store = new EventsExecutionTrackingStore();
      const parentEventPtrs = registerHierarchy(store);
      store.unregisterEventsHierarchy(parentEventPtrs);
      store.ingest(makeOutput(2, 10));

      expect(store.getCumulatedEventExecution(1)).toBeNull();
      expect(store.getCumulatedEventExecution(2)).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('forgets everything and wakes up the events that were shown', () => {
      const store = new EventsExecutionTrackingStore();
      const listener = jest.fn();
      store.ingest(makeOutput(42, 1.5));
      store.subscribe(42, listener);

      store.clear();

      expect(store.getEventExecution(42)).toBeNull();
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('watched expressions', () => {
    it('notifies the listeners when an expression is added or removed', () => {
      const store = new EventsExecutionTrackingStore();
      const listener = jest.fn();
      const unsubscribe = store.subscribeToWatchedExpressions(listener);

      store.addWatchedExpression('Score');
      store.addWatchedExpression('Score');
      expect(store.getWatchedExpressions()).toEqual(['Score']);
      expect(listener).toHaveBeenCalledTimes(1);

      store.removeWatchedExpression('Score');
      expect(store.getWatchedExpressions()).toEqual([]);
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      store.addWatchedExpression('Lives');
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe('running scene', () => {
    it('notifies the listeners when the running scene changes', () => {
      const store = new EventsExecutionTrackingStore();
      const listener = jest.fn();
      store.subscribeToRunningSceneName(listener);

      store.setRunningSceneName('Level 1');
      store.setRunningSceneName('Level 1');
      expect(listener).toHaveBeenCalledTimes(1);

      store.onAllPreviewsClosed();
      expect(store.getRunningSceneName()).toBeNull();
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });
});

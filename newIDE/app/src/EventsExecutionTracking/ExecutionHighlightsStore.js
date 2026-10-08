// @flow

/** What the game reports: the duration of the last execution of each instruction. */
export type EventsExecutionTrackerOutput = {|
  instructionDurations: { [instructionExecutionId: string]: number },
|};

export type InstructionExecution = {|
  /** Duration of the last execution, in milliseconds. */
  durationMs: number,
  /** When the execution was reported (`Date.now()`). */
  reportedAt: number,
|};

/**
 * What an event took with everything under it: what a group shows, so that
 * the heavy parts of a sheet can be found by reading the groups only.
 */
export type CumulatedEventExecution = {|
  /** Duration of the event and of all its sub-events, in milliseconds. */
  durationMs: number,
  /** Its share of everything tracked in the last report, in percent. */
  sharePercent: number,
  /** When the execution was reported (`Date.now()`). */
  reportedAt: number,
|};

/** An executed instruction is highlighted for this long after being reported. */
const HIGHLIGHT_DURATION_MS = 700;

/**
 * How much of a new value is taken into the smoothed one. Reports arrive
 * every 100 ms: without smoothing, the number shown on a group flickers too
 * fast to be read, let alone compared.
 */
const SMOOTHING_FACTOR = 0.3;

/**
 * Build the id identifying an instruction in the code generated for a preview.
 * Must match `gd::EventsCodeGenerator::GetInstructionExecutionId`: the identity
 * of the event as known by the editor (its pointer), then the kind and the
 * index of the instruction.
 */
export const getInstructionExecutionId = (
  eventPtr: number,
  isCondition: boolean,
  indexInList: number
): string => `${eventPtr}:${isCondition ? 'c' : 'a'}${indexInList}`;

const getEventPtrFromInstructionExecutionId = (
  instructionExecutionId: string
): number => parseInt(instructionExecutionId, 10);

/**
 * Keep what the previews report about the execution of their events (what
 * the instructions took, and what each event took with everything under it),
 * forget it once it is too old to be highlighted, and notify the listeners
 * (the rows of the events sheets) of the events concerned.
 */
export class ExecutionHighlightsStore {
  _instructionExecutions: Map<string, InstructionExecution> = new Map();
  _eventExecutions: Map<number, InstructionExecution> = new Map();
  /**
   * What each event took with everything under it, so that a group can show
   * what its sub-events cost without the game reporting anything more.
   */
  _cumulatedEventExecutions: Map<number, CumulatedEventExecution> = new Map();
  /**
   * The listeners of each event, so that a report only wakes up the rows that
   * it concerns: an events sheet has one listener per instruction, and waking
   * them all up several times per second would be far too expensive.
   */
  _listenersByEventPtr: Map<number, Set<() => void>> = new Map();
  _expirationTimeoutId: TimeoutID | null = null;
  /**
   * The parent of each event, one map per events sheet showing a tree. The
   * sheets fill their own map in place while they build their rows, and the
   * store only reads it.
   */
  _parentEventPtrsBySheet: Set<Map<number, number>> = new Set();
  /**
   * When the game advances frame by frame, what a frame executed stays
   * highlighted until the next frame instead of fading out.
   */
  _areHighlightsPersistent: boolean = false;
  /**
   * The events were changed since the code of the running game was generated.
   *
   * The ids reported by the game are the addresses of the events when its
   * code was generated. An event deleted since then frees its address, and a
   * new one can take it: the new event would be highlighted with what the old
   * one did. Nothing is shown until the code is generated again.
   */
  _areReportedEventPtrsOutdated: boolean = false;

  setHighlightsPersistent(areHighlightsPersistent: boolean): void {
    if (this._areHighlightsPersistent === areHighlightsPersistent) return;
    this._areHighlightsPersistent = areHighlightsPersistent;
    if (areHighlightsPersistent) {
      // What is displayed stays as is.
      if (this._expirationTimeoutId) {
        clearTimeout(this._expirationTimeoutId);
        this._expirationTimeoutId = null;
      }
    } else if (this._instructionExecutions.size > 0) {
      this._scheduleExpiration();
    }
  }

  ingest(output: EventsExecutionTrackerOutput): void {
    try {
      this._ingestOrThrow(output);
    } catch (error) {
      console.error(
        'Unable to read what the game reported about its events:',
        error
      );
    }
  }

  /** To be called when the events are changed (added, removed, edited...). */
  onEventsModified(): void {
    if (this._areReportedEventPtrsOutdated) return;
    this._areReportedEventPtrsOutdated = true;
    this.clear();
  }

  /** To be called when a preview was launched, or hot-reloaded. */
  onEventsCodeGenerated(): void {
    this._areReportedEventPtrsOutdated = false;
  }

  _ingestOrThrow(output: EventsExecutionTrackerOutput): void {
    if (this._areReportedEventPtrsOutdated) return;
    const reportedAt = Date.now();
    const eventDurations: Map<number, number> = new Map();
    // The events that were showing something and are not reported anymore
    // must be notified too, so that they stop being highlighted.
    const previouslyShownEventPtrs = this._areHighlightsPersistent
      ? Array.from(this._eventExecutions.keys())
      : null;
    if (this._areHighlightsPersistent) {
      // Only the last frame is shown.
      this._instructionExecutions.clear();
      this._eventExecutions.clear();
    }

    for (const instructionExecutionId in output.instructionDurations) {
      const durationMs = output.instructionDurations[instructionExecutionId];
      this._instructionExecutions.set(instructionExecutionId, {
        durationMs,
        reportedAt,
      });

      const eventPtr = getEventPtrFromInstructionExecutionId(
        instructionExecutionId
      );
      eventDurations.set(
        eventPtr,
        (eventDurations.get(eventPtr) || 0) + durationMs
      );
    }
    eventDurations.forEach((durationMs, eventPtr) => {
      this._eventExecutions.set(eventPtr, { durationMs, reportedAt });
    });
    const cumulatedEventPtrs = this._updateCumulatedExecutions(
      eventDurations,
      reportedAt
    );

    this._notifyEvents(eventDurations.keys());
    // A group is woken up by what its sub-events did, not by its own
    // instructions: it has none.
    this._notifyEvents(
      cumulatedEventPtrs.filter(eventPtr => !eventDurations.has(eventPtr))
    );
    if (previouslyShownEventPtrs) {
      this._notifyEvents(
        previouslyShownEventPtrs.filter(
          eventPtr => !eventDurations.has(eventPtr)
        )
      );
    }
    if (!this._areHighlightsPersistent) this._scheduleExpiration();
  }

  /**
   * Sum what each event took with everything under it, by walking up the
   * parents, and turn it into a share of everything tracked in this report.
   * Returns every event whose cumulated value changed.
   */
  _updateCumulatedExecutions(
    eventDurations: Map<number, number>,
    reportedAt: number
  ): Array<number> {
    const rawDurations: Map<number, number> = new Map();
    let totalDurationMs = 0;
    eventDurations.forEach((durationMs, eventPtr) => {
      totalDurationMs += durationMs;
      // A tree cannot loop, but a stale hierarchy could: stop on a pointer
      // already walked rather than spin forever.
      const walkedEventPtrs = new Set();
      let currentEventPtr = eventPtr;
      while (currentEventPtr != null && !walkedEventPtrs.has(currentEventPtr)) {
        walkedEventPtrs.add(currentEventPtr);
        rawDurations.set(
          currentEventPtr,
          (rawDurations.get(currentEventPtr) || 0) + durationMs
        );
        currentEventPtr = this._getParentEventPtr(currentEventPtr);
      }
    });

    const changedEventPtrs = Array.from(
      new Set([
        ...rawDurations.keys(),
        ...this._cumulatedEventExecutions.keys(),
      ])
    );
    const previousExecutions = this._cumulatedEventExecutions;
    this._cumulatedEventExecutions = new Map();
    rawDurations.forEach((rawDurationMs, eventPtr) => {
      // Paused or frame by frame: the exact value of the frame is what is
      // being looked at, smoothing it would be a lie.
      const previousExecution = this._areHighlightsPersistent
        ? null
        : previousExecutions.get(eventPtr);
      const durationMs = previousExecution
        ? previousExecution.durationMs +
          SMOOTHING_FACTOR * (rawDurationMs - previousExecution.durationMs)
        : rawDurationMs;
      this._cumulatedEventExecutions.set(eventPtr, {
        durationMs,
        sharePercent:
          totalDurationMs > 0 ? (rawDurationMs / totalDurationMs) * 100 : 0,
        reportedAt,
      });
    });

    return changedEventPtrs;
  }

  clear(): void {
    if (this._expirationTimeoutId) {
      clearTimeout(this._expirationTimeoutId);
      this._expirationTimeoutId = null;
    }
    if (
      this._instructionExecutions.size === 0 &&
      this._eventExecutions.size === 0 &&
      this._cumulatedEventExecutions.size === 0
    ) {
      return;
    }
    const shownEventPtrs = Array.from(
      new Set([
        ...this._eventExecutions.keys(),
        ...this._cumulatedEventExecutions.keys(),
      ])
    );
    this._instructionExecutions.clear();
    this._eventExecutions.clear();
    this._cumulatedEventExecutions.clear();
    this._notifyEvents(shownEventPtrs);
  }

  getInstructionExecution(
    eventPtr: number,
    isCondition: boolean,
    indexInList: number
  ): InstructionExecution | null {
    return (
      this._instructionExecutions.get(
        getInstructionExecutionId(eventPtr, isCondition, indexInList)
      ) || null
    );
  }

  getEventExecution(eventPtr: number): InstructionExecution | null {
    return this._eventExecutions.get(eventPtr) || null;
  }

  /**
   * Follow the tree of an events sheet: the map is filled by the sheet itself
   * while it builds its rows, and read here to sum what a group took.
   */
  registerEventsHierarchy(parentEventPtrs: Map<number, number>): void {
    this._parentEventPtrsBySheet.add(parentEventPtrs);
  }

  unregisterEventsHierarchy(parentEventPtrs: Map<number, number>): void {
    this._parentEventPtrsBySheet.delete(parentEventPtrs);
  }

  /**
   * The event holding this one, whichever sheet shows it. An event only
   * belongs to one sheet, so the first map knowing it answers.
   */
  _getParentEventPtr(eventPtr: number): number | null {
    for (const parentEventPtrs of this._parentEventPtrsBySheet) {
      const parentEventPtr = parentEventPtrs.get(eventPtr);
      if (parentEventPtr != null) return parentEventPtr;
    }
    return null;
  }

  getCumulatedEventExecution(eventPtr: number): CumulatedEventExecution | null {
    return this._cumulatedEventExecutions.get(eventPtr) || null;
  }

  /** Listen to what is reported about the instructions of one event. */
  subscribe(eventPtr: number, listener: () => void): () => void {
    let listeners = this._listenersByEventPtr.get(eventPtr);
    if (!listeners) {
      listeners = new Set();
      this._listenersByEventPtr.set(eventPtr, listeners);
    }
    listeners.add(listener);

    return () => {
      const currentListeners = this._listenersByEventPtr.get(eventPtr);
      if (!currentListeners) return;
      currentListeners.delete(listener);
      if (currentListeners.size === 0) {
        this._listenersByEventPtr.delete(eventPtr);
      }
    };
  }

  _notifyEvents(eventPtrs: Iterable<number>): void {
    for (const eventPtr of eventPtrs) {
      const listeners = this._listenersByEventPtr.get(eventPtr);
      if (listeners) listeners.forEach(listener => listener());
    }
  }

  /** Forget the executions that are too old to be highlighted anymore. */
  _scheduleExpiration(): void {
    if (this._expirationTimeoutId) return;

    this._expirationTimeoutId = setTimeout(() => {
      this._expirationTimeoutId = null;
      const expirationTime = Date.now() - HIGHLIGHT_DURATION_MS;
      let hasChanged = false;

      // An instruction that expires concerns the event holding it: its row
      // has to be woken up too, or the duration it shows never goes away.
      const expiredEventPtrs = new Set();
      this._instructionExecutions.forEach((execution, id) => {
        if (execution.reportedAt <= expirationTime) {
          this._instructionExecutions.delete(id);
          expiredEventPtrs.add(getEventPtrFromInstructionExecutionId(id));
          hasChanged = true;
        }
      });
      this._eventExecutions.forEach((execution, eventPtr) => {
        if (execution.reportedAt <= expirationTime) {
          this._eventExecutions.delete(eventPtr);
          expiredEventPtrs.add(eventPtr);
          hasChanged = true;
        }
      });
      this._cumulatedEventExecutions.forEach((execution, eventPtr) => {
        if (execution.reportedAt <= expirationTime) {
          this._cumulatedEventExecutions.delete(eventPtr);
          expiredEventPtrs.add(eventPtr);
          hasChanged = true;
        }
      });

      if (hasChanged) this._notifyEvents(Array.from(expiredEventPtrs));
      // Events are expired on their own: an events entry left alone, with no
      // instruction under it anymore, must still be scheduled for expiration.
      if (
        this._instructionExecutions.size > 0 ||
        this._eventExecutions.size > 0 ||
        this._cumulatedEventExecutions.size > 0
      ) {
        this._scheduleExpiration();
      }
    }, HIGHLIGHT_DURATION_MS);
  }
}

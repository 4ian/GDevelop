// @flow
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';

/**
 * The speed a game plays at while debugged: normal, or slowed down to see the
 * instructions being executed one after the other in the events sheets.
 */
export type DebuggerPlaySpeed = 'normal' | 'slow';

/**
 * How to start a preview for the debugger: at the given play speed, or at the
 * speed already chosen when omitted.
 */
export type LaunchDebuggerAndPreviewOptions = {|
  playSpeed?: DebuggerPlaySpeed,
|};

export const SLOW_PLAY_SPEED_GAME_SPEED_FACTOR = 0.1;

export const getGameSpeedFactorForPlaySpeed = (
  playSpeed: DebuggerPlaySpeed
): number => (playSpeed === 'slow' ? SLOW_PLAY_SPEED_GAME_SPEED_FACTOR : 1);

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

/** The value an expression takes on one instance of the object it reads. */
export type InstanceEvaluation = {|
  /** The identifier of the instance in the running game (stable). */
  id: number,
  /**
   * The object the instance is of. Only worth showing for a group, whose
   * instances are of several objects.
   */
  objectName?: string,
  result: any,
|};

/** What the game answers when asked to evaluate an expression. */
export type ExpressionEvaluation = {|
  result?: any,
  /**
   * How many instances the object read by the expression has. The value above
   * is the one of the first of them: this is what says so.
   */
  instancesCount?: number,
  /** Only when the editor asked for every instance, and up to a fixed count. */
  instances?: ?Array<InstanceEvaluation>,
  /** The value of each variable used by the expression, keyed by its text. */
  variables: { [variableExpression: string]: any },
  error?: string,
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
 * Keep what the previews report about the execution of their events, and
 * notify the listeners (the events sheets) of any change.
 *
 * It lives outside of React on purpose: reports arrive several times per
 * second and must not re-render the whole editor, only the instructions and
 * events that are concerned.
 */
export class EventsExecutionTrackingStore {
  _instructionExecutions: Map<string, InstructionExecution> = new Map();
  _eventExecutions: Map<number, InstructionExecution> = new Map();
  /**
   * The listeners of each event, so that a report only wakes up the rows that
   * it concerns: an events sheet has one listener per instruction, and waking
   * them all up several times per second would be far too expensive.
   */
  _listenersByEventPtr: Map<number, Set<() => void>> = new Map();
  _expirationTimeoutId: TimeoutID | null = null;
  /**
   * What each event took with everything under it, so that a group can show
   * what its sub-events cost without the game reporting anything more.
   */
  _cumulatedEventExecutions: Map<number, CumulatedEventExecution> = new Map();
  /**
   * The parent of each event, one map per events sheet showing a tree. The
   * sheets fill their own map in place while they build their rows, and the
   * store only reads it.
   */
  _parentEventPtrsBySheet: Set<Map<number, number>> = new Set();
  _previewDebuggerServer: ?PreviewDebuggerServer = null;
  /**
   * The values of the game are only read while it is debugged: a preview
   * launched without the debugger is left alone.
   */
  _isDebuggerOpened: boolean = false;

  /**
   * The scene the running preview reports being in, so that the variables
   * offered and read are those of the scene actually playing, whatever the
   * scene opened in the editor.
   */
  _runningSceneName: string | null = null;

  setRunningSceneName(sceneName: string | null): void {
    this._runningSceneName = sceneName;
  }

  getRunningSceneName(): string | null {
    return this._runningSceneName;
  }

  /**
   * Closing the debugger forgets what the previews reported: nobody is
   * looking at the last frame anymore, and leaving it highlighted would keep
   * durations shown on the events sheets forever.
   */
  setDebuggerOpened(isDebuggerOpened: boolean): void {
    if (this._isDebuggerOpened === isDebuggerOpened) return;
    this._isDebuggerOpened = isDebuggerOpened;
    if (!isDebuggerOpened) {
      this.setHighlightsPersistent(false);
      this.clear();
    }
  }

  /**
   * The last preview was closed: its last frame stays shown as long as the
   * debugger is opened (like a paused game), and is forgotten otherwise.
   */
  onAllPreviewsClosed(): void {
    if (this._isDebuggerOpened) {
      this.setHighlightsPersistent(true);
    } else {
      this.setHighlightsPersistent(false);
      this.clear();
    }
    this.setRunningSceneName(null);
  }
  /**
   * When the game advances frame by frame, what a frame executed stays
   * highlighted until the next frame instead of fading out.
   */
  _areHighlightsPersistent: boolean = false;

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

  /** The expressions of the "watched variables" panel, kept while it's closed. */
  _watchedExpressions: Array<string> = [];

  getWatchedExpressions(): Array<string> {
    return this._watchedExpressions;
  }

  addWatchedExpression(expression: string): void {
    if (this._watchedExpressions.includes(expression)) return;
    this._watchedExpressions = [...this._watchedExpressions, expression];
  }

  /** The watched variables belong to a project: closing it forgets them. */
  clearWatchedExpressions(): void {
    this._watchedExpressions = [];
  }

  removeWatchedExpression(expression: string): void {
    this._watchedExpressions = this._watchedExpressions.filter(
      watchedExpression => watchedExpression !== expression
    );
  }

  setPreviewDebuggerServer(previewDebuggerServer: ?PreviewDebuggerServer) {
    this._previewDebuggerServer = previewDebuggerServer;
  }

  /**
   * The preview to ask for values. Only a real preview is considered: a game
   * embedded in an editor answers on the same channel, but much faster (it is
   * in the same process), so it would always win the race and answer for a
   * scene that is not the one being debugged.
   */
  _getTargetPreviewDebuggerId(): ?DebuggerId {
    if (!this._previewDebuggerServer) return null;
    const previewDebuggerIds = this._previewDebuggerServer.getExistingPreviewDebuggerIds();
    return previewDebuggerIds.length > 0 ? previewDebuggerIds[0] : null;
  }

  hasRunningPreview(): boolean {
    return this._isDebuggerOpened && this._getTargetPreviewDebuggerId() != null;
  }

  /**
   * Ask the running preview to evaluate the codes generated for expressions
   * (see `LayoutCodeGenerator.generateExpressionEvaluationCode`), all of them
   * in a single round trip. Resolves to null if no preview answers.
   */
  async evaluateExpressions(
    codes: Array<string>
  ): Promise<Array<ExpressionEvaluation | null> | null> {
    const previewDebuggerServer = this._previewDebuggerServer;
    const debuggerId = this._getTargetPreviewDebuggerId();
    if (!previewDebuggerServer || !this._isDebuggerOpened || debuggerId == null)
      return null;
    if (!codes.length) return [];

    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse(
        {
          command: 'evaluateExpression',
          payload: { codes },
        },
        debuggerId
      );
      return answer.payload || null;
    } catch (error) {
      // The preview did not answer in time (closed, paused...).
      return null;
    }
  }

  /** Evaluate a single expression (see `evaluateExpressions`). */
  async evaluateExpression(code: string): Promise<ExpressionEvaluation | null> {
    const evaluations = await this.evaluateExpressions([code]);
    return evaluations ? evaluations[0] || null : null;
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

  _ingestOrThrow(output: EventsExecutionTrackerOutput): void {
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

  _notifyAll(): void {
    this._listenersByEventPtr.forEach(listeners =>
      listeners.forEach(listener => listener())
    );
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

/**
 * Format a value evaluated by the game, for display. Strings are quoted, to
 * tell them apart from a number or from a keyword; `quoteStrings` drops the
 * quotes where the type of the value is already shown by an icon.
 */
export const formatEvaluationValue = (
  value: any,
  maxLength: number = 200,
  quoteStrings: boolean = true
): string => {
  if (value === undefined) return 'undefined';
  const text =
    typeof value === 'string'
      ? quoteStrings
        ? `"${value}"`
        : value
      : JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
};

export const formatExecutionDuration = (durationMs: number): string =>
  durationMs < 0.01 ? '< 0.01 ms' : `${durationMs.toFixed(2)} ms`;

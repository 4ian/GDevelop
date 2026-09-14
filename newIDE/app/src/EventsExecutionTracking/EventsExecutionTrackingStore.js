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

/** What the game answers when asked to evaluate an expression. */
export type ExpressionEvaluation = {|
  result?: any,
  /** The value of each variable used by the expression, keyed by its text. */
  variables: { [variableExpression: string]: any },
  error?: string,
|};

/** An executed instruction is highlighted for this long after being reported. */
const HIGHLIGHT_DURATION_MS = 700;

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

  setDebuggerOpened(isDebuggerOpened: boolean): void {
    this._isDebuggerOpened = isDebuggerOpened;
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

    this._notifyEvents(eventDurations.keys());
    if (previouslyShownEventPtrs) {
      this._notifyEvents(
        previouslyShownEventPtrs.filter(
          eventPtr => !eventDurations.has(eventPtr)
        )
      );
    }
    if (!this._areHighlightsPersistent) this._scheduleExpiration();
  }

  clear(): void {
    if (this._expirationTimeoutId) {
      clearTimeout(this._expirationTimeoutId);
      this._expirationTimeoutId = null;
    }
    if (
      this._instructionExecutions.size === 0 &&
      this._eventExecutions.size === 0
    ) {
      return;
    }
    const shownEventPtrs = Array.from(this._eventExecutions.keys());
    this._instructionExecutions.clear();
    this._eventExecutions.clear();
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

      this._instructionExecutions.forEach((execution, id) => {
        if (execution.reportedAt <= expirationTime) {
          this._instructionExecutions.delete(id);
          hasChanged = true;
        }
      });
      const expiredEventPtrs = [];
      this._eventExecutions.forEach((execution, eventPtr) => {
        if (execution.reportedAt <= expirationTime) {
          this._eventExecutions.delete(eventPtr);
          expiredEventPtrs.push(eventPtr);
          hasChanged = true;
        }
      });

      if (hasChanged) this._notifyEvents(expiredEventPtrs);
      if (this._instructionExecutions.size > 0) this._scheduleExpiration();
    }, HIGHLIGHT_DURATION_MS);
  }
}

/** Format a value evaluated by the game, for display. */
export const formatEvaluationValue = (
  value: any,
  maxLength: number = 200
): string => {
  if (value === undefined) return 'undefined';
  const text = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
  if (text === undefined) return String(value);
  return text.length > maxLength ? text.substring(0, maxLength) + '…' : text;
};

export const formatExecutionDuration = (durationMs: number): string =>
  durationMs < 0.01 ? '< 0.01 ms' : `${durationMs.toFixed(2)} ms`;

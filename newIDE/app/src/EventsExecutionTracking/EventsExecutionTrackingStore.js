// @flow
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';

/**
 * How the execution of the events of a preview is followed by the editor:
 * not at all, at the normal speed of the game, or with the game slowed down
 * to see the instructions being executed one after the other.
 */
export type EventsExecutionTrackingMode =
  | 'off'
  | 'normal-speed'
  | 'slow-speed'
  // The game is paused and only advances one frame at a time, on demand.
  | 'frame-by-frame';

export const SLOW_SPEED_GAME_SPEED_FACTOR = 0.1;

export const getGameSpeedFactorForMode = (
  mode: EventsExecutionTrackingMode
): number => (mode === 'slow-speed' ? SLOW_SPEED_GAME_SPEED_FACTOR : 1);

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
  _listeners: Set<() => void> = new Set();
  _expirationTimeoutId: TimeoutID | null = null;
  _previewDebuggerServer: ?PreviewDebuggerServer = null;
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

  /** Ask the paused previews to advance of one frame. */
  stepOneFrame(): void {
    const previewDebuggerServer = this._previewDebuggerServer;
    if (!previewDebuggerServer) return;
    previewDebuggerServer.getExistingPreviewDebuggerIds().forEach(id => {
      previewDebuggerServer.sendMessage(id, { command: 'stepFrame' });
    });
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

  removeWatchedExpression(expression: string): void {
    this._watchedExpressions = this._watchedExpressions.filter(
      watchedExpression => watchedExpression !== expression
    );
  }

  setPreviewDebuggerServer(previewDebuggerServer: ?PreviewDebuggerServer) {
    this._previewDebuggerServer = previewDebuggerServer;
  }

  hasRunningPreview(): boolean {
    return (
      !!this._previewDebuggerServer &&
      this._previewDebuggerServer.getExistingPreviewDebuggerIds().length > 0
    );
  }

  /**
   * Ask the running preview to evaluate the code generated for an expression
   * (see `LayoutCodeGenerator.generateExpressionEvaluationCode`).
   * Resolves to null if no preview answers.
   */
  async evaluateExpression(code: string): Promise<ExpressionEvaluation | null> {
    if (!this._previewDebuggerServer || !this.hasRunningPreview()) return null;

    try {
      const answer = await this._previewDebuggerServer.sendMessageWithResponse({
        command: 'evaluateExpression',
        payload: { code },
      });
      return answer.payload || null;
    } catch (error) {
      // The preview did not answer in time (closed, paused...).
      return null;
    }
  }

  ingest(output: EventsExecutionTrackerOutput): void {
    const reportedAt = Date.now();
    const eventDurations: Map<number, number> = new Map();
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

    this._notify();
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
    this._instructionExecutions.clear();
    this._eventExecutions.clear();
    this._notify();
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

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  _notify(): void {
    this._listeners.forEach(listener => listener());
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
      this._eventExecutions.forEach((execution, eventPtr) => {
        if (execution.reportedAt <= expirationTime) {
          this._eventExecutions.delete(eventPtr);
          hasChanged = true;
        }
      });

      if (hasChanged) this._notify();
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

// @flow
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';
import {
  ExecutionHighlightsStore,
  type EventsExecutionTrackerOutput,
  type InstructionExecution,
  type CumulatedEventExecution,
} from './ExecutionHighlightsStore';
import {
  PreviewExpressionEvaluator,
  type ExpressionEvaluation,
} from './PreviewExpressionEvaluator';

export type {
  EventsExecutionTrackerOutput,
  InstructionExecution,
  CumulatedEventExecution,
} from './ExecutionHighlightsStore';
export { getInstructionExecutionId } from './ExecutionHighlightsStore';
export type {
  InstanceEvaluation,
  ExpressionEvaluation,
} from './PreviewExpressionEvaluator';

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

/**
 * What the editor knows about the previews being debugged, for the events
 * sheets and the watched variables panel: the executions highlighted in the
 * sheets (see ExecutionHighlightsStore), the values read from the running
 * preview (see PreviewExpressionEvaluator), the watched expressions and the
 * scene the preview runs.
 *
 * It lives outside of React on purpose: reports arrive several times per
 * second and must not re-render the whole editor, only the instructions and
 * events that are concerned.
 */
export class EventsExecutionTrackingStore {
  _executionHighlights: ExecutionHighlightsStore = new ExecutionHighlightsStore();
  _previewExpressionEvaluator: PreviewExpressionEvaluator = new PreviewExpressionEvaluator();
  /** The expressions of the "watched variables" panel, kept while it's closed. */
  _watchedExpressions: Array<string> = [];
  _watchedExpressionsListeners: Set<() => void> = new Set();
  /**
   * The scene the running preview reports being in, so that the variables
   * offered and read are those of the scene actually playing, whatever the
   * scene opened in the editor.
   */
  _runningSceneName: string | null = null;
  _runningSceneNameListeners: Set<() => void> = new Set();

  setRunningSceneName(sceneName: string | null): void {
    if (this._runningSceneName === sceneName) return;
    this._runningSceneName = sceneName;
    this._runningSceneNameListeners.forEach(listener => listener());
  }

  getRunningSceneName(): string | null {
    return this._runningSceneName;
  }

  /** Listen to the changes of the scene the running preview is in. */
  subscribeToRunningSceneName(listener: () => void): () => void {
    this._runningSceneNameListeners.add(listener);
    return () => {
      this._runningSceneNameListeners.delete(listener);
    };
  }

  /**
   * Closing the debugger forgets what the previews reported: nobody is
   * looking at the last frame anymore, and leaving it highlighted would keep
   * durations shown on the events sheets forever.
   */
  setDebuggerOpened(isDebuggerOpened: boolean): void {
    if (
      this._previewExpressionEvaluator.isDebuggerOpened() === isDebuggerOpened
    )
      return;
    this._previewExpressionEvaluator.setDebuggerOpened(isDebuggerOpened);
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
    if (this._previewExpressionEvaluator.isDebuggerOpened()) {
      this.setHighlightsPersistent(true);
    } else {
      this.setHighlightsPersistent(false);
      this.clear();
    }
    this.setRunningSceneName(null);
  }

  // Watched expressions.

  getWatchedExpressions(): Array<string> {
    return this._watchedExpressions;
  }

  /** Listen to the expressions being watched, or not anymore. */
  subscribeToWatchedExpressions(listener: () => void): () => void {
    this._watchedExpressionsListeners.add(listener);
    return () => {
      this._watchedExpressionsListeners.delete(listener);
    };
  }

  _setWatchedExpressions(watchedExpressions: Array<string>): void {
    this._watchedExpressions = watchedExpressions;
    this._watchedExpressionsListeners.forEach(listener => listener());
  }

  addWatchedExpression(expression: string): void {
    if (this._watchedExpressions.includes(expression)) return;
    this._setWatchedExpressions([...this._watchedExpressions, expression]);
  }

  /** The watched variables belong to a project: closing it forgets them. */
  clearWatchedExpressions(): void {
    if (this._watchedExpressions.length === 0) return;
    this._setWatchedExpressions([]);
  }

  removeWatchedExpression(expression: string): void {
    if (!this._watchedExpressions.includes(expression)) return;
    this._setWatchedExpressions(
      this._watchedExpressions.filter(
        watchedExpression => watchedExpression !== expression
      )
    );
  }

  // Values of the running preview (see PreviewExpressionEvaluator).

  setPreviewDebuggerServer(previewDebuggerServer: ?PreviewDebuggerServer) {
    this._previewExpressionEvaluator.setPreviewDebuggerServer(
      previewDebuggerServer
    );
  }

  setTargetDebuggerId(debuggerId: ?DebuggerId): void {
    this._previewExpressionEvaluator.setTargetDebuggerId(debuggerId);
  }

  hasConnectedPreview(): boolean {
    return this._previewExpressionEvaluator.hasConnectedPreview();
  }

  hasRunningPreview(): boolean {
    return this._previewExpressionEvaluator.hasRunningPreview();
  }

  evaluateExpressions(
    codes: Array<string>,
    options: {| maxInstancesCount?: number |} = {}
  ): Promise<Array<ExpressionEvaluation | null> | null> {
    return this._previewExpressionEvaluator.evaluateExpressions(codes, options);
  }

  evaluateExpression(code: string): Promise<ExpressionEvaluation | null> {
    return this._previewExpressionEvaluator.evaluateExpression(code);
  }

  // Executions highlighted in the events sheets (see ExecutionHighlightsStore).

  setHighlightsPersistent(areHighlightsPersistent: boolean): void {
    this._executionHighlights.setHighlightsPersistent(areHighlightsPersistent);
  }

  ingest(output: EventsExecutionTrackerOutput): void {
    this._executionHighlights.ingest(output);
  }

  onEventsModified(): void {
    this._executionHighlights.onEventsModified();
  }

  onEventsCodeGenerated(): void {
    this._executionHighlights.onEventsCodeGenerated();
  }

  clear(): void {
    this._executionHighlights.clear();
  }

  getInstructionExecution(
    eventPtr: number,
    isCondition: boolean,
    indexInList: number
  ): InstructionExecution | null {
    return this._executionHighlights.getInstructionExecution(
      eventPtr,
      isCondition,
      indexInList
    );
  }

  getEventExecution(eventPtr: number): InstructionExecution | null {
    return this._executionHighlights.getEventExecution(eventPtr);
  }

  getCumulatedEventExecution(eventPtr: number): CumulatedEventExecution | null {
    return this._executionHighlights.getCumulatedEventExecution(eventPtr);
  }

  registerEventsHierarchy(parentEventPtrs: Map<number, number>): void {
    this._executionHighlights.registerEventsHierarchy(parentEventPtrs);
  }

  unregisterEventsHierarchy(parentEventPtrs: Map<number, number>): void {
    this._executionHighlights.unregisterEventsHierarchy(parentEventPtrs);
  }

  subscribe(eventPtr: number, listener: () => void): () => void {
    return this._executionHighlights.subscribe(eventPtr, listener);
  }
}

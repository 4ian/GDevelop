// @flow
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';

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

/**
 * Ask the running preview for the values of expressions (the live values of
 * the events sheets and of the watched variables), choosing which preview
 * answers when several run.
 */
export class PreviewExpressionEvaluator {
  _previewDebuggerServer: ?PreviewDebuggerServer = null;
  /** The preview chosen in the debugger: the events sheets read its values. */
  _targetDebuggerId: ?DebuggerId = null;
  /**
   * The values of the game are only read while it is debugged: a preview
   * launched without the debugger is left alone.
   */
  _isDebuggerOpened: boolean = false;

  setPreviewDebuggerServer(previewDebuggerServer: ?PreviewDebuggerServer) {
    this._previewDebuggerServer = previewDebuggerServer;
  }

  setTargetDebuggerId(debuggerId: ?DebuggerId): void {
    this._targetDebuggerId = debuggerId;
  }

  setDebuggerOpened(isDebuggerOpened: boolean): void {
    this._isDebuggerOpened = isDebuggerOpened;
  }

  isDebuggerOpened(): boolean {
    return this._isDebuggerOpened;
  }

  /**
   * The preview to ask for values: the one chosen in the debugger, or else the
   * first one. Only a real preview is considered: a game embedded in an editor
   * answers on the same channel, but much faster (it is in the same process),
   * so it would always win the race and answer for a scene that is not the
   * one being debugged.
   */
  _getTargetPreviewDebuggerId(): ?DebuggerId {
    if (!this._previewDebuggerServer) return null;
    const previewDebuggerIds = this._previewDebuggerServer.getExistingPreviewDebuggerIds();
    const targetDebuggerId = this._targetDebuggerId;
    if (
      targetDebuggerId != null &&
      previewDebuggerIds.includes(targetDebuggerId)
    ) {
      return targetDebuggerId;
    }
    return previewDebuggerIds.length > 0 ? previewDebuggerIds[0] : null;
  }

  /**
   * A preview runs, whether the debugger is opened or not: the values can be
   * read only while it is (see `hasRunningPreview`).
   */
  hasConnectedPreview(): boolean {
    return this._getTargetPreviewDebuggerId() != null;
  }

  hasRunningPreview(): boolean {
    return this._isDebuggerOpened && this._getTargetPreviewDebuggerId() != null;
  }

  /**
   * Ask the running preview to evaluate the codes generated for expressions
   * (see `LayoutCodeGenerator.generateExpressionEvaluationCode`), all of them
   * in a single round trip. Resolves to null if no preview answers.
   *
   * `maxInstancesCount` caps the instances the game sends for the codes
   * evaluated on every instance: only what is shown travels.
   */
  async evaluateExpressions(
    codes: Array<string>,
    { maxInstancesCount }: {| maxInstancesCount?: number |} = {}
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
          payload: { codes, maxInstancesCount },
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
}

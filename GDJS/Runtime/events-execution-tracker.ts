/*
 * GDevelop JS Platform
 * Copyright 2013-2026 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * What the tracker reports: the duration (in milliseconds) of the last
   * execution of each instruction that ran since the previous report.
   *
   * @category Debugging > Events execution tracker
   */
  export type EventsExecutionTrackerOutput = {
    instructionDurations: Record<string, float>;
  };

  /**
   * Records which instructions of the events are executed and how long each
   * one takes, so that the editor can highlight them while a preview runs.
   *
   * Instructions are identified by the ids that the code generator emits, for
   * previews only, around each condition and action (the identity of the
   * event as known by the editor, followed by the kind and index of the
   * instruction). Reports are throttled: the editor does not need more than a
   * few updates per second.
   *
   * @category Debugging > Events execution tracker
   */
  export class EventsExecutionTracker {
    private _startTimes: Record<string, float> = {};
    private _pendingOutput: EventsExecutionTrackerOutput | null = null;
    /** `null` until the first report, which is never delayed. */
    private _lastReportTime: float | null = null;
    private readonly _reportIntervalMs: float;
    private readonly _onReport: (output: EventsExecutionTrackerOutput) => void;
    /** Corresponds to performance.now() when available. */
    private readonly _getTimeNow: () => float;

    /**
     * @param onReport Called, at most every `reportIntervalMs`, with what ran.
     * @param reportIntervalMs Minimum delay between two reports.
     */
    constructor(
      onReport: (output: EventsExecutionTrackerOutput) => void,
      reportIntervalMs: float = 100
    ) {
      this._onReport = onReport;
      this._reportIntervalMs = reportIntervalMs;
      this._getTimeNow =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
          ? performance.now.bind(performance)
          : Date.now;
    }

    /**
     * Called by the generated code just before an instruction runs.
     */
    begin(instructionExecutionId: string): void {
      this._startTimes[instructionExecutionId] = this._getTimeNow();
    }

    /**
     * Called by the generated code just after an instruction ran.
     */
    end(instructionExecutionId: string): void {
      const startTime = this._startTimes[instructionExecutionId];
      if (startTime === undefined) return;

      if (!this._pendingOutput) {
        this._pendingOutput = { instructionDurations: {} };
      }
      this._pendingOutput.instructionDurations[instructionExecutionId] =
        this._getTimeNow() - startTime;
    }

    /**
     * Report what ran, if anything did and enough time elapsed since the
     * previous report. To be called once per frame by the game.
     */
    onFrameEnded(): void {
      if (!this._pendingOutput) return;

      const now = this._getTimeNow();
      if (
        this._lastReportTime !== null &&
        now - this._lastReportTime < this._reportIntervalMs
      ) {
        return;
      }

      this._lastReportTime = now;
      this.flush();
    }

    /**
     * Report immediately what ran since the previous report, if anything did.
     */
    flush(): void {
      const output = this._pendingOutput;
      if (!output) return;

      this._pendingOutput = null;
      this._onReport(output);
    }
  }

  /**
   * The tracker used by the generated code of previews, or `null` when the
   * editor did not ask to follow the execution of the events.
   * See `RuntimeGame.startEventsExecutionTracking`.
   *
   * @category Debugging > Events execution tracker
   */
  export let eventsExecutionTracker: EventsExecutionTracker | null = null;
}

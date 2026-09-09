/*
 * GDevelop JS Platform
 * Copyright 2013-2026 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  const logger = new gdjs.Logger('Events execution tracker');

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
    /**
     * The instruction being executed and when it started. Instructions are
     * never nested (the generated code wraps each one of them separately),
     * so a single pair is enough: no map to look up, nothing to allocate.
     */
    private _startedInstructionId: string | null = null;
    private _startedAt: float = 0;
    /** Durations of the instructions that ran since the last report. */
    private _durations: Map<string, float> = new Map();
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
      this._startedInstructionId = instructionExecutionId;
      this._startedAt = this._getTimeNow();
    }

    /**
     * Called by the generated code just after an instruction ran.
     */
    end(instructionExecutionId: string): void {
      if (this._startedInstructionId !== instructionExecutionId) return;

      this._durations.set(
        instructionExecutionId,
        this._getTimeNow() - this._startedAt
      );
      this._startedInstructionId = null;
    }

    /**
     * Report what ran, if anything did and enough time elapsed since the
     * previous report. To be called once per frame by the game.
     */
    onFrameEnded(): void {
      if (this._durations.size === 0) return;

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
      if (this._durations.size === 0) return;

      // Built only when reporting: the durations are collected in a map,
      // which is much cheaper to fill than an object with dynamic keys.
      const instructionDurations: Record<string, float> = {};
      this._durations.forEach((durationMs, instructionExecutionId) => {
        instructionDurations[instructionExecutionId] = durationMs;
      });
      this._durations.clear();

      try {
        this._onReport({ instructionDurations });
      } catch (error) {
        logger.error(
          'Unable to report the executed instructions to the debugger:',
          error
        );
      }
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

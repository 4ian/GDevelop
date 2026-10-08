// @ts-check
describe('gdjs.EventsExecutionTracker', () => {
  /**
   * @param {number} reportIntervalMs
   */
  const makeTracker = (reportIntervalMs) => {
    /** @type {gdjs.EventsExecutionTrackerOutput[]} */
    const reports = [];
    const tracker = new gdjs.EventsExecutionTracker(
      (output) => reports.push(output),
      reportIntervalMs
    );
    return { tracker, reports };
  };

  it('reports the duration of the last execution of each instruction', () => {
    const { tracker, reports } = makeTracker(0);

    tracker.begin('123:c0');
    tracker.end('123:c0');
    tracker.begin('123:a0');
    tracker.end('123:a0');
    // Executed twice in the same frame: only the last execution is kept.
    tracker.begin('123:c0');
    tracker.end('123:c0');
    expect(reports.length).to.be(0);

    tracker.onFrameEnded();
    expect(reports.length).to.be(1);
    const durations = reports[0].instructionDurations;
    expect(Object.keys(durations).sort()).to.eql(['123:a0', '123:c0']);
    expect(durations['123:c0'] >= 0).to.be(true);
    expect(durations['123:a0'] >= 0).to.be(true);
  });

  it('measures an action calling a function whose events are tracked too', () => {
    const { tracker, reports } = makeTracker(0);

    tracker.begin('123:a0');
    // The events of the function called by the action.
    tracker.begin('456:c0');
    tracker.end('456:c0');
    tracker.begin('456:a0');
    tracker.end('456:a0');
    tracker.end('123:a0');

    tracker.onFrameEnded();
    const durations = reports[0].instructionDurations;
    expect(Object.keys(durations).sort()).to.eql([
      '123:a0',
      '456:a0',
      '456:c0',
    ]);
    // The action includes what the function did.
    expect(durations['123:a0'] >= durations['456:a0']).to.be(true);
  });

  it('keeps measuring after an instruction left without its end', () => {
    const { tracker, reports } = makeTracker(0);

    tracker.begin('123:a0');
    // An exception thrown in this one: its end is never called.
    tracker.begin('456:a0');
    tracker.end('123:a0');
    tracker.begin('123:a1');
    tracker.end('123:a1');

    tracker.onFrameEnded();
    const durations = reports[0].instructionDurations;
    expect(Object.keys(durations).sort()).to.eql(['123:a0', '123:a1']);
  });

  it('does not report anything when nothing ran', () => {
    const { tracker, reports } = makeTracker(0);

    tracker.onFrameEnded();
    tracker.flush();
    expect(reports.length).to.be(0);

    // An end without a begin is ignored.
    tracker.end('123:a0');
    tracker.onFrameEnded();
    expect(reports.length).to.be(0);
  });

  it('throttles the reports but flushes on demand', () => {
    const { tracker, reports } = makeTracker(60 * 60 * 1000);

    tracker.begin('123:a0');
    tracker.end('123:a0');
    tracker.onFrameEnded();
    // First report is always sent.
    expect(reports.length).to.be(1);

    tracker.begin('123:a1');
    tracker.end('123:a1');
    tracker.onFrameEnded();
    // Too early for a second report.
    expect(reports.length).to.be(1);

    tracker.flush();
    expect(reports.length).to.be(2);
    expect(Object.keys(reports[1].instructionDurations)).to.eql(['123:a1']);

    // Nothing pending anymore.
    tracker.flush();
    expect(reports.length).to.be(2);
  });
});

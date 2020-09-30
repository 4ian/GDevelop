/**
 * Firebase Tools Collection.
 * @fileoverview
 * @author arthuro555
 */

/**
 * Firebase Performance Event Tools.
 * @namespace
 */
gdjs.evtTools.firebase.performance = {
  /** @type {Object.<string, firebase.performance.Trace>} */
  tracers: {},
};

/**
 * Get a tracer (custom event) by name, if it doesn't exists create it.
 * @param {string} tracerName - The name of the tracer.
 * @returns {firebase.performance.Trace} The tracer instance.
 */
gdjs.evtTools.firebase.performance.getTracer = function (tracerName) {
  if (!gdjs.evtTools.firebase.performance.tracers.hasOwnProperty(tracerName)) {
    gdjs.evtTools.firebase.performance.tracers[
      tracerName
    ] = firebase.performance().trace(tracerName);
  }
  return gdjs.evtTools.firebase.performance.tracers[tracerName];
};

/**
 * Start measuring performance for a custom event (tracer).
 * @param {string} tracerName - The name of the tracer.
 */
gdjs.evtTools.firebase.performance.startTracer = function (tracerName) {
  gdjs.evtTools.firebase.performance.getTracer(tracerName).start();
};

/**
 * Stop measuring performance for a custom event (tracer).
 * @param {string} tracerName - The name of the tracer.
 */
gdjs.evtTools.firebase.performance.stopTracer = function (tracerName) {
  gdjs.evtTools.firebase.performance.getTracer(tracerName).stop();
  delete gdjs.evtTools.firebase.performance.tracers[tracerName];
};

/**
 * Record performance for a specific time.
 * @param {string} tracerName - The name of the tracer.
 * @param {number} delay - The delay before starting measuring.
 * @param {number} duration - The duration of the measuring.
 */
gdjs.evtTools.firebase.performance.recordPerformance = function (
  tracerName,
  delay,
  duration
) {
  let currentTimeSinceEpoch = Date.now();
  gdjs.evtTools.firebase.performance
    .getTracer(tracerName)
    .record(currentTimeSinceEpoch + delay, duration);
};

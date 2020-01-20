// @ts-check

/**
 * A basic profiling tool that can be used to measure time spent in sections of the engine.
 * @class Profiler
 * @see gdjs.RuntimeGame
 * @memberof gdjs
 */
gdjs.Profiler = function() {
  this._framesMeasures = []; // All the measures for the last frames
  this._currentFrameIndex = 0;
  this._currentFrameMeasure = null; // The measures being done
  this._currentSection = null; // The section being measured

  this._maxFramesCount = 600;
  this._framesCount = 0; // The number of frames that have been measured
  while (this._framesMeasures.length < this._maxFramesCount) {
    this._framesMeasures.push({
      parent: null,
      time: 0,
      subsections: {},
      counters: {},
      timings: {},
    });
  }

  this._getTimeNow =
    window.performance && typeof window.performance.now === 'function'
      ? window.performance.now.bind(window.performance)
      : Date.now;
};

gdjs.Profiler.prototype.beginFrame = function() {
  this._currentFrameMeasure = {
    parent: null,
    time: 0,
    lastStartTime: this._getTimeNow(),
    subsections: {},
    counters: {},
    timings: {},
  };
  this._currentSection = this._currentFrameMeasure;
};

gdjs.Profiler.prototype.begin = function(sectionName) {
  // Push the new section
  var subsections = this._currentSection.subsections;
  var subsection = (subsections[sectionName] = subsections[sectionName] || {
    parent: this._currentSection,
    time: 0,
    lastStartTime: 0,
    subsections: {},
  });
  this._currentSection = subsection;

  // Start the timer
  this._currentSection.lastStartTime = this._getTimeNow();
};

gdjs.Profiler.prototype.end = function(sectionName) {
  // Stop the timer
  var sectionTime = this._getTimeNow() - this._currentSection.lastStartTime;
  this._currentSection.time = (this._currentSection.time || 0) + sectionTime;

  // Pop the section
  this._currentSection = this._currentSection.parent;
};

/**
 * Increment a counter for the current frame.
 * @param {string} counterName The name of the counter
 */
gdjs.Profiler.prototype.incrementCallCounter = function(counterName) {
  this._currentFrameMeasure.counters[counterName] =
    (this._currentFrameMeasure.counters[counterName] || 0) + 1;
};

/**
 * Increment some timing for the current frame.
 * @param {string} timingName The name of the timing
 * @param {number} timeInMs The time in milliseconds
 */
gdjs.Profiler.prototype.addTime = function(timingName, timeInMs) {
  this._currentFrameMeasure.timings[timingName] =
    (this._currentFrameMeasure.timings[timingName] || 0) + timeInMs;
};

gdjs.Profiler.prototype.endFrame = function() {
  if (this._currentSection.parent !== null) {
    throw new Error(
      'Mismatch in profiler, endFrame should be called on root section'
    );
  }

  this.end();

  this._framesCount++;
  if (this._framesCount > this._maxFramesCount)
    this._framesCount = this._maxFramesCount;
  this._framesMeasures[this._currentFrameIndex] = this._currentFrameMeasure;
  this._currentFrameIndex++;
  if (this._currentFrameIndex >= this._maxFramesCount)
    this._currentFrameIndex = 0;
};

gdjs.Profiler._addAverageSectionTimes = function(
  section,
  destinationSection,
  totalCount,
  i
) {
  destinationSection.time =
    (destinationSection.time || 0) + section.time / totalCount;
  for (var sectionName in section.subsections) {
    if (section.subsections.hasOwnProperty(sectionName)) {
      var destinationSubsections = destinationSection.subsections;
      var destinationSubsection = (destinationSubsections[
        sectionName
      ] = destinationSubsections[sectionName] || {
        parent: destinationSection,
        time: 0,
        subsections: {},
      });

      gdjs.Profiler._addAverageSectionTimes(
        section.subsections[sectionName],
        destinationSubsection,
        totalCount,
        i
      );
    }
  }
};

/**
 * Return the measures for all the section of the game during the frames
 * captured.
 */
gdjs.Profiler.prototype.getFramesAverageMeasures = function() {
  var framesAverageMeasures = {
    parent: null,
    time: 0,
    subsections: {},
    counters: {},
    timings: {},
  };

  for (var i = 0; i < this._framesCount; ++i) {
    gdjs.Profiler._addAverageSectionTimes(
      this._framesMeasures[i],
      framesAverageMeasures,
      this._framesCount,
      i
    );

    // Compute the sum for the counters and timings
    for(var counterName in this._framesMeasures[i].counters) {
      framesAverageMeasures.counters[counterName] = (framesAverageMeasures.counters[counterName] || 0) +
        this._framesMeasures[i].counters[counterName];
    }
    for(var timingName in this._framesMeasures[i].timings) {
      framesAverageMeasures.timings[timingName] = (framesAverageMeasures.timings[timingName] || 0) +
        this._framesMeasures[i].timings[timingName];
    }
  }

  // Compute average for counters and timings
  for(var counterName in framesAverageMeasures.counters) {
    framesAverageMeasures.counters[counterName] /= this._framesCount;
  }
  for(var timingName in framesAverageMeasures.timings) {
    framesAverageMeasures.timings[timingName] /= this._framesCount;
  }

  return framesAverageMeasures;
};

/**
 * Get stats measured during the frames captured.
 */
gdjs.Profiler.prototype.getStats = function() {
  return {
    framesCount: this._framesCount,
  };
};

/**
 * Convert measures for a section into texts.
 * Useful for ingame profiling.
 *
 * @param {string} sectionName The name of the section
 * @param {*} profilerSection The section measures
 * @param {string[]} outputs The array where to push the results
 */
gdjs.Profiler.getProfilerSectionTexts = function(
  sectionName,
  profilerSection,
  outputs
) {
  var percent =
    profilerSection.parent && profilerSection.parent.time !== 0
      ? ((profilerSection.time / profilerSection.parent.time) * 100).toFixed(1)
      : '100%';
  var time = profilerSection.time.toFixed(2);
  outputs.push(sectionName + ': ' + time + 'ms (' + percent + ')');
  var subsectionsOutputs = [];

  for (var subsectionName in profilerSection.subsections) {
    if (profilerSection.subsections.hasOwnProperty(subsectionName)) {
      gdjs.Profiler.getProfilerSectionTexts(
        subsectionName,
        profilerSection.subsections[subsectionName],
        subsectionsOutputs
      );
    }
  }
  outputs.push.apply(outputs, subsectionsOutputs);
};

/**
 * Convert counters into texts.
 * Useful for ingame profiling.
 *
 * @param {Object.<string, number>} counters The counters that were measured
 * @param {string[]} outputs The array where to push the results
 */
gdjs.Profiler.getProfilerCounterTexts = function(
  counters,
  outputs
) {
  for (var counterName in counters) {
    outputs.push(counterName + ": " + counters[counterName]);
  }
};

/**
 * Convert timings into texts.
 * Useful for ingame profiling.
 *
 * @param {Object.<string, number>} timings The timings that were measured
 * @param {string[]} outputs The array where to push the results
 */
gdjs.Profiler.getProfilerTimingTexts = function(
  timings,
  outputs
) {
  for (var timingName in timings) {
    outputs.push(timingName + ": " + timings[timingName].toFixed(2) + "ms");
  }
};

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
  };

  for (var i = 0; i < this._framesCount; ++i) {
    gdjs.Profiler._addAverageSectionTimes(
      this._framesMeasures[i],
      framesAverageMeasures,
      this._framesCount,
      i
    );
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
 * @param {s} profilerSection The section measures
 * @param {*} outputs The array where to push the results
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

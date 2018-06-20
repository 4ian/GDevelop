/**
 * A basic profiling tool that can be used to measure time spent in sections of the engine
 */
gdjs.Profiler = function() {
  this._framesMeasures = []; // All the measures for the last frames
  this._currentFrameIndex = 0;
  this._currentFrameMeasure = null; // The measures being done
  this._currentSection = null; // The section being measured

  this._maxFramesCount = 30; //TODO: add framesCount
  // this._framesCount = 30; // The number of frames that have been measured
  while (this._framesMeasures.length < this._maxFramesCount) {
    this._framesMeasures.push({
      parent: null,
      time: 0,
      subsections: {}
    });
  }

  this._getTimeNow =
    window.performance && typeof window.performance.now === "function"
      ? window.performance.now.bind(window.performance)
      : Date.now;
};

gdjs.Profiler.prototype.beginFrame = function() {
  this._currentFrameMeasure = {
    parent: null,
    startTime: this._getTimeNow(),
    subsections: {}
  };
  this._currentSection = this._currentFrameMeasure;
};

gdjs.Profiler.prototype.begin = function(sectionName) {
  var subsections = this._currentSection.subsections;
  var subsection = (subsections[sectionName] = subsections[sectionName] || {
    parent: this._currentSection,
    startTime: this._getTimeNow(),
    subsections: {}
  });
  this._currentSection = subsection;
};

gdjs.Profiler.prototype.end = function(sectionName) {
  var sectionTime = this._getTimeNow() - this._currentSection.startTime;

  this._currentSection.time = (this._currentSection.time || 0) + sectionTime;
  this._currentSection = this._currentSection.parent;
};

gdjs.Profiler.prototype.endFrame = function() {
  if (this._currentSection.parent !== null) {
    throw new Error(
      "Mismatch in profiler, endFrame should be called on root section"
    );
  }

  this.end();

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
        subsections: {}
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

gdjs.Profiler.prototype.getFramesAverageMeasures = function() {
  var framesAverageMeasures = {
    parent: null,
    time: 0,
    subsections: {}
  };

  for (var i = 0; i < this._framesMeasures.length; ++i) {
    gdjs.Profiler._addAverageSectionTimes(
      this._framesMeasures[i],
      framesAverageMeasures,
      this._framesMeasures.length,
      i
    );
  }

  return framesAverageMeasures;
};

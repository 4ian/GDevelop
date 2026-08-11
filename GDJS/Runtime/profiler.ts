namespace gdjs {
  /**
   * @category Debugging > Profiler
   */
  export type ProfilerStats = {
    framesCount: integer;
  };

  /**
   * @category Debugging > Profiler
   */
  export type FrameMeasure = {
    parent: FrameMeasure | null;
    time: float;
    lastStartTime: float;
    subsections: Record<string, FrameMeasure>;
  };

  /**
   * Measures output by the profiler (see `getFramesAverageMeasures`): a
   * plain tree without back-references, safe to serialize with
   * `JSON.stringify`.
   * @category Debugging > Profiler
   */
  export type FrameMeasureOutput = {
    time: float;
    subsections: Record<string, FrameMeasureOutput>;
  };

  /**
   * A basic profiling tool that can be used to measure time spent in sections of the engine.
   * @category Debugging > Profiler
   */
  export class Profiler {
    /** All the measures for the last frames */
    _framesMeasures: Array<FrameMeasure> = [];

    _currentFrameIndex: float = 0;

    /** The measures being done */
    _currentFrameMeasure: FrameMeasure = {
      parent: null,
      time: 0,
      lastStartTime: 0,
      subsections: {},
    };

    /** The section being measured */
    _currentSection: FrameMeasure | null = null;

    _maxFramesCount: number = 600;

    /** The number of frames that have been measured */
    _framesCount: number = 0;

    /** A function to get the current time. If available, corresponds to performance.now(). */
    _getTimeNow: () => float;

    constructor() {
      while (this._framesMeasures.length < this._maxFramesCount) {
        this._framesMeasures.push({
          parent: null,
          time: 0,
          lastStartTime: 0,
          subsections: {},
        });
      }
      this._getTimeNow =
        window.performance && typeof window.performance.now === 'function'
          ? window.performance.now.bind(window.performance)
          : Date.now;
    }

    beginFrame(): void {
      this._currentFrameMeasure = {
        parent: null,
        time: 0,
        lastStartTime: this._getTimeNow(),
        subsections: {},
      };
      this._currentSection = this._currentFrameMeasure;
    }

    begin(sectionName: string): void {
      if (this._currentSection === null)
        throw new Error(
          'Impossible to call Profiler.begin() when not profiling a frame!'
        );

      // Push the new section
      const subsections = this._currentSection.subsections;
      const subsection = (subsections[sectionName] = subsections[
        sectionName
      ] || {
        parent: this._currentSection,
        time: 0,
        lastStartTime: 0,
        subsections: {},
      });
      this._currentSection = subsection;

      // Start the timer
      this._currentSection.lastStartTime = this._getTimeNow();
    }

    end(sectionName?: string): void {
      if (this._currentSection === null)
        throw new Error(
          'Impossible to call Profiler.end() when not profiling a frame!'
        );

      // Stop the timer
      const sectionTime =
        this._getTimeNow() - this._currentSection.lastStartTime;
      this._currentSection.time =
        (this._currentSection.time || 0) + sectionTime;

      // Pop the section
      if (this._currentSection.parent !== null)
        this._currentSection = this._currentSection.parent;
    }

    endFrame(): void {
      if (this._currentSection === null)
        throw new Error(
          'Impossible to end profiling a frame when profiling has not started a frame!'
        );
      if (this._currentSection.parent !== null) {
        throw new Error(
          'Mismatch in profiler, endFrame should be called on root section'
        );
      }
      this.end();
      this._framesCount++;
      if (this._framesCount > this._maxFramesCount) {
        this._framesCount = this._maxFramesCount;
      }
      this._framesMeasures[this._currentFrameIndex] = this
        ._currentFrameMeasure as FrameMeasure;
      this._currentFrameIndex++;
      if (this._currentFrameIndex >= this._maxFramesCount) {
        this._currentFrameIndex = 0;
      }
    }

    static _addAverageSectionTimes(
      section: FrameMeasure,
      destinationSection: FrameMeasureOutput,
      totalCount: integer,
      i: integer
    ): void {
      destinationSection.time =
        (destinationSection.time || 0) + section.time / totalCount;
      for (const sectionName in section.subsections) {
        if (section.subsections.hasOwnProperty(sectionName)) {
          const destinationSubsections = destinationSection.subsections;
          const destinationSubsection = (destinationSubsections[sectionName] =
            destinationSubsections[sectionName] || {
              time: 0,
              subsections: {},
            });
          Profiler._addAverageSectionTimes(
            section.subsections[sectionName],
            destinationSubsection,
            totalCount,
            i
          );
        }
      }
    }

    /**
     * Return the measures for all the section of the game during the frames
     * captured, as a plain tree (no back-references): safe to serialize
     * with `JSON.stringify`.
     */
    getFramesAverageMeasures(): FrameMeasureOutput {
      const framesAverageMeasures: FrameMeasureOutput = {
        time: 0,
        subsections: {},
      };
      for (let i = 0; i < this._framesCount; ++i) {
        Profiler._addAverageSectionTimes(
          this._framesMeasures[i],
          framesAverageMeasures,
          this._framesCount,
          i
        );
      }
      return framesAverageMeasures;
    }

    static _addMaxSectionTimes(
      section: FrameMeasure,
      destinationSection: FrameMeasureOutput
    ): void {
      destinationSection.time = Math.max(
        destinationSection.time || 0,
        section.time
      );
      for (const sectionName in section.subsections) {
        if (section.subsections.hasOwnProperty(sectionName)) {
          const destinationSubsections = destinationSection.subsections;
          const destinationSubsection = (destinationSubsections[sectionName] =
            destinationSubsections[sectionName] || {
              time: 0,
              subsections: {},
            });
          Profiler._addMaxSectionTimes(
            section.subsections[sectionName],
            destinationSubsection
          );
        }
      }
    }

    /**
     * Return, for each section, the maximum time it took during a single
     * captured frame - the "worst frame" per section, catching the spikes
     * that averages hide. Plain tree, safe to serialize with
     * `JSON.stringify`.
     */
    getFramesMaxMeasures(): FrameMeasureOutput {
      const framesMaxMeasures: FrameMeasureOutput = {
        time: 0,
        subsections: {},
      };
      for (let i = 0; i < this._framesCount; ++i) {
        Profiler._addMaxSectionTimes(
          this._framesMeasures[i],
          framesMaxMeasures
        );
      }
      return framesMaxMeasures;
    }

    /**
     * Return the total time of each captured frame, in chronological order
     * (up to the last 600 frames).
     */
    getFrameTimes(): Array<float> {
      const frameTimes: Array<float> = [];
      const isBufferFull = this._framesCount >= this._maxFramesCount;
      const startIndex = isBufferFull ? this._currentFrameIndex : 0;
      for (let i = 0; i < this._framesCount; ++i) {
        const index = (startIndex + i) % this._maxFramesCount;
        frameTimes.push(this._framesMeasures[index].time);
      }
      return frameTimes;
    }

    /**
     * Get stats measured during the frames captured.
     */
    getStats(): ProfilerStats {
      return { framesCount: this._framesCount };
    }

    /**
     * Convert measures for a section into texts.
     * Useful for ingame profiling.
     *
     * @param sectionName The name of the section
     * @param profilerSection The section measures
     * @param outputs The array where to push the results
     */
    static getProfilerSectionTexts(
      sectionName: string,
      profilerSection: FrameMeasureOutput,
      outputs: Array<string>,
      parentTime?: float | null
    ): void {
      const percent =
        parentTime && parentTime !== 0
          ? ((profilerSection.time / parentTime) * 100).toFixed(1)
          : '100%';
      const time = profilerSection.time.toFixed(2);
      outputs.push(sectionName + ': ' + time + 'ms (' + percent + ')');
      const subsectionsOutputs = [];
      for (const subsectionName in profilerSection.subsections) {
        if (profilerSection.subsections.hasOwnProperty(subsectionName)) {
          Profiler.getProfilerSectionTexts(
            subsectionName,
            profilerSection.subsections[subsectionName],
            subsectionsOutputs,
            profilerSection.time
          );
        }
      }
      outputs.push.apply(outputs, subsectionsOutputs);
    }
  }
}

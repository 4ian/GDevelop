namespace gdjs {
  const logger = new gdjs.Logger('Profiler');

  /**
   * @category Debugging > Profiler
   */
  export type ProfilerStats = {
    framesCount: integer;
    /**
     * The number of shader programs held by the 3D renderer at the end of the
     * run (0 when the game does not render in 3D).
     */
    shaderProgramsCount: integer;
    /**
     * The number of shader programs the 3D renderer had to compile *during*
     * the run. Anything above 0 once the game is running means frames were
     * spent compiling shaders instead of drawing - see
     * `Profiler.recordShaderPrograms`.
     */
    shaderProgramCompilationsCount: integer;
    /** The number of captured frames that compiled at least one shader. */
    framesWithShaderCompilationCount: integer;
    /** Average number of 3D draw calls per captured frame. */
    averageDrawCallsCount: float;
    /** Average number of 3D triangles drawn per captured frame. */
    averageTrianglesCount: float;
    /** Geometries the 3D renderer was holding at the end of the run. */
    geometriesCount: integer;
    /** Textures the 3D renderer was holding at the end of the run. */
    texturesCount: integer;
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

    /**
     * The renderer cache keys already seen, or null until the first measured
     * frame (whose programs are start-up cost, not part of the run).
     */
    _seenShaderCacheKeys: Set<string> | null = null;

    /** The number of shader programs held by the 3D renderer on the last frame. */
    _shaderProgramsCount: integer = 0;

    /** How many shader programs were compiled since profiling started. */
    _shaderProgramCompilationsCount: integer = 0;

    /** How many frames compiled at least one shader program. */
    _framesWithShaderCompilationCount: integer = 0;

    /** Draw calls summed over the frames measured, to average afterwards. */
    _drawCallsSum: integer = 0;

    /** Triangles summed over the frames measured, to average afterwards. */
    _trianglesSum: integer = 0;

    /** How many frames the two sums above cover. */
    _rendererInfoFramesCount: integer = 0;

    _geometriesCount: integer = 0;
    _texturesCount: integer = 0;

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
     * Record what the 3D renderer did on this frame: its cheap per-frame
     * counters, and the shader programs it is holding.
     *
     * The renderer compiles a separate program for every distinct combination
     * of the things that shape a shader - material features, the number of
     * lights of each kind, fog, shadow filtering, clipping planes, tone
     * mapping, instancing, and more. Whenever the game moves any of them onto
     * a combination that has not been seen before, that program is compiled
     * and linked on the spot: the cost lands on a single frame, and never
     * again for that combination. It shows up as unexplained stutter early in
     * a playthrough, which is why it is worth measuring rather than guessing.
     *
     * Rather than assume a cause, this compares the cache keys the renderer
     * itself uses to tell programs apart, and reports which fields differ from
     * the closest program already seen.
     *
     * @param rendererInfo The current `WebGLRenderer.info`.
     */
    record3DRendererInfo(rendererInfo: {
      programs?: Array<{ cacheKey?: string; type?: string }> | null;
      render?: { calls: number; triangles: number };
      memory?: { geometries: number; textures: number };
    }): void {
      if (rendererInfo.render) {
        // These counters are reset by the renderer on every frame, so reading
        // them after rendering gives this frame's numbers.
        this._drawCallsSum += rendererInfo.render.calls;
        this._trianglesSum += rendererInfo.render.triangles;
        this._rendererInfoFramesCount++;
      }
      if (rendererInfo.memory) {
        this._geometriesCount = rendererInfo.memory.geometries;
        this._texturesCount = rendererInfo.memory.textures;
      }

      const programs = rendererInfo.programs || null;
      const programsCount = programs ? programs.length : 0;
      this._shaderProgramsCount = programsCount;

      if (!this._seenShaderCacheKeys) {
        // First measured frame: whatever is already compiled is start-up
        // cost, not something that happened during the run.
        this._seenShaderCacheKeys = new Set<string>();
        if (programs) {
          for (const program of programs) {
            this._seenShaderCacheKeys.add(program.cacheKey || '');
          }
        }
        return;
      }

      if (!programs) {
        return;
      }

      const newPrograms = programs.filter(
        (program) => !this._seenShaderCacheKeys!.has(program.cacheKey || '')
      );
      if (!newPrograms.length) {
        return;
      }

      const descriptions = newPrograms.map((program) => {
        const description = Profiler._describeNewShaderProgram(
          program,
          this._seenShaderCacheKeys!
        );
        this._seenShaderCacheKeys!.add(program.cacheKey || '');
        return description;
      });

      this._shaderProgramCompilationsCount += newPrograms.length;
      this._framesWithShaderCompilationCount++;

      logger.warn(
        'Compiled ' +
          newPrograms.length +
          ' new shader program(s) on frame ' +
          this._framesCount +
          ' (' +
          programsCount +
          ' in total), which costs a dropped frame. ' +
          descriptions.join(' ')
      );
    }

    /**
     * Describe a newly compiled shader program by what makes it different from
     * the most similar program already compiled.
     *
     * The renderer's cache keys are comma separated lists of the values that
     * decide the shader, always in the same order, so comparing them field by
     * field points straight at what the game changed - without this having to
     * know what any given field means.
     */
    private static _describeNewShaderProgram(
      program: { cacheKey?: string; type?: string },
      seenCacheKeys: Set<string>
    ): string {
      const name = program.type || 'unknown material';
      const cacheKey = program.cacheKey;
      if (!cacheKey) {
        return '"' + name + '" (no cache key to compare).';
      }

      const fields = cacheKey.split(',');
      let closestDifferences: Array<string> | null = null;
      for (const seenCacheKey of seenCacheKeys) {
        const seenFields = seenCacheKey.split(',');
        if (seenFields.length !== fields.length) {
          // A different shader entirely, not the same one reconfigured.
          continue;
        }
        const differences: Array<string> = [];
        for (let i = 0; i < fields.length; i++) {
          if (fields[i] !== seenFields[i]) {
            differences.push(
              'field ' + i + ': "' + seenFields[i] + '" -> "' + fields[i] + '"'
            );
          }
        }
        if (
          differences.length &&
          (!closestDifferences ||
            differences.length < closestDifferences.length)
        ) {
          closestDifferences = differences;
        }
      }

      if (!closestDifferences) {
        return '"' + name + '" is a shader that was not used before.';
      }
      return (
        '"' +
        name +
        '" differs from the closest program already compiled in ' +
        closestDifferences.length +
        ' field(s): ' +
        closestDifferences.slice(0, 4).join(', ') +
        (closestDifferences.length > 4 ? ', ...' : '') +
        '.'
      );
    }

    /**
     * Get stats measured during the frames captured.
     */
    getStats(): ProfilerStats {
      const rendererFrames = this._rendererInfoFramesCount || 1;
      return {
        framesCount: this._framesCount,
        shaderProgramsCount: this._shaderProgramsCount,
        shaderProgramCompilationsCount: this._shaderProgramCompilationsCount,
        framesWithShaderCompilationCount:
          this._framesWithShaderCompilationCount,
        averageDrawCallsCount: this._drawCallsSum / rendererFrames,
        averageTrianglesCount: this._trianglesSum / rendererFrames,
        geometriesCount: this._geometriesCount,
        texturesCount: this._texturesCount,
      };
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

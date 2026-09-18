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
   * The measures of the frame being profiled: a tree of sections, where
   * re-entering a section with the same name accumulates in the same node.
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
   * Running aggregates of a section over the whole recording, so that
   * averages and maximums are available whatever the recording duration,
   * without keeping every frame in memory.
   */
  type SectionAggregate = {
    sumTime: float;
    maxTime: float;
    subsections: Record<string, SectionAggregate>;
  };

  /**
   * The ordered sections ("spans") of one recorded frame, stored as columns:
   * the span `i` is `(nameIds[i], depths[i], startsMs[i], durationsMs[i])`.
   * Names are interned per recording (see `ProfilerChunk.newNames`).
   * @category Debugging > Profiler
   */
  export type ProfilerFrameSpans = {
    /** Index of the frame since the recording started. */
    frameIndex: integer;
    /** The scene that was running during this frame. */
    sceneName: string;
    /** Start of the frame, in milliseconds since the game started. */
    frameStartTimeMs: float;
    frameDurationMs: float;
    nameIds: Array<integer>;
    depths: Array<integer>;
    /** Start of each span, relative to `frameStartTimeMs`. */
    startsMs: Array<float>;
    durationsMs: Array<float>;
  };

  /**
   * A lightweight snapshot of the machine and renderer state, taken once per
   * chunk while recording.
   * @category Debugging > Profiler
   */
  export type ProfilerPerformanceSample = {
    /** Milliseconds since the game started. */
    atGameTimeMs: float;
    /** Frames per second measured over the chunk. */
    fps: float;
    /** `performance.memory.usedJSHeapSize` (Chromium only), or null. */
    usedJSHeapBytes: integer | null;
    /** `performance.memory.jsHeapSizeLimit` (Chromium only), or null. */
    jsHeapSizeLimitBytes: integer | null;
    /** Estimated GPU memory used by the loaded textures, or null. */
    estimatedGpuMemoryBytes: integer | null;
    /** `WebGLRenderer.info.memory.textures`, or null without 3D renderer. */
    texturesCount: integer | null;
    /** `WebGLRenderer.info.memory.geometries`, or null without 3D renderer. */
    geometriesCount: integer | null;
    /**
     * The counters below are nullable on purpose: an older game engine sends
     * none of them, and a recording read back from a file may have been
     * written before they existed. A missing counter is shown as a dash, and
     * never as a zero.
     */
    /** Draw calls made by the 3D renderer, per frame over the chunk. */
    drawCalls3DPerFrame: float | null;
    /** Triangles drawn by the 3D renderer, per frame over the chunk. */
    triangles3DPerFrame: float | null;
    /** Draw calls made by the 2D renderer, per frame over the chunk. */
    drawCalls2DPerFrame: float | null;
    /** Layers rendered by the 2D renderer on the last frame. */
    rendered2DLayersCount: integer | null;
    /** Layers rendered by the 3D renderer on the last frame. */
    rendered3DLayersCount: integer | null;
    /** Objects handed to the renderers on the last frame. */
    renderedObjectsCount: integer | null;
    /** Textures PixiJS is holding, all layers and scenes together. */
    managedTexturesCount: integer | null;
    /** How many times PixiJS ran its texture garbage collector. */
    textureGarbageCollectionsCount: integer | null;
  };

  /**
   * The part of a performance sample that the profiler cannot measure by
   * itself and asks the game for (see `Profiler.setSampleProvider`).
   * @category Debugging > Profiler
   */
  export type ProfilerPerformanceSampleSource = Omit<
    ProfilerPerformanceSample,
    'atGameTimeMs' | 'fps'
  >;

  /**
   * A batch of recorded frames, sent to the editor while the recording is
   * running so the runtime never holds more than one pending chunk.
   * @category Debugging > Profiler
   */
  export type ProfilerChunk = {
    recordingId: integer;
    chunkIndex: integer;
    /** The section names interned for the first time in this chunk. */
    newNames: Array<{ id: integer; name: string }>;
    frames: Array<ProfilerFrameSpans>;
    samples: Array<ProfilerPerformanceSample>;
    /** True when the recording reached its maximum duration and stopped. */
    stoppedByCap?: boolean;
  };

  /** A chunk is sent after this many frames... */
  export const PROFILER_CHUNK_FRAMES_COUNT: integer = 30;
  /** ...or after this duration, whichever comes first. */
  export const PROFILER_CHUNK_MAX_DURATION_MS: float = 500;
  /** A recording stops by itself after this duration. */
  export const PROFILER_MAX_RECORDING_DURATION_MS: float = 5 * 60 * 1000;
  /** How many frame durations are kept for `getFrameTimes`. */
  export const PROFILER_MAX_FRAME_TIMES_COUNT: integer = 18000;

  let lastRecordingId: integer = 0;

  /**
   * A basic profiling tool that can be used to measure time spent in sections of the engine.
   *
   * It keeps running aggregates (average and maximum time per section over the
   * whole recording) and records the ordered spans of every frame, sent in
   * chunks to the editor as the recording goes.
   * @category Debugging > Profiler
   */
  export class Profiler {
    /** Identifies this recording in the chunks sent to the editor. */
    _recordingId: integer;

    /** The measures being done */
    _currentFrameMeasure: FrameMeasure = {
      parent: null,
      time: 0,
      lastStartTime: 0,
      subsections: {},
    };

    /** The section being measured */
    _currentSection: FrameMeasure | null = null;

    /** Sum and maximum of each section over all the frames measured. */
    _aggregates: SectionAggregate = { sumTime: 0, maxTime: 0, subsections: {} };

    /** The number of frames that have been measured */
    _framesCount: number = 0;

    /** Total time of each captured frame, chronological, bounded. */
    _frameTimes: Array<float> = [];

    /** A function to get the current time. If available, corresponds to performance.now(). */
    _getTimeNow: () => float;

    /** Time returned by `_getTimeNow` when the recording started. */
    _recordingStartTime: float;

    /** Milliseconds elapsed since the game started, at recording start. */
    _recordingStartGameTimeMs: float;

    /** Gives the current time in milliseconds since the game started. */
    _getGameTimeMs: () => float;

    _currentSceneName: string = '';

    _nameToId: Map<string, integer> = new Map();
    _pendingNewNames: Array<{ id: integer; name: string }> = [];

    _currentFrameSpans: ProfilerFrameSpans | null = null;
    /** Time returned by `_getTimeNow` at the start of the current frame. */
    _currentFrameStartTime: float = 0;
    _openSpanStack: Array<{ spanIndex: integer; startTime: float }> = [];

    _pendingFrames: Array<ProfilerFrameSpans> = [];
    _chunkIndex: integer = 0;
    _lastChunkFlushTime: float;

    _onChunk: ((chunk: ProfilerChunk) => void) | null = null;
    _sampleProvider: (() => ProfilerPerformanceSampleSource | null) | null =
      null;
    _onRecordingCapReached: (() => void) | null = null;
    _isStoppedByCap: boolean = false;

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

    /**
     * The same counters, emptied at each sample rather than at the end of the
     * run: the panels draw them over time, and the averages over the whole
     * run are kept apart, for the summary sent when the recording stops.
     */
    _sampleDrawCallsSum: integer = 0;
    _sampleTrianglesSum: integer = 0;
    _sampleRendererInfoFramesCount: integer = 0;
    /** Draw calls of the 2D renderer, counted only while recording. */
    _sample2DDrawCallsSum: integer = 0;
    _sample2DDrawCallsFramesCount: integer = 0;

    _geometriesCount: integer = 0;
    _texturesCount: integer = 0;

    /**
     * @param getGameTimeMs Gives the time since the game started, used as the
     * common clock of every timestamp sent to the editor. Defaults to the
     * time since the profiler was created.
     */
    constructor(getGameTimeMs?: () => float) {
      this._getTimeNow =
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
          ? performance.now.bind(performance)
          : Date.now;
      this._recordingId = ++lastRecordingId;
      this._recordingStartTime = this._getTimeNow();
      this._lastChunkFlushTime = this._recordingStartTime;
      this._getGameTimeMs =
        getGameTimeMs || (() => this._getTimeNow() - this._recordingStartTime);
      this._recordingStartGameTimeMs = this._getGameTimeMs();
    }

    getRecordingId(): integer {
      return this._recordingId;
    }

    /** Milliseconds since the game started, when the recording started. */
    getRecordingStartGameTimeMs(): float {
      return this._recordingStartGameTimeMs;
    }

    getRecordedFramesCount(): integer {
      return this._framesCount;
    }

    getRecordingDurationMs(): float {
      return this._getTimeNow() - this._recordingStartTime;
    }

    /** True when the recording stopped because it reached its maximum duration. */
    isStoppedByCap(): boolean {
      return this._isStoppedByCap;
    }

    /** Tell the profiler which scene the next frames belong to. */
    setCurrentSceneName(sceneName: string): void {
      this._currentSceneName = sceneName;
    }

    /** Called with each chunk of recorded frames, as soon as it is ready. */
    setOnChunk(onChunk: ((chunk: ProfilerChunk) => void) | null): void {
      this._onChunk = onChunk;
    }

    /** Provides the memory and renderer counters put in each chunk sample. */
    setSampleProvider(
      sampleProvider: (() => ProfilerPerformanceSampleSource | null) | null
    ): void {
      this._sampleProvider = sampleProvider;
    }

    /**
     * The draw calls the 2D renderer made on one frame. Counted by the game
     * renderer, which wraps the WebGL context only while recording.
     */
    record2DDrawCalls(drawCallsCount: integer): void {
      this._sample2DDrawCallsSum += drawCallsCount;
      this._sample2DDrawCallsFramesCount++;
    }

    /** Called once when the recording reaches its maximum duration. */
    setOnRecordingCapReached(onRecordingCapReached: (() => void) | null): void {
      this._onRecordingCapReached = onRecordingCapReached;
    }

    beginFrame(): void {
      const now = this._getTimeNow();
      this._currentFrameMeasure = {
        parent: null,
        time: 0,
        lastStartTime: now,
        subsections: {},
      };
      this._currentSection = this._currentFrameMeasure;
      this._currentFrameStartTime = now;
      this._openSpanStack.length = 0;
      this._currentFrameSpans = {
        frameIndex: this._framesCount,
        sceneName: this._currentSceneName,
        frameStartTimeMs: Profiler._roundMs(this._getGameTimeMs()),
        frameDurationMs: 0,
        nameIds: [],
        depths: [],
        startsMs: [],
        durationsMs: [],
      };
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
      const now = this._getTimeNow();
      this._currentSection.lastStartTime = now;

      // Record the ordered span
      const frameSpans = this._currentFrameSpans;
      if (frameSpans) {
        const spanIndex = frameSpans.nameIds.length;
        frameSpans.nameIds.push(this._internName(sectionName));
        frameSpans.depths.push(this._openSpanStack.length);
        frameSpans.startsMs.push(
          Profiler._roundMs(now - this._currentFrameStartTime)
        );
        frameSpans.durationsMs.push(0);
        this._openSpanStack.push({ spanIndex, startTime: now });
      }
    }

    end(sectionName?: string): void {
      if (this._currentSection === null)
        throw new Error(
          'Impossible to call Profiler.end() when not profiling a frame!'
        );

      // Stop the timer
      const now = this._getTimeNow();
      const sectionTime = now - this._currentSection.lastStartTime;
      this._currentSection.time =
        (this._currentSection.time || 0) + sectionTime;

      // Close the span (the root of the frame has no span).
      if (this._currentSection.parent !== null) {
        const openSpan = this._openSpanStack.pop();
        if (openSpan && this._currentFrameSpans) {
          this._currentFrameSpans.durationsMs[openSpan.spanIndex] =
            Profiler._roundMs(now - openSpan.startTime);
        }
      }

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

      Profiler._addFrameToAggregates(
        this._currentFrameMeasure,
        this._aggregates
      );
      this._frameTimes.push(this._currentFrameMeasure.time);
      if (this._frameTimes.length > PROFILER_MAX_FRAME_TIMES_COUNT) {
        this._frameTimes.shift();
      }

      const frameSpans = this._currentFrameSpans;
      if (frameSpans) {
        frameSpans.frameDurationMs = Profiler._roundMs(
          this._currentFrameMeasure.time
        );
        this._pendingFrames.push(frameSpans);
        this._currentFrameSpans = null;
      }

      const now = this._getTimeNow();
      if (
        now - this._recordingStartTime >=
        PROFILER_MAX_RECORDING_DURATION_MS
      ) {
        this._isStoppedByCap = true;
        this._flushChunk(true);
        if (this._onRecordingCapReached) {
          this._onRecordingCapReached();
        }
        return;
      }
      if (
        this._pendingFrames.length >= PROFILER_CHUNK_FRAMES_COUNT ||
        now - this._lastChunkFlushTime >= PROFILER_CHUNK_MAX_DURATION_MS
      ) {
        this._flushChunk(false);
      }
    }

    /**
     * Send the frames recorded since the last chunk, if any. Called when the
     * recording stops so nothing stays behind.
     */
    flushChunk(): void {
      this._flushChunk(false);
    }

    private _flushChunk(stoppedByCap: boolean): void {
      const now = this._getTimeNow();
      if (
        !stoppedByCap &&
        this._pendingFrames.length === 0 &&
        this._pendingNewNames.length === 0
      ) {
        this._lastChunkFlushTime = now;
        return;
      }

      const chunk: ProfilerChunk = {
        recordingId: this._recordingId,
        chunkIndex: this._chunkIndex++,
        newNames: this._pendingNewNames,
        frames: this._pendingFrames,
        samples: [this._takeSample(now)],
      };
      if (stoppedByCap) {
        chunk.stoppedByCap = true;
      }
      this._pendingNewNames = [];
      this._pendingFrames = [];
      this._lastChunkFlushTime = now;

      if (this._onChunk) {
        try {
          this._onChunk(chunk);
        } catch (error) {
          logger.error('Error while sending a profiler chunk: ' + error);
        }
      }
    }

    private _takeSample(now: float): ProfilerPerformanceSample {
      const chunkDurationMs = now - this._lastChunkFlushTime;
      const fps =
        chunkDurationMs > 0
          ? (this._pendingFrames.length * 1000) / chunkDurationMs
          : 0;
      let source: ProfilerPerformanceSampleSource | null = null;
      if (this._sampleProvider) {
        try {
          source = this._sampleProvider();
        } catch (error) {
          logger.warn('Error while sampling performance counters: ' + error);
        }
      }
      // `WebGLRenderer.info` is reset by the renderer on every frame and the
      // profiler sums it, so the accumulators are emptied here: a sample
      // covers the frames since the previous one, not the whole run.
      const sampleFramesCount = this._sampleRendererInfoFramesCount;
      const drawCalls3DPerFrame = sampleFramesCount
        ? this._sampleDrawCallsSum / sampleFramesCount
        : null;
      const triangles3DPerFrame = sampleFramesCount
        ? this._sampleTrianglesSum / sampleFramesCount
        : null;
      this._sampleDrawCallsSum = 0;
      this._sampleTrianglesSum = 0;
      this._sampleRendererInfoFramesCount = 0;

      const drawCalls2DPerFrame = this._sample2DDrawCallsFramesCount
        ? this._sample2DDrawCallsSum / this._sample2DDrawCallsFramesCount
        : null;
      this._sample2DDrawCallsSum = 0;
      this._sample2DDrawCallsFramesCount = 0;

      return {
        atGameTimeMs: Profiler._roundMs(this._getGameTimeMs()),
        fps: Math.round(fps * 10) / 10,
        usedJSHeapBytes: source ? source.usedJSHeapBytes : null,
        jsHeapSizeLimitBytes: source ? source.jsHeapSizeLimitBytes : null,
        estimatedGpuMemoryBytes: source ? source.estimatedGpuMemoryBytes : null,
        texturesCount: source ? source.texturesCount : null,
        geometriesCount: source ? source.geometriesCount : null,
        drawCalls3DPerFrame:
          drawCalls3DPerFrame == null
            ? null
            : Math.round(drawCalls3DPerFrame * 10) / 10,
        triangles3DPerFrame:
          triangles3DPerFrame == null
            ? null
            : Math.round(triangles3DPerFrame),
        drawCalls2DPerFrame:
          drawCalls2DPerFrame == null
            ? null
            : Math.round(drawCalls2DPerFrame * 10) / 10,
        rendered2DLayersCount: source ? source.rendered2DLayersCount : null,
        rendered3DLayersCount: source ? source.rendered3DLayersCount : null,
        renderedObjectsCount: source ? source.renderedObjectsCount : null,
        managedTexturesCount: source ? source.managedTexturesCount : null,
        textureGarbageCollectionsCount: source
          ? source.textureGarbageCollectionsCount
          : null,
      };
    }

    private _internName(sectionName: string): integer {
      const existingId = this._nameToId.get(sectionName);
      if (existingId !== undefined) {
        return existingId;
      }
      const id = this._nameToId.size;
      this._nameToId.set(sectionName, id);
      this._pendingNewNames.push({ id, name: sectionName });
      return id;
    }

    private static _roundMs(timeMs: float): float {
      return Math.round(timeMs * 1000) / 1000;
    }

    private static _addFrameToAggregates(
      section: FrameMeasure,
      aggregate: SectionAggregate
    ): void {
      aggregate.sumTime += section.time;
      aggregate.maxTime = Math.max(aggregate.maxTime, section.time);
      for (const sectionName in section.subsections) {
        if (section.subsections.hasOwnProperty(sectionName)) {
          const subAggregate = (aggregate.subsections[sectionName] = aggregate
            .subsections[sectionName] || {
            sumTime: 0,
            maxTime: 0,
            subsections: {},
          });
          Profiler._addFrameToAggregates(
            section.subsections[sectionName],
            subAggregate
          );
        }
      }
    }

    private static _convertAggregates(
      aggregate: SectionAggregate,
      getTime: (aggregate: SectionAggregate) => float
    ): FrameMeasureOutput {
      const output: FrameMeasureOutput = {
        time: getTime(aggregate),
        subsections: {},
      };
      for (const sectionName in aggregate.subsections) {
        if (aggregate.subsections.hasOwnProperty(sectionName)) {
          output.subsections[sectionName] = Profiler._convertAggregates(
            aggregate.subsections[sectionName],
            getTime
          );
        }
      }
      return output;
    }

    /**
     * Return the average time of every section of the game over all the
     * frames captured since the recording started, as a plain tree (no
     * back-references): safe to serialize with `JSON.stringify`.
     */
    getFramesAverageMeasures(): FrameMeasureOutput {
      const framesCount = this._framesCount || 1;
      return Profiler._convertAggregates(
        this._aggregates,
        (aggregate) => aggregate.sumTime / framesCount
      );
    }

    /**
     * Return, for each section, the maximum time it took during a single
     * captured frame - the "worst frame" per section, catching the spikes
     * that averages hide. Plain tree, safe to serialize with
     * `JSON.stringify`.
     */
    getFramesMaxMeasures(): FrameMeasureOutput {
      return Profiler._convertAggregates(
        this._aggregates,
        (aggregate) => aggregate.maxTime
      );
    }

    /**
     * Return the total time of each captured frame, in chronological order
     * (bounded to the last `PROFILER_MAX_FRAME_TIMES_COUNT` frames).
     */
    getFrameTimes(): Array<float> {
      return this._frameTimes.slice();
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
        this._sampleDrawCallsSum += rendererInfo.render.calls;
        this._sampleTrianglesSum += rendererInfo.render.triangles;
        this._sampleRendererInfoFramesCount++;
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

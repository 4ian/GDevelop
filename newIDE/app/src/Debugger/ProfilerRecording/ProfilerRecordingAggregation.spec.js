// @flow
import {
  aggregateFramesToMeasures,
  compareMeasures,
  findFirstFrameIndexAtOrAfter,
  formatClockDuration,
  formatGameTime,
  getFrameStats,
  getFramesInRange,
  getRecordingTimeBounds,
  getSceneChanges,
} from './ProfilerRecordingAggregation';
import {
  ProfilerRecordingStore,
  type ProfilerFrame,
} from './ProfilerRecordingStore';

const names = ['events', 'Group A', 'MyExt::Fn', 'render'];

/**
 * A frame with: events (10 ms) > Group A (6 ms) > MyExt::Fn (2 ms), then
 * render (4 ms). Spans are in call order, with their depth.
 */
const makeFrame = (
  frameIndex: number,
  frameStartTimeMs: number,
  sceneName: string = 'Scene1'
): ProfilerFrame => ({
  frameIndex,
  sceneName,
  frameStartTimeMs,
  frameDurationMs: 16,
  nameIds: [0, 1, 2, 3],
  depths: [0, 1, 2, 0],
  startsMs: [0, 1, 2, 11],
  durationsMs: [10, 6, 2, 4],
});

describe('ProfilerRecordingAggregation', () => {
  describe('aggregateFramesToMeasures', () => {
    it('rebuilds the tree of sections from the spans of a frame', () => {
      const measures = aggregateFramesToMeasures(names, [makeFrame(0, 0)]);
      expect(measures.time).toBe(16);
      expect(measures.subsections['events'].time).toBe(10);
      expect(measures.subsections['events'].subsections['Group A'].time).toBe(
        6
      );
      expect(
        measures.subsections['events'].subsections['Group A'].subsections[
          'MyExt::Fn'
        ].time
      ).toBe(2);
      expect(measures.subsections['render'].time).toBe(4);
    });

    it('averages the sections over several frames and merges same-named spans', () => {
      const slowFrame: ProfilerFrame = {
        ...makeFrame(1, 16),
        frameDurationMs: 32,
        // events is re-entered twice at depth 0: both are merged.
        nameIds: [0, 0, 3],
        depths: [0, 0, 0],
        startsMs: [0, 10, 28],
        durationsMs: [10, 18, 4],
      };
      const measures = aggregateFramesToMeasures(names, [
        makeFrame(0, 0),
        slowFrame,
      ]);
      expect(measures.time).toBe(24);
      expect(measures.subsections['events'].time).toBe((10 + 28) / 2);
      expect(measures.subsections['render'].time).toBe(4);
    });

    it('returns an empty root without frames', () => {
      expect(aggregateFramesToMeasures(names, [])).toEqual({
        time: 0,
        subsections: {},
      });
    });
  });

  describe('ranges', () => {
    const frames = [makeFrame(0, 0), makeFrame(1, 16), makeFrame(2, 32)];

    it('finds the first frame at or after a time', () => {
      expect(findFirstFrameIndexAtOrAfter(frames, 0)).toBe(0);
      expect(findFirstFrameIndexAtOrAfter(frames, 1)).toBe(1);
      expect(findFirstFrameIndexAtOrAfter(frames, 16)).toBe(1);
      expect(findFirstFrameIndexAtOrAfter(frames, 100)).toBe(3);
    });

    it('slices the frames starting in a range', () => {
      expect(
        getFramesInRange(frames, { fromMs: 10, toMs: 32 }).map(
          frame => frame.frameIndex
        )
      ).toEqual([1, 2]);
      expect(getFramesInRange(frames, { fromMs: 40, toMs: 50 })).toEqual([]);
    });

    it('computes the stats of frames', () => {
      const stats = getFrameStats([
        makeFrame(0, 0),
        { ...makeFrame(1, 16), frameDurationMs: 40 },
      ]);
      expect(stats.framesCount).toBe(2);
      expect(stats.averageMs).toBe(28);
      expect(stats.maxMs).toBe(40);
      expect(stats.minMs).toBe(16);
      expect(stats.slowFramesCount).toBe(1);
      expect(stats.durationMs).toBe(56);
      expect(stats.slowestFrameStartTimeMs).toBe(16);
    });

    it('points at the first of the slowest frames', () => {
      const stats = getFrameStats([
        makeFrame(0, 0),
        { ...makeFrame(1, 16), frameDurationMs: 40 },
        { ...makeFrame(2, 56), frameDurationMs: 40 },
      ]);
      expect(stats.maxMs).toBe(40);
      expect(stats.slowestFrameStartTimeMs).toBe(16);
    });

    it('has no slowest frame without any frame', () => {
      expect(getFrameStats([]).slowestFrameStartTimeMs).toBe(0);
    });

    it('lists the scene changes', () => {
      expect(
        getSceneChanges([
          makeFrame(0, 0, 'Menu'),
          makeFrame(1, 16, 'Menu'),
          makeFrame(2, 32, 'Game'),
        ])
      ).toEqual([
        { atMs: 0, sceneName: 'Menu' },
        { atMs: 32, sceneName: 'Game' },
      ]);
    });
  });

  describe('formatting', () => {
    it('formats game times and durations', () => {
      expect(formatGameTime(1200)).toBe('1.20 s');
      expect(formatGameTime(125300)).toBe('2:05.3');
      expect(formatClockDuration(42000)).toBe('0:42');
      expect(formatClockDuration(130000)).toBe('2:10');
    });
  });

  describe('ProfilerRecordingStore', () => {
    it('accumulates chunks, ignores stale ones and keeps time bounds', () => {
      const store = new ProfilerRecordingStore();
      store.onStarted('1', { recordingId: 7, startedAtGameTimeMs: 1000 });
      store.onChunk('1', {
        recordingId: 7,
        chunkIndex: 0,
        newNames: [{ id: 0, name: 'events' }],
        frames: [makeFrame(0, 1000)],
        samples: [],
      });
      // A chunk of another recording is ignored.
      store.onChunk('1', {
        recordingId: 3,
        chunkIndex: 0,
        newNames: [{ id: 0, name: 'other' }],
        frames: [makeFrame(0, 5000)],
        samples: [],
      });
      store.onStopped('1', {
        recordingId: 7,
        framesCount: 1,
        endedAtGameTimeMs: 1500,
        stoppedByCap: false,
      });

      const recording = store.getRecording('1');
      if (!recording) throw new Error('Recording expected');
      expect(recording.status).toBe('stopped');
      expect(recording.names).toEqual(['events']);
      expect(recording.frames).toHaveLength(1);
      expect(getRecordingTimeBounds(recording)).toEqual({
        fromMs: 1000,
        toMs: 1500,
      });

      store.clear('1');
      expect(store.getRecording('1')).toBeNull();
    });
  });

  describe('compareMeasures', () => {
    const makeMeasures = subsections => ({ time: 10, subsections });
    const makeSection = time => ({ time, subsections: {} });

    it('pairs the sections present on both sides', () => {
      const compared = compareMeasures(
        makeMeasures({ 'Group A': makeSection(4) }),
        makeMeasures({ 'Group A': makeSection(6) })
      );
      expect(compared.subsections['Group A'].time).toBe(4);
      expect(compared.subsections['Group A'].baselineTime).toBe(6);
    });

    it('keeps a section present on one side only', () => {
      const compared = compareMeasures(
        makeMeasures({ 'MyExt::Fn': makeSection(4) }),
        makeMeasures({ 'Group A': makeSection(6) })
      );
      // A renamed group must be shown as gone on one side, never dropped.
      expect(compared.subsections['MyExt::Fn'].time).toBe(4);
      expect(compared.subsections['MyExt::Fn'].baselineTime).toBeNull();
      expect(compared.subsections['Group A'].time).toBeNull();
      expect(compared.subsections['Group A'].baselineTime).toBe(6);
    });

    it('walks down the whole tree', () => {
      const compared = compareMeasures(
        makeMeasures({
          'Group A': { time: 4, subsections: { Nested: makeSection(1) } },
        }),
        makeMeasures({
          'Group A': { time: 6, subsections: { Nested: makeSection(3) } },
        })
      );
      const nested = compared.subsections['Group A'].subsections.Nested;
      expect(nested.time).toBe(1);
      expect(nested.baselineTime).toBe(3);
    });

    it('answers on a missing reference', () => {
      const compared = compareMeasures(
        makeMeasures({ 'Group A': makeSection(4) }),
        null
      );
      expect(compared.baselineTime).toBeNull();
      expect(compared.subsections['Group A'].baselineTime).toBeNull();
    });
  });
});

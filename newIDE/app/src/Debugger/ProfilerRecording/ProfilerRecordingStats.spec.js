// @flow
import {
  formatNumber,
  getRecordingStats,
  SLOWEST_FRAME_MARGIN_MS,
  type RecordingStat,
} from './ProfilerRecordingStats';
import {
  type ProfilerFrame,
  type ProfilerPerformanceSample,
  type ProfilerRecording,
} from './ProfilerRecordingStore';

const makeFrame = (
  frameIndex: number,
  frameStartTimeMs: number,
  frameDurationMs: number
): ProfilerFrame => ({
  frameIndex,
  sceneName: 'Scene1',
  frameStartTimeMs,
  frameDurationMs,
  nameIds: [],
  depths: [],
  startsMs: [],
  durationsMs: [],
});

const makeSample = (
  atGameTimeMs: number,
  counters: $Shape<ProfilerPerformanceSample>
): ProfilerPerformanceSample => ({
  atGameTimeMs,
  fps: 60,
  usedJSHeapBytes: null,
  jsHeapSizeLimitBytes: null,
  estimatedGpuMemoryBytes: null,
  texturesCount: null,
  geometriesCount: null,
  ...counters,
});

const makeRecording = (
  recording: $Shape<ProfilerRecording>
): ProfilerRecording => ({
  recordingId: 1,
  status: 'stopped',
  startedAtGameTimeMs: 0,
  startsAtGameTimeMs: [0],
  endedAtGameTimeMs: null,
  stoppedByCap: false,
  names: [],
  frames: [],
  samples: [],
  legacyOutput: null,
  nextChunkIndex: 0,
  nameIdOffset: 0,
  selectedRange: null,
  ...recording,
});

const getStat = (stats: Array<RecordingStat>, id: string): RecordingStat => {
  const stat = stats.find(stat => stat.id === id);
  if (!stat) throw new Error(`No stat with id "${id}".`);
  return stat;
};

const noop = () => {};

describe('ProfilerRecordingStats', () => {
  describe('formatNumber', () => {
    it('rounds to one decimal, without a trailing zero', () => {
      expect(formatNumber(3)).toBe('3');
      // Written in the language of the user.
      expect(formatNumber(2.345)).toBe((2.3).toLocaleString());
      expect(formatNumber(NaN)).toBe('-');
    });
  });

  describe('getRecordingStats', () => {
    it('always gives every card, with a dash for what is not measured', () => {
      const stats = getRecordingStats(makeRecording({}), noop, null);

      expect(stats.map(stat => stat.id)).toEqual([
        'frames',
        'averageFrame',
        'slowestFrame',
        'jsHeap',
        'gpuMemory',
        'drawCalls3D',
        'drawCalls2D',
        'triangles3D',
        'managedTextures',
        'renderedLayers',
        'geometriesAndTextures3D',
        'shaderPrograms',
        'shaderCompilations',
      ]);
      expect(getStat(stats, 'frames').value).toBe('0');
      expect(getStat(stats, 'averageFrame').value).toBe('-');
      expect(getStat(stats, 'slowestFrame').value).toBe('-');
      expect(getStat(stats, 'slowestFrame').onClick).toBeUndefined();
      expect(getStat(stats, 'jsHeap').value).toBe('-');
      expect(getStat(stats, 'drawCalls2D').value).toBe('-');
      expect(getStat(stats, 'renderedLayers').value).toBe('- / -');
      // Every card says what it means: a number nobody can act on is noise.
      for (const stat of stats) expect(stat.help).toBeTruthy();
      // No reference pinned: nothing is compared.
      for (const stat of stats) expect(stat.comparison).toBeFalsy();
    });

    it('computes the frames of the selection only', () => {
      const recording = makeRecording({
        frames: [
          makeFrame(0, 0, 10),
          makeFrame(1, 10, 30),
          makeFrame(2, 40, 20),
          makeFrame(3, 60, 10),
        ],
        selectedRange: { fromMs: 10, toMs: 59 },
      });
      const stats = getRecordingStats(recording, noop, null);

      expect(getStat(stats, 'frames').value).toBe('2');
      expect(getStat(stats, 'averageFrame').value).toBe('25.00 ms');
      expect(getStat(stats, 'slowestFrame').value).toBe('30.00 ms');
    });

    it('selects the slowest frame, with some room around it, when its card is clicked', () => {
      const recording = makeRecording({
        frames: [makeFrame(0, 0, 10), makeFrame(1, 10, 30)],
      });
      const onSelectRange = jest.fn();
      const stats = getRecordingStats(recording, onSelectRange, null);
      const { onClick } = getStat(stats, 'slowestFrame');
      if (!onClick) throw new Error('The slowest frame card is not clickable.');

      onClick();

      expect(onSelectRange).toHaveBeenCalledWith({
        fromMs: 10 - SLOWEST_FRAME_MARGIN_MS,
        toMs: 10 + 30 + SLOWEST_FRAME_MARGIN_MS,
      });
    });

    it('prefers the samples to the summary sent at the end of the recording', () => {
      const recording = makeRecording({
        // The frames give the bounds of the recording, samples included.
        frames: [makeFrame(0, 0, 300), makeFrame(1, 300, 300)],
        samples: [
          makeSample(0, {
            drawCalls3DPerFrame: 10,
            drawCalls2DPerFrame: 4,
            usedJSHeapBytes: 2000000,
            rendered2DLayersCount: 2,
          }),
          makeSample(500, {
            drawCalls3DPerFrame: 20,
            drawCalls2DPerFrame: 6,
            usedJSHeapBytes: 1500000,
            rendered2DLayersCount: 3,
            rendered3DLayersCount: 1,
          }),
        ],
        legacyOutput: {
          framesAverageMeasures: { time: 0, subsections: {} },
          stats: {
            framesCount: 0,
            averageDrawCallsCount: 999,
            shaderProgramsCount: 7,
          },
        },
      });
      const stats = getRecordingStats(recording, noop, null);

      // Averaged over the samples.
      expect(getStat(stats, 'drawCalls3D').value).toBe('15');
      expect(getStat(stats, 'drawCalls2D').value).toBe('5');
      // The last value measured.
      expect(getStat(stats, 'jsHeap').value).toBe('1.50 MB');
      expect(getStat(stats, 'renderedLayers').value).toBe('3 / 1');
      // Only known from the summary.
      expect(getStat(stats, 'shaderPrograms').value).toBe('7');
    });

    it('compares to the whole run of the reference, when one is pinned', () => {
      const recording = makeRecording({
        frames: [makeFrame(0, 0, 10), makeFrame(1, 10, 20)],
      });
      const baselineRecording = makeRecording({
        frames: [makeFrame(0, 0, 10), makeFrame(1, 10, 10)],
      });
      const stats = getRecordingStats(recording, noop, baselineRecording);

      expect(getStat(stats, 'averageFrame').comparison).toBeTruthy();
      expect(getStat(stats, 'slowestFrame').comparison).toBeTruthy();
      // Not measured on either side: nothing to compare.
      expect(getStat(stats, 'jsHeap').comparison).toBeFalsy();
    });
  });
});

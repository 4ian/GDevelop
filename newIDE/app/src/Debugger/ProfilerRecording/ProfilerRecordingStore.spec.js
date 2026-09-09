// @flow
import {
  ProfilerRecordingStore,
  type ProfilerFrame,
} from './ProfilerRecordingStore';
import { extendSamplesToStarts } from './ProfilerRecordingAggregation';

const makeFrame = (
  frameIndex: number,
  frameStartTimeMs: number,
  nameIds: Array<number>
): ProfilerFrame => ({
  frameIndex,
  sceneName: 'Scene1',
  frameStartTimeMs,
  frameDurationMs: 16,
  nameIds,
  depths: nameIds.map(() => 0),
  startsMs: nameIds.map(() => 0),
  durationsMs: nameIds.map(() => 1),
});

describe('ProfilerRecordingStore', () => {
  it('appends a recording started again to the one kept', () => {
    const store = new ProfilerRecordingStore();
    store.onStarted(1, { recordingId: 1, startedAtGameTimeMs: 0 });
    store.onChunk(1, {
      recordingId: 1,
      chunkIndex: 0,
      newNames: [{ id: 0, name: 'events' }, { id: 1, name: 'render' }],
      frames: [makeFrame(0, 0, [0, 1])],
      samples: [],
    });
    store.onStopped(1, {
      recordingId: 1,
      framesCount: 1,
      endedAtGameTimeMs: 16,
      stoppedByCap: false,
    });

    // The game interns its names per recording: ids start from 0 again.
    store.onStarted(1, { recordingId: 2, startedAtGameTimeMs: 1000 });
    store.onChunk(1, {
      recordingId: 2,
      chunkIndex: 0,
      newNames: [{ id: 0, name: 'render' }, { id: 1, name: 'physics' }],
      frames: [makeFrame(0, 1000, [0, 1])],
      samples: [],
    });

    const recording = store.getRecording(1);
    if (!recording) throw new Error('No recording kept.');
    expect(recording.status).toBe('recording');
    expect(recording.recordingId).toBe(2);
    expect(recording.startedAtGameTimeMs).toBe(0);
    expect(recording.frames).toHaveLength(2);
    const nameOf = (frame, spanIndex) =>
      recording.names[frame.nameIds[spanIndex]];
    expect(nameOf(recording.frames[0], 0)).toBe('events');
    expect(nameOf(recording.frames[0], 1)).toBe('render');
    expect(nameOf(recording.frames[1], 0)).toBe('render');
    expect(nameOf(recording.frames[1], 1)).toBe('physics');
  });

  it('starts from scratch after the recording was cleared', () => {
    const store = new ProfilerRecordingStore();
    store.onStarted(1, { recordingId: 1, startedAtGameTimeMs: 0 });
    store.onChunk(1, {
      recordingId: 1,
      chunkIndex: 0,
      newNames: [{ id: 0, name: 'events' }],
      frames: [makeFrame(0, 0, [0])],
      samples: [],
    });
    store.clear(1);
    store.onStarted(1, { recordingId: 2, startedAtGameTimeMs: 1000 });

    const recording = store.getRecording(1);
    if (!recording) throw new Error('No recording kept.');
    expect(recording.frames).toHaveLength(0);
    expect(recording.names).toHaveLength(0);
    expect(recording.startedAtGameTimeMs).toBe(1000);
  });
});

describe('extendSamplesToStarts', () => {
  const makeSample = (atGameTimeMs: number, fps: number) => ({
    atGameTimeMs,
    fps,
    usedJSHeapBytes: null,
    jsHeapSizeLimitBytes: null,
    estimatedGpuMemoryBytes: null,
    texturesCount: null,
    geometriesCount: null,
  });

  it('copies the first sample of each recording back to its start', () => {
    const samples = extendSamplesToStarts(
      [makeSample(500, 60), makeSample(1000, 58), makeSample(2500, 30)],
      [0, 2000]
    );
    expect(samples.map(sample => sample.atGameTimeMs)).toEqual([
      0,
      500,
      1000,
      2000,
      2500,
    ]);
    expect(samples[0].fps).toBe(60);
    expect(samples[3].fps).toBe(30);
  });

  it('adds nothing when a sample already exists at the start', () => {
    const samples = extendSamplesToStarts([makeSample(0, 60)], [0]);
    expect(samples).toHaveLength(1);
  });
});

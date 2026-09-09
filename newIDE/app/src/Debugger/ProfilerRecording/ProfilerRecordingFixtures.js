// @flow
import {
  ProfilerRecordingStore,
  type ProfilerFrame,
  type ProfilerPerformanceSample,
} from './ProfilerRecordingStore';

/**
 * A deterministic pseudo-random generator, so that stories look the same on
 * every run.
 */
const makeRandom = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const sectionNames = [
  'asynchronous actions (wait action, etc...)',
  'objects (pre-events)',
  'callbacks and extensions (pre-events)',
  'events',
  'Player movement',
  'Enemies',
  'Health::Behavior::doStepPreEvents',
  'objects (post-events)',
  'objects (pre-render, effects update)',
  'layers (effects update)',
  'render',
];

/**
 * Build a fake recording of the given duration in a store, for stories.
 */
export const makeFakeRecordingStore = (
  durationMs: number,
  debuggerId: string = '0'
): ProfilerRecordingStore => {
  const random = makeRandom(42);
  const store = new ProfilerRecordingStore();
  const startedAtGameTimeMs = 2500;
  store.onStarted(debuggerId, { recordingId: 1, startedAtGameTimeMs });

  const frames: Array<ProfilerFrame> = [];
  const samples: Array<ProfilerPerformanceSample> = [];
  let gameTimeMs = startedAtGameTimeMs;
  let frameIndex = 0;
  while (gameTimeMs < startedAtGameTimeMs + durationMs) {
    const isSpike = random() < 0.04;
    const eventsMs = (isSpike ? 20 : 4) + random() * 3;
    const playerMs = eventsMs * 0.3;
    const enemiesMs = eventsMs * 0.5;
    const renderMs = 3 + random() * 2;
    const preMs = 1 + random() * 0.5;
    const frameDurationMs = preMs * 3 + eventsMs + 1 + 0.5 + 0.3 + renderMs;
    let cursor = 0;
    const nameIds = [];
    const depths = [];
    const startsMs = [];
    const durationsMs = [];
    const push = (nameId: number, depth: number, duration: number) => {
      nameIds.push(nameId);
      depths.push(depth);
      startsMs.push(Math.round(cursor * 1000) / 1000);
      durationsMs.push(Math.round(duration * 1000) / 1000);
    };
    push(0, 0, preMs * 0.2);
    cursor += preMs * 0.2;
    push(1, 0, preMs);
    push(6, 1, preMs * 0.8);
    cursor += preMs;
    push(2, 0, preMs * 0.3);
    cursor += preMs * 0.3;
    push(3, 0, eventsMs);
    push(4, 1, playerMs);
    cursor += playerMs;
    push(5, 1, enemiesMs);
    cursor += eventsMs - playerMs;
    push(7, 0, 1);
    cursor += 1;
    push(8, 0, 0.5);
    cursor += 0.5;
    push(9, 0, 0.3);
    cursor += 0.3;
    push(10, 0, renderMs);

    frames.push({
      frameIndex,
      sceneName:
        gameTimeMs < startedAtGameTimeMs + durationMs * 0.4 ? 'Menu' : 'Game',
      frameStartTimeMs: Math.round(gameTimeMs * 1000) / 1000,
      frameDurationMs: Math.round(frameDurationMs * 1000) / 1000,
      nameIds,
      depths,
      startsMs,
      durationsMs,
    });
    gameTimeMs += Math.max(16.67, frameDurationMs);
    frameIndex++;
  }

  for (
    let sampleTimeMs = startedAtGameTimeMs;
    sampleTimeMs < startedAtGameTimeMs + durationMs;
    sampleTimeMs += 500
  ) {
    const progress = (sampleTimeMs - startedAtGameTimeMs) / durationMs;
    samples.push({
      atGameTimeMs: sampleTimeMs,
      fps: 55 + random() * 6,
      usedJSHeapBytes: Math.round(
        (80 + progress * 40 + random() * 5) * 1024 * 1024
      ),
      jsHeapSizeLimitBytes: 4 * 1024 * 1024 * 1024,
      estimatedGpuMemoryBytes: Math.round(
        (progress < 0.4 ? 60 : 140) * 1024 * 1024
      ),
      texturesCount: progress < 0.4 ? 12 : 30,
      geometriesCount: 4,
    });
  }

  store.onChunk(debuggerId, {
    recordingId: 1,
    chunkIndex: 0,
    newNames: sectionNames.map((name, id) => ({ id, name })),
    frames,
    samples,
  });
  store.onStopped(debuggerId, {
    recordingId: 1,
    framesCount: frames.length,
    endedAtGameTimeMs: gameTimeMs,
    stoppedByCap: false,
  });
  store.onOutput(debuggerId, {
    framesAverageMeasures: { time: 12, subsections: {} },
    stats: {
      framesCount: frames.length,
      shaderProgramsCount: 8,
      shaderProgramCompilationsCount: 1,
      framesWithShaderCompilationCount: 1,
      averageDrawCallsCount: 42,
      averageTrianglesCount: 12000,
      geometriesCount: 4,
      texturesCount: 30,
    },
  });
  return store;
};

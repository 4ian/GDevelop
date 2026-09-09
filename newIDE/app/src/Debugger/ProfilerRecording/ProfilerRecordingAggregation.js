// @flow
import { type ProfilerMeasuresSection } from '..';
import {
  type ProfilerFrame,
  type ProfilerPerformanceSample,
  type ProfilerRecording,
  type ProfilerRecordingRange,
} from './ProfilerRecordingStore';

/** A frame is considered slow above this duration (60 frames per second). */
export const SLOW_FRAME_THRESHOLD_MS = 1000 / 60;

/**
 * The game time covered by a recording: from its first frame (or its start)
 * to the end of its last frame (or its end).
 */
export const getRecordingTimeBounds = (
  recording: ProfilerRecording
): ProfilerRecordingRange => {
  const firstFrame = recording.frames[0];
  const lastFrame = recording.frames[recording.frames.length - 1];
  const fromMs = firstFrame
    ? Math.min(firstFrame.frameStartTimeMs, recording.startedAtGameTimeMs)
    : recording.startedAtGameTimeMs;
  const lastFrameEndMs = lastFrame
    ? lastFrame.frameStartTimeMs + lastFrame.frameDurationMs
    : fromMs;
  const toMs = Math.max(
    lastFrameEndMs,
    recording.endedAtGameTimeMs != null ? recording.endedAtGameTimeMs : fromMs
  );
  return { fromMs, toMs: Math.max(toMs, fromMs) };
};

/** The range shown: the selected one, or the whole recording. */
export const getShownRange = (
  recording: ProfilerRecording
): ProfilerRecordingRange =>
  recording.selectedRange || getRecordingTimeBounds(recording);

/** The frames starting inside a range (frames are chronological). */
export const getFramesInRange = (
  frames: Array<ProfilerFrame>,
  range: ProfilerRecordingRange
): Array<ProfilerFrame> => {
  const firstIndex = findFirstFrameIndexAtOrAfter(frames, range.fromMs);
  const result = [];
  for (let index = firstIndex; index < frames.length; index++) {
    const frame = frames[index];
    if (frame.frameStartTimeMs > range.toMs) break;
    result.push(frame);
  }
  return result;
};

/** Binary search of the first frame starting at or after a game time. */
export const findFirstFrameIndexAtOrAfter = (
  frames: Array<ProfilerFrame>,
  gameTimeMs: number
): number => {
  let low = 0;
  let high = frames.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (frames[middle].frameStartTimeMs < gameTimeMs) low = middle + 1;
    else high = middle;
  }
  return low;
};

export const getSamplesInRange = (
  samples: Array<ProfilerPerformanceSample>,
  range: ProfilerRecordingRange
): Array<ProfilerPerformanceSample> =>
  samples.filter(
    sample =>
      sample.atGameTimeMs >= range.fromMs && sample.atGameTimeMs <= range.toMs
  );

/**
 * Rebuild the tree of sections averaged over some frames, in the shape
 * used by the measures table (`gdjs.FrameMeasureOutput`): the spans are
 * attached to their parent using their depth, and same-named siblings are
 * merged like the game profiler does.
 */
export const aggregateFramesToMeasures = (
  names: Array<string>,
  frames: Array<ProfilerFrame>
): ProfilerMeasuresSection => {
  const root: ProfilerMeasuresSection = { time: 0, subsections: {} };
  if (!frames.length) return root;

  for (const frame of frames) {
    root.time += frame.frameDurationMs;
    // The section open at each depth, so that a span finds its parent.
    const openSections: Array<ProfilerMeasuresSection> = [root];
    for (let spanIndex = 0; spanIndex < frame.nameIds.length; spanIndex++) {
      const depth = frame.depths[spanIndex];
      const parent = openSections[Math.min(depth, openSections.length - 1)];
      const name = names[frame.nameIds[spanIndex]] || '?';
      const section = (parent.subsections[name] = parent.subsections[name] || {
        time: 0,
        subsections: {},
      });
      section.time += frame.durationsMs[spanIndex];
      openSections.length = depth + 1;
      openSections.push(section);
    }
  }

  const divideBy = (section: ProfilerMeasuresSection, framesCount: number) => {
    section.time /= framesCount;
    for (const name in section.subsections) {
      divideBy(section.subsections[name], framesCount);
    }
  };
  divideBy(root, frames.length);
  return root;
};

export type FrameStats = {|
  framesCount: number,
  /** Game time covered by the frames, in milliseconds. */
  durationMs: number,
  averageMs: number,
  maxMs: number,
  minMs: number,
  /** Frames per second, derived from the average frame duration. */
  fps: number,
  slowFramesCount: number,
|};

export const getFrameStats = (frames: Array<ProfilerFrame>): FrameStats => {
  if (!frames.length) {
    return {
      framesCount: 0,
      durationMs: 0,
      averageMs: 0,
      maxMs: 0,
      minMs: 0,
      fps: 0,
      slowFramesCount: 0,
    };
  }
  let sumMs = 0;
  let maxMs = -Infinity;
  let minMs = Infinity;
  let slowFramesCount = 0;
  for (const frame of frames) {
    sumMs += frame.frameDurationMs;
    maxMs = Math.max(maxMs, frame.frameDurationMs);
    minMs = Math.min(minMs, frame.frameDurationMs);
    if (frame.frameDurationMs > SLOW_FRAME_THRESHOLD_MS) slowFramesCount++;
  }
  const firstFrame = frames[0];
  const lastFrame = frames[frames.length - 1];
  const averageMs = sumMs / frames.length;
  return {
    framesCount: frames.length,
    durationMs:
      lastFrame.frameStartTimeMs +
      lastFrame.frameDurationMs -
      firstFrame.frameStartTimeMs,
    averageMs,
    maxMs,
    minMs,
    fps: averageMs > 0 ? 1000 / averageMs : 0,
    slowFramesCount,
  };
};

/** Where the scene running changed, from the frames themselves. */
export const getSceneChanges = (
  frames: Array<ProfilerFrame>
): Array<{| atMs: number, sceneName: string |}> => {
  const changes = [];
  let lastSceneName: ?string = null;
  for (const frame of frames) {
    if (frame.sceneName !== lastSceneName) {
      changes.push({
        atMs: frame.frameStartTimeMs,
        sceneName: frame.sceneName,
      });
      lastSceneName = frame.sceneName;
    }
  }
  return changes;
};

/** Format a game time as "1.20 s" or "2:05.3" past a minute. */
export const formatGameTime = (timeMs: number): string => {
  if (timeMs < 60 * 1000) return `${(timeMs / 1000).toFixed(2)} s`;
  const minutes = Math.floor(timeMs / 60000);
  const seconds = (timeMs - minutes * 60000) / 1000;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(1)}`;
};

/** Format a duration as "0:42" (minutes and seconds). */
export const formatClockDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const formatMilliseconds = (durationMs: number): string =>
  Number.isFinite(durationMs)
    ? `${(Math.round(durationMs * 10) / 10).toLocaleString()} ms`
    : '-';

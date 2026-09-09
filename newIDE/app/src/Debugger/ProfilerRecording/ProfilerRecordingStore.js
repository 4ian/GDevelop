// @flow
import { type DebuggerId } from '../../ExportAndShare/PreviewLauncher.flow';
import { type ProfilerOutput } from '..';

// The types below mirror the ones of `gdjs.Profiler` (GDJS/Runtime/profiler.ts).

/** The ordered sections of one frame, as columns: span i = (nameIds[i], depths[i], startsMs[i], durationsMs[i]). */
export type ProfilerFrame = {|
  frameIndex: number,
  sceneName: string,
  /** Milliseconds since the game started. */
  frameStartTimeMs: number,
  frameDurationMs: number,
  nameIds: Array<number>,
  depths: Array<number>,
  /** Relative to `frameStartTimeMs`. */
  startsMs: Array<number>,
  durationsMs: Array<number>,
|};

export type ProfilerPerformanceSample = {|
  atGameTimeMs: number,
  fps: number,
  usedJSHeapBytes: ?number,
  jsHeapSizeLimitBytes: ?number,
  estimatedGpuMemoryBytes: ?number,
  texturesCount: ?number,
  geometriesCount: ?number,
|};

export type ProfilerChunkPayload = {|
  recordingId: number,
  chunkIndex: number,
  newNames: Array<{| id: number, name: string |}>,
  frames: Array<ProfilerFrame>,
  samples: Array<ProfilerPerformanceSample>,
  stoppedByCap?: boolean,
|};

export type ProfilerStartedPayload = {|
  recordingId: number,
  startedAtGameTimeMs: number,
|};

export type ProfilerStoppedPayload = {|
  recordingId: number,
  framesCount: number,
  endedAtGameTimeMs: number,
  stoppedByCap: boolean,
|};

/** A range of game time, in milliseconds. */
export type ProfilerRecordingRange = {| fromMs: number, toMs: number |};

export type ProfilerRecording = {|
  recordingId: number,
  status: 'recording' | 'stopped',
  startedAtGameTimeMs: number,
  /** When each recording started, in game time: the first one and the ones appended to it. */
  startsAtGameTimeMs: Array<number>,
  endedAtGameTimeMs: ?number,
  stoppedByCap: boolean,
  /** The interned section names, indexed by id. */
  names: Array<string>,
  frames: Array<ProfilerFrame>,
  samples: Array<ProfilerPerformanceSample>,
  /** The averages sent when the recording stopped (kept for the summary stats). */
  legacyOutput: ?ProfilerOutput,
  nextChunkIndex: number,
  /**
   * Added to the name ids of the chunks being received: the game interns its
   * names per recording (starting from 0), while a recording started again
   * without clearing keeps the names of the previous ones.
   */
  nameIdOffset: number,
  /** The range the user is looking at, or null for the whole recording. */
  selectedRange: ?ProfilerRecordingRange,
|};

/** Notifications are grouped while chunks arrive, to spare renders. */
const NOTIFY_THROTTLE_MS = 100;

/**
 * Keeps the recordings of the profiler of each preview, out of React so
 * that chunks arriving twice a second do not each re-render the debugger.
 */
export class ProfilerRecordingStore {
  _recordings: Map<DebuggerId, ProfilerRecording> = new Map();
  _listeners: Set<() => void> = new Set();
  _notifyTimeoutId: ?TimeoutID = null;

  getRecording(debuggerId: DebuggerId): ProfilerRecording | null {
    return this._recordings.get(debuggerId) || null;
  }

  /**
   * A recording starts. If one is already kept for this preview (not cleared
   * before recording again), the new frames are appended to it.
   */
  onStarted(debuggerId: DebuggerId, payload: ?ProfilerStartedPayload) {
    // Older game engines send no payload: they also send no chunks, so the
    // recording stays empty and only `legacyOutput` is shown.
    const recordingId = payload ? payload.recordingId : 0;
    const startedAtGameTimeMs = payload ? payload.startedAtGameTimeMs : 0;
    const existingRecording = this._recordings.get(debuggerId);
    if (existingRecording) {
      existingRecording.recordingId = recordingId;
      existingRecording.status = 'recording';
      existingRecording.endedAtGameTimeMs = null;
      existingRecording.stoppedByCap = false;
      existingRecording.legacyOutput = null;
      existingRecording.nextChunkIndex = 0;
      existingRecording.nameIdOffset = existingRecording.names.length;
      existingRecording.startsAtGameTimeMs.push(startedAtGameTimeMs);
    } else {
      this._recordings.set(debuggerId, {
        recordingId,
        status: 'recording',
        startedAtGameTimeMs,
        startsAtGameTimeMs: [startedAtGameTimeMs],
        endedAtGameTimeMs: null,
        stoppedByCap: false,
        names: [],
        frames: [],
        samples: [],
        legacyOutput: null,
        nextChunkIndex: 0,
        nameIdOffset: 0,
        selectedRange: null,
      });
    }
    this._notify(true);
  }

  onChunk(debuggerId: DebuggerId, chunk: ProfilerChunkPayload) {
    const recording = this._recordings.get(debuggerId);
    if (!recording || recording.recordingId !== chunk.recordingId) {
      // A chunk of a recording that was cleared or replaced: ignore it.
      return;
    }
    if (chunk.chunkIndex !== recording.nextChunkIndex) {
      console.warn(
        `Profiler chunk ${chunk.chunkIndex} received while chunk ${
          recording.nextChunkIndex
        } was expected: the recording may be incomplete.`
      );
    }
    recording.nextChunkIndex = chunk.chunkIndex + 1;
    const { nameIdOffset } = recording;
    for (const { id, name } of chunk.newNames) {
      recording.names[id + nameIdOffset] = name;
    }
    for (const frame of chunk.frames) {
      recording.frames.push(
        nameIdOffset === 0
          ? frame
          : {
              ...frame,
              nameIds: frame.nameIds.map(nameId => nameId + nameIdOffset),
            }
      );
    }
    for (const sample of chunk.samples) {
      recording.samples.push(sample);
    }
    if (chunk.stoppedByCap) {
      recording.stoppedByCap = true;
    }
    this._notify(false);
  }

  onStopped(debuggerId: DebuggerId, payload: ?ProfilerStoppedPayload) {
    const recording = this._recordings.get(debuggerId);
    if (!recording) return;
    recording.status = 'stopped';
    if (payload) {
      recording.endedAtGameTimeMs = payload.endedAtGameTimeMs;
      recording.stoppedByCap = recording.stoppedByCap || payload.stoppedByCap;
    } else {
      const lastFrame = recording.frames[recording.frames.length - 1];
      recording.endedAtGameTimeMs = lastFrame
        ? lastFrame.frameStartTimeMs + lastFrame.frameDurationMs
        : recording.startedAtGameTimeMs;
    }
    this._notify(true);
  }

  onOutput(debuggerId: DebuggerId, profilerOutput: ProfilerOutput) {
    const recording = this._recordings.get(debuggerId);
    if (!recording) return;
    recording.legacyOutput = profilerOutput;
    this._notify(true);
  }

  setSelectedRange(debuggerId: DebuggerId, range: ?ProfilerRecordingRange) {
    const recording = this._recordings.get(debuggerId);
    if (!recording) return;
    recording.selectedRange = range;
    this._notify(true);
  }

  clear(debuggerId: DebuggerId) {
    if (this._recordings.delete(debuggerId)) {
      this._notify(true);
    }
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  _notify(immediately: boolean) {
    if (immediately) {
      if (this._notifyTimeoutId) {
        clearTimeout(this._notifyTimeoutId);
        this._notifyTimeoutId = null;
      }
      this._listeners.forEach(listener => listener());
      return;
    }
    if (this._notifyTimeoutId) return;
    this._notifyTimeoutId = setTimeout(() => {
      this._notifyTimeoutId = null;
      this._listeners.forEach(listener => listener());
    }, NOTIFY_THROTTLE_MS);
  }
}

/**
 * Re-render a component when the store changes.
 */
export const useProfilerRecording = (
  store: ProfilerRecordingStore,
  debuggerId: DebuggerId
): ProfilerRecording | null => {
  const React = require('react');
  const [, setVersion] = React.useState(0);
  React.useEffect(
    () => store.subscribe(() => setVersion(version => version + 1)),
    [store]
  );
  return store.getRecording(debuggerId);
};

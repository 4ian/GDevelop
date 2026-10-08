// @flow
import { getIDEVersion } from '../../Version';
import { type Log } from '../DebuggerConsole';
import { type ResourcesDebugState } from '../Resources/ResourcesDebugTypes';
import {
  type ProfilerRecording,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  getFrameStats,
  getRecordingTimeBounds,
} from '../ProfilerRecording/ProfilerRecordingAggregation';

/**
 * What tells one of these files apart from any other JSON dropped on the
 * import dialog.
 */
export const DEBUGGER_RECORDING_FILE_KIND = 'gdevelop-debugger-recording';

/**
 * The version of the format. Raised only when a file written by this version
 * could no longer be read; new fields are added without raising it, every
 * reader treating what it does not know as absent.
 */
export const DEBUGGER_RECORDING_FORMAT_VERSION = 1;

export const DEBUGGER_RECORDING_FILE_EXTENSION = '.gdrecording.json';

/** What a file says about the run it holds, before it is even opened. */
export type DebuggerRecordingMetadata = {|
  projectName: string,
  /** The version of the editor that wrote the file. */
  ideVersion: string,
  /** What the run was played on, to warn when two runs are not comparable. */
  userAgent: string,
  /** ISO date, so that two files are told apart by reading their name. */
  exportedAt: string,
  sceneName: ?string,
  durationMs: number,
  framesCount: number,
|};

export type DebuggerRecordingFile = {|
  kind: typeof DEBUGGER_RECORDING_FILE_KIND,
  formatVersion: number,
  metadata: DebuggerRecordingMetadata,
  /** Everything the profiler recorded, without the state of its transport. */
  profiler: ?Object,
  resources: ?ResourcesDebugState,
  logs: Array<Log>,
|};

/**
 * What a recording is once the state of its transport is left out: the
 * identifiers of the chunks mean nothing outside of the connection they were
 * received on, and would only confuse a recording read back from a file.
 */
const toStoredRecording = (recording: ProfilerRecording) => ({
  status: 'stopped',
  startedAtGameTimeMs: recording.startedAtGameTimeMs,
  startsAtGameTimeMs: recording.startsAtGameTimeMs,
  endedAtGameTimeMs: recording.endedAtGameTimeMs,
  stoppedByCap: recording.stoppedByCap,
  names: recording.names,
  frames: recording.frames,
  samples: recording.samples,
  legacyOutput: recording.legacyOutput,
  selectedRange: recording.selectedRange,
});

/** The scene most of the recorded frames were played in. */
const getMainSceneName = (recording: ?ProfilerRecording): ?string => {
  if (!recording || recording.frames.length === 0) return null;
  const framesCountByScene: Map<string, number> = new Map();
  for (const frame of recording.frames) {
    framesCountByScene.set(
      frame.sceneName,
      (framesCountByScene.get(frame.sceneName) || 0) + 1
    );
  }
  let mainSceneName = null;
  let mainFramesCount = 0;
  framesCountByScene.forEach((framesCount, sceneName) => {
    if (framesCount > mainFramesCount) {
      mainFramesCount = framesCount;
      mainSceneName = sceneName;
    }
  });
  return mainSceneName;
};

const getDurationMs = (recording: ?ProfilerRecording): number => {
  if (!recording) return 0;
  const bounds = getRecordingTimeBounds(recording);
  return bounds ? bounds.toMs - bounds.fromMs : 0;
};

export const makeDebuggerRecordingFile = ({
  projectName,
  recording,
  resourcesDebugState,
  logs,
}: {|
  projectName: string,
  recording: ?ProfilerRecording,
  resourcesDebugState: ?ResourcesDebugState,
  logs: Array<Log>,
|}): DebuggerRecordingFile => ({
  kind: DEBUGGER_RECORDING_FILE_KIND,
  formatVersion: DEBUGGER_RECORDING_FORMAT_VERSION,
  metadata: {
    projectName,
    ideVersion: getIDEVersion(),
    userAgent:
      typeof navigator !== 'undefined' && navigator.userAgent
        ? navigator.userAgent
        : '',
    exportedAt: new Date().toISOString(),
    sceneName: getMainSceneName(recording),
    durationMs: getDurationMs(recording),
    framesCount: recording ? getFrameStats(recording.frames).framesCount : 0,
  },
  profiler: recording ? toStoredRecording(recording) : null,
  resources: resourcesDebugState || null,
  logs: logs || [],
});

/**
 * Written without indentation: a five minute run holds around 18 000 frames,
 * and indenting it would double the size of the file for nothing.
 */
export const serializeDebuggerRecordingFile = (
  file: DebuggerRecordingFile
): string => JSON.stringify(file);

export class DebuggerRecordingFileError extends Error {}

const asFiniteNumber = (value: any, fallback: number): number =>
  typeof value === 'number' && isFinite(value) ? value : fallback;

/**
 * Read back what a file holds. Every field of the profiler is rebuilt rather
 * than trusted: a file written by another version of the editor is missing
 * some of them, and a recording without its arrays would break every panel.
 */
export const parseDebuggerRecordingFile = (
  content: string
): DebuggerRecordingFile => {
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
  } catch (error) {
    throw new DebuggerRecordingFileError(
      'This file is not a recording of the debugger (invalid JSON).'
    );
  }
  if (!parsedContent || typeof parsedContent !== 'object') {
    throw new DebuggerRecordingFileError(
      'This file is not a recording of the debugger.'
    );
  }
  if (parsedContent.kind !== DEBUGGER_RECORDING_FILE_KIND) {
    throw new DebuggerRecordingFileError(
      'This file is not a recording of the debugger.'
    );
  }
  if (
    asFiniteNumber(parsedContent.formatVersion, 0) >
    DEBUGGER_RECORDING_FORMAT_VERSION
  ) {
    throw new DebuggerRecordingFileError(
      'This recording was written by a newer version of GDevelop.'
    );
  }

  const metadata = parsedContent.metadata || {};
  return {
    kind: DEBUGGER_RECORDING_FILE_KIND,
    formatVersion: asFiniteNumber(parsedContent.formatVersion, 1),
    metadata: {
      projectName: String(metadata.projectName || ''),
      ideVersion: String(metadata.ideVersion || ''),
      userAgent: String(metadata.userAgent || ''),
      exportedAt: String(metadata.exportedAt || ''),
      sceneName: metadata.sceneName ? String(metadata.sceneName) : null,
      durationMs: asFiniteNumber(metadata.durationMs, 0),
      framesCount: asFiniteNumber(metadata.framesCount, 0),
    },
    profiler: parsedContent.profiler || null,
    resources: parsedContent.resources || null,
    logs: Array.isArray(parsedContent.logs) ? parsedContent.logs : [],
  };
};

/**
 * The recording a file holds, in the shape the store keeps, with the state of
 * its transport set to what an imported recording needs: nothing is ever
 * appended to it.
 */
export const getRecordingFromFile = (
  file: DebuggerRecordingFile
): ProfilerRecording | null => {
  const storedRecording = file.profiler;
  if (!storedRecording) return null;

  const selectedRange: ?ProfilerRecordingRange =
    storedRecording.selectedRange &&
    typeof storedRecording.selectedRange.fromMs === 'number' &&
    typeof storedRecording.selectedRange.toMs === 'number'
      ? {
          fromMs: storedRecording.selectedRange.fromMs,
          toMs: storedRecording.selectedRange.toMs,
        }
      : null;

  return {
    recordingId: 0,
    status: 'stopped',
    startedAtGameTimeMs: asFiniteNumber(storedRecording.startedAtGameTimeMs, 0),
    startsAtGameTimeMs: Array.isArray(storedRecording.startsAtGameTimeMs)
      ? storedRecording.startsAtGameTimeMs
      : [],
    endedAtGameTimeMs:
      typeof storedRecording.endedAtGameTimeMs === 'number'
        ? storedRecording.endedAtGameTimeMs
        : null,
    stoppedByCap: !!storedRecording.stoppedByCap,
    names: Array.isArray(storedRecording.names) ? storedRecording.names : [],
    frames: Array.isArray(storedRecording.frames) ? storedRecording.frames : [],
    samples: Array.isArray(storedRecording.samples)
      ? storedRecording.samples
      : [],
    legacyOutput: storedRecording.legacyOutput || null,
    nextChunkIndex: 0,
    nameIdOffset: 0,
    selectedRange,
  };
};

/** A name that says what the file holds, without being asked. */
export const getDefaultRecordingFileName = (
  metadata: DebuggerRecordingMetadata
): string => {
  const safeProjectName = (metadata.projectName || 'game')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const date = (metadata.exportedAt || '').slice(0, 19).replace(/[:T]/g, '-');
  return `${safeProjectName ||
    'game'}-${date}${DEBUGGER_RECORDING_FILE_EXTENSION}`;
};

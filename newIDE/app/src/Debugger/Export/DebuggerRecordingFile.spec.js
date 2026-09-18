// @flow
import {
  DEBUGGER_RECORDING_FILE_KIND,
  DEBUGGER_RECORDING_FORMAT_VERSION,
  DebuggerRecordingFileError,
  getDefaultRecordingFileName,
  getRecordingFromFile,
  makeDebuggerRecordingFile,
  parseDebuggerRecordingFile,
  serializeDebuggerRecordingFile,
} from './DebuggerRecordingFile';
import { makeFakeRecordingStore } from '../ProfilerRecording/ProfilerRecordingFixtures';

describe('DebuggerRecordingFile', () => {
  const makeRecording = () => {
    const store = makeFakeRecordingStore(5000);
    const recording = store.getRecording('0');
    if (!recording) throw new Error('The fixture has no recording.');
    return recording;
  };

  const makeFile = () =>
    makeDebuggerRecordingFile({
      projectName: 'My Game',
      recording: makeRecording(),
      resourcesDebugState: null,
      logs: [
        {
          message: 'Something happened',
          type: 'info',
          group: 'Game',
          timestamp: 1,
        },
      ],
    });

  it('writes what the run was, so that two files can be told apart', () => {
    const file = makeFile();
    expect(file.kind).toBe(DEBUGGER_RECORDING_FILE_KIND);
    expect(file.formatVersion).toBe(DEBUGGER_RECORDING_FORMAT_VERSION);
    expect(file.metadata.projectName).toBe('My Game');
    expect(file.metadata.ideVersion).toBeTruthy();
    expect(file.metadata.framesCount).toBeGreaterThan(0);
    expect(file.metadata.durationMs).toBeGreaterThan(0);
    expect(file.metadata.sceneName).toBeTruthy();
  });

  it('leaves out the state of the transport', () => {
    const file = makeFile();
    expect(file.profiler).toBeTruthy();
    if (!file.profiler) throw new Error('No profiler in the file.');
    expect(file.profiler.recordingId).toBeUndefined();
    expect(file.profiler.nextChunkIndex).toBeUndefined();
    expect(file.profiler.nameIdOffset).toBeUndefined();
  });

  it('comes back the same after a round trip', () => {
    const recording = makeRecording();
    const file = makeDebuggerRecordingFile({
      projectName: 'My Game',
      recording,
      resourcesDebugState: null,
      logs: [],
    });

    const readFile = parseDebuggerRecordingFile(
      serializeDebuggerRecordingFile(file)
    );
    const readRecording = getRecordingFromFile(readFile);
    if (!readRecording) throw new Error('No recording in the file.');

    expect(readRecording.frames).toEqual(recording.frames);
    expect(readRecording.samples).toEqual(recording.samples);
    expect(readRecording.names).toEqual(recording.names);
    // Nothing is ever appended to an imported recording.
    expect(readRecording.status).toBe('stopped');
    expect(readRecording.nextChunkIndex).toBe(0);
    expect(readRecording.nameIdOffset).toBe(0);
  });

  it('refuses a file that is not a recording', () => {
    expect(() => parseDebuggerRecordingFile('not json at all')).toThrow(
      DebuggerRecordingFileError
    );
    expect(() => parseDebuggerRecordingFile('{"kind":"something"}')).toThrow(
      DebuggerRecordingFileError
    );
  });

  it('refuses a file written by a newer editor', () => {
    const file = makeFile();
    const newerContent = serializeDebuggerRecordingFile({
      ...file,
      formatVersion: DEBUGGER_RECORDING_FORMAT_VERSION + 1,
    });
    expect(() => parseDebuggerRecordingFile(newerContent)).toThrow(
      DebuggerRecordingFileError
    );
  });

  it('reads a file whose statistics fields are missing', () => {
    // What an older editor wrote, or a newer one having dropped a field: the
    // panels must still open on it rather than break.
    const content = JSON.stringify({
      kind: DEBUGGER_RECORDING_FILE_KIND,
      formatVersion: 1,
      metadata: {},
      profiler: { frames: [] },
      logs: null,
    });

    const readFile = parseDebuggerRecordingFile(content);
    expect(readFile.metadata.framesCount).toBe(0);
    expect(readFile.logs).toEqual([]);

    const readRecording = getRecordingFromFile(readFile);
    if (!readRecording) throw new Error('No recording in the file.');
    expect(readRecording.samples).toEqual([]);
    expect(readRecording.names).toEqual([]);
    expect(readRecording.legacyOutput).toBeNull();
  });

  it('names the file after the project and the date', () => {
    const fileName = getDefaultRecordingFileName({
      projectName: 'My Game!',
      ideVersion: '5.0.0',
      userAgent: '',
      exportedAt: '2026-09-18T10:20:30.000Z',
      sceneName: 'Scene',
      durationMs: 0,
      framesCount: 0,
    });
    expect(fileName).toBe('My-Game-2026-09-18-10-20-30.gdrecording.json');
  });
});

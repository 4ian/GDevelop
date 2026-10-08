// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { openBlobDownloadUrl } from '../../Utils/BlobDownloadUrlHolder';
import {
  type DebuggerRecordingFile,
  DebuggerRecordingFileError,
  parseDebuggerRecordingFile,
  serializeDebuggerRecordingFile,
  getDefaultRecordingFileName,
} from './DebuggerRecordingFile';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

const fileFilters = [
  {
    name: 'GDevelop debugger recording',
    extensions: ['json'],
  },
];

/**
 * One module for both platforms rather than a Writer/Opener injected by the
 * providers: there is a single consumer, and the pattern would cost wiring
 * in five files for nothing.
 */

/** Where the user wants the file written, or null if they gave up. */
const chooseSaveFilePath = async (
  defaultFileName: string
): Promise<?string> => {
  if (!dialog) return null;
  const browserWindow = remote.getCurrentWindow();
  const { filePath } = await dialog.showSaveDialog(browserWindow, {
    title: 'Export the recorded data of the debugger',
    filters: fileFilters,
    defaultPath: defaultFileName,
  });
  return filePath || null;
};

const downloadAsFile = (fileName: string, content: string) => {
  if (!document.body) throw new Error("Document body couldn't be found.");
  const blob = new Blob([content], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  openBlobDownloadUrl(blobUrl, fileName);
  URL.revokeObjectURL(blobUrl);
};

/**
 * Write the recording where the user asks. Returns where it was written, or
 * null when the user gave up (which is not an error).
 */
export const exportDebuggerRecording = async (
  file: DebuggerRecordingFile
): Promise<?string> => {
  const content = serializeDebuggerRecordingFile(file);
  const defaultFileName = getDefaultRecordingFileName(file.metadata);

  if (fsPromises && dialog) {
    const filePath = await chooseSaveFilePath(defaultFileName);
    if (!filePath) return null;
    await fsPromises.writeFile(filePath, content, { encoding: 'utf8' });
    return filePath;
  }

  // In a browser, the file goes to the downloads: nothing says where.
  downloadAsFile(defaultFileName, content);
  return defaultFileName;
};

/** Ask the browser for a file, as the desktop dialog does. */
const pickFileInBrowser = (): Promise<?File> =>
  new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const files = input.files;
      resolve(files && files.length ? files[0] : null);
    };
    // A cancelled picker never fires `change` in every browser: the promise
    // is then left pending, which is harmless (nothing is imported).
    input.click();
  });

const readFileInBrowser = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () =>
      reject(new DebuggerRecordingFileError('This file could not be read.'));
    reader.readAsText(file);
  });

/**
 * Read a recording chosen by the user. Returns null when they gave up, and
 * throws a `DebuggerRecordingFileError` when the file is not one of ours.
 */
export const importDebuggerRecording = async (): Promise<?DebuggerRecordingFile> => {
  let content: ?string = null;

  if (fsPromises && dialog) {
    const browserWindow = remote.getCurrentWindow();
    const { filePaths } = await dialog.showOpenDialog(browserWindow, {
      title: 'Import a recording of the debugger',
      properties: ['openFile'],
      message: 'Choose a recording exported from the debugger',
      filters: fileFilters,
    });
    if (!filePaths || !filePaths.length) return null;
    content = await fsPromises.readFile(filePaths[0], { encoding: 'utf8' });
  } else {
    const file = await pickFileInBrowser();
    if (!file) return null;
    content = await readFileInBrowser(file);
  }

  return parseDebuggerRecordingFile(content || '');
};

// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { type FileMetadata } from '../index';
import { unsplit } from '../../Utils/ObjectSplitter';
import { openFilePicker, readJSONFile } from '../../Utils/FileSystem';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export const onOpenWithPicker = (): Promise<?FileMetadata> => {
  return openFilePicker({
    title: 'Open a project',
    properties: ['openFile'],
    message:
      'If you want to open your GDevelop 4 project, be sure to save it as a .json file',
    filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
  }).then(filePath => (filePath ? { fileIdentifier: filePath } : null));
};

export const onOpen = (
  fileMetadata: FileMetadata
): Promise<{|
  content: Object,
|}> => {
  const filePath = fileMetadata.fileIdentifier;
  const projectPath = path.dirname(filePath);
  return readJSONFile(filePath).then(object => {
    return unsplit(object, {
      getReferencePartialObject: referencePath => {
        return readJSONFile(path.join(projectPath, referencePath) + '.json');
      },
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
      // Limit unsplitting to depth 3 (which would allow properties of layouts/external layouts/external events
      // to be un-splitted, but not the content of these properties), to avoid very slow processing
      // of large game files.
      maxUnsplitDepth: 3,
    }).then(() => {
      return { content: object };
    });
  });
};

export const getAutoSaveCreationDate = async (
  fileMetadata: FileMetadata,
  compareLastModified: boolean
): Promise<?number> => {
  const filePath = fileMetadata.fileIdentifier;
  const autoSavePath = filePath + '.autosave';
  if (fs.existsSync(autoSavePath)) {
    const autoSavedTime = fs.statSync(autoSavePath).mtime.getTime();
    if (!compareLastModified) {
      return autoSavedTime;
    }
    try {
      const saveTime = fs.statSync(filePath).mtime.getTime();
      // When comparing the last modified time, add a 5 seconds margin to avoid
      // showing the warning if the user has just saved the project, or if the
      // project has been decompressed from a zip file, causing the last modified
      // time to be the time of decompression.
      return autoSavedTime > saveTime + 5000 ? autoSavedTime : null;
    } catch (err) {
      console.error('Unable to compare *.autosave to project', err);
      return null;
    }
  }
  return null;
};

export const onGetAutoSave = (fileMetadata: FileMetadata) => {
  return Promise.resolve({
    ...fileMetadata,
    fileIdentifier: fileMetadata.fileIdentifier + '.autosave',
  });
};

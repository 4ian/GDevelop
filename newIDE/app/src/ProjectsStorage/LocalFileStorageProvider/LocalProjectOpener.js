// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { type FileMetadata } from '../index';
import { unsplit } from '../../Utils/ObjectSplitter';
import { openFilePicker, readJSONFile } from '../../Utils/FileSystem';
import {
  getLegacyMigrationSourceHash,
  hashLegacySource,
  migrateLegacyProject,
  openMultiFileProject,
} from './LocalMultiFileProject';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export const onOpenWithPicker = (): Promise<?FileMetadata> => {
  return openFilePicker({
    title: 'Open a project',
    properties: ['openFile'],
    message:
      'If you want to open your GDevelop 4 project, be sure to save it as a .json file',
    filters: [{ name: 'GDevelop project', extensions: ['settings', 'json'] }],
    // $FlowFixMe[incompatible-type]
  }).then(filePath => (filePath ? { fileIdentifier: filePath } : null));
};

export const onOpen = (
  fileMetadata: FileMetadata
): Promise<{|
  content: Object,
  fileMetadata?: FileMetadata,
|}> => {
  const filePath = fileMetadata.fileIdentifier;
  if (path.basename(filePath).toLowerCase() === 'project.settings') {
    return openMultiFileProject(filePath).then(content => ({ content }));
  }
  const projectPath = path.dirname(filePath);
  return fs.promises.readFile(filePath, 'utf8').then(legacySource => {
    return readJSONFile(filePath).then(object => {
      return unsplit(object, {
        getReferencePartialObject: referencePath => {
          return readJSONFile(path.join(projectPath, referencePath) + '.json');
        },
        isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
        // Migration must reconstruct the complete legacy reference tree before
        // ownership projection. Keep a finite guard against malicious cycles.
        maxUnsplitDepth: 100,
      }).then(async () => {
        const entryPath = path.join(projectPath, 'project.settings');
        if (fs.existsSync(entryPath)) {
          const migrationHash = await getLegacyMigrationSourceHash(entryPath);
          if (
            migrationHash &&
            migrationHash !== hashLegacySource(legacySource)
          ) {
            throw new Error(
              'The legacy JSON and migrated project.settings have diverged. Open project.settings or import the changed JSON into a different folder.'
            );
          }
          return {
            content: await openMultiFileProject(entryPath),
            fileMetadata: { ...fileMetadata, fileIdentifier: entryPath },
          };
        }
        const migration = await migrateLegacyProject({
          legacyPath: filePath,
          legacySource,
          legacyProject: object,
        });
        return {
          content: object,
          fileMetadata: {
            ...fileMetadata,
            fileIdentifier: migration.entryPath,
          },
        };
      });
    });
  });
};

export const getMultiFileAutoSavePath = (filePath: string): string =>
  path.join(
    path.dirname(filePath),
    '.gdevelop',
    'autosave',
    'current',
    'project.settings'
  );

export const getAutoSaveCreationDate = async (
  fileMetadata: FileMetadata,
  compareLastModified: boolean
): Promise<?number> => {
  const filePath = fileMetadata.fileIdentifier;
  const autoSavePath =
    path.basename(filePath).toLowerCase() === 'project.settings'
      ? getMultiFileAutoSavePath(filePath)
      : filePath + '.autosave';
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

export const onGetAutoSave = (
  fileMetadata: FileMetadata
): Promise<{
  fileIdentifier: string,
  gameId?: string,
  lastModifiedDate?: number,
  name?: string,
  ownerId?: string,
  version?: string,
}> => {
  return Promise.resolve({
    ...fileMetadata,
    fileIdentifier:
      path.basename(fileMetadata.fileIdentifier).toLowerCase() ===
      'project.settings'
        ? getMultiFileAutoSavePath(fileMetadata.fileIdentifier)
        : fileMetadata.fileIdentifier + '.autosave',
  });
};

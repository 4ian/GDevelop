// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { serializeToJSObject, serializeToJSON } from '../../Utils/Serializer';
import { type FileMetadata, type SaveAsLocation } from '../index';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  split,
  splitPaths,
  getSlugifiedUniqueNameFromProperty,
} from '../../Utils/ObjectSplitter';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import LocalFolderPicker from '../../UI/LocalFolderPicker';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

export const splittedProjectFolderNames = [
  'layouts',
  'externalLayouts',
  'externalEvents',
  'eventsFunctionsExtensions',
];

const checkFileContent = (filePath: string, expectedContent: string) => {
  const time = performance.now();
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'utf8' }, (err, content) => {
      if (err) return reject(err);

      if (content === '') {
        reject(new Error(`Written file is empty, did the write fail?`));
      }
      if (content !== expectedContent) {
        reject(
          new Error(
            `Written file is not containing the expected content, did the write fail?`
          )
        );
      }
      const verificationTime = performance.now() - time;
      console.info(
        `Verified ${filePath} content in ${verificationTime.toFixed()}ms.`
      );
      resolve();
    });
  });
};

const writeAndCheckFile = async (
  content: string,
  filePath: string
): Promise<void> => {
  if (!fs) throw new Error('Filesystem is not supported.');
  if (content === '')
    throw new Error('The content to save on disk is empty. Aborting.');

  await fs.ensureDir(path.dirname(filePath));

  await fs.writeFile(filePath, content);
  await checkFileContent(filePath, content);
};

const writeAndCheckFormattedJSONFile = async (
  object: Object,
  filePath: string
): Promise<void> => {
  const content = JSON.stringify(object, null, 2);
  await writeAndCheckFile(content, filePath);
};

const writeProjectFiles = (
  project: gdProject,
  filePath: string,
  projectPath: string
): Promise<void> => {
  const serializedProjectObject = serializeToJSObject(project);
  if (project.isFolderProject()) {
    const partialObjects = split(serializedProjectObject, {
      pathSeparator: '/',
      getArrayItemReferenceName: getSlugifiedUniqueNameFromProperty('name'),
      shouldSplit: splitPaths(
        new Set(
          splittedProjectFolderNames.map(folderName => `/${folderName}/*`)
        )
      ),
      isReferenceMagicPropertyName: '__REFERENCE_TO_SPLIT_OBJECT',
    });

    return Promise.all(
      partialObjects.map(partialObject => {
        return writeAndCheckFormattedJSONFile(
          partialObject.object,
          path.join(projectPath, partialObject.reference) + '.json'
        ).catch(err => {
          console.error('Unable to write a partial file:', err);
          throw err;
        });
      })
    ).then(() => {
      return writeAndCheckFormattedJSONFile(
        serializedProjectObject,
        filePath
      ).catch(err => {
        console.error('Unable to write the split project:', err);
        throw err;
      });
    });
  } else {
    return writeAndCheckFormattedJSONFile(
      serializedProjectObject,
      filePath
    ).catch(err => {
      console.error('Unable to write the project:', err);
      throw err;
    });
  }
};

export const onSaveProject = (
  project: gdProject,
  fileMetadata: FileMetadata
): Promise<{|
  wasSaved: boolean,
  fileMetadata: FileMetadata,
|}> => {
  const filePath = fileMetadata.fileIdentifier;
  const now = Date.now();
  if (!filePath) {
    return Promise.reject(
      'Project file is empty, "Save as" should have been called?'
    );
  }
  // Ensure we always pick the latest name and gameId.
  const newFileMetadata = {
    ...fileMetadata,
    name: project.getName(),
    gameId: project.getProjectUuid(),
    lastModifiedDate: now,
  };

  const projectPath = path.dirname(filePath);
  return writeProjectFiles(project, filePath, projectPath).then(() => {
    return { wasSaved: true, fileMetadata: newFileMetadata }; // Save was properly done
  });
};

export const onChooseSaveProjectAsLocation = async ({
  project,
  fileMetadata,
}: {|
  project: gdProject,
  fileMetadata: ?FileMetadata, // This is the current location.
|}): Promise<{|
  saveAsLocation: ?SaveAsLocation, // This is the newly chosen location (or null if cancelled).
|}> => {
  const defaultPath = fileMetadata ? fileMetadata.fileIdentifier : '';
  const browserWindow = remote.getCurrentWindow();
  const saveDialogOptions = {
    defaultPath,
    filters: [{ name: 'GDevelop 5 project', extensions: ['json'] }],
  };

  if (!dialog) {
    throw new Error('Unsupported');
  }
  const filePath = dialog.showSaveDialogSync(browserWindow, saveDialogOptions);
  if (!filePath) {
    return { saveAsLocation: null };
  }

  return {
    saveAsLocation: {
      fileIdentifier: filePath,
    },
  };
};

export const onSaveProjectAs = async (
  project: gdProject,
  saveAsLocation: ?SaveAsLocation,
  options: {|
    onStartSaving: () => void,
    onMoveResources: ({|
      newFileMetadata: FileMetadata,
    |}) => Promise<void>,
  |}
): Promise<{|
  wasSaved: boolean,
  fileMetadata: ?FileMetadata,
|}> => {
  if (!saveAsLocation)
    throw new Error('A location was not chosen before saving as.');
  const filePath = saveAsLocation.fileIdentifier;
  if (!filePath)
    throw new Error('A file path was not chosen before saving as.');

  options.onStartSaving();
  // Ensure we always pick the latest name and gameId.
  const newFileMetadata = {
    fileIdentifier: filePath,
    name: project.getName(),
    gameId: project.getProjectUuid(),
    lastModifiedDate: Date.now(),
  };

  // Move (copy or download, etc...) the resources first.
  await options.onMoveResources({ newFileMetadata });

  // Save the project when resources have been copied.
  const projectPath = path.dirname(filePath);
  project.setProjectFile(filePath);

  await writeProjectFiles(project, filePath, projectPath);
  return {
    wasSaved: true,
    fileMetadata: newFileMetadata,
  };
};

export const onAutoSaveProject = (
  project: gdProject,
  fileMetadata: FileMetadata
): Promise<void> => {
  const autoSavePath = fileMetadata.fileIdentifier + '.autosave';
  return writeAndCheckFile(serializeToJSON(project), autoSavePath).catch(
    err => {
      console.error(`Unable to write ${autoSavePath}:`, err);
      throw err;
    }
  );
};

export const getWriteErrorMessage = (error: Error): MessageDescriptor =>
  t`An error occurred when saving the project. Please try again by choosing another location.`;

// See https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file
const forbiddenCharacterRegex = /\\ | \/ | : | \* | \? | " | < | > | \|/g;
const consecutiveSpacesRegex = /\s+/g;
const cleanUpProjectFileName = (projectFileName: string) =>
  (projectFileName.length > 200
    ? projectFileName.substring(0, 200)
    : projectFileName
  )
    .replace(forbiddenCharacterRegex, ' ')
    .replace(consecutiveSpacesRegex, ' ')
    .trim();

export const getProjectLocation = ({
  projectName,
  saveAsLocation,
  newProjectsDefaultFolder,
}: {
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  newProjectsDefaultFolder?: string,
}): SaveAsLocation => {
  const outputPath = saveAsLocation
    ? path.dirname(saveAsLocation.fileIdentifier)
    : newProjectsDefaultFolder
    ? newProjectsDefaultFolder
    : '';
  const projectFileName = projectName
    ? cleanUpProjectFileName(projectName) + '.json'
    : 'game.json';
  return {
    fileIdentifier: path.join(outputPath, projectFileName),
  };
};

export const renderNewProjectSaveAsLocationChooser = ({
  projectName,
  saveAsLocation,
  setSaveAsLocation,
  newProjectsDefaultFolder,
}: {|
  projectName: string,
  saveAsLocation: ?SaveAsLocation,
  setSaveAsLocation: (?SaveAsLocation) => void,
  newProjectsDefaultFolder?: string,
|}) => {
  const projectLocation = getProjectLocation({
    projectName,
    saveAsLocation,
    newProjectsDefaultFolder,
  });
  return (
    <LocalFolderPicker
      fullWidth
      value={path.dirname(projectLocation.fileIdentifier)}
      onChange={newOutputPath => {
        const newOutputFileIdentifier = path.join(
          newOutputPath,
          path.basename(projectLocation.fileIdentifier)
        );
        setSaveAsLocation(
          getProjectLocation({
            projectName,
            saveAsLocation: {
              fileIdentifier: newOutputFileIdentifier,
            },
            newProjectsDefaultFolder,
          })
        );
      }}
      type="create-game"
    />
  );
};

export const isTryingToSaveInForbiddenPath = (filePath: string): boolean => {
  if (!remote) return false; // This should not happen, but let's be safe.
  // If the user is saving locally and chose the same location as where the
  // executable is running, prevent this, as it will be deleted when the app is updated.
  const exePath = remote.app.getPath('exe');
  if (!exePath) return false; // This should not happen, but let's be safe.
  const gdevelopDirectory = path.dirname(exePath);
  return filePath.startsWith(gdevelopDirectory);
};

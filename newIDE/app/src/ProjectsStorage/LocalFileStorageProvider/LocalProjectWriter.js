// @flow
import { serializeToJSObject, serializeToJSON } from '../../Utils/Serializer';
import { type FileMetadata } from '../index';
import optionalRequire from '../../Utils/OptionalRequire';
import {
  split,
  splitPaths,
  getSlugifiedUniqueNameFromProperty,
} from '../../Utils/ObjectSplitter';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { t } from '@lingui/macro';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const remote = optionalRequire('@electron/remote');
const dialog = remote ? remote.dialog : null;

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

export const writeAndCheckFile = async (
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
        new Set([
          '/layouts/*',
          '/externalLayouts/*',
          '/externalEvents/*',
          '/layouts/*',
          '/eventsFunctionsExtensions/*',
        ])
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
  const newFileMetadata = {
    ...fileMetadata,
    lastModifiedDate: now,
  };

  const projectPath = path.dirname(filePath);
  return writeProjectFiles(project, filePath, projectPath).then(() => {
    return { wasSaved: true, fileMetadata: newFileMetadata }; // Save was properly done
  });
};

export const onSaveProjectAs = async (
  project: gdProject,
  fileMetadata: ?FileMetadata,
  options: {|
    context?: 'duplicateCurrentProject',
    onStartSaving: () => void,
    onMoveResources: (options: {|
      newFileMetadata: FileMetadata,
    |}) => Promise<void>,
  |}
): Promise<{|
  wasSaved: boolean,
  fileMetadata: ?FileMetadata,
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
    return { wasSaved: false, fileMetadata };
  }
  const projectPath = path.dirname(filePath);

  if (options && options.onStartSaving) options.onStartSaving();

  const newFileMetadata = {
    ...fileMetadata,
    fileIdentifier: filePath,
  };

  await options.onMoveResources({ newFileMetadata });

  // Update the project with the new file path (resources have already been updated)
  project.setProjectFile(filePath);

  return writeProjectFiles(project, filePath, projectPath).then(() => {
    return {
      wasSaved: true,
      fileMetadata: {
        ...newFileMetadata,
        lastModifiedDate: Date.now(),
      },
    }; // Save was properly done
  });
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

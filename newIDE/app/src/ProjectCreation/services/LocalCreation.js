// @flow
import axios from 'axios';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import LocalFileStorageProvider from '../../ProjectsStorage/LocalFileStorageProvider';
import { type StorageProvider, type FileMetadata } from '../../ProjectsStorage';
import optionalRequire from '../../Utils/OptionalRequire.js';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { writeAndCheckFile } from '../../ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { showGameFileCreationError } from '../LocalExamples';
const gd: libGDevelop = global.gd;

const path = optionalRequire('path');
var fs = optionalRequire('fs-extra');

export const onCreateBlank = async ({
  i18n,
  outputPath,
}: {|
  i18n: I18nType,
  outputPath?: string,
|}): Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
|}> => {
  if (!fs || !outputPath) return;

  try {
    fs.mkdirsSync(outputPath);
  } catch (error) {
    showGameFileCreationError(i18n, outputPath, error);
    return;
  }

  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();
  const filePath = path.join(outputPath, 'game.json');
  project.setProjectFile(filePath);
  sendNewGameCreated('');
  return {
    project,
    storageProvider: LocalFileStorageProvider,
    fileMetadata: { fileIdentifier: filePath },
  };
};

export const onCreateFromExampleShortHeader = async ({
  i18n,
  exampleShortHeader,
  outputPath,
}: {|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  outputPath?: string,
|}): Promise<?{|
  storageProvider: StorageProvider,
  fileMetadata: FileMetadata,
|}> => {
  if (!fs || !outputPath) return;
  try {
    const example = await getExample(exampleShortHeader);

    // Prepare the folder for the example.
    fs.mkdirsSync(outputPath);

    // Download the project file and save it.
    const response = await axios.get(example.projectFileUrl, {
      responseType: 'text',
      // Required to properly get the response as text, and not as JSON:
      transformResponse: [data => data],
    });
    const projectFileContent = response.data;
    const localFilePath = path.join(outputPath, 'game.json');

    await writeAndCheckFile(projectFileContent, localFilePath);

    sendNewGameCreated(example.projectFileUrl);
    return {
      storageProvider: LocalFileStorageProvider,
      fileMetadata: { fileIdentifier: localFilePath },
    };
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to load the example or save it on disk.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
    return;
  }
};

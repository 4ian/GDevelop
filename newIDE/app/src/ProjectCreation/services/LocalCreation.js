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

export const onCreateBlank = (
  onOpenCallback: (
    project: gdProject,
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void
) => async (i18n: I18nType, outputPath?: string) => {
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
  onOpenCallback(project, LocalFileStorageProvider, {
    fileIdentifier: filePath,
  });
  sendNewGameCreated('');
};

export const onCreateFromExampleShortHeader = (
  isOpeningCallback: boolean => void,
  onOpenCallback: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void
) => async (
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  outputPath?: string
) => {
  if (!fs || !outputPath) return;
  try {
    isOpeningCallback(true);
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

    // Open the project file. Note that resources that are URLs will be downloaded
    // thanks to the LocalResourceFetcher.
    onOpenCallback(LocalFileStorageProvider, {
      fileIdentifier: localFilePath,
    });

    sendNewGameCreated(example.projectFileUrl);
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to load the example or save it on disk.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
  } finally {
    isOpeningCallback(false);
  }
};

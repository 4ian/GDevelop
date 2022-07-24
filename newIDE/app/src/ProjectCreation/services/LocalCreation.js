// @flow
import axios from 'axios';
import { t } from '@lingui/macro';

import LocalFileStorageProvider from '../../ProjectsStorage/LocalFileStorageProvider';
import optionalRequire from '../../Utils/OptionalRequire';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { writeAndCheckFile } from '../../ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import {
  type OnCreateBlankFunction,
  type OnCreateFromExampleShortHeaderFunction,
} from '../CreateProjectDialog';
const gd: libGDevelop = global.gd;

const path = optionalRequire('path');
var fs = optionalRequire('fs-extra');

export const onCreateBlank: OnCreateBlankFunction = async ({
  i18n,
  settings,
}) => {
  const { projectName, outputPath } = settings;
  if (!fs || !outputPath) return;

  try {
    fs.mkdirsSync(outputPath);
  } catch (error) {
    showErrorBox({
      message: i18n._(
        t`Unable to create the game in the specified folder. Check that you have permissions to write in this folder: ${outputPath} or choose another folder.`
      ),
      rawError: error,
      errorId: 'local-example-creation-error',
    });
    return;
  }

  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();
  const filePath = path.join(outputPath, 'game.json');
  project.setProjectFile(filePath);
  sendNewGameCreated({ exampleUrl: '', exampleSlug: '' });
  return {
    project,
    storageProvider: LocalFileStorageProvider,
    fileMetadata: { fileIdentifier: filePath, lastModifiedDate: Date.now() },
    projectName,
  };
};

export const onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction = async ({
  i18n,
  exampleShortHeader,
  settings,
}) => {
  const { projectName, outputPath } = settings;
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

    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
    });
    return {
      storageProvider: LocalFileStorageProvider,
      fileMetadata: {
        fileIdentifier: localFilePath,
        lastModifiedDate: Date.now(),
      },
      projectName,
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

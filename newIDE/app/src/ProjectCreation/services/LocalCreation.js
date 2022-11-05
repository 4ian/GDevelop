// @flow
import { t } from '@lingui/macro';

import LocalFileStorageProvider from '../../ProjectsStorage/LocalFileStorageProvider';
import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import optionalRequire from '../../Utils/OptionalRequire';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
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
  if (!fs || !outputPath) return null;

  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();
  const localFilePath = path.join(outputPath, 'game.json');
  project.setProjectFile(localFilePath);
  sendNewGameCreated({ exampleUrl: '', exampleSlug: '' });
  return {
    source: {
      project,
      projectName,
      storageProvider: null,
      fileMetadata: null,
    },
    destination: {
      storageProvider: LocalFileStorageProvider,
      fileMetadata: { fileIdentifier: localFilePath },
    },
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

    const localFilePath = path.join(outputPath, 'game.json');
    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
    });
    return {
      source: {
        projectName,
        project: null,
        storageProvider: UrlStorageProvider,
        fileMetadata: {
          fileIdentifier: example.projectFileUrl,
        },
      },
      destination: {
        storageProvider: LocalFileStorageProvider,
        fileMetadata: {
          fileIdentifier: localFilePath,
        },
      },
    };
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
    return;
  }
};

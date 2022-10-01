// @flow
import { t } from '@lingui/macro';

import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  type OnCreateBlankFunction,
  type OnCreateFromExampleShortHeaderFunction,
} from '../CreateProjectDialog';

const gd: libGDevelop = global.gd;

export const onCreateBlank: OnCreateBlankFunction = async ({
  i18n,
  settings,
}) => {
  sendNewGameCreated({ exampleUrl: '', exampleSlug: '' });

  const { projectName } = settings;

  const project = gd.ProjectHelper.createNewGDJSProject();
  return {
    source: {
      project,
      projectName,
      storageProvider: null,
      fileMetadata: null,
    },
    destination: null,
  };
};

export const onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction = async ({
  i18n,
  exampleShortHeader,
  settings,
}) => {
  try {
    const { projectName } = settings;

    const example = await getExample(exampleShortHeader);
    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
    });
    return {
      source: {
        project: null,
        projectName,
        storageProvider: UrlStorageProvider,
        fileMetadata: {
          fileIdentifier: example.projectFileUrl,
        },
      },
      destination: null,
    };
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'browser-example-load-error',
    });
    return;
  }
};

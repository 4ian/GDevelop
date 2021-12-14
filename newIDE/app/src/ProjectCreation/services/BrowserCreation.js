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

// Signatures of this function and its arguments contain useless arguments
// because this function has to match the signature of LocalCreation.onCreateBlank
// that needs these arguments.
export const onCreateBlank: OnCreateBlankFunction = async ({
  i18n,
  outputPath,
  projectName,
}) => {
  sendNewGameCreated('');

  const project = gd.ProjectHelper.createNewGDJSProject();
  return {
    project,
    projectName,
    storageProvider: null,
    fileMetadata: null,
  };
};

export const onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction = async ({
  i18n,
  exampleShortHeader,
  projectName,
  outputPath,
}) => {
  try {
    const example = await getExample(exampleShortHeader);
    sendNewGameCreated(example.projectFileUrl);
    return {
      storageProvider: UrlStorageProvider,
      projectName,
      fileMetadata: {
        fileIdentifier: example.projectFileUrl,
      },
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

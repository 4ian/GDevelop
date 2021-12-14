// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import { type StorageProvider, type FileMetadata } from '../../ProjectsStorage';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
const gd: libGDevelop = global.gd;

// Signatures of this function and its arguments contain useless arguments
// because this function has to match the signature of LocalCreation.onCreateBlank
// that needs these arguments.
export const onCreateBlank = async ({
  i18n,
  outputPath,
  projectName,
}: {|
  i18n: I18nType,
  projectName: string,
  outputPath?: string,
|}): Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
|}> => {
  sendNewGameCreated('');

  const project = gd.ProjectHelper.createNewGDJSProject();
  project.setName(projectName);
  return {
    project,
    storageProvider: null,
    fileMetadata: null,
  };
};

export const onCreateFromExampleShortHeader = async ({
  i18n,
  exampleShortHeader,
  projectName,
  outputPath,
}: {|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  projectName: string,
  outputPath?: string,
|}): Promise<?{|
  storageProvider: StorageProvider,
  fileMetadata: FileMetadata,
|}> => {
  try {
    const example = await getExample(exampleShortHeader);
    sendNewGameCreated(example.projectFileUrl);
    return {
      storageProvider: UrlStorageProvider,
      fileMetadata: {
        projectName,
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

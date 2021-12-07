// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import UrlStorageProvider from '../../ProjectsStorage/UrlStorageProvider';
import { type StorageProvider, type FileMetadata } from '../../ProjectsStorage';
import { getExample } from '../../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../../Utils/Analytics/EventSender';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';

export const onCreateFromExampleShortHeader = (
  isOpeningCallback: boolean => void,
  onOpenCallback: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void
) => async (
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
) => {
  try {
    isOpeningCallback(true);
    const example = await getExample(exampleShortHeader);
    onOpenCallback(UrlStorageProvider, {
      fileIdentifier: example.projectFileUrl,
    });
    sendNewGameCreated(example.projectFileUrl);
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'browser-example-load-error',
    });
  } finally {
    isOpeningCallback(false);
  }
};

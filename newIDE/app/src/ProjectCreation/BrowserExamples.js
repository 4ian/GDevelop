// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { ExampleStore } from '../AssetStore/ExampleStore';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
import {
  getExample,
  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
|};

export default function BrowserExamples(props: Props) {
  const [isOpening, setIsOpening] = React.useState(false);

  return (
    <I18n>
      {({ i18n }) => (
        <ExampleStore
          isOpening={isOpening}
          onOpen={async (exampleShortHeader: ExampleShortHeader) => {
            try {
              setIsOpening(true);
              const example = await getExample(exampleShortHeader);
              props.onOpen(UrlStorageProvider, {
                fileIdentifier: example.projectFileUrl,
              });
              sendNewGameCreated(example.projectFileUrl);
            } catch (error) {
              showErrorBox({
                message:
                  i18n._(t`Unable to fetch the example.`) +
                  ' ' +
                  i18n._(
                    t`Verify your internet connection or try again later.`
                  ),
                rawError: error,
                errorId: 'browser-example-load-error',
              });
            } finally {
              setIsOpening(false);
            }
          }}
        />
      )}
    </I18n>
  );
}

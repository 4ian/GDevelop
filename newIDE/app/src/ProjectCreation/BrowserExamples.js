// @flow
import * as React from 'react';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import { ExampleStore } from '../AssetStore/ExampleStore';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { getExample } from '../Utils/GDevelopServices/Asset';

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
|};

export default function BrowserExamples(props: Props) {
  const [isOpening, setIsOpening] = React.useState(false);

  return (
    <ExampleStore
      isOpening={isOpening}
      onOpen={async (exampleShortHeader: ExampleShortHeader) => {
        try {
          setIsOpening(true);
          const example = getExample(exampleShortHeader);
          props.onOpen(UrlStorageProvider, {
            fileIdentifier: example.projectFileUrl,
          });
          sendNewGameCreated(example.projectFileUrl);
        } catch (error) {
          showErrorBox({
            message: 'TODO',
            rawError: error,
            errorId: 'browser-example-load-error',
          });
        } finally {
          setIsOpening(false);
        }
      }}
    />
  );
}

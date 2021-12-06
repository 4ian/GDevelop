// @flow
import { I18n } from '@lingui/react';
import * as React from 'react';
import { ExampleStore } from '../AssetStore/ExampleStore';
import {

  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { type OnCreateFromExampleShortHeaderFunction } from '../ProjectCreation/CreateProjectDialog';

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

export default function BrowserExamples({
  onOpen,
  onCreateFromExampleShortHeader,
}: Props) {
  const [isOpening, setIsOpening] = React.useState(false);

  return (
    <I18n>
      {({ i18n }) => (
        <ExampleStore
          isOpening={isOpening}
          onOpen={(exampleShortHeader: ExampleShortHeader) =>
            onCreateFromExampleShortHeader(setIsOpening, onOpen)(
              i18n,
              exampleShortHeader
            )
          }
        />
      )}
    </I18n>
  );
}

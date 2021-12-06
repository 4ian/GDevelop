// @flow
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ExampleStore } from '../AssetStore/ExampleStore';
import {

  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  onCreateFromExampleShortHeader: (
    isOpeningCallback: (boolean) => void,
    onOpenCallback: any
  ) => (
    i18n: I18nType,
    exampleShortHeader: ExampleShortHeader
  ) => Promise<void>,
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

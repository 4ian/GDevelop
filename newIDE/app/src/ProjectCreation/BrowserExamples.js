// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { ExampleStore } from '../AssetStore/ExampleStore';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../ProjectCreation/CreateProjectDialog';

type Props = {|
  onOpen: OnOpenProjectAfterCreationFunction,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

export default function BrowserExamples({
  onOpen,
  onCreateFromExampleShortHeader,
}: Props) {
  const [isOpening, setIsOpening] = React.useState(false);

  const createProjectFromExample = async (
    i18n: I18nType,
    exampleShortHeader: ExampleShortHeader
  ) => {
    setIsOpening(true);
    try {
      const projectMetadata = await onCreateFromExampleShortHeader({
        i18n,
        exampleShortHeader: exampleShortHeader,
      });
      if (projectMetadata) {
        const { storageProvider, fileMetadata } = projectMetadata;
        onOpen({ storageProvider, fileMetadata, shouldCloseDialog: true });
      }
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <ExampleStore
          isOpening={isOpening}
          onOpen={(exampleShortHeader: ExampleShortHeader) =>
            createProjectFromExample(i18n, exampleShortHeader)
          }
        />
      )}
    </I18n>
  );
}

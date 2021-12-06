// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Divider from '@material-ui/core/Divider';
import { ExampleStore } from '../AssetStore/ExampleStore';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { Column } from '../UI/Grid';
import { showErrorBox } from '../UI/Messages/MessageBox';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import LocalProjectPreCreationDialog from './LocalProjectPreCreationDialog';
import { type OnCreateFromExampleShortHeaderFunction } from '../ProjectCreation/CreateProjectDialog';

type Props = {|
  onOpen: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void,
  onChangeOutputPath: (outputPath: string) => void,
  outputPath: string,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

export const showGameFileCreationError = (
  i18n: I18nType,
  outputPath: string,
  rawError: Error
) => {
  showErrorBox({
    message: i18n._(
      t`Unable to create the game in the specified folder. Check that you have permissions to write in this folder: ${outputPath} or choose another folder.`
    ),
    rawError,
    errorId: 'local-example-creation-error',
  });
};

export default function LocalExamples({
  outputPath,
  onChangeOutputPath,
  onOpen,
  onCreateFromExampleShortHeader,
}: Props) {
  const [isOpening, setIsOpening] = React.useState<boolean>(false);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Column noMargin expand useFullHeight>
            <Divider />
            <ExampleStore
              isOpening={isOpening}
              onOpen={async (example: ?ExampleShortHeader) =>
                setSelectedExampleShortShortHeader(example)
              }
            />
          </Column>
          {selectedExampleShortHeader && (
            <LocalProjectPreCreationDialog
              open
              onClose={() => setSelectedExampleShortShortHeader(null)}
              onCreate={() =>
                onCreateFromExampleShortHeader(setIsOpening, onOpen)(
                  i18n,
                  selectedExampleShortHeader,
                  outputPath
                )
              }
              outputPath={outputPath}
              onChangeOutputPath={onChangeOutputPath}
            />
          )}
        </>
      )}
    </I18n>
  );
}

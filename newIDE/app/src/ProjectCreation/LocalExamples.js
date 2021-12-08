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
import LocalProjectPreCreationDialog from './LocalProjectPreCreationDialog';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../ProjectCreation/CreateProjectDialog';

type Props = {|
  onOpen: OnOpenProjectAfterCreationFunction,
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

  const createProjectFromExample = async (i18n: I18nType) => {
    if (!selectedExampleShortHeader) return;

    setIsOpening(true);

    const projectMetadata = await onCreateFromExampleShortHeader({
      i18n,
      outputPath,
      exampleShortHeader: selectedExampleShortHeader,
    });
    if (!!projectMetadata) {
      const { storageProvider, fileMetadata } = projectMetadata;
      onOpen({ storageProvider, fileMetadata, shouldCloseDialog: true });
    }
    setIsOpening(false);
  };

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
              onCreate={() => createProjectFromExample(i18n)}
              outputPath={outputPath}
              onChangeOutputPath={onChangeOutputPath}
            />
          )}
        </>
      )}
    </I18n>
  );
}

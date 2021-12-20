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
import ProjectPreCreationDialog from './ProjectPreCreationDialog';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../ProjectCreation/CreateProjectDialog';
import generateName from '../Utils/ProjectNameGenerator';

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
  const [newProjectName, setNewProjectName] = React.useState<string>(
    generateName()
  );
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);

  const createProjectFromExample = async (i18n: I18nType) => {
    if (!selectedExampleShortHeader) return;

    setIsOpening(true);
    try {
      const projectMetadata = await onCreateFromExampleShortHeader({
        i18n,
        outputPath,
        projectName: newProjectName,
        exampleShortHeader: selectedExampleShortHeader,
      });
      if (!!projectMetadata) {
        onOpen({ ...projectMetadata, shouldCloseDialog: true });
      }
    } finally {
      setIsOpening(false);
    }
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
            <ProjectPreCreationDialog
              open
              isOpening={isOpening}
              onClose={() => setSelectedExampleShortShortHeader(null)}
              onCreate={() => createProjectFromExample(i18n)}
              onClickGenerateProjectName={() =>
                setNewProjectName(generateName())
              }
              outputPath={outputPath}
              onChangeOutputPath={onChangeOutputPath}
              projectName={newProjectName}
              onChangeProjectName={setNewProjectName}
            />
          )}
        </>
      )}
    </I18n>
  );
}

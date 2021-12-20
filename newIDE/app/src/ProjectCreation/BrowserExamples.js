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
import ProjectPreCreationDialog from './ProjectPreCreationDialog';
import generateName from '../Utils/ProjectNameGenerator';

type Props = {|
  onOpen: OnOpenProjectAfterCreationFunction,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

export default function BrowserExamples({
  onOpen,
  onCreateFromExampleShortHeader,
}: Props) {
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const [newProjectName, setNewProjectName] = React.useState<string>(
    generateName()
  );
  const [isOpening, setIsOpening] = React.useState(false);

  const createProjectFromExample = async (i18n: I18nType) => {
    if (!selectedExampleShortHeader) return;

    setIsOpening(true);
    try {
      const projectMetadata = await onCreateFromExampleShortHeader({
        i18n,
        projectName: newProjectName,
        exampleShortHeader: selectedExampleShortHeader,
      });
      if (projectMetadata) {
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
          <ExampleStore
            isOpening={isOpening}
            onOpen={async (example: ?ExampleShortHeader) =>
              setSelectedExampleShortShortHeader(example)
            }
          />
          {selectedExampleShortHeader && (
            <ProjectPreCreationDialog
              open
              isOpening={isOpening}
              onClose={() => setSelectedExampleShortShortHeader(null)}
              onCreate={() => createProjectFromExample(i18n)}
              onClickGenerateProjectName={() => setNewProjectName(generateName())}
              projectName={newProjectName}
              onChangeProjectName={setNewProjectName}
            />
          )}
        </>
      )}
    </I18n>
  );
}

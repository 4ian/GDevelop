// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ExampleStore } from '../AssetStore/ExampleStore';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Column } from '../UI/Grid';
import { type StorageProvider, type FileMetadata } from '../ProjectsStorage';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import ProjectPreCreationDialog from './ProjectPreCreationDialog';

export type OnOpenProjectAfterCreationFunction = ({|
  project?: gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
  projectName?: string,
  templateSlug?: string,
  shouldCloseDialog?: boolean,
|}) => Promise<void>;

export type CreateProjectDialogWithComponentsProps = {|
  open: boolean,
  onClose: () => void,
  onOpen: OnOpenProjectAfterCreationFunction,
|};

export type ProjectCreationSettings = {|
  projectName: string,
  outputPath?: string,
|};

export type OnCreateBlankFunction = ({|
  i18n: I18nType,
  settings: ProjectCreationSettings,
|}) => Promise<?{|
  project: gdProject,
  storageProvider: ?StorageProvider,
  projectName?: string,
  fileMetadata: ?FileMetadata,
|}>;

export type OnCreateFromExampleShortHeaderFunction = ({|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  settings: ProjectCreationSettings,
|}) => Promise<?{|
  storageProvider: StorageProvider,
  projectName: string,
  fileMetadata: FileMetadata,
|}>;

type Props = {|
  ...CreateProjectDialogWithComponentsProps,
  onCreateBlank: OnCreateBlankFunction,
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
|};

const CreateProjectDialog = ({
  open,
  onClose,
  onOpen,
  onCreateFromExampleShortHeader,
  onCreateBlank,
}: Props) => {
  const [isOpening, setIsOpening] = React.useState<boolean>(false);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const [
    preCreationDialogOpen,
    setPreCreationDialogOpen,
  ] = React.useState<boolean>(false);

  const actions = React.useMemo(
    () => [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />,
      <DialogPrimaryButton
        key="create-blank"
        id="create-blank-project-button"
        label={<Trans>Create a blank project</Trans>}
        primary
        onClick={() => {
          setSelectedExampleShortShortHeader(null);
          setPreCreationDialogOpen(true);
        }}
      />,
    ],
    [onClose, setPreCreationDialogOpen]
  );

  if (!open) return null;

  const createProject = async (
    i18n: I18nType,
    settings: ProjectCreationSettings
  ) => {
    setIsOpening(true);

    try {
      let projectMetadata;

      if (selectedExampleShortHeader) {
        projectMetadata = await onCreateFromExampleShortHeader({
          i18n,
          exampleShortHeader: selectedExampleShortHeader,
          settings,
        });
      } else {
        projectMetadata = await onCreateBlank({
          i18n,
          settings,
        });
      }

      if (!projectMetadata) return;

      setPreCreationDialogOpen(false);
      setSelectedExampleShortShortHeader(null);
      onOpen({ ...projectMetadata });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Create a new project</Trans>}
            actions={actions}
            onRequestClose={onClose}
            onApply={() => setPreCreationDialogOpen(true)}
            open={open}
            noMargin
            fullHeight
            flexBody
          >
            <Column expand noMargin>
              <Column noMargin expand useFullHeight>
                <ExampleStore
                  focusOnMount
                  isOpening={isOpening}
                  onOpen={async (example: ?ExampleShortHeader) => {
                    setSelectedExampleShortShortHeader(example);
                    setPreCreationDialogOpen(true);
                  }}
                />
              </Column>
            </Column>
          </Dialog>
          {preCreationDialogOpen && (
            <ProjectPreCreationDialog
              open
              isOpening={isOpening}
              onClose={() => setPreCreationDialogOpen(false)}
              onCreate={projectName => createProject(i18n, projectName)}
              sourceExampleName={
                selectedExampleShortHeader
                  ? selectedExampleShortHeader.name
                  : undefined
              }
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default CreateProjectDialog;

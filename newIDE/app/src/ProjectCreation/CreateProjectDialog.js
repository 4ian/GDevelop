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
  initialExampleShortHeader: ?ExampleShortHeader,
  onOpenProjectPreCreationDialog: (
    assetShortHeader: ?ExampleShortHeader
  ) => void,
  isProjectOpening: boolean,
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
|};

const CreateProjectDialog = ({
  open,
  onClose,
  initialExampleShortHeader,
  onOpenProjectPreCreationDialog,
  isProjectOpening,
}: Props) => {
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
        onClick={() =>
          onOpenProjectPreCreationDialog(/*exampleShortHeader*/ null)
        }
      />,
    ],
    [onClose, onOpenProjectPreCreationDialog]
  );

  if (!open) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Create a new project</Trans>}
            actions={actions}
            onRequestClose={onClose}
            onApply={() => {
              onOpenProjectPreCreationDialog(/*exampleShortHeader*/ null);
            }}
            open={open}
            noMargin
            fullHeight
            flexBody
          >
            <Column expand noMargin>
              <Column noMargin expand useFullHeight>
                <ExampleStore
                  focusOnMount
                  isOpening={isProjectOpening}
                  onOpen={async (exampleShortHeader: ExampleShortHeader) => {
                    onOpenProjectPreCreationDialog(exampleShortHeader);
                  }}
                  initialExampleShortHeader={initialExampleShortHeader}
                />
              </Column>
            </Column>
          </Dialog>
        </>
      )}
    </I18n>
  );
};

export default CreateProjectDialog;

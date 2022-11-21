// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ExampleStore } from '../AssetStore/ExampleStore';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  type StorageProvider,
  type FileMetadata,
  type SaveAsLocation,
} from '../ProjectsStorage';
import {
  getExample,
  type ExampleShortHeader,
} from '../Utils/GDevelopServices/Example';
import { sendNewGameCreated } from '../Utils/Analytics/EventSender';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { showErrorBox } from '../UI/Messages/MessageBox';
const gd: libGDevelop = global.gd;

export type CreateProjectDialogProps = {|
  open: boolean,
  onClose: () => void,
  initialExampleShortHeader: ?ExampleShortHeader,
  onChoose: (exampleShortHeader: ?ExampleShortHeader) => void,
  isProjectOpening: boolean,
|};

export type NewProjectSetup = {|
  projectName: string,
  storageProvider: StorageProvider,
  saveAsLocation: ?SaveAsLocation,
|};

export type NewProjectSource = {|
  project: ?gdProject,
  storageProvider: ?StorageProvider,
  fileMetadata: ?FileMetadata,
|};

export const createNewProject = async (): Promise<?NewProjectSource> => {
  const project: gdProject = gd.ProjectHelper.createNewGDJSProject();

  sendNewGameCreated({ exampleUrl: '', exampleSlug: '' });
  return {
    project,
    storageProvider: null,
    fileMetadata: null,
  };
};

export const createNewProjectFromExampleShortHeader = async ({
  i18n,
  exampleShortHeader,
}: {|
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
|}): Promise<?NewProjectSource> => {
  try {
    const example = await getExample(exampleShortHeader);

    sendNewGameCreated({
      exampleUrl: example.projectFileUrl,
      exampleSlug: exampleShortHeader.slug,
    });
    return {
      project: null,
      storageProvider: UrlStorageProvider,
      fileMetadata: {
        fileIdentifier: example.projectFileUrl,
      },
    };
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
    return;
  }
};

const CreateProjectDialog = ({
  open,
  onClose,
  initialExampleShortHeader,
  onChoose,
  isProjectOpening,
}: CreateProjectDialogProps) => {
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
        onClick={() => onChoose(/*exampleShortHeader*/ null)}
      />,
    ],
    [onClose, onChoose]
  );

  if (!open) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Create a new project</Trans>}
          actions={actions}
          onRequestClose={onClose}
          onApply={() => {
            onChoose(/*exampleShortHeader*/ null);
          }}
          open={open}
          fullHeight
          flexColumnBody
        >
          <ExampleStore
            focusOnMount
            isOpening={isProjectOpening}
            onOpen={async (exampleShortHeader: ExampleShortHeader) => {
              onChoose(exampleShortHeader);
            }}
            initialExampleShortHeader={initialExampleShortHeader}
          />
        </Dialog>
      )}
    </I18n>
  );
};

export default CreateProjectDialog;

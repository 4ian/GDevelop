// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { Column, Line } from '../../UI/Grid';
import GoogleDriveFileOrFolderPicker from './GoogleDriveFileOrFolderPicker';
import {
  type GoogleDriveFileOrFolder,
  type GoogleDriveFilePickerOptions,
} from '.';
import TextField from '../../UI/TextField';
import LeftLoader from '../../UI/LeftLoader';
import AlertMessage from '../../UI/AlertMessage';

type Props = {|
  onCancel: () => void,
  onSave: ({|
    selectedFileOrFolder: GoogleDriveFileOrFolder,
    newFileName: string,
  |}) => Promise<void>,
  onShowFilePicker: GoogleDriveFilePickerOptions => Promise<?GoogleDriveFileOrFolder>,
|};

/**
 * A "Save as" dialog for Google Drive, allowing to pick a file to overwrite or a folder
 * and a new filename where to save the game.
 */
const GoogleDriveSaveAsDialog = (props: Props) => {
  const [selectedFileOrFolder, setSelectedFileOrFolder] = React.useState(
    (null: ?GoogleDriveFileOrFolder)
  );
  const [newFileName, setNewFileName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState((null: ?Error));
  const [pickerError, setPickerError] = React.useState((null: ?Error));
  const [dialogHidden, hideDialog] = React.useState(false);

  const canSave = () => {
    if (saving) return;
    if (!selectedFileOrFolder) return;

    return selectedFileOrFolder.type === 'FOLDER' ? !!newFileName : true;
  };
  const save = () => {
    if (!canSave() || !selectedFileOrFolder) return;

    setSaveError(null);
    setSaving(true);
    props
      .onSave({
        selectedFileOrFolder,
        newFileName,
      })
      .catch(error => {
        setSaveError(error);
        setSaving(false);
      });
  };
  const canCancel = () => !saving;
  const cancel = () => {
    if (!canCancel()) return;

    props.onCancel();
  };
  const openPicker = () => {
    hideDialog(true);
    setPickerError(null);
    props
      .onShowFilePicker({ selectFolderEnabled: true, showUploadView: false })
      .then(selectedFileOrFolder => {
        setSelectedFileOrFolder(selectedFileOrFolder);
        hideDialog(false);
      })
      .catch(error => {
        setPickerError(error);
        hideDialog(false);
      });
  };

  // Hide the dialog while the picker is opened, as it does not play nice with material-ui's
  // Dialog.
  if (dialogHidden) {
    return null;
  }

  return (
    <Dialog
      title={<Trans>Save on Google Drive</Trans>}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          disabled={!canCancel()}
          onClick={props.onCancel}
        />,
        <LeftLoader key="save" isLoading={saving}>
          <DialogPrimaryButton
            label={<Trans>Save</Trans>}
            primary
            disabled={!canSave()}
            onClick={save}
          />
        </LeftLoader>,
      ]}
      cannotBeDismissed={saving}
      onRequestClose={cancel}
      onApply={save}
      open
      maxWidth="sm"
    >
      <Column noMargin>
        <Line>
          <GoogleDriveFileOrFolderPicker
            floatingLabelText={
              <Trans>Google Drive folder or existing file to overwrite</Trans>
            }
            value={selectedFileOrFolder}
            onOpenPicker={openPicker}
          />
        </Line>
        <Line>
          {selectedFileOrFolder && selectedFileOrFolder.type === 'FOLDER' ? (
            <TextField
              floatingLabelText={<Trans>New file name</Trans>}
              floatingLabelFixed
              type="text"
              translatableHintText={t`YourGame.json`}
              value={newFileName}
              onChange={(event, newFileName) => setNewFileName(newFileName)}
              fullWidth
            />
          ) : null}
        </Line>
        {saveError && (
          <Line>
            <AlertMessage kind="error">
              There was an error when saving your game. Verify that you have the
              rights on the folder or file that you selected and try again.
            </AlertMessage>
          </Line>
        )}
        {pickerError && (
          <Line>
            <AlertMessage kind="error">
              There was an error when selecting a file or folder from Google
              Drive. Try again later or verify that you are properly connected
              to Google Drive.
            </AlertMessage>
          </Line>
        )}
      </Column>
    </Dialog>
  );
};

export default GoogleDriveSaveAsDialog;

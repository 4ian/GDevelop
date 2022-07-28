// @flow
import { Trans, t } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type EditForm,
  type AuthError,
  type Profile,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import {
  isUsernameValid,
  UsernameField,
  usernameFormatError,
} from './UsernameField';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';

type Props = {|
  profile: Profile,
  onClose: () => void,
  onEdit: (form: EditForm) => Promise<void>,
  editInProgress: boolean,
  error: ?AuthError,
|};

type State = {|
  form: EditForm,
|};

export const getUsernameErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/username-used')
    return 'This username is already used, please pick another one.';
  if (error.code === 'auth/malformed-username') return usernameFormatError;
  return undefined;
};

export default class EditDialog extends Component<Props, State> {
  state = {
    form: {
      username: this.props.profile.username || '',
      description: this.props.profile.description || '',
      getGameStatsEmail: !!this.props.profile.getGameStatsEmail,
    },
  };

  _onEdit = () => {
    if (!this._canEdit()) return;

    const { form } = this.state;
    this.props.onEdit(form);
  };

  _canEdit = () => {
    return (
      !this.props.editInProgress && isUsernameValid(this.state.form.username)
    );
  };

  render() {
    const { onClose, editInProgress, error } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Back</Trans>}
        disabled={editInProgress}
        key="back"
        primary={false}
        onClick={onClose}
      />,
      <LeftLoader isLoading={editInProgress} key="edit">
        <DialogPrimaryButton
          label={<Trans>Save</Trans>}
          primary
          onClick={this._onEdit}
          disabled={!this._canEdit()}
        />
      </LeftLoader>,
    ];

    return (
      <Dialog
        title={<Trans>Edit your GDevelop profile</Trans>}
        actions={actions}
        maxWidth="sm"
        cannotBeDismissed={editInProgress}
        onRequestClose={onClose}
        onApply={this._onEdit}
        open
      >
        <ColumnStackLayout noMargin>
          <UsernameField
            value={this.state.form.username}
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  username: value,
                },
              });
            }}
            errorText={getUsernameErrorText(error)}
          />
          <TextField
            value={this.state.form.description}
            floatingLabelText={<Trans>Bio</Trans>}
            fullWidth
            multiline
            rows={3}
            rowsMax={5}
            translatableHintText={t`What are you using GDevelop for?`}
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  description: value,
                },
              });
            }}
          />
          <Checkbox
            label={<Trans>I want to receive weekly stats about my games</Trans>}
            checked={this.state.form.getGameStatsEmail}
            onCheck={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  getGameStatsEmail: value,
                },
              });
            }}
          />
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

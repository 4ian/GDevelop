// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import TextField from '../UI/TextField';
import {
  type EditForm,
  type AuthError,
  type Profile,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  profile: Profile,
  onClose: () => void,
  onEdit: (form: EditForm) => void,
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
  if (error.code === 'auth/malformed-username')
    return 'Please pick a short username with only alphanumerical characters as well as _ and -';
  return undefined;
};

export default class EditDialog extends Component<Props, State> {
  state = {
    form: {
      username: this.props.profile.username || '',
    },
  };

  _onEdit = () => {
    const { form } = this.state;
    this.props.onEdit(form);
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
        <RaisedButton
          label={<Trans>Save</Trans>}
          primary
          onClick={this._onEdit}
          disabled={editInProgress}
        />
      </LeftLoader>,
    ];

    return (
      <Dialog
        title={<Trans>Edit your GDevelop profile</Trans>}
        actions={actions}
        onRequestClose={() => {
          if (!editInProgress) onClose();
        }}
        maxWidth="sm"
        cannotBeDismissed={true}
        open
      >
        <ColumnStackLayout noMargin>
          <TextField
            autoFocus
            value={this.state.form.username}
            floatingLabelText={<Trans>Username</Trans>}
            errorText={getUsernameErrorText(error)}
            fullWidth
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  username: value,
                },
              });
            }}
          />
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

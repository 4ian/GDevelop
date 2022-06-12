// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { User as FirebaseUser } from 'firebase/auth';
import {
  type ChangeEmailForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import TextField from '../UI/TextField';
import { getEmailErrorText } from './CreateAccountDialog';

type Props = {|
  firebaseUser: FirebaseUser,
  onClose: () => void,
  onChangeEmail: (form: ChangeEmailForm) => Promise<void>,
  changeEmailInProgress: boolean,
  error: ?AuthError,
|};

type State = {|
  form: ChangeEmailForm,
|};

export default class ChangeEmailDialog extends Component<Props, State> {
  state = {
    form: {
      email: this.props.firebaseUser.email,
    },
  };

  _onChangeEmail = () => {
    if (this.props.changeEmailInProgress) return;

    const { form } = this.state;
    this.props.onChangeEmail(form);
  };

  render() {
    const { onClose, changeEmailInProgress, error } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Back</Trans>}
        disabled={changeEmailInProgress}
        key="back"
        primary={false}
        onClick={onClose}
      />,
      <LeftLoader isLoading={changeEmailInProgress} key="change-email">
        <DialogPrimaryButton
          label={<Trans>Save</Trans>}
          primary
          onClick={this._onChangeEmail}
          disabled={changeEmailInProgress}
        />
      </LeftLoader>,
    ];

    return (
      <Dialog
        title={<Trans>Change your email</Trans>}
        actions={actions}
        maxWidth="sm"
        cannotBeDismissed={changeEmailInProgress}
        onRequestClose={onClose}
        onApply={this._onChangeEmail}
        open
      >
        <ColumnStackLayout noMargin>
          <TextField
            value={this.state.form.email}
            floatingLabelText={<Trans>Email</Trans>}
            errorText={getEmailErrorText(error)}
            fullWidth
            required
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  email: value,
                },
              });
            }}
          />
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

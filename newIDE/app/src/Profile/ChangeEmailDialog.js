// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import { User as FirebaseUser } from 'firebase/auth';
import {
  type ChangeEmailForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import TextField from '../UI/TextField';

type Props = {|
  firebaseUser: FirebaseUser,
  onClose: () => void,
  onChangeEmail: (form: ChangeEmailForm) => void,
  changeEmailInProgress: boolean,
  error: ?AuthError,
|};

type State = {|
  form: ChangeEmailForm,
|};

export const getEmailErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/invalid-email') return 'This email is invalid';
  if (error.code === 'auth/email-already-in-use')
    return 'This email was already used for another account';
  if (error.code === 'auth/operation-not-allowed')
    return 'Service seems to be unavailable, please try again later';
  if (error.code === 'auth/requires-recent-login')
    return 'Please log out and log in again to verify your identify, then change your email';
  return undefined;
};

export default class ChangeEmailDialog extends Component<Props, State> {
  state = {
    form: {
      email: this.props.firebaseUser.email,
    },
  };

  _onChangeEmail = () => {
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
        <RaisedButton
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
        onRequestClose={() => {
          if (!changeEmailInProgress) onClose();
        }}
        maxWidth="sm"
        cannotBeDismissed={true}
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

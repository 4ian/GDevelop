// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import TextField from '../UI/TextField';
import {
  type RegisterForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import BackgroundText from '../UI/BackgroundText';
import { ColumnStackLayout } from '../UI/Layout';
import { MarkdownText } from '../UI/MarkdownText';
import { UsernameField, isUsernameValid } from './UsernameField';

type Props = {|
  onClose: () => void,
  onGoToLogin: () => void,
  onCreateAccount: (form: RegisterForm) => void,
  createAccountInProgress: boolean,
  error: ?AuthError,
|};

type State = {|
  form: RegisterForm,
|};

export const getEmailErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/invalid-email') return 'This email is invalid';
  if (error.code === 'auth/user-disabled') return 'The user was disabled';
  if (error.code === 'auth/user-not-found')
    return 'This user was not found: have you created your account?';
  if (error.code === 'auth/email-already-in-use')
    return 'This email was already used for another account';
  if (error.code === 'auth/operation-not-allowed')
    return 'Service seems to be unavailable, please try again later';
  if (error.code === 'auth/requires-recent-login')
    return 'Please log out and log in again to verify your identify, then change your email';
  return undefined;
};

export const getPasswordErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/wrong-password') return 'The password is invalid';
  if (error.code === 'auth/weak-password')
    return 'This password is too weak: please use more letters and digits';
  return undefined;
};

export default class CreateAccountDialog extends Component<Props, State> {
  state = {
    form: {
      email: '',
      password: '',
      username: '',
    },
  };

  _onCreateAccount = () => {
    const { form } = this.state;
    this.props.onCreateAccount(form);
  };

  render() {
    const { onClose, createAccountInProgress, onGoToLogin, error } = this.props;

    return (
      <Dialog
        title={<Trans>Create a new GDevelop account</Trans>}
        actions={[
          <FlatButton
            label={<Trans>Back</Trans>}
            disabled={createAccountInProgress}
            key="close"
            primary={false}
            onClick={onClose}
          />,
          <LeftLoader isLoading={createAccountInProgress} key="create-account">
            <RaisedButton
              label={<Trans>Create my account</Trans>}
              primary
              disabled={
                createAccountInProgress ||
                !isUsernameValid(this.state.form.username, true)
              }
              onClick={this._onCreateAccount}
            />
          </LeftLoader>,
        ]}
        secondaryActions={[
          <FlatButton
            label={<Trans>Already have an account?</Trans>}
            primary={false}
            key="already-have-account"
            onClick={onGoToLogin}
          />,
        ]}
        onRequestClose={() => {
          if (!createAccountInProgress) onClose();
        }}
        maxWidth="sm"
        cannotBeDismissed={true}
        open
      >
        <ColumnStackLayout noMargin>
          <BackgroundText>
            <MarkdownText
              translatableSource={t`By creating an account and using GDevelop, you agree to the [Terms and Conditions](https://gdevelop-app.com/legal/terms-and-conditions). Having an account allows you to export your game on Android or as a Desktop app and it unlocks other services for your project!`}
            />
          </BackgroundText>
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
            allowEmpty
          />
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
          <TextField
            value={this.state.form.password}
            floatingLabelText={<Trans>Password</Trans>}
            errorText={getPasswordErrorText(error)}
            type="password"
            fullWidth
            required
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  password: value,
                },
              });
            }}
          />
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

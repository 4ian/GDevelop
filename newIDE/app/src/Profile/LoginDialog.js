// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '../UI/Dialog';
import { Column, Line, Spacer } from '../UI/Grid';
import TextField from 'material-ui/TextField/TextField';
import {
  type LoginForm,
  type LoginError,
} from '../Utils/GDevelopServices/Authentification';
import RightLoader from '../UI/RightLoader';
import LeftLoader from '../UI/LeftLoader';

type Props = {|
  open: boolean,
  onClose: Function,
  onLogin: (form: LoginForm) => void,
  onCreateAccount: (form: LoginForm) => void,
  onForgotPassword: (form: LoginForm) => void,
  loginInProgress: boolean,
  createAccountInProgress: boolean,
  error: ?LoginError,
  resetPasswordDialogOpen: boolean,
  onCloseResetPasswordDialog: Function,
  forgotPasswordInProgress: boolean,
|};

type State = {|
  form: LoginForm,
|};

const getEmailErrorText = (error: ?LoginError) => {
  if (!error) return undefined;

  if (error.code === 'auth/invalid-email') return 'This email is invalid';
  if (error.code === 'auth/user-disabled') return 'The user was disabled';
  if (error.code === 'auth/user-not-found')
    return 'This user was not found: have you created your account?';
  if (error.code === 'auth/email-already-in-use')
    return 'This email was already used for another account';
  if (error.code === 'auth/operation-not-allowed')
    return 'Service seems to be unavailable, please try again later';
  return undefined;
};

const getPasswordErrorText = (error: ?LoginError) => {
  if (!error) return undefined;

  if (error.code === 'auth/wrong-password') return 'The password is invalid';
  if (error.code === 'auth/weak-password')
    return 'This password is too weak: please use more letters and digits';
  return undefined;
};

export default class LoginDialog extends Component<Props, State> {
  state = {
    form: {
      email: '',
      password: '',
    },
  };

  _onLogin = () => {
    const { form } = this.state;
    this.props.onLogin(form);
  };

  _onCreateAccount = () => {
    const { form } = this.state;
    this.props.onCreateAccount(form);
  };

  _onForgotPassword = () => {
    const { form } = this.state;
    this.props.onForgotPassword(form);
  };

  render() {
    const {
      open,
      onClose,
      createAccountInProgress,
      loginInProgress,
      error,
      resetPasswordDialogOpen,
      onCloseResetPasswordDialog,
      forgotPasswordInProgress,
    } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Close</Trans>}
        key="close"
        primary={false}
        onClick={onClose}
      />,
    ];

    return (
      <Dialog
        title={<Trans>Login or create a GDevelop account</Trans>}
        actions={actions}
        secondaryActions={[
          <RightLoader
            isLoading={forgotPasswordInProgress}
            key="forgot-password"
          >
            <FlatButton
              label={<Trans>I forgot my password</Trans>}
              primary={false}
              disabled={
                loginInProgress ||
                createAccountInProgress ||
                forgotPasswordInProgress
              }
              onClick={this._onForgotPassword}
            />
          </RightLoader>,
        ]}
        onRequestClose={onClose}
        open={open}
        autoScrollBodyContent
      >
        <Column noMargin>
          <TextField
            value={this.state.form.email}
            floatingLabelText={<Trans>Email</Trans>}
            errorText={getEmailErrorText(error)}
            fullWidth
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
            onChange={(e, value) => {
              this.setState({
                form: {
                  ...this.state.form,
                  password: value,
                },
              });
            }}
          />
          <Spacer />
          <Line expand justifyContent="space-between">
            <RightLoader isLoading={createAccountInProgress}>
              <RaisedButton
                label={<Trans>Create my account</Trans>}
                disabled={
                  loginInProgress ||
                  createAccountInProgress ||
                  forgotPasswordInProgress
                }
                onClick={this._onCreateAccount}
              />
            </RightLoader>

            <LeftLoader isLoading={loginInProgress}>
              <FlatButton
                label={<Trans>Login</Trans>}
                onClick={this._onLogin}
                disabled={
                  loginInProgress ||
                  createAccountInProgress ||
                  forgotPasswordInProgress
                }
              />
            </LeftLoader>
          </Line>
        </Column>
        <Dialog
          open={resetPasswordDialogOpen}
          title={<Trans>Reset your password</Trans>}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              key="close"
              onClick={onCloseResetPasswordDialog}
            />,
          ]}
        >
          <Column noMargin>
            <p>
              <Trans>
                You should have received an email containing instructions to
                reset and set a new password. Once it's done, you can use your
                new password in GDevelop.
              </Trans>
            </p>
          </Column>
        </Dialog>
      </Dialog>
    );
  }
}

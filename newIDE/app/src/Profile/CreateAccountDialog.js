// @flow
import type { Node } from 'React';
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import TextField from '../UI/TextField';
import {
  type LoginForm,
  type LoginError,
} from '../Utils/GDevelopServices/Authentification';
import LeftLoader from '../UI/LeftLoader';
import BackgroundText from '../UI/BackgroundText';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  onClose: () => void,
  onGoToLogin: () => void,
  onCreateAccount: (form: LoginForm) => void,
  createAccountInProgress: boolean,
  error: ?LoginError,
|};

type State = {|
  form: LoginForm,
|};

export const getEmailErrorText = (error: ?LoginError): void | string => {
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

export const getPasswordErrorText = (error: ?LoginError): void | string => {
  if (!error) return undefined;

  if (error.code === 'auth/wrong-password') return 'The password is invalid';
  if (error.code === 'auth/weak-password')
    return 'This password is too weak: please use more letters and digits';
  return undefined;
};

export default class CreateAccountDialog extends Component<Props, State> {
  state: State = {
    form: {
      email: '',
      password: '',
    },
  };

  _onCreateAccount: () => void = () => {
    const { form } = this.state;
    this.props.onCreateAccount(form);
  };

  render(): Node {
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
              disabled={createAccountInProgress}
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
            <Trans>
              By creating an account and using GDevelop, you agree to the Terms
              and Conditions. Having an account allows to export your game on
              Android, as a desktop app and unlock other services for your
              project!
            </Trans>
          </BackgroundText>
          <TextField
            autoFocus
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
        </ColumnStackLayout>
      </Dialog>
    );
  }
}

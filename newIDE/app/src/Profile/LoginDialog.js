// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Column } from '../UI/Grid';
import {
  type LoginForm as LoginFormType,
  type ForgotPasswordForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import HelpButton from '../UI/HelpButton';
import Link from '../UI/Link';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import LoginForm from './LoginForm';

const styles = {
  formContainer: {
    marginTop: 20,
  },
};

type Props = {|
  onClose: () => void,
  onGoToCreateAccount: () => void,
  onLogin: (form: LoginFormType) => Promise<void>,
  onForgotPassword: (form: ForgotPasswordForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
|};

const LoginDialog = ({
  onClose,
  onGoToCreateAccount,
  onLogin,
  onForgotPassword,
  loginInProgress,
  error,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const doLogin = () => {
    if (loginInProgress) return;

    onLogin({
      email: email.trim(),
      password,
    });
  };

  const actions = [
    <FlatButton
      label={<Trans>Cancel</Trans>}
      disabled={loginInProgress}
      key="cancel"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={loginInProgress} key="login">
      <DialogPrimaryButton
        id="login-button"
        label={<Trans>Login</Trans>}
        primary
        onClick={doLogin}
        disabled={loginInProgress}
      />
    </LeftLoader>,
  ];

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="login-dialog"
      actions={actions}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={loginInProgress}
      onRequestClose={onClose}
      onApply={doLogin}
      maxWidth="sm"
      open
      flexColumnBody
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        <Text size="title" align="center">
          <Trans>Log in to your account</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin>
            <Trans>Don't have an account yet?</Trans>
          </Text>
          <Link
            href=""
            onClick={onGoToCreateAccount}
            disabled={loginInProgress}
          >
            <Text size="body2" noMargin color="inherit">
              <Trans>Create an account</Trans>
            </Text>
          </Link>
        </Column>
        <div
          style={{
            ...styles.formContainer,
            // Take full width on mobile.
            width: isMobileScreen ? '95%' : '60%',
          }}
        >
          <LoginForm
            onLogin={doLogin}
            email={email}
            onChangeEmail={setEmail}
            password={password}
            onChangePassword={setPassword}
            onForgotPassword={onForgotPassword}
            loginInProgress={loginInProgress}
            error={error}
          />
        </div>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default LoginDialog;

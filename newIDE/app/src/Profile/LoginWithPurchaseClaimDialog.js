// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type LoginForm as LoginFormType,
  type ForgotPasswordForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import LoginForm from './LoginForm';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { CorsAwareImage } from '../UI/CorsAwareImage';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type ClaimedProductOptions } from './PurchaseClaimDialog';

const getStyles = ({ isMobile }) => {
  return {
    formContainer: {
      display: 'flex',
      width: isMobile ? '95%' : '90%',
      marginTop: 10,
      flexDirection: 'column',
    },
    previewImage: {
      width: '100%',
      maxWidth: 400,
      display: 'block',
      objectFit: 'contain',
      borderRadius: 8,
      border: '1px solid lightgrey',
      boxSizing: 'border-box', // Take border in account for sizing to avoid cumulative layout shift.
      // Prevent cumulative layout shift by enforcing
      // the 16:9 ratio.
      aspectRatio: '16 / 9',
      transition: 'opacity 0.3s ease-in-out',
      position: 'relative',
    },
  };
};

type Props = {|
  onClose: () => void,
  onGoToCreateAccount: () => void,
  onLogin: (form: LoginFormType) => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  onForgotPassword: (form: ForgotPasswordForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
  claimedProductOptions: ClaimedProductOptions,
|};

const LoginWithPurchaseClaimDialog = ({
  onClose,
  onGoToCreateAccount,
  onLogin,
  onLoginWithProvider,
  onForgotPassword,
  loginInProgress,
  error,
  claimedProductOptions: { productListingData: claimedProduct },
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const styles = getStyles({ isMobile });
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

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

  const secondaryActions = [
    <HelpButton key="help" helpPagePath={'/interface/profile'} />,
  ];

  const dialogContent = (
    <ColumnStackLayout
      noMargin
      expand
      justifyContent="center"
      alignItems="center"
    >
      <ColumnStackLayout justifyContent="center" alignItems="center" noMargin>
        {claimedProduct.productType === 'BUNDLE' && (
          <CorsAwareImage
            style={{
              ...styles.previewImage,
              background: gdevelopTheme.paper.backgroundColor.light,
            }}
            src={claimedProduct.thumbnailUrls[0]}
            alt={`Preview image of bundle ${claimedProduct.name}`}
          />
        )}
        <Text size="section-title" align="center" noMargin>
          <Trans>Log in to your account to activate your purchase!</Trans>
        </Text>
      </ColumnStackLayout>
      <div style={styles.formContainer}>
        <LoginForm
          onLogin={doLogin}
          onLoginWithProvider={onLoginWithProvider}
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          onForgotPassword={onForgotPassword}
          loginInProgress={loginInProgress}
          error={error}
          onGoToCreateAccount={onGoToCreateAccount}
        />
      </div>
    </ColumnStackLayout>
  );

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="login-dialog"
      actions={actions}
      secondaryActions={secondaryActions}
      cannotBeDismissed={loginInProgress}
      onRequestClose={onClose}
      onApply={doLogin}
      maxWidth="md"
      open
      flexColumnBody
    >
      {dialogContent}
    </Dialog>
  );
};

export default LoginWithPurchaseClaimDialog;

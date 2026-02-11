// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type RegisterForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import { isUsernameValid } from './UsernameField';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import CreateAccountForm from './CreateAccountForm';
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
  onGoToLogin: () => void,
  onCreateAccount: (form: RegisterForm) => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  createAccountInProgress: boolean,
  error: ?AuthError,
  claimedProductOptions: ClaimedProductOptions,
|};

const CreateAccountWithPurchaseClaimDialog = ({
  onClose,
  onGoToLogin,
  onCreateAccount,
  onLoginWithProvider,
  createAccountInProgress,
  error,
  claimedProductOptions: { productListingData: claimedProduct },
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const styles = getStyles({ isMobile });
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('');
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState<boolean>(
    false
  );
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const canCreateAccount =
    !createAccountInProgress &&
    isUsernameValid(username, { allowEmpty: true }) &&
    !isValidatingUsername &&
    (!usernameAvailability || usernameAvailability.isAvailable);

  const createAccount = async () => {
    if (!canCreateAccount) return;
    try {
      await onCreateAccount({
        email: email.trim(),
        password,
        username,
        getNewsletterEmail,
      });
    } catch (error) {
      console.error('Error while creating account', error);
    }
  };

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="create-account-with-purchase-claim-dialog"
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
        <LeftLoader isLoading={createAccountInProgress} key="create-account">
          <DialogPrimaryButton
            label={<Trans>Create account</Trans>}
            id="create-account-button"
            primary
            disabled={!canCreateAccount}
            onClick={createAccount}
          />
        </LeftLoader>,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={createAccountInProgress}
      onApply={createAccount}
      onRequestClose={() => {
        if (!createAccountInProgress) onClose();
      }}
      maxWidth="md"
      open
      flexColumnBody
    >
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
            <Trans>Create an account to activate your purchase!</Trans>
          </Text>
        </ColumnStackLayout>
        <div style={styles.formContainer}>
          <CreateAccountForm
            onCreateAccount={createAccount}
            onLoginWithProvider={onLoginWithProvider}
            email={email}
            onChangeEmail={setEmail}
            password={password}
            onChangePassword={setPassword}
            username={username}
            onChangeUsername={setUsername}
            optInNewsletterEmail={getNewsletterEmail}
            onChangeOptInNewsletterEmail={setGetNewsletterEmail}
            createAccountInProgress={createAccountInProgress}
            error={error}
            onChangeUsernameAvailability={setUsernameAvailability}
            isValidatingUsername={isValidatingUsername}
            onChangeIsValidatingUsername={setIsValidatingUsername}
            onGoToLogin={onGoToLogin}
          />
        </div>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default CreateAccountWithPurchaseClaimDialog;

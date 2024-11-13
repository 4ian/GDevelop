// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';

import TextField from '../UI/TextField';
import {
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import { UsernameField } from './UsernameField';
import Checkbox from '../UI/Checkbox';
import Form from '../UI/Form';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { Column, Line, Spacer } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import Google from '../UI/CustomSvgIcons/Google';
import Apple from '../UI/CustomSvgIcons/Apple';
import GitHub from '../UI/CustomSvgIcons/GitHub';
import AlertMessage from '../UI/AlertMessage';
import { accountsAlreadyExistsWithDifferentProviderCopy } from './LoginForm';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import Link from '../UI/Link';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import BackgroundText from '../UI/BackgroundText';
import { MarkdownText } from '../UI/MarkdownText';
import ResponsiveDelimiter from './ResponsiveDelimiter';

const getStyles = ({ verticalDesign }) => ({
  logInContainer: {
    width: '100%',
  },
  panelContainer: {
    width: verticalDesign ? '100%' : '90%',
  },
  icon: {
    width: 16,
    height: 16,
  },
  backgroundText: {
    width: '100%',
    textAlign: 'start',
  },
});

type Props = {|
  onCreateAccount: () => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  email: string,
  onChangeEmail: string => void,
  password: string,
  onChangePassword: string => void,
  username: string,
  onChangeUsername: string => void,
  optInNewsletterEmail: boolean,
  onChangeOptInNewsletterEmail: boolean => void,
  usernameAvailability: ?UsernameAvailability,
  onChangeUsernameAvailability: (?UsernameAvailability) => void,
  isValidatingUsername: boolean,
  onChangeIsValidatingUsername: boolean => void,
  createAccountInProgress: boolean,
  error: ?AuthError,
  onGoToLogin?: () => void,
|};

const CreateAccountForm = ({
  onCreateAccount,
  onLoginWithProvider,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  username,
  onChangeUsername,
  optInNewsletterEmail,
  onChangeOptInNewsletterEmail,
  usernameAvailability,
  onChangeUsernameAvailability,
  isValidatingUsername,
  onChangeIsValidatingUsername,
  createAccountInProgress,
  error,
  onGoToLogin,
}: Props) => {
  const accountsExistsWithOtherCredentials = error
    ? error.code === 'auth/account-exists-with-different-credential'
    : false;

  const { isMobile, isLandscape } = useResponsiveWindowSize();

  const verticalDesign = isMobile && !isLandscape;
  const styles = getStyles({ verticalDesign });

  return (
    <Column noMargin expand justifyContent="center" alignItems="center">
      <Form
        onSubmit={onCreateAccount}
        autoComplete="on"
        name="createAccount"
        fullWidth
      >
        <ColumnStackLayout noMargin>
          {accountsExistsWithOtherCredentials && (
            <AlertMessage kind="warning">
              {accountsAlreadyExistsWithDifferentProviderCopy}
            </AlertMessage>
          )}
          <ResponsiveLineStackLayout noMargin noResponsiveLandscape>
            <Column expand noMargin alignItems="center" justifyContent="center">
              <div style={styles.panelContainer}>
                <ColumnStackLayout noMargin>
                  <RaisedButton
                    primary
                    fullWidth
                    label={<Trans>Continue with Google</Trans>}
                    icon={<Google style={styles.icon} />}
                    onClick={() => {
                      onLoginWithProvider('google');
                    }}
                    disabled={createAccountInProgress}
                  />
                  <FlatButton
                    primary
                    fullWidth
                    label={<Trans>Continue with Github</Trans>}
                    leftIcon={<GitHub style={styles.icon} />}
                    onClick={() => {
                      onLoginWithProvider('github');
                    }}
                    disabled={createAccountInProgress}
                  />
                  <FlatButton
                    primary
                    fullWidth
                    label={<Trans>Continue with Apple</Trans>}
                    leftIcon={<Apple style={styles.icon} />}
                    onClick={() => {
                      onLoginWithProvider('apple');
                    }}
                    disabled={createAccountInProgress}
                  />
                </ColumnStackLayout>
              </div>
            </Column>
            <ResponsiveDelimiter text={<Trans>or</Trans>} />
            <Column expand noMargin alignItems="center" justifyContent="center">
              <div style={styles.panelContainer}>
                <ColumnStackLayout noMargin>
                  <TextField
                    value={email}
                    floatingLabelText={<Trans>Email</Trans>}
                    errorText={getEmailErrorText(error)}
                    fullWidth
                    type="email"
                    required
                    onChange={(e, value) => {
                      onChangeEmail(value);
                    }}
                    onBlur={event => {
                      onChangeEmail(event.currentTarget.value.trim());
                    }}
                    disabled={createAccountInProgress}
                  />
                  <TextField
                    value={password}
                    floatingLabelText={<Trans>Password</Trans>}
                    errorText={getPasswordErrorText(error)}
                    type="password"
                    fullWidth
                    required
                    onChange={(e, value) => {
                      onChangePassword(value);
                    }}
                    disabled={createAccountInProgress}
                  />
                  <UsernameField
                    value={username}
                    onChange={(e, value) => {
                      onChangeUsername(value);
                    }}
                    allowEmpty
                    onAvailabilityChecked={onChangeUsernameAvailability}
                    onAvailabilityCheckLoading={onChangeIsValidatingUsername}
                    isValidatingUsername={isValidatingUsername}
                    disabled={createAccountInProgress}
                  />
                  {onGoToLogin && (
                    <div style={styles.logInContainer}>
                      <LineStackLayout noMargin>
                        <Text size="body2" noMargin align="center">
                          <Trans>Already a member?</Trans>
                        </Text>
                        <Link
                          href="#"
                          onClick={onGoToLogin}
                          disabled={createAccountInProgress}
                        >
                          <Text size="body2" noMargin color="inherit">
                            <Trans>Log in to your account</Trans>
                          </Text>
                        </Link>
                      </LineStackLayout>
                    </div>
                  )}
                </ColumnStackLayout>
              </div>
            </Column>
          </ResponsiveLineStackLayout>
          <Spacer />
          <Line noMargin>
            <Checkbox
              label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
              checked={optInNewsletterEmail}
              onCheck={(e, value) => {
                onChangeOptInNewsletterEmail(value);
              }}
              disabled={createAccountInProgress}
            />
          </Line>
          <BackgroundText style={styles.backgroundText}>
            <MarkdownText
              translatableSource={t`By creating an account and using GDevelop, you agree to the [Terms and Conditions](https://gdevelop.io/page/terms-and-conditions).`}
            />
          </BackgroundText>
        </ColumnStackLayout>
      </Form>
    </Column>
  );
};

export default CreateAccountForm;

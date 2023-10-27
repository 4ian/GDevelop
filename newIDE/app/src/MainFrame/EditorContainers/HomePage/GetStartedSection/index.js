// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';
import TreeLeaves from '../../../../UI/CustomSvgIcons/TreeLeaves';
import SectionContainer from '../SectionContainer';
import JewelPlatform from '../../../../UI/CustomSvgIcons/JewelPlatform';
import RaisedButton from '../../../../UI/RaisedButton';
import FlatButton from '../../../../UI/FlatButton';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { Column, LargeSpacer, Line } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import CircularProgress from '../../../../UI/CircularProgress';
import BackgroundText from '../../../../UI/BackgroundText';
import { type UsernameAvailability } from '../../../../Utils/GDevelopServices/User';
import PersonalizationFlow from './PersonalizationFlow';
import LinearProgress from '../../../../UI/LinearProgress';
import CreateAccountForm from '../../../../Profile/CreateAccountForm';
import LoginForm from '../../../../Profile/LoginForm';
import PreferencesContext from '../../../Preferences/PreferencesContext';

const styles = {
  icon: {
    width: 80,
    height: 80,
    margin: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300, // Make buttons larger but not too much.
  },
  linearProgress: { width: 200 },
  getFormContainerStyle: (isMobile: boolean) => ({
    marginTop: 20,
    // Take full width on mobile.
    width: isMobile ? '95%' : 300,
  }),
};

const questionnaireFinishedImageSource = 'res/questionnaire/welcome-back.svg';

type Props = {||};

const GetStartedSection = ({  }: Props) => {
  const isOnline = useOnlineStatus();
  const {
    profile,
    onResetPassword,
    creatingOrLoggingInAccount,
    onLogin,
    onCreateAccount,
    authenticationError,
  } = React.useContext(AuthenticatedUserContext);
  const { values: preferences } = React.useContext(PreferencesContext);

  const forceUpdate = useForceUpdate();
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [step, setStep] = React.useState<
    'welcome' | 'login' | 'register' | 'questionnaire' | 'questionnaireFinished'
  >('welcome');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState<boolean>(
    false
  );

  const doLogin = () => {
    if (creatingOrLoggingInAccount) return;
    onLogin({
      email: email.trim(),
      password,
    });
  };

  const doCreateAccount = async () => {
    if (creatingOrLoggingInAccount) return;
    onCreateAccount(
      {
        email: email.trim(),
        password,
        getNewsletterEmail,
        username,
      },
      preferences
    );
  };

  React.useEffect(
    () => {
      if ((step === 'login' || step === 'register') && profile) {
        setStep('questionnaire');
      } else if (!(step === 'login' || step === 'register') && !profile) {
        setStep('welcome');
      }
    },
    [profile, step]
  );

  if (creatingOrLoggingInAccount) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={50} />
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (!isOnline) {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <Text size="title" align="center">
            <Trans>You seem to be offline</Trans>
          </Text>
          <TreeLeaves style={styles.icon} />
          <Text size="body2" noMargin align="center">
            <Trans>
              Verify your internet connection to access your personalized
              content.
            </Trans>
          </Text>
          <div style={styles.buttonContainer}>
            <Line expand>
              <RaisedButton
                primary
                label={<Trans>Refresh</Trans>}
                onClick={forceUpdate}
                fullWidth
              />
            </Line>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (step === 'login') {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <ColumnStackLayout expand alignItems="center" justifyContent="center">
            <Text size="title" align="center">
              <Trans>Log in to Gdevelop</Trans>
            </Text>
            <BackgroundText>
              <Trans>
                This will synchronise your selected content wherever you go.
              </Trans>
            </BackgroundText>
            <div style={styles.getFormContainerStyle(isMobile)}>
              <LoginForm
                email={email}
                onChangeEmail={setEmail}
                password={password}
                onChangePassword={setPassword}
                onLogin={doLogin}
                loginInProgress={creatingOrLoggingInAccount}
                onForgotPassword={onResetPassword}
                error={authenticationError}
              />
            </div>
          </ColumnStackLayout>
          <div style={styles.buttonContainer}>
            <Column>
              <LineStackLayout expand>
                <FlatButton
                  primary
                  label={<Trans>Back</Trans>}
                  onClick={() => setStep('welcome')}
                  fullWidth
                />
                <RaisedButton
                  label={<Trans>Next</Trans>}
                  primary
                  onClick={doLogin}
                  fullWidth
                />
              </LineStackLayout>
            </Column>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (step === 'register') {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <ColumnStackLayout expand alignItems="center" justifyContent="center">
            <Text size="title" align="center">
              <Trans>Let's start by creating your GDevelop account</Trans>
            </Text>
            <BackgroundText>
              <Trans>
                This will synchronise your selected content wherever you go.
              </Trans>
            </BackgroundText>
            <div style={styles.getFormContainerStyle(isMobile)}>
              <CreateAccountForm
                email={email}
                onChangeEmail={setEmail}
                password={password}
                onChangePassword={setPassword}
                username={username}
                onChangeUsername={setUsername}
                optInNewsletterEmail={getNewsletterEmail}
                onChangeOptInNewsletterEmail={setGetNewsletterEmail}
                isValidatingUsername={isValidatingUsername}
                onChangeIsValidatingUsername={setIsValidatingUsername}
                usernameAvailability={usernameAvailability}
                onChangeUsernameAvailability={setUsernameAvailability}
                onCreateAccount={doCreateAccount}
                createAccountInProgress={creatingOrLoggingInAccount}
                error={authenticationError}
              />
            </div>
          </ColumnStackLayout>
          <div style={styles.buttonContainer}>
            <Column>
              <LineStackLayout expand>
                <FlatButton
                  primary
                  label={<Trans>Back</Trans>}
                  onClick={() => setStep('welcome')}
                  fullWidth
                />
                <RaisedButton
                  label={<Trans>Next</Trans>}
                  primary
                  onClick={doLogin}
                  fullWidth
                />
              </LineStackLayout>
            </Column>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (step === 'welcome') {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <Text size="title" align="center">
            <Trans>Welcome to GDevelop!</Trans>
          </Text>
          <JewelPlatform style={styles.icon} />
          <Text size="body2" noMargin align="center">
            <Trans>
              We've put together some content to help you on your game creation
              journey.
            </Trans>
          </Text>
          <LargeSpacer />
          <Text size="sub-title" align="center">
            <Trans>Let's start by creating your account.</Trans>
          </Text>
          <div style={styles.buttonContainer}>
            <ColumnStackLayout noMargin>
              <RaisedButton
                label={<Trans>Let's go!</Trans>}
                primary
                onClick={() => setStep('register')}
                fullWidth
              />
              <FlatButton
                primary
                label={<Trans>I already have an account</Trans>}
                onClick={() => setStep('login')}
                fullWidth
              />
            </ColumnStackLayout>
          </div>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (step === 'questionnaireFinished') {
    return (
      <SectionContainer
        title={null} // Let the content handle the title.
        flexBody
      >
        <ColumnStackLayout
          noMargin
          expand
          justifyContent="center"
          alignItems="center"
        >
          <Text size="title" align="center">
            <Trans>Alright let's see what we have for you...</Trans>
          </Text>
          <img
            src={questionnaireFinishedImageSource}
            alt="You as the red hero coming back to life"
          />
          <Text size="body2" noMargin align="center">
            <Trans>Just one second please...</Trans>
          </Text>
          <Line>
            <LinearProgress
              variant="indeterminate"
              style={styles.linearProgress}
            />
          </Line>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  return (
    <PersonalizationFlow
      onQuestionnaireFinished={() => setStep('questionnaireFinished')}
    />
  );
};

const GetStartedSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Get started section</Trans>}
    scope="start-page-get-started"
  >
    <GetStartedSection {...props} />
  </ErrorBoundary>
);

export default GetStartedSectionWithErrorBoundary;

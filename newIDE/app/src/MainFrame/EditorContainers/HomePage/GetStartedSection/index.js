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
import {
  type UsernameAvailability,
  type UserSurvey as UserSurveyType,
} from '../../../../Utils/GDevelopServices/User';
import UserSurvey from './UserSurvey';
import LinearProgress from '../../../../UI/LinearProgress';
import CreateAccountForm from '../../../../Profile/CreateAccountForm';
import LoginForm from '../../../../Profile/LoginForm';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import RecommendationList from './RecommendationList';
import ErrorBoundary from '../../../../UI/ErrorBoundary';

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

type Props = {|
  showUserChip: boolean => void,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const GetStartedSection = ({ showUserChip, selectInAppTutorial }: Props) => {
  const isOnline = useOnlineStatus();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    onResetPassword,
    creatingOrLoggingInAccount,
    onLogin,
    onEditProfile,
    onCreateAccount,
    authenticationError,
    loginState,
  } = authenticatedUser;
  const { values: preferences } = React.useContext(PreferencesContext);

  const forceUpdate = useForceUpdate();
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [step, setStep] = React.useState<
    | 'welcome'
    | 'login'
    | 'register'
    | 'questionnaire'
    | 'questionnaireFinished'
    | 'recommendations'
  >(profile && profile.survey ? 'recommendations' : 'welcome');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [errorSendingSurvey, setErrorSendingSurvey] = React.useState<boolean>(
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
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState<boolean>(
    false
  );
  const [
    lastVisitedAuthenticationStep,
    setLastVisitedAuthenticationStep,
  ] = React.useState<'login' | 'register'>('login');

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

  const onQuestionnaireFinished = async (survey: UserSurveyType) => {
    try {
      setStep('questionnaireFinished');
      await onEditProfile({ survey }, preferences, { throwError: true });
      setStep('recommendations');
    } catch (error) {
      console.error('An error occurred when sending survey:', error);
      setErrorSendingSurvey(true);
      setStep('welcome');
    }
  };

  React.useEffect(
    () => {
      if (step === 'welcome' && profile && profile.survey) {
        setStep('recommendations');
      } else if ((step === 'login' || step === 'register') && profile) {
        setStep(profile.survey ? 'recommendations' : 'questionnaire');
      } else if (!(step === 'login' || step === 'register') && !profile) {
        setStep('welcome');
      }
      // Only show user chip when the user is logged in and can see the recommendations.
      // In any other case, we don't want to distract them from completing the survey.
      showUserChip(step === 'recommendations' && !!profile && !!profile.survey);
    },
    [profile, step, showUserChip]
  );

  // Logic to store the last visited authentication step.
  React.useEffect(
    () => {
      if (step === 'login') {
        setLastVisitedAuthenticationStep('login');
      } else if (step === 'register') {
        setLastVisitedAuthenticationStep('register');
      }
    },
    [step]
  );

  // Reset form when user changes authentication step.
  React.useEffect(
    () => {
      setEmail('');
      setPassword('');
    },
    [lastVisitedAuthenticationStep]
  );

  if (
    (creatingOrLoggingInAccount || loginState === 'loggingIn') &&
    // Do not display loader if the user is already seeing the recommendations.
    // It can happen when the user profile is refreshed while the recommendations
    // are displayed. This way, the loader is not displayed unnecessarily.
    step !== 'recommendations'
  ) {
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

  if (!isOnline || errorSendingSurvey) {
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
          {errorSendingSurvey ? (
            <>
              <Text size="title" align="center">
                <Trans>Error when sending survey.</Trans>
              </Text>
              <TreeLeaves style={styles.icon} />
              <Text size="body2" noMargin align="center">
                <Trans>
                  Verify your internet connection and try again later.
                </Trans>
              </Text>
            </>
          ) : (
            <>
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
            </>
          )}
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
                  onClick={doCreateAccount}
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
            {profile ? (
              <Trans>Let's get to know you better.</Trans>
            ) : (
              <Trans>Let's start by creating your account.</Trans>
            )}
          </Text>
          <div style={styles.buttonContainer}>
            {profile ? (
              <Column noMargin>
                <RaisedButton
                  label={<Trans>Let's go!</Trans>}
                  primary
                  onClick={() => setStep('questionnaire')}
                  fullWidth
                />
              </Column>
            ) : (
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
            )}
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

  if (step === 'recommendations' && profile) {
    return (
      <SectionContainer
        title={
          profile.username ? (
            <Trans>Hello {profile.username}!</Trans>
          ) : (
            <Trans>Hello!</Trans>
          )
        }
        subtitleText={
          <Trans>
            Here’s some content to get you started on your GDevelop journey!
          </Trans>
        }
        flexBody
      >
        <RecommendationList
          authenticatedUser={authenticatedUser}
          selectInAppTutorial={selectInAppTutorial}
        />
      </SectionContainer>
    );
  }

  return <UserSurvey onQuestionnaireFinished={onQuestionnaireFinished} />;
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

// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Text from '../../../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
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
import {
  clearUserSurveyPersistedState,
  hasStartedUserSurvey,
} from './UserSurveyStorage';
import LinearProgress from '../../../../UI/LinearProgress';
import CreateAccountForm from '../../../../Profile/CreateAccountForm';
import LoginForm from '../../../../Profile/LoginForm';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import RecommendationList from './RecommendationList';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { delay } from '../../../../Utils/Delay';
import { type AuthError } from '../../../../Utils/GDevelopServices/Authentication';
import { AnnouncementsFeed } from '../../../../AnnouncementsFeed';
import Checkbox from '../../../../UI/Checkbox';
import { getGetStartedSectionViewCount } from '../../../../Utils/Analytics/LocalStats';
import { sendUserSurveyCompleted } from '../../../../Utils/Analytics/EventSender';

const ONE_WEEK = 7 * 24 * 3600 * 1000;
const THRESHOLD_BEFORE_ALLOWING_TO_HIDE_GET_STARTED_SECTION = 15;

const shouldDisplayOptionToHideGetStartedSection = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean,
}): boolean => {
  if (!isAuthenticated) return false;

  const getStartedSectionViewCount = getGetStartedSectionViewCount();
  return (
    getStartedSectionViewCount >
    THRESHOLD_BEFORE_ALLOWING_TO_HIDE_GET_STARTED_SECTION
  );
};

const styles = {
  icon: {
    width: 80,
    height: 80,
    margin: 20,
  },
  middlePageButtonContainer: {
    width: '100%',
    maxWidth: 300, // Make buttons larger but not too much.
    marginBottom: '15%', // Used to display the content of the section higher than at the center.
  },
  bottomPageButtonContainer: {
    width: '100%',
    maxWidth: 300, // Make buttons larger but not too much.
    marginBottom: 30, // Used to giver some space between the buttons and the screen bottom border.
  },
  linearProgress: { width: 200 },
  getFormContainerStyle: (isMobile: boolean) => ({
    marginTop: 20,
    // Take full width on mobile.
    width: isMobile ? '95%' : 300,
  }),
  questionnaireFinishedImage: { aspectRatio: '263 / 154' },
};

const questionnaireFinishedImageSource = 'res/questionnaire/welcome-back.svg';

type Props = {|
  showUserChip: boolean => void,
  onUserSurveyStarted: () => void,
  onUserSurveyHidden: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
|};

const GetStartedSection = ({
  showUserChip,
  selectInAppTutorial,
  onUserSurveyStarted,
  onUserSurveyHidden,
}: Props) => {
  const isFillingOutSurvey = hasStartedUserSurvey();
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
  const {
    values: preferences,
    setShowGetStartedSectionByDefault,
  } = React.useContext(PreferencesContext);
  const recommendationsGettingDelayPromise = React.useRef<?Promise<void>>(null);
  const [error, setError] = React.useState<?AuthError>(null);
  const forceUpdate = useForceUpdate();
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const [step, setStep] = React.useState<
    | 'welcome'
    | 'login'
    | 'register'
    | 'survey'
    | 'surveyFinished'
    | 'recommendations'
  >(
    profile && profile.survey
      ? 'recommendations'
      : isFillingOutSurvey
      ? 'survey'
      : 'welcome'
  );
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

  const onSurveyFinished = async (survey: UserSurveyType) => {
    try {
      setStep('surveyFinished');
      // Artificial delay to build up expectations.
      recommendationsGettingDelayPromise.current = delay(5000);
      await Promise.all([
        onEditProfile({ survey }, preferences, { throwError: true }),
        recommendationsGettingDelayPromise.current,
      ]);
      sendUserSurveyCompleted();
      clearUserSurveyPersistedState();
      setStep('recommendations');
    } catch (error) {
      console.error('An error occurred when sending survey:', error);
      setErrorSendingSurvey(true);
      setStep('welcome');
    } finally {
      recommendationsGettingDelayPromise.current = null;
    }
  };

  React.useEffect(
    () => {
      if (step === 'welcome' && profile && profile.survey) {
        setStep('recommendations');
      } else if ((step === 'login' || step === 'register') && profile) {
        setStep(profile.survey ? 'recommendations' : 'survey');
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

  React.useEffect(
    () => {
      if (!authenticatedUser.authenticated) clearUserSurveyPersistedState();
    },
    [authenticatedUser.authenticated]
  );

  // Set the error when the authentication error changes.
  React.useEffect(
    () => {
      setError(authenticationError);
    },
    [authenticationError]
  );

  // Reset form when user changes authentication step.
  React.useEffect(
    () => {
      setError(null);
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
    step !== 'recommendations' &&
    !recommendationsGettingDelayPromise.current
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
              <div style={styles.middlePageButtonContainer}>
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
          <ColumnStackLayout
            expand
            noMargin
            alignItems="center"
            justifyContent="center"
          >
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
                error={error}
              />
            </div>
          </ColumnStackLayout>
          <div style={styles.bottomPageButtonContainer}>
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
          <ColumnStackLayout
            expand
            noMargin
            alignItems="center"
            justifyContent="center"
          >
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
                error={error}
              />
            </div>
          </ColumnStackLayout>
          <div style={styles.bottomPageButtonContainer}>
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
    const isNewUser = profile && Date.now() - profile.createdAt < ONE_WEEK;
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
          <ColumnStackLayout
            noMargin
            expand
            justifyContent="center"
            alignItems="center"
          >
            <Text size="title" align="center">
              {!profile || isNewUser ? (
                <Trans>Welcome to GDevelop!</Trans>
              ) : profile && profile.username ? (
                <Trans>Good to see you {profile.username}!</Trans>
              ) : (
                <Trans>We have something new for you!</Trans>
              )}
            </Text>
            <JewelPlatform style={styles.icon} />
            <Text size="body2" noMargin align="center">
              <Trans>
                We've made a selection of GDevelop content to help you on your
                game development journey.
              </Trans>
            </Text>
            <LargeSpacer />
            <Text size="sub-title" align="center">
              {profile ? (
                <Trans>
                  Answer our questionnaire and get recommendations according to
                  your current objectives.
                </Trans>
              ) : (
                <Trans>Let's start by creating your account.</Trans>
              )}
            </Text>
            <div style={styles.middlePageButtonContainer}>
              {profile ? (
                <Column noMargin>
                  <RaisedButton
                    label={<Trans>Let's go!</Trans>}
                    primary
                    onClick={() => setStep('survey')}
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
          {shouldDisplayOptionToHideGetStartedSection({
            isAuthenticated: authenticatedUser.authenticated,
          }) && (
            <div style={styles.bottomPageButtonContainer}>
              <Checkbox
                label={<Trans>Don't show this screen on next startup</Trans>}
                checked={!preferences.showGetStartedSectionByDefault}
                onCheck={(e, checked) => {
                  if (checked) onUserSurveyHidden();
                  setShowGetStartedSectionByDefault(!checked);
                }}
              />
            </div>
          )}
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (step === 'surveyFinished') {
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
            style={styles.questionnaireFinishedImage}
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

  const renderSubtitle = () => (
    <ResponsiveLineStackLayout
      justifyContent="space-between"
      alignItems="center"
      noColumnMargin
      noMargin
    >
      <Text noMargin>
        <Trans>
          Here’s some content to get you started on your GDevelop journey!
        </Trans>
      </Text>
      <Checkbox
        label={<Trans>Don't show this screen on next startup</Trans>}
        checked={!preferences.showGetStartedSectionByDefault}
        onCheck={(e, checked) => setShowGetStartedSectionByDefault(!checked)}
      />
    </ResponsiveLineStackLayout>
  );

  if (step === 'recommendations' && profile) {
    return (
      <>
        <AnnouncementsFeed canClose level="urgent" addMargins />
        <SectionContainer
          title={
            profile.username ? (
              <Trans>Hello {profile.username}!</Trans>
            ) : (
              <Trans>Hello!</Trans>
            )
          }
          renderSubtitle={renderSubtitle}
          flexBody
        >
          <RecommendationList
            authenticatedUser={authenticatedUser}
            selectInAppTutorial={selectInAppTutorial}
          />
        </SectionContainer>
      </>
    );
  }

  return (
    <UserSurvey
      onCompleted={onSurveyFinished}
      onStarted={onUserSurveyStarted}
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

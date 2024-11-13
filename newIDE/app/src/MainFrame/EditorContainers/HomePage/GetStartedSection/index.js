// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Text from '../../../../UI/Text';
import { ColumnStackLayout } from '../../../../UI/Layout';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { useOnlineStatus } from '../../../../Utils/OnlineStatus';
import TreeLeaves from '../../../../UI/CustomSvgIcons/TreeLeaves';
import SectionContainer from '../SectionContainer';
import RaisedButton from '../../../../UI/RaisedButton';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { LargeSpacer, Line } from '../../../../UI/Grid';
import CircularProgress from '../../../../UI/CircularProgress';
import { type UserSurvey as UserSurveyType } from '../../../../Utils/GDevelopServices/User';
import UserSurvey from './UserSurvey';
import {
  clearUserSurveyPersistedState,
  hasStartedUserSurvey,
} from './UserSurveyStorage';
import LinearProgress from '../../../../UI/LinearProgress';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import RecommendationList from './RecommendationList';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { delay } from '../../../../Utils/Delay';
import { type SubscriptionPlanWithPricingSystems } from '../../../../Utils/GDevelopServices/Usage';
import Checkbox from '../../../../UI/Checkbox';
import { sendUserSurveyCompleted } from '../../../../Utils/Analytics/EventSender';
import { type NewProjectSetup } from '../../../../ProjectCreation/NewProjectSetupDialog';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';

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
  onUserSurveyStarted: () => void,
  onUserSurveyHidden: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[]),
  onOpenProfile: () => void,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
|};

const GetStartedSection = ({
  selectInAppTutorial,
  onUserSurveyStarted,
  onUserSurveyHidden,
  subscriptionPlansWithPricingSystems,
  onOpenProfile,
  onCreateProjectFromExample,
  askToCloseProject,
}: Props) => {
  const isFillingOutSurvey = hasStartedUserSurvey();
  const isOnline = useOnlineStatus();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    creatingOrLoggingInAccount,
    onEditProfile,
    loginState,
  } = authenticatedUser;
  const {
    values: preferences,
    setShowGetStartedSectionByDefault,
  } = React.useContext(PreferencesContext);
  const recommendationsGettingDelayPromise = React.useRef<?Promise<void>>(null);
  const forceUpdate = useForceUpdate();
  const [step, setStep] = React.useState<
    'survey' | 'surveyFinished' | 'recommendations'
  >(isFillingOutSurvey ? 'survey' : 'recommendations');

  const [errorSendingSurvey, setErrorSendingSurvey] = React.useState<boolean>(
    false
  );

  const onSurveyFinished = async (survey: UserSurveyType) => {
    try {
      setStep('surveyFinished');
      // Artificial delay to build up expectations.
      recommendationsGettingDelayPromise.current = delay(2500);
      await Promise.all([
        onEditProfile({ survey }, preferences),
        recommendationsGettingDelayPromise.current,
      ]);
      sendUserSurveyCompleted();
      clearUserSurveyPersistedState();
    } catch (error) {
      console.error('An error occurred when sending survey:', error);
      setErrorSendingSurvey(true);
    } finally {
      recommendationsGettingDelayPromise.current = null;
      setStep('recommendations');
    }
  };

  React.useEffect(
    () => {
      if (!authenticatedUser.authenticated) clearUserSurveyPersistedState();
    },
    [authenticatedUser.authenticated]
  );

  const shouldDisplayAnnouncements =
    !authenticatedUser.limits ||
    !authenticatedUser.limits.capabilities.classrooms ||
    !authenticatedUser.limits.capabilities.classrooms.hidePlayTab;

  if (
    (creatingOrLoggingInAccount || loginState === 'loggingIn') &&
    // Do not display loader if the user is already seeing the recommendations.
    // It can happen when the user profile is refreshed while the recommendations
    // are displayed. This way, the loader is not displayed unnecessarily.
    step !== 'recommendations' &&
    !recommendationsGettingDelayPromise.current
  ) {
    return (
      <SectionContainer flexBody>
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
            <CircularProgress size={40} />
          </ColumnStackLayout>
        </ColumnStackLayout>
      </SectionContainer>
    );
  }

  if (!isOnline || errorSendingSurvey) {
    return (
      <SectionContainer flexBody>
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

  if (step === 'surveyFinished') {
    return (
      <SectionContainer flexBody>
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

  if (step === 'recommendations') {
    return (
      <>
        <SectionContainer
          flexBody
          showUrgentAnnouncements={shouldDisplayAnnouncements}
        >
          <RecommendationList
            authenticatedUser={authenticatedUser}
            selectInAppTutorial={selectInAppTutorial}
            subscriptionPlansWithPricingSystems={
              subscriptionPlansWithPricingSystems
            }
            onOpenProfile={onOpenProfile}
            onStartSurvey={
              profile
                ? () => {
                    setStep('survey');
                  }
                : null
            }
            hasFilledSurveyAlready={profile ? !!profile.survey : false}
            onCreateProjectFromExample={onCreateProjectFromExample}
            askToCloseProject={askToCloseProject}
          />
          {authenticatedUser.recommendations && (
            <Line justifyContent="center" alignItems="center">
              <Checkbox
                label={<Trans>Don't show this screen on next startup</Trans>}
                checked={!preferences.showGetStartedSectionByDefault}
                onCheck={(e, checked) =>
                  setShowGetStartedSectionByDefault(!checked)
                }
              />
            </Line>
          )}
          <LargeSpacer />
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

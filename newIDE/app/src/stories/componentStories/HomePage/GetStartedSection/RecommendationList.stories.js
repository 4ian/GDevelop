// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import { fakeAuthenticatedUserWithNoSubscription } from '../../../../fixtures/GDevelopServicesTestData';
import RecommendationList from '../../../../MainFrame/EditorContainers/HomePage/GetStartedSection/RecommendationList';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import inAppTutorialDecorator from '../../../InAppTutorialDecorator';
import { TutorialStateProvider } from '../../../../Tutorial/TutorialContext';
import useSubscriptionPlans, {
  getAvailableSubscriptionPlansWithPrices,
} from '../../../../Utils/UseSubscriptionPlans';
import LoaderModal from '../../../../UI/LoaderModal';

export default {
  title: 'HomePage/GetStartedSectionSection/RecommendationList',
  component: RecommendationList,
  decorators: [paperDecorator, inAppTutorialDecorator],
};

export const Default = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  return subscriptionPlansWithPricingSystems ? (
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialStateProvider>
        <RecommendationList
          onOpenProfile={action('onOpenProfile')}
          authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
          selectInAppTutorial={action('selectInAppTutorial')}
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onStartSurvey={null}
          hasFilledSurveyAlready={false}
          askToCloseProject={async () => true}
          onCreateProjectFromExample={action('onCreateProjectFromExample')}
        />
      </TutorialStateProvider>
    </PreferencesContext.Provider>
  ) : (
    <LoaderModal show />
  );
};

export const WithSurvey = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });

  return subscriptionPlansWithPricingSystems ? (
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialStateProvider>
        <RecommendationList
          onOpenProfile={action('onOpenProfile')}
          authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
          selectInAppTutorial={action('selectInAppTutorial')}
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onStartSurvey={action('onStartSurvey')}
          hasFilledSurveyAlready={false}
          askToCloseProject={async () => true}
          onCreateProjectFromExample={action('onCreateProjectFromExample')}
        />
      </TutorialStateProvider>
    </PreferencesContext.Provider>
  ) : (
    <LoaderModal show />
  );
};

export const WithSurveyAlreadyFilled = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });

  return subscriptionPlansWithPricingSystems ? (
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialStateProvider>
        <RecommendationList
          onOpenProfile={action('onOpenProfile')}
          authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
          selectInAppTutorial={action('selectInAppTutorial')}
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onStartSurvey={action('onStartSurvey')}
          hasFilledSurveyAlready={true}
          askToCloseProject={async () => true}
          onCreateProjectFromExample={action('onCreateProjectFromExample')}
        />
      </TutorialStateProvider>
    </PreferencesContext.Provider>
  ) : (
    <LoaderModal show />
  );
};

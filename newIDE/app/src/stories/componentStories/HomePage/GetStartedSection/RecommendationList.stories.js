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

export default {
  title: 'HomePage/GetStartedSectionSection/RecommendationList',
  component: RecommendationList,
  decorators: [paperDecorator, inAppTutorialDecorator],
};

export const Default = () => {
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialStateProvider>
      <RecommendationList
        onOpenProfile={action('onOpenProfile')}
        authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
        selectInAppTutorial={action('selectInAppTutorial')}
        onStartSurvey={null}
        hasFilledSurveyAlready={false}
        askToCloseProject={async () => true}
        onCreateProjectFromExample={action('onCreateProjectFromExample')}
      />
    </TutorialStateProvider>
  </PreferencesContext.Provider>;
};

export const WithSurvey = () => {
  return (
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialStateProvider>
        <RecommendationList
          onOpenProfile={action('onOpenProfile')}
          authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
          selectInAppTutorial={action('selectInAppTutorial')}
          onStartSurvey={action('onStartSurvey')}
          hasFilledSurveyAlready={false}
          askToCloseProject={async () => true}
          onCreateProjectFromExample={action('onCreateProjectFromExample')}
        />
      </TutorialStateProvider>
    </PreferencesContext.Provider>
  );
};

export const WithSurveyAlreadyFilled = () => {
  return (
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialStateProvider>
        <RecommendationList
          onOpenProfile={action('onOpenProfile')}
          authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
          selectInAppTutorial={action('selectInAppTutorial')}
          onStartSurvey={action('onStartSurvey')}
          hasFilledSurveyAlready={true}
          askToCloseProject={async () => true}
          onCreateProjectFromExample={action('onCreateProjectFromExample')}
        />
      </TutorialStateProvider>
    </PreferencesContext.Provider>
  );
};

// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  fakeAuthenticatedUserWithNoSubscription,
  subscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData';
import RecommendationList from '../../../../MainFrame/EditorContainers/HomePage/GetStartedSection/RecommendationList';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import inAppTutorialDecorator from '../../../InAppTutorialDecorator';
import {
  TutorialContext,
  TutorialStateProvider,
} from '../../../../Tutorial/TutorialContext';

export default {
  title: 'HomePage/GetStartedSectionSection/RecommendationList',
  component: RecommendationList,
  decorators: [paperDecorator, inAppTutorialDecorator, muiDecorator],
};

const RecommendationListStory = () => {
  const { fetchTutorials, tutorials } = React.useContext(TutorialContext);
  React.useEffect(
    () => {
      // TODO: Fix weird issue where tutorials are fetched but tutorials are never set in the context state.
      fetchTutorials();
    },
    [fetchTutorials]
  );
  return (
    <RecommendationList
      key={tutorials ? tutorials.length : 0}
      authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
      selectInAppTutorial={action('selectInAppTutorial')}
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
    />
  );
};

export const Default = () => (
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialStateProvider>
      <RecommendationListStory />
    </TutorialStateProvider>
  </PreferencesContext.Provider>
);

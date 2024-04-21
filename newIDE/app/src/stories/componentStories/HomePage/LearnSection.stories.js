// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import LearnSection from '../../../MainFrame/EditorContainers/HomePage/LearnSection';
import PreferencesContext, {
  initialPreferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import inAppTutorialDecorator from '../../InAppTutorialDecorator';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { fakeTutorials } from '../../../fixtures/GDevelopServicesTestData/FakeTutorials';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedTeacherFromEducationPlan,
  fakeAuthenticatedUserWithEducationPlan,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'HomePage/LearnSection',
  component: LearnSection,
  decorators: [paperDecorator, inAppTutorialDecorator],
};

export const Default = () => (
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialContext.Provider
      value={{
        tutorials: fakeTutorials,
        fetchTutorials: () => {},
        error: null,
      }}
    >
      <LearnSection
        initialCategory={null}
        onOpenExampleStore={action('onOpenExampleStore')}
        onTabChange={() => {}}
        selectInAppTutorial={action('selectInAppTutorial')}
      />
    </TutorialContext.Provider>
  </PreferencesContext.Provider>
);

export const EducationSubscriber = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedUserWithEducationPlan}
  >
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialContext.Provider
        value={{
          tutorials: fakeTutorials,
          fetchTutorials: () => {},
          error: null,
        }}
      >
        <LearnSection
          initialCategory={null}
          onOpenExampleStore={action('onOpenExampleStore')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
        />
      </TutorialContext.Provider>
    </PreferencesContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const EducationTeacher = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedTeacherFromEducationPlan}
  >
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialContext.Provider
        value={{
          tutorials: fakeTutorials,
          fetchTutorials: () => {},
          error: null,
        }}
      >
        <LearnSection
          initialCategory={null}
          onOpenExampleStore={action('onOpenExampleStore')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
        />
      </TutorialContext.Provider>
    </PreferencesContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const Loading = () => (
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialContext.Provider
      value={{
        tutorials: null,
        fetchTutorials: () => {},
        error: null,
      }}
    >
      <LearnSection
        initialCategory={null}
        onOpenExampleStore={action('onOpenExampleStore')}
        onTabChange={() => {}}
        selectInAppTutorial={action('selectInAppTutorial')}
      />
    </TutorialContext.Provider>
  </PreferencesContext.Provider>
);

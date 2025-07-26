// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import LearnSection from '../../../MainFrame/EditorContainers/HomePage/LearnSection';
import PreferencesContext, {
  initialPreferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import inAppTutorialDecorator from '../../InAppTutorialDecorator';
import { TutorialContext } from '../../../Tutorial/TutorialContext';
import { fakeTutorials } from '../../../fixtures/GDevelopServicesTestData/FakeTutorials';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  videoBasedCourseChapter,
  fakeAuthenticatedTeacherFromEducationPlan,
  fakeAuthenticatedUserWithEducationPlan,
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  lockedCourseChapter,
  premiumCourse,
} from '../../../fixtures/GDevelopServicesTestData';
import i18nProviderDecorator from '../../I18nProviderDecorator';

export default {
  title: 'HomePage/LearnSection',
  component: LearnSection,
  decorators: [
    paperDecorator,
    alertDecorator,
    inAppTutorialDecorator,
    i18nProviderDecorator,
  ],
};

export const Default = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedUserWithNoSubscription}
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
          getCourseChapters={() => [
            videoBasedCourseChapter,
            lockedCourseChapter,
          ]}
          course={premiumCourse}
          courses={[premiumCourse]}
          onSelectCourse={action('onSelectCourse')}
          previewedCourse={premiumCourse}
          isCourseTaskCompleted={() => false}
          onCompleteCourseTask={action('onCompleteCourseTask')}
          getCourseChapterCompletion={() => null}
          getCourseCompletion={() => null}
          selectedCategory={null}
          onSelectCategory={action('onSelectCategory')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
          onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
          onOpenTemplateFromCourseChapter={action(
            'onOpenTemplateFromCourseChapter'
          )}
          onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
          onBuyCourse={action('onBuyCourse')}
          purchasingCourseListingData={null}
          setPurchasingCourseListingData={() => {}}
          onOpenAskAi={() => action('onOpenAskAi')()}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSelectPrivateGameTemplateListingData={action(
            'onSelectPrivateGameTemplateListingData'
          )}
          onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
        />
      </TutorialContext.Provider>
    </PreferencesContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const NotAuthenticated = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <PreferencesContext.Provider value={initialPreferences}>
      <TutorialContext.Provider
        value={{
          tutorials: fakeTutorials,
          fetchTutorials: () => {},
          error: null,
        }}
      >
        <LearnSection
          getCourseChapters={() => [
            videoBasedCourseChapter,
            lockedCourseChapter,
          ]}
          course={premiumCourse}
          courses={[premiumCourse]}
          onSelectCourse={action('onSelectCourse')}
          previewedCourse={premiumCourse}
          isCourseTaskCompleted={() => false}
          onCompleteCourseTask={action('onCompleteCourseTask')}
          getCourseChapterCompletion={() => null}
          getCourseCompletion={() => null}
          selectedCategory={null}
          onSelectCategory={action('onSelectCategory')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
          onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
          onOpenTemplateFromCourseChapter={action(
            'onOpenTemplateFromCourseChapter'
          )}
          onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
          onBuyCourse={action('onBuyCourse')}
          purchasingCourseListingData={null}
          setPurchasingCourseListingData={() => {}}
          onOpenAskAi={() => action('onOpenAskAi')()}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSelectPrivateGameTemplateListingData={action(
            'onSelectPrivateGameTemplateListingData'
          )}
          onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
        />
      </TutorialContext.Provider>
    </PreferencesContext.Provider>
  </AuthenticatedUserContext.Provider>
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
          getCourseChapters={() => [
            videoBasedCourseChapter,
            lockedCourseChapter,
          ]}
          course={premiumCourse}
          courses={[premiumCourse]}
          onSelectCourse={action('onSelectCourse')}
          previewedCourse={premiumCourse}
          isCourseTaskCompleted={() => false}
          onCompleteCourseTask={action('onCompleteCourseTask')}
          getCourseChapterCompletion={() => null}
          getCourseCompletion={() => null}
          selectedCategory={null}
          onSelectCategory={action('onSelectCategory')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
          onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
          onOpenTemplateFromCourseChapter={action(
            'onOpenTemplateFromCourseChapter'
          )}
          onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
          onBuyCourse={action('onBuyCourse')}
          purchasingCourseListingData={null}
          setPurchasingCourseListingData={() => {}}
          onOpenAskAi={() => action('onOpenAskAi')()}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSelectPrivateGameTemplateListingData={action(
            'onSelectPrivateGameTemplateListingData'
          )}
          onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
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
          getCourseChapters={() => [
            videoBasedCourseChapter,
            lockedCourseChapter,
          ]}
          course={premiumCourse}
          courses={[premiumCourse]}
          onSelectCourse={action('onSelectCourse')}
          previewedCourse={premiumCourse}
          isCourseTaskCompleted={() => false}
          onCompleteCourseTask={action('onCompleteCourseTask')}
          getCourseChapterCompletion={() => null}
          getCourseCompletion={() => null}
          selectedCategory={null}
          onSelectCategory={action('onSelectCategory')}
          onTabChange={() => {}}
          selectInAppTutorial={action('selectInAppTutorial')}
          onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
          onOpenTemplateFromCourseChapter={action(
            'onOpenTemplateFromCourseChapter'
          )}
          onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
          onBuyCourse={action('onBuyCourse')}
          purchasingCourseListingData={null}
          setPurchasingCourseListingData={() => {}}
          onOpenAskAi={() => action('onOpenAskAi')()}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSelectPrivateGameTemplateListingData={action(
            'onSelectPrivateGameTemplateListingData'
          )}
          onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
        />
      </TutorialContext.Provider>
    </PreferencesContext.Provider>
  </AuthenticatedUserContext.Provider>
);

export const LoadingTutorials = () => (
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialContext.Provider
      value={{
        tutorials: null,
        fetchTutorials: () => {},
        error: null,
      }}
    >
      <LearnSection
        getCourseChapters={() => null}
        course={null}
        courses={[premiumCourse]} //TODO
        onSelectCourse={action('onSelectCourse')}
        previewedCourse={null}
        isCourseTaskCompleted={() => false}
        onCompleteCourseTask={action('onCompleteCourseTask')}
        getCourseChapterCompletion={() => null}
        getCourseCompletion={() => null}
        selectedCategory={null}
        onSelectCategory={action('onSelectCategory')}
        onTabChange={() => {}}
        selectInAppTutorial={action('selectInAppTutorial')}
        onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
        onOpenTemplateFromCourseChapter={action(
          'onOpenTemplateFromCourseChapter'
        )}
        onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
        onBuyCourse={action('onBuyCourse')}
        purchasingCourseListingData={null}
        setPurchasingCourseListingData={() => {}}
        onOpenAskAi={() => action('onOpenAskAi')()}
        onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
        onSelectPrivateGameTemplateListingData={action(
          'onSelectPrivateGameTemplateListingData'
        )}
        onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
      />
    </TutorialContext.Provider>
  </PreferencesContext.Provider>
);

export const LoadingCourses = () => (
  <PreferencesContext.Provider value={initialPreferences}>
    <TutorialContext.Provider
      value={{
        tutorials: fakeTutorials,
        fetchTutorials: () => {},
        error: null,
      }}
    >
      <LearnSection
        getCourseChapters={() => null}
        course={null}
        courses={null}
        onSelectCourse={action('onSelectCourse')}
        previewedCourse={null}
        isCourseTaskCompleted={() => false}
        onCompleteCourseTask={action('onCompleteCourseTask')}
        getCourseChapterCompletion={() => null}
        getCourseCompletion={() => null}
        selectedCategory={null}
        onSelectCategory={action('onSelectCategory')}
        onTabChange={() => {}}
        selectInAppTutorial={action('selectInAppTutorial')}
        onOpenTemplateFromTutorial={action('onOpenTemplateFromTutorial')}
        onOpenTemplateFromCourseChapter={action(
          'onOpenTemplateFromCourseChapter'
        )}
        onBuyCourseWithCredits={action('onBuyCourseWithCredits')}
        onBuyCourse={action('onBuyCourse')}
        purchasingCourseListingData={null}
        setPurchasingCourseListingData={() => {}}
        onOpenAskAi={() => action('onOpenAskAi')()}
        onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
        onSelectPrivateGameTemplateListingData={action(
          'onSelectPrivateGameTemplateListingData'
        )}
        onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
      />
    </TutorialContext.Provider>
  </PreferencesContext.Provider>
);

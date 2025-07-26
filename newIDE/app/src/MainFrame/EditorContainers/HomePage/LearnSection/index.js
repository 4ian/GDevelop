// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type HomeTab } from '../HomePageMenu';
import {
  type CourseListingData,
  type PrivateGameTemplateListingData,
} from '../../../../Utils/GDevelopServices/Shop';
import MainPage from './MainPage';
import TutorialsCategoryPage from './TutorialsCategoryPage';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import ErrorBoundary from '../../../../UI/ErrorBoundary';

import CourseSection from './CourseSection';
import type {
  CourseChapter,
  Course,
} from '../../../../Utils/GDevelopServices/Asset';
import type { CourseChapterCompletion, CourseCompletion } from '../UseCourses';
import SectionContainer, { SectionRow } from '../SectionContainer';
import TutorialsPage from './TutorialsPage';
import InAppTutorialsPage from './InAppTutorialsPage';
import CoursesPage from './CoursesPage';
import { type LearnCategory } from './Utils';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';

type Props = {|
  onTabChange: (tab: HomeTab) => void,
  selectInAppTutorial: (tutorialId: string) => void,
  selectedCategory: LearnCategory,
  onSelectCategory: LearnCategory => void,
  onOpenTemplateFromTutorial: string => Promise<void>,
  onOpenTemplateFromCourseChapter: CourseChapter => Promise<void>,
  previewedCourse: ?Course,
  onSelectCourse: (courseId: string | null) => void,
  course: ?Course,
  courses: ?(Course[]),
  getCourseChapters: (courseId: string) => ?Array<CourseChapter>,
  onCompleteCourseTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isCourseTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getCourseChapterCompletion: (
    courseId: string,
    chapterId: string
  ) => CourseChapterCompletion | null,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  onBuyCourseWithCredits: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  onBuyCourse: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  purchasingCourseListingData: ?CourseListingData,
  setPurchasingCourseListingData: (CourseListingData | null) => void,
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
  onOpenNewProjectSetupDialog: () => void,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
|};

const LearnSection = ({
  onTabChange,
  selectInAppTutorial,
  selectedCategory,
  onSelectCategory,
  onOpenTemplateFromTutorial,
  onOpenTemplateFromCourseChapter,
  previewedCourse,
  onSelectCourse,
  course,
  getCourseChapters,
  courses,
  onCompleteCourseTask,
  isCourseTaskCompleted,
  getCourseChapterCompletion,
  getCourseCompletion,
  onBuyCourseWithCredits,
  onBuyCourse,
  purchasingCourseListingData,
  setPurchasingCourseListingData,
  onOpenAskAi,
  onOpenNewProjectSetupDialog,
  onSelectPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
}: Props) => {
  const { fetchTutorials } = React.useContext(TutorialContext);

  React.useEffect(
    () => {
      fetchTutorials();
    },
    [fetchTutorials]
  );

  if (course) {
    const courseChapters = getCourseChapters(course.id);

    if (!courseChapters) {
      return (
        <SectionContainer flexBody>
          <SectionRow expand>
            <PlaceholderLoader />
          </SectionRow>
        </SectionContainer>
      );
    }

    return (
      <CourseSection
        course={course}
        courseChapters={courseChapters}
        onBack={() => {
          onSelectCourse(null);
        }}
        onOpenTemplateFromCourseChapter={onOpenTemplateFromCourseChapter}
        onCompleteTask={onCompleteCourseTask}
        isTaskCompleted={isCourseTaskCompleted}
        getChapterCompletion={(chapterId: string) =>
          getCourseChapterCompletion(course.id, chapterId)
        }
        getCourseCompletion={() => getCourseCompletion(course.id)}
        onBuyCourseWithCredits={onBuyCourseWithCredits}
        onBuyCourse={onBuyCourse}
        purchasingCourseListingData={purchasingCourseListingData}
        setPurchasingCourseListingData={setPurchasingCourseListingData}
        onOpenAskAi={onOpenAskAi}
      />
    );
  }

  return !selectedCategory ? (
    <MainPage
      onTabChange={onTabChange}
      onSelectCategory={onSelectCategory}
      selectInAppTutorial={selectInAppTutorial}
      courses={courses}
      onSelectCourse={onSelectCourse}
      previewedCourse={previewedCourse}
      getCourseCompletion={getCourseCompletion}
      getCourseChapterCompletion={getCourseChapterCompletion}
      onOpenAskAi={onOpenAskAi}
      onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
      onSelectPrivateGameTemplateListingData={
        onSelectPrivateGameTemplateListingData
      }
      onSelectExampleShortHeader={onSelectExampleShortHeader}
    />
  ) : selectedCategory === 'all-tutorials' ? (
    <TutorialsPage onSelectCategory={onSelectCategory} />
  ) : selectedCategory === 'in-app-tutorials' ? (
    <InAppTutorialsPage
      onBack={() => onSelectCategory(null)}
      selectInAppTutorial={selectInAppTutorial}
    />
  ) : selectedCategory === 'all-courses' ? (
    <CoursesPage
      onBack={() => onSelectCategory(null)}
      courses={courses}
      onSelectCourse={onSelectCourse}
      previewedCourse={previewedCourse}
      getCourseChapters={getCourseChapters}
      getCourseCompletion={getCourseCompletion}
      getCourseChapterCompletion={getCourseChapterCompletion}
    />
  ) : (
    <TutorialsCategoryPage
      onBack={() => onSelectCategory('all-tutorials')}
      category={selectedCategory}
      onOpenTemplateFromTutorial={onOpenTemplateFromTutorial}
      onSelectCourse={onSelectCourse}
    />
  );
};

const LearnSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Learn section</Trans>}
    scope="start-page-learn"
  >
    <LearnSection {...props} />
  </ErrorBoundary>
);

export default LearnSectionWithErrorBoundary;

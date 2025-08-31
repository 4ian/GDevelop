// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import {
  type CourseListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
} from '../../../../Utils/GDevelopServices/Shop';
import MainPage from './MainPage';
import TutorialsCategoryPage from './TutorialsCategoryPage';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import ErrorBoundary from '../../../../UI/ErrorBoundary';

import CoursePage from './CoursePage';
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
import { type SubscriptionPlanWithPricingSystems } from '../../../../Utils/GDevelopServices/Usage';
import BundlePage from './BundlePage/BundlePage';
import RouterContext from '../../../RouterContext';
import {
  sendBundleInformationOpened,
  sendCourseInformationOpened,
} from '../../../../Utils/Analytics/EventSender';
import { BundleStoreContext } from '../../../../AssetStore/Bundles/BundleStoreContext';

type Props = {|
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
  getSubscriptionPlansWithPricingSystems: () => Array<SubscriptionPlanWithPricingSystems> | null,
  receivedCourses: ?Array<Course>,
|};

const LearnSection = ({
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
  getSubscriptionPlansWithPricingSystems,
  receivedCourses,
}: Props) => {
  const { fetchTutorials } = React.useContext(TutorialContext);
  const { fetchBundles } = React.useContext(BundleStoreContext);
  const { navigateToRoute } = React.useContext(RouterContext);

  const [
    selectedBundleListingData,
    setSelectedBundleListingData,
  ] = React.useState<?BundleListingData>(null);

  const onOpenBundle = React.useCallback(
    (bundleListingData: BundleListingData) => {
      sendBundleInformationOpened({
        bundleName: bundleListingData.name,
        bundleId: bundleListingData.id,
        source: 'learn',
      });
      setSelectedBundleListingData(bundleListingData);
    },
    [setSelectedBundleListingData]
  );

  const onOpenCourse = React.useCallback(
    (courseId: string | null) => {
      if (courseId && courses) {
        const course = courses.find(c => c.id === courseId);
        if (course && course.isLocked) {
          // Only send the event if the course is not owned.
          sendCourseInformationOpened({
            courseName: course.titleByLocale['en'],
            courseId: courseId,
            source: 'learn',
          });
        }
      }
      onSelectCourse(courseId);
    },
    [onSelectCourse, courses]
  );

  React.useEffect(
    () => {
      fetchTutorials();
      fetchBundles();
    },
    // Fetch tutorials and bundles only once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
      <CoursePage
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

  if (selectedBundleListingData) {
    return (
      <BundlePage
        bundleListingData={selectedBundleListingData}
        onBack={() => setSelectedBundleListingData(null)}
        getSubscriptionPlansWithPricingSystems={
          getSubscriptionPlansWithPricingSystems
        }
        onAssetPackOpen={privateAssetPackListingData => {
          // Ideally we would open it in the Learn Section,
          // but asset packs are not supported in the Learn Section yet.
          navigateToRoute('store', {
            'asset-pack': `product-${privateAssetPackListingData.id}`,
          });
        }}
        onGameTemplateOpen={onSelectPrivateGameTemplateListingData}
        onBundleOpen={onOpenBundle}
        onCourseOpen={courseListingData => {
          onOpenCourse(courseListingData.id);
        }}
        courses={courses}
        receivedCourses={receivedCourses}
        getCourseCompletion={getCourseCompletion}
      />
    );
  }

  return !selectedCategory ? (
    <MainPage
      onSelectCategory={onSelectCategory}
      selectInAppTutorial={selectInAppTutorial}
      courses={courses}
      onSelectCourse={onOpenCourse}
      onSelectBundle={onOpenBundle}
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
      onSelectCourse={onOpenCourse}
      onSelectBundle={onOpenBundle}
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
      onSelectCourse={onOpenCourse}
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

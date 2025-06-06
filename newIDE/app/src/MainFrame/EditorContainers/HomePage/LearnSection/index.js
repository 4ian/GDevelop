// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type HomeTab } from '../HomePageMenu';
import {
  type TutorialCategory,
  type Tutorial,
  canAccessTutorial,
} from '../../../../Utils/GDevelopServices/Tutorial';
import MainPage from './MainPage';
import TutorialsCategoryPage from './TutorialsCategoryPage';
import { Trans } from '@lingui/macro';
import { TutorialContext } from '../../../../Tutorial/TutorialContext';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { sendTutorialOpened } from '../../../../Utils/Analytics/EventSender';
import Window from '../../../../Utils/Window';
import { type ImageTileComponent } from '../../../../UI/ImageTileGrid';
import Paper from '../../../../UI/Paper';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import { type Limits } from '../../../../Utils/GDevelopServices/Usage';
import { formatDuration } from '../../../../Utils/Duration';
import CourseSection from './CourseSection';
import type {
  CourseChapter,
  Course,
} from '../../../../Utils/GDevelopServices/Asset';
import type { CourseChapterCompletion, CourseCompletion } from '../UseCourses';

export const TUTORIAL_CATEGORY_TEXTS = {
  'full-game': {
    title: <Trans>Entire games</Trans>,
    description: <Trans>Make complete games step by step</Trans>,
  },
  'game-mechanic': {
    title: <Trans>Specific game mechanics</Trans>,
    description: (
      <Trans>
        Find how to implement the most common game mechanics and more
      </Trans>
    ),
  },
  'official-beginner': {
    title: <Trans>Beginner course</Trans>,
    description: <Trans>Learn the fundamental principles of GDevelop</Trans>,
  },
  'official-intermediate': {
    title: <Trans>Intermediate course</Trans>,
    description: (
      <Trans>Learn all the game-building mechanics of GDevelop</Trans>
    ),
  },
  'official-advanced': {
    title: <Trans>Advanced course</Trans>,
    description: <Trans>The icing on the cake</Trans>,
  },
  'education-curriculum': {
    title: <Trans>Education curriculum and resources</Trans>,
    description: (
      <Trans>
        For teachers and educators having the GDevelop Education subscription.
        Ready to use resources for teaching.
      </Trans>
    ),
  },
  course: {
    title: <Trans>Loading</Trans>,
    description: <Trans>Loading course...</Trans>,
  },
  recommendations: {
    title: <Trans>Recommendations</Trans>,
    description: null,
  },
};

type FormatTutorialToImageTileComponentProps = {|
  i18n: I18nType,
  limits: ?Limits,
  tutorial: Tutorial,
  onSelectTutorial: (tutorial: Tutorial) => void,
|};

export const formatTutorialToImageTileComponent = ({
  i18n,
  tutorial,
  limits,
  onSelectTutorial,
}: FormatTutorialToImageTileComponentProps): ImageTileComponent => {
  const isLocked = !canAccessTutorial(
    tutorial,
    limits ? limits.capabilities : null
  );
  return {
    title:
      selectMessageByLocale(i18n, tutorial.titleByLocale) || tutorial.title,
    description:
      selectMessageByLocale(i18n, tutorial.descriptionByLocale) ||
      tutorial.description,
    isLocked,
    onClick: () => {
      if (tutorial.isPrivateTutorial) {
        onSelectTutorial(tutorial);
        return;
      }

      sendTutorialOpened(tutorial.id);
      Window.openExternalURL(
        selectMessageByLocale(i18n, tutorial.linkByLocale)
      );
    },
    imageUrl: selectMessageByLocale(i18n, tutorial.thumbnailUrlByLocale),
    overlayText: tutorial.duration
      ? formatDuration(tutorial.duration)
      : '\u{1F4D8}',
    overlayTextPosition: 'bottomRight',
  };
};

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
  },
};

type Props = {|
  onTabChange: (tab: HomeTab) => void,
  selectInAppTutorial: (tutorialId: string) => void,
  selectedCategory: TutorialCategory | null,
  onSelectCategory: (TutorialCategory | null) => void,
  onOpenTemplateFromTutorial: string => Promise<void>,
  onOpenTemplateFromCourseChapter: CourseChapter => Promise<void>,
  previewedCourse: ?Course,
  previewedCourseChapters: ?(CourseChapter[]),
  onSelectCourse: (courseId: string | null) => void,
  course: ?Course,
  courses: ?(Course[]),
  courseChapters: ?(CourseChapter[]),
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
  onBuyCourseChapterWithCredits: (CourseChapter, string) => Promise<void>,
|};

const LearnSection = ({
  onTabChange,
  selectInAppTutorial,
  selectedCategory,
  onSelectCategory,
  onOpenTemplateFromTutorial,
  onOpenTemplateFromCourseChapter,
  previewedCourse,
  previewedCourseChapters,
  onSelectCourse,
  course,
  courseChapters,
  courses,
  onCompleteCourseTask,
  isCourseTaskCompleted,
  getCourseChapterCompletion,
  getCourseCompletion,
  onBuyCourseChapterWithCredits,
}: Props) => {
  const {
    tutorials,
    fetchTutorials,
    error: tutorialLoadingError,
  } = React.useContext(TutorialContext);

  React.useEffect(
    () => {
      fetchTutorials();
    },
    [fetchTutorials]
  );

  if (selectedCategory === 'course' && courseChapters && course) {
    return (
      <CourseSection
        course={course}
        courseChapters={courseChapters}
        onBack={() => {
          onSelectCategory(null);
          onSelectCourse(null);
        }}
        onOpenTemplateFromCourseChapter={onOpenTemplateFromCourseChapter}
        onCompleteTask={onCompleteCourseTask}
        isTaskCompleted={isCourseTaskCompleted}
        getChapterCompletion={(chapterId: string) =>
          getCourseChapterCompletion(course.id, chapterId)
        }
        getCourseCompletion={() => getCourseCompletion(course.id)}
        onBuyCourseChapterWithCredits={onBuyCourseChapterWithCredits}
      />
    );
  }

  if (tutorialLoadingError)
    return (
      <Paper square style={styles.paper} background="dark">
        <PlaceholderError onRetry={fetchTutorials}>
          <Trans>
            Can't load the tutorials. Verify your internet connection or retry
            later.
          </Trans>
        </PlaceholderError>
      </Paper>
    );

  if (!tutorials) return <PlaceholderLoader />;

  return !selectedCategory ? (
    <MainPage
      onTabChange={onTabChange}
      onSelectCategory={onSelectCategory}
      tutorials={tutorials}
      selectInAppTutorial={selectInAppTutorial}
      courses={courses}
      onSelectCourse={onSelectCourse}
      previewedCourse={previewedCourse}
      previewedCourseChapters={previewedCourseChapters}
      getCourseCompletion={getCourseCompletion}
      getCourseChapterCompletion={getCourseChapterCompletion}
    />
  ) : (
    <TutorialsCategoryPage
      onBack={() => onSelectCategory(null)}
      category={selectedCategory}
      tutorials={tutorials}
      onOpenTemplateFromTutorial={onOpenTemplateFromTutorial}
      onSelectCourse={(courseId: string) => {
        onSelectCourse(courseId);
        onSelectCategory('course');
      }}
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

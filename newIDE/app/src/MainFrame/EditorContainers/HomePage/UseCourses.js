// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  listCourseChapters,
  listCourses,
  type Course,
  type CourseChapter,
  type UserCourseProgress,
} from '../../../Utils/GDevelopServices/Asset';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fetchUserCourseProgress,
  updateUserCourseProgress as doUpdateUserCourseProgress,
} from '../../../Utils/GDevelopServices/User';
import { useOptimisticState } from '../../../Utils/UseOptimisticState';
import CourseChapterStoreContext from '../../../Course/CourseChapterStoreContext';
import { CreditsPackageStoreContext } from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { buyProductWithCredits } from '../../../Utils/GDevelopServices/Shop';
import PreferencesContext from '../../Preferences/PreferencesContext';

export type CourseChapterCompletion = {|
  completedTasks: number,
  tasks: number,
|};

export type CourseCompletion = {|
  percentage: number,
  completedChapters: number,
  chapters: number,
|};

const useCourses = () => {
  const {
    profile,
    limits,
    subscription,
    getAuthorizationHeader,
    onOpenLoginDialog,
  } = React.useContext(AuthenticatedUserContext);
  const {
    values: { language },
  } = React.useContext(PreferencesContext);
  const userLanguage2LetterCode = language.split('_')[0].toLowerCase();

  const [courses, setCourses] = React.useState<?(Course[])>(null);
  const { listedCourseChapters } = React.useContext(CourseChapterStoreContext);
  const { openCreditsPackageDialog, openCreditsUsageDialog } = React.useContext(
    CreditsPackageStoreContext
  );

  const updateUserCourseProgress = React.useCallback(
    async (userCourseProgress: UserCourseProgress | null) => {
      if (!userCourseProgress) return;
      doUpdateUserCourseProgress(getAuthorizationHeader, userCourseProgress);
    },
    [getAuthorizationHeader]
  );

  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(
    null
  );
  const [userProgressByCourseId, setUserProgressByCourseId] = React.useState<{|
    [courseId: string]: ?UserCourseProgress,
  |}>({});

  const [
    userCourseProgress,
    setUserCourseProgress,
    setUserCourseProgressImmediately,
  ] = useOptimisticState<UserCourseProgress | null>(
    null,
    updateUserCourseProgress
  );

  const [areChaptersReady, setAreChaptersReady] = React.useState<boolean>(
    false
  );

  const [chaptersByCourseId, setChaptersByCourseId] = React.useState<{|
    [courseId: string]: CourseChapter[],
  |}>({});
  const userId = profile ? profile.id : null;

  const fetchCourses = React.useCallback(async () => {
    const fetchedCourses = await listCourses();
    setCourses(fetchedCourses);
  }, []);

  const onSelectCourse = React.useCallback(
    (courseId: string | null) => {
      if (!courseId) {
        setUserCourseProgressImmediately(null);
      } else {
        const userProgress = userProgressByCourseId[courseId];
        setUserCourseProgressImmediately(userProgress || null);
      }
      setSelectedCourseId(courseId);
    },
    [userProgressByCourseId, setUserCourseProgressImmediately]
  );

  const fetchCourseChapters = React.useCallback(
    async (courseId: string) => {
      try {
        const [fetchedChapters, userProgress] = await Promise.all([
          listCourseChapters(getAuthorizationHeader, {
            courseId,
            userId,
            lang: userLanguage2LetterCode,
          }),
          (async () => {
            if (userId) {
              const userProgress = await fetchUserCourseProgress(
                getAuthorizationHeader,
                userId,
                courseId
              );
              return userProgress;
            } else {
              return null;
            }
          })(),
        ]);
        setUserProgressByCourseId(currentProgressByCourseId => ({
          ...currentProgressByCourseId,
          [courseId]: userProgress,
        }));
        setChaptersByCourseId(currentChaptersByCourseId => ({
          ...currentChaptersByCourseId,
          [courseId]: fetchedChapters,
        }));
      } catch (error) {
        console.error(
          `An error occurred while fetching chapters for course ${courseId}:`,
          error
        );
      }
    },
    // A subscription change will change the displayed chapters sent by the backend.
    // So the user subscription is added as a dependency to make sure the chapters are
    // up to date with the user subscription.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getAuthorizationHeader, userId, subscription, userLanguage2LetterCode]
  );

  const onCompleteTask = React.useCallback(
    (chapterId: string, taskIndex: number, completed: boolean) => {
      if (!selectedCourseId) return;
      if (!userId) {
        onOpenLoginDialog();
        return;
      }

      const newUserCourseProgress: UserCourseProgress = userCourseProgress
        ? { ...userCourseProgress }
        : {
            courseId: selectedCourseId,
            userId,
            progress: [],
          };
      let currentChapterProgress = newUserCourseProgress.progress.find(
        task => task.chapterId === chapterId
      );
      if (!currentChapterProgress) {
        newUserCourseProgress.progress.push({ chapterId, completedTasks: [] });
        currentChapterProgress =
          newUserCourseProgress.progress[
            newUserCourseProgress.progress.length - 1
          ];
      }

      const indexInList = currentChapterProgress.completedTasks.indexOf(
        taskIndex
      );
      if (completed) {
        if (indexInList === -1) {
          currentChapterProgress.completedTasks.push(taskIndex);
        }
      } else {
        if (indexInList !== -1) {
          currentChapterProgress.completedTasks.splice(indexInList, 1);
        }
      }
      setUserCourseProgress(newUserCourseProgress);
      setUserProgressByCourseId(currentUserProgressByCourseId => ({
        ...currentUserProgressByCourseId,
        [selectedCourseId]: newUserCourseProgress,
      }));
    },
    [
      userCourseProgress,
      userId,
      selectedCourseId,
      setUserCourseProgress,
      onOpenLoginDialog,
    ]
  );

  const isTaskCompleted = React.useCallback(
    (chapterId: string, taskIndex: number) => {
      if (!userCourseProgress) return false;

      const currentChapterProgress = userCourseProgress.progress.find(
        task => task.chapterId === chapterId
      );
      if (!currentChapterProgress) return false;

      return currentChapterProgress.completedTasks.indexOf(taskIndex) >= 0;
    },
    [userCourseProgress]
  );

  const getChapterCompletion = React.useCallback(
    (courseId: string, chapterId: string): CourseChapterCompletion | null => {
      const chapters = chaptersByCourseId[courseId];
      if (!chapters) return null;

      const chapter = chapters.find(chapter => chapter.id === chapterId);
      if (!chapter || chapter.isLocked) return null;

      const tasksCount = chapter.tasks
        ? chapter.tasks.length
        : chapter.items.filter(item => item.type === 'task').length;

      const courseProgress = userProgressByCourseId[courseId];
      if (!courseProgress) return { completedTasks: 0, tasks: tasksCount };

      const chapterProgress = courseProgress.progress.find(
        chapterProgress => chapterProgress.chapterId === chapterId
      );
      if (!chapterProgress) return { completedTasks: 0, tasks: tasksCount };

      return {
        completedTasks: chapterProgress.completedTasks.length,
        tasks: tasksCount,
      };
    },
    [userProgressByCourseId, chaptersByCourseId]
  );

  const getCourseCompletion = React.useCallback(
    (courseId: string): CourseCompletion | null => {
      if (!courses) return null;
      const course = courses.find(course => course.id === courseId);
      if (!course) return null;

      const chapters = chaptersByCourseId[courseId];
      if (!chapters) return null;

      const chaptersCount = course.chaptersTargetCount;
      const courseProgress = userProgressByCourseId[courseId];
      if (!courseProgress)
        return { percentage: 0, completedChapters: 0, chapters: chaptersCount };

      let completion = 0;
      let completedChapters = 0;
      const chapterProportion = 1 / chaptersCount;
      chapters.forEach(chapter => {
        if (chapter.isLocked) return;

        const chapterProgress = courseProgress.progress.find(
          chapterProgress => chapterProgress.chapterId === chapter.id
        );
        if (!chapterProgress) return;

        const tasksCount = chapter.tasks
          ? chapter.tasks.length
          : chapter.items.filter(item => item.type === 'task').length;

        const isChapterCompleted =
          chapterProgress.completedTasks.length >= tasksCount;
        if (isChapterCompleted) completedChapters++;

        completion +=
          (chapterProgress.completedTasks.length / tasksCount) *
          chapterProportion;
      });

      return {
        percentage: completion,
        chapters: chaptersCount,
        completedChapters,
      };
    },
    [userProgressByCourseId, chaptersByCourseId, courses]
  );

  const onBuyCourseChapterWithCredits = React.useCallback(
    async (courseChapter: CourseChapter, password: string) => {
      if (
        !courseChapter.isLocked ||
        !courseChapter.priceInCredits ||
        !listedCourseChapters
      )
        return;

      if (!userId || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      const currentCreditsAmount = limits.credits.userBalance.amount;
      const listedCourseChapter = listedCourseChapters.find(
        chapter => chapter.id === courseChapter.productId
      );
      if (!listedCourseChapter) {
        console.error(
          `Couldn't find course chapter with id ${
            courseChapter.productId
          } in Shop API.`
        );
        return;
      }
      const priceForUsageType = listedCourseChapter.creditPrices.find(
        price => price.usageType === 'default'
      );
      if (!priceForUsageType) {
        console.error(
          'Unable to find the credits price for the default usage type'
        );
        return;
      }
      const creditsAmount = priceForUsageType.amount;
      if (currentCreditsAmount < creditsAmount) {
        openCreditsPackageDialog({
          missingCredits: creditsAmount - currentCreditsAmount,
        });
        return;
      }

      openCreditsUsageDialog({
        title: <Trans>Purchase {courseChapter.title}</Trans>,
        message: (
          <Trans>
            You are about to use {creditsAmount} credits to purchase the chapter
            "{courseChapter.title}". Continue?
          </Trans>
        ),
        onConfirm: async () => {
          await buyProductWithCredits(getAuthorizationHeader, {
            productId: listedCourseChapter.id,
            usageType: 'default',
            userId,
            password,
          });
          if (selectedCourseId) await fetchCourseChapters(selectedCourseId);
        },
        successMessage: <Trans>🎉 You can now follow your new chapter!</Trans>,
      });
    },
    [
      userId,
      limits,
      listedCourseChapters,
      openCreditsPackageDialog,
      openCreditsUsageDialog,
      getAuthorizationHeader,
      onOpenLoginDialog,
      fetchCourseChapters,
      selectedCourseId,
    ]
  );

  React.useEffect(
    () => {
      (async () => {
        if (courses) {
          await Promise.all(
            courses.map(course => fetchCourseChapters(course.id))
          );
          setAreChaptersReady(true);
        }
      })();
    },
    // (Re)fetch course chapters when courses are defined and when fetchCourseChapters
    // changes (see its dependencies).
    [courses, fetchCourseChapters]
  );

  const selectedCourse =
    selectedCourseId && courses && areChaptersReady
      ? courses.find(course => course.id === selectedCourseId) || null
      : null;

  return {
    courses,
    fetchCourses,
    onSelectCourse,
    selectedCourse,
    courseChaptersByCourseId: chaptersByCourseId,
    areChaptersReady,
    onCompleteTask,
    isTaskCompleted,
    getChapterCompletion,
    getCourseCompletion,
    onBuyCourseChapterWithCredits,
  };
};

export default useCourses;

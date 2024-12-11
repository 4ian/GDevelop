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

const useCourses = () => {
  const {
    profile,
    limits,
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

  const [
    userCourseProgress,
    setUserCourseProgress,
    setUserCourseProgressImmediately,
  ] = useOptimisticState<UserCourseProgress | null>(
    null,
    updateUserCourseProgress
  );

  const [isLoadingChapters, setIsLoadingChapters] = React.useState<boolean>(
    false
  );
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null
  );
  const [
    courseChapters,
    setCourseChapters,
  ] = React.useState<?(CourseChapter[])>(null);
  const userId = profile ? profile.id : null;

  const fetchCourses = React.useCallback(async () => {
    const fetchedCourses = await listCourses();
    setCourses(fetchedCourses);
  }, []);

  const fetchCourseChapters = React.useCallback(
    async (courseId: string) => {
      setIsLoadingChapters(true);
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
        setUserCourseProgressImmediately(userProgress);
        setCourseChapters(fetchedChapters);
      } finally {
        setIsLoadingChapters(false);
      }
    },
    [
      getAuthorizationHeader,
      userId,
      setUserCourseProgressImmediately,
      userLanguage2LetterCode,
    ]
  );

  React.useEffect(
    () => {
      if (selectedCourse) {
        fetchCourseChapters(selectedCourse.id);
      } else {
        setCourseChapters(null);
        setUserCourseProgressImmediately(null);
      }
    },
    /**
     * Fetch chapters when:
     * - Selected course changes
     * - when user logs in/out
     */
    [
      selectedCourse,
      userId,
      getAuthorizationHeader,
      setUserCourseProgressImmediately,
      fetchCourseChapters,
    ]
  );

  const onCompleteTask = React.useCallback(
    (chapterId: string, taskIndex: number, completed: boolean) => {
      if (!selectedCourse) return;
      if (!userId) {
        onOpenLoginDialog();
        return;
      }

      const newUserCourseProgress: UserCourseProgress = userCourseProgress
        ? { ...userCourseProgress }
        : {
            courseId: selectedCourse.id,
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
    },
    [
      userCourseProgress,
      userId,
      selectedCourse,
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
    (chapterId: string): CourseChapterCompletion | null => {
      if (!courseChapters) return null;

      const chapter = courseChapters.find(chapter => chapter.id === chapterId);
      if (!chapter || chapter.isLocked) return null;

      const tasksCount = chapter.tasks.length;

      if (!userCourseProgress) return { completedTasks: 0, tasks: tasksCount };

      const chapterProgress = userCourseProgress.progress.find(
        chapterProgress => chapterProgress.chapterId === chapterId
      );
      if (!chapterProgress) return { completedTasks: 0, tasks: tasksCount };

      return {
        completedTasks: chapterProgress.completedTasks.length,
        tasks: tasksCount,
      };
    },
    [userCourseProgress, courseChapters]
  );

  const getCourseCompletion = React.useCallback(
    (): number | null => {
      if (!courseChapters) return null;
      if (!userCourseProgress) return 0;

      let completion = 0;
      const chapterProportion = 1 / courseChapters.length;
      courseChapters.forEach(chapter => {
        if (chapter.isLocked) return;

        const chapterProgress = userCourseProgress.progress.find(
          chapterProgress => chapterProgress.chapterId === chapter.id
        );
        if (!chapterProgress) return;

        completion +=
          (chapterProgress.completedTasks.length / chapter.tasks.length) *
          chapterProportion;
      });

      return completion;
    },
    [userCourseProgress, courseChapters]
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
          if (selectedCourse) await fetchCourseChapters(selectedCourse.id);
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
      selectedCourse,
    ]
  );

  React.useEffect(
    () => {
      fetchCourses();
    },
    [fetchCourses]
  );

  return {
    courses,
    courseChapters,
    selectedCourse,
    onSelectCourse: setSelectedCourse,
    isLoadingChapters,
    onCompleteTask,
    isTaskCompleted,
    getChapterCompletion,
    getCourseCompletion,
    onBuyCourseChapterWithCredits,
  };
};

export default useCourses;

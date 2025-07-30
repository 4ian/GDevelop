// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import {
  listCourseChapters,
  listCourses,
  type Course,
  type CourseChapter,
  type UserCourseProgress,
} from '../../../Utils/GDevelopServices/Asset';
import { type CourseListingData } from '../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fetchUserCourseProgress,
  updateUserCourseProgress as doUpdateUserCourseProgress,
} from '../../../Utils/GDevelopServices/User';
import { useOptimisticState } from '../../../Utils/UseOptimisticState';
import CourseStoreContext from '../../../Course/CourseStoreContext';
import { CreditsPackageStoreContext } from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import { buyProductWithCredits } from '../../../Utils/GDevelopServices/Shop';
import PreferencesContext from '../../Preferences/PreferencesContext';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import { sendCourseBuyClicked } from '../../../Utils/Analytics/EventSender';

export type CourseChapterCompletion = {|
  completedTasks: number,
  tasks: number,
|};

export type CourseCompletion = {|
  percentage: number,
  completedChapters: number,
  chapters: number,
|};

type ReadyUser = {|
  userStatus: 'ready' | 'not-ready',
  userId: string | null,
  userSubscriptionPlanId: string | null,
  userCoursePurchasesCount: number | null,
|};

/**
 * Help to reduce the number of re-fetches of the courses by
 * debouncing the user changes.
 */
const useReadyUser = () => {
  const {
    profile,
    subscription,
    coursePurchases,
    loginState,
  } = React.useContext(AuthenticatedUserContext);

  const [readyUser, setReadyUser] = React.useState<ReadyUser>({
    userStatus: 'not-ready',
    userId: null,
    userSubscriptionPlanId: null,
    userCoursePurchasesCount: null,
  });

  React.useEffect(
    () => {
      if (loginState !== 'done') {
        return;
      }

      setReadyUser({
        userStatus: 'ready',
        userId: profile ? profile.id : null,
        userSubscriptionPlanId: subscription ? subscription.planId : null,
        userCoursePurchasesCount: coursePurchases ? coursePurchases.length : 0,
      });
    },
    [profile, loginState, subscription, coursePurchases]
  );

  return readyUser;
};

const noCourseChapters: {
  [courseId: string]: CourseChapter[],
} = {};

const useCourses = () => {
  const {
    userStatus,
    userId,
    userSubscriptionPlanId,
    userCoursePurchasesCount,
  } = useReadyUser();
  const {
    limits,
    getAuthorizationHeader,
    onOpenLoginDialog,
  } = React.useContext(AuthenticatedUserContext);
  const {
    values: { language },
  } = React.useContext(PreferencesContext);

  const [courses, setCourses] = React.useState<?(Course[])>(null);
  const { listedCourses } = React.useContext(CourseStoreContext);
  const [
    purchasingCourseListingData,
    setPurchasingCourseListingData,
  ] = React.useState<?CourseListingData>(null);
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

  const [areCoursesFetched, setAreCoursesFetched] = React.useState<boolean>(
    false
  );

  const [
    chaptersByCourseIdByUserId,
    setChaptersByCourseIdByUserId,
  ] = React.useState<{
    [userId: string]: { [courseId: string]: CourseChapter[] },
  }>({
    '': noCourseChapters,
  });

  const fetchCourses = React.useCallback(
    async (): Promise<Array<Course>> => {
      const fetchedCourses = await listCourses(getAuthorizationHeader, {
        userId,
      });
      setCourses(fetchedCourses);
      return fetchedCourses;
    },
    [userId, getAuthorizationHeader]
  );

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
        console.info(
          `Fetching chapters for course ${courseId} for userId=${userId ||
            'null'}.`
        );
        const [fetchedChapters, userProgress] = await Promise.all([
          listCourseChapters(getAuthorizationHeader, {
            courseId,
            userId,
            language,
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
        const userIdOrEmpty: string = userId || '';
        setChaptersByCourseIdByUserId(currentChaptersByCourseIdByUserId => ({
          ...currentChaptersByCourseIdByUserId,
          [userIdOrEmpty]: {
            ...currentChaptersByCourseIdByUserId[userIdOrEmpty],
            [courseId]: fetchedChapters,
          },
        }));
      } catch (error) {
        console.error(
          `An error occurred while fetching chapters for course ${courseId}:`,
          error
        );
      }
    },
    [getAuthorizationHeader, userId, language]
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

  const chaptersByCourseId =
    chaptersByCourseIdByUserId[userId || ''] || noCourseChapters;

  const getChapterCompletion = React.useCallback(
    (courseId: string, chapterId: string): CourseChapterCompletion | null => {
      const chapters = chaptersByCourseId ? chaptersByCourseId[courseId] : null;
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

      const chapters = chaptersByCourseId ? chaptersByCourseId[courseId] : null;
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

  const onBuyCourse = React.useCallback(
    async (course: Course, password: string, i18n: I18nType) => {
      if (!course.isLocked || !listedCourses) return;

      if (!userId || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      const listedCourse = listedCourses.find(
        listedCourse => listedCourse.id === course.id
      );
      if (!listedCourse) {
        console.error(`Couldn't find course with id ${course.id} in Shop API.`);
        return;
      }
      const priceForUsageType = listedCourse.prices.find(
        price => price.usageType === 'default'
      );
      if (!priceForUsageType) {
        console.error('Unable to find the price for the default usage type');
        return;
      }
      try {
        sendCourseBuyClicked({
          courseId: course.id,
          courseName: course.titleByLocale.en,
          currency: priceForUsageType ? priceForUsageType.currency : undefined,
          usageType: 'default',
        });

        setPurchasingCourseListingData(listedCourse);
      } catch (e) {
        console.warn('Unable to send event', e);
      }
    },
    [
      userId,
      limits,
      listedCourses,
      onOpenLoginDialog,
      setPurchasingCourseListingData,
    ]
  );

  const onBuyCourseWithCredits = React.useCallback(
    async (course: Course, password: string, i18n: I18nType) => {
      if (!course.isLocked || !listedCourses) return;

      if (!userId || !limits) {
        // User not logged in, suggest to log in.
        onOpenLoginDialog();
        return;
      }

      sendCourseBuyClicked({
        courseId: course.id,
        courseName: course.titleByLocale.en,
        currency: 'CREDITS',
        usageType: 'default',
      });

      const currentCreditsAmount = limits.credits.userBalance.amount;
      const listedCourse = listedCourses.find(
        listedCourse => listedCourse.id === course.id
      );
      if (!listedCourse) {
        console.error(`Couldn't find course with id ${course.id} in Shop API.`);
        return;
      }
      const priceForUsageType = listedCourse.creditPrices.find(
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

      const translatedCourseTitle = selectMessageByLocale(
        i18n,
        course.titleByLocale
      );

      openCreditsUsageDialog({
        title: <Trans>Purchase {translatedCourseTitle}</Trans>,
        message: (
          <Trans>
            You are about to use {creditsAmount} credits to purchase the course
            "{translatedCourseTitle}". Continue?
          </Trans>
        ),
        onConfirm: async () => {
          await buyProductWithCredits(getAuthorizationHeader, {
            productId: listedCourse.id,
            usageType: 'default',
            userId,
            password,
          });
          await Promise.all([fetchCourses(), fetchCourseChapters(course.id)]);
        },
        successMessage: <Trans>🎉 You can now follow your new course!</Trans>,
      });
    },
    [
      userId,
      limits,
      listedCourses,
      openCreditsPackageDialog,
      openCreditsUsageDialog,
      getAuthorizationHeader,
      onOpenLoginDialog,
      fetchCourses,
      fetchCourseChapters,
    ]
  );

  React.useEffect(
    () => {
      (async () => {
        if (userStatus !== 'ready') {
          return;
        }

        console.info(`Fetching all courses for userId=${userId || 'null'}.`);

        if (userSubscriptionPlanId || userCoursePurchasesCount) {
          // Trigger a re-fetch of the courses when the user subscription changes,
          // or when the user purchases a course or when the user logs in/out.
        }

        if (userId) {
          const userIdOrEmpty: string = userId || '';
          // we empty the chapters fetched for the user to ensure they are re-fetched
          // and up-to-date (notably in case subscription changed or purchase count changed).
          setChaptersByCourseIdByUserId(currentChaptersByCourseIdByUserId => ({
            ...currentChaptersByCourseIdByUserId,
            [userIdOrEmpty]: noCourseChapters,
          }));
        }

        await fetchCourses();
        setAreCoursesFetched(true);
      })();
    },
    [
      fetchCourses,
      userSubscriptionPlanId,
      userCoursePurchasesCount,
      userId,
      userStatus,
    ]
  );

  // This callback will change (triggering re-renders)
  // anytime the chapters are fetched for a course for a user.
  const getCourseChapters = React.useCallback(
    (courseId: string) => {
      if (chaptersByCourseId[courseId] !== undefined) {
        return chaptersByCourseId[courseId];
      }

      // Chapter is not loaded yet, fetch it. Note that we could store
      // the promise to avoid fetching it multiple times.
      fetchCourseChapters(courseId);
      return null;
    },
    [chaptersByCourseId, fetchCourseChapters]
  );

  const selectedCourse = React.useMemo(
    () => {
      if (!selectedCourseId || !courses) return null;
      return courses.find(course => course.id === selectedCourseId) || null;
    },
    [selectedCourseId, courses]
  );

  return {
    courses,
    fetchCourses,
    onSelectCourse,
    selectedCourse,
    getCourseChapters,
    areCoursesFetched,
    onCompleteTask,
    isTaskCompleted,
    getChapterCompletion,
    getCourseCompletion,
    onBuyCourseWithCredits,
    onBuyCourse,
    purchasingCourseListingData,
    setPurchasingCourseListingData,
  };
};

export default useCourses;

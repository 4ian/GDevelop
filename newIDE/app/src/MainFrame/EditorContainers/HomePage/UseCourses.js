// @flow

import * as React from 'react';
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

const useCourses = () => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [courses, setCourses] = React.useState<?(Course[])>(null);

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
    setUserProgressWithoutCallingFunction,
  ] = useOptimisticState<UserCourseProgress | null>(
    null,
    updateUserCourseProgress
  );

  const [isLoadingChapters, setIsLoadingChapters] = React.useState<boolean>(
    false
  );
  const [selectedCourse, setSelectedCourse] = React.useState<?Course>(null);
  const [
    courseChapters,
    setCourseChapters,
  ] = React.useState<?(CourseChapter[])>(null);
  const userId = profile ? profile.id : null;

  const fetchCourses = React.useCallback(async () => {
    const fetchedCourses = await listCourses();
    setCourses(fetchedCourses);
  }, []);

  React.useEffect(
    () => {
      const fetchCourseChapters = async (courseId: string) => {
        setIsLoadingChapters(true);
        try {
          const fetchedChapters = await listCourseChapters(
            getAuthorizationHeader,
            {
              courseId,
              userId,
            }
          );

          if (userId) {
            const userProgress = await fetchUserCourseProgress(
              getAuthorizationHeader,
              userId,
              courseId
            );
            setUserProgressWithoutCallingFunction(userProgress);
          } else {
            setUserProgressWithoutCallingFunction(null);
          }
          setCourseChapters(fetchedChapters);
        } finally {
          setIsLoadingChapters(false);
        }
      };
      if (selectedCourse) {
        fetchCourseChapters(selectedCourse.id);
      } else {
        setCourseChapters(null);
        setUserProgressWithoutCallingFunction(null);
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
      setUserProgressWithoutCallingFunction,
    ]
  );

  const onCompleteTask = React.useCallback(
    (chapterId: string, taskIndex: number, completed: boolean) => {
      if (!selectedCourse || !userId) return;
      // TODO: if no userId, force to subscribe.

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
    [userCourseProgress, userId, selectedCourse, setUserCourseProgress]
  );

  const isTaskCompleted = React.useCallback(
    (chapterId: string, taskIndex: number) => {
      if (!userCourseProgress) return false;
      console.log(userCourseProgress)
      const currentChapterProgress = userCourseProgress.progress.find(
        task => task.chapterId === chapterId
      );
      if (!currentChapterProgress) return false;

      return currentChapterProgress.completedTasks.indexOf(taskIndex) >= 0;
    },
    [userCourseProgress]
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
    onSelectCourse: setSelectedCourse,
    isLoadingChapters,
    onCompleteTask,
    isTaskCompleted,
  };
};

export default useCourses;

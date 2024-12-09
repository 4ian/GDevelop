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

export type CourseChapterCompletion = {|
  completedTasks: number,
  tasks: number,
|};

const useCourses = () => {
  const {
    profile,
    getAuthorizationHeader,
    onOpenCreateAccountDialog,
  } = React.useContext(AuthenticatedUserContext);

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
          const [fetchedChapters, userProgress] = await Promise.all([
            listCourseChapters(getAuthorizationHeader, {
              courseId,
              userId,
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
          setUserProgressWithoutCallingFunction(userProgress);
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
      if (!selectedCourse) return;
      if (!userId) {
        onOpenCreateAccountDialog();
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
      onOpenCreateAccountDialog,
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
    getChapterCompletion,
    getCourseCompletion,
  };
};

export default useCourses;

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
          setCourseChapters(fetchedChapters);
          if (userId && selectedCourse) {
            const userProgress = await fetchUserCourseProgress(
              getAuthorizationHeader,
              userId,
              selectedCourse.id
            );
            setUserProgressWithoutCallingFunction(userProgress);
          } else {
            setUserProgressWithoutCallingFunction(null);
          }
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
  };
};

export default useCourses;

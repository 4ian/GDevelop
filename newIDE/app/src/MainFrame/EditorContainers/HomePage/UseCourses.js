// @flow

import * as React from 'react';
import {
  listCourseChapters,
  listCourses,
  type Course,
  type CourseChapter,
} from '../../../Utils/GDevelopServices/Asset';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

const useCourses = () => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [courses, setCourses] = React.useState<?(Course[])>(null);
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

  const fetchCourseChapters = React.useCallback(
    async (courseId: string) => {
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
      } finally {
        setIsLoadingChapters(false);
      }
    },
    [userId, getAuthorizationHeader]
  );

  React.useEffect(
    () => {
      if (selectedCourse) fetchCourseChapters(selectedCourse.id);
      else setCourseChapters(null);
    },
    /**
     * Fetch chapters when:
     * - Selected course changes
     * - fetchCourseChapters changes (when user logs in/out)
     */
    [selectedCourse, fetchCourseChapters]
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

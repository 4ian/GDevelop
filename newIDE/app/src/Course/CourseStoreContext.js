// @flow

import * as React from 'react';

import {
  listListedCourseChapters,
  type CourseChapterListingData,
  listListedCourses,
  type CourseListingData,
} from '../Utils/GDevelopServices/Shop';
import { COURSE_CHAPTERS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';

type CourseChapterStoreState = {|
  listedCourses: CourseListingData[] | null,
  listedCourseChapters: CourseChapterListingData[] | null,
|};

const initialCourseStoreState: CourseChapterStoreState = {
  listedCourses: null,
  listedCourseChapters: null,
};

const CourseStoreContext = React.createContext<CourseChapterStoreState>(
  initialCourseStoreState
);

type Props = {| children: React.Node |};

export const CourseStoreStateProvider = (props: Props) => {
  const [listedCourses, setListedCourses] = React.useState<
    CourseListingData[] | null
  >(null);
  const [listedCourseChapters, setListedCourseChapters] = React.useState<
    CourseChapterListingData[] | null
  >(null);

  const loadCourses = React.useCallback(async () => {
    try {
      const fetchedListedCourses = await listListedCourses();
      setListedCourses(fetchedListedCourses);
    } catch (error) {
      console.error(
        'An error occurred when fetching courses in Shop API:',
        error
      );
    }
  }, []);

  const loadCourseChapters = React.useCallback(async () => {
    try {
      const fetchedListedCourseChapters = await listListedCourseChapters();
      setListedCourseChapters(fetchedListedCourseChapters);
    } catch (error) {
      console.error(
        'An error occurred when fetching course chapters in Shop API:',
        error
      );
    }
  }, []);

  React.useEffect(
    () => {
      console.info('Pre-fetching courses...');
      loadCourses();
      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching course chapters...');
        loadCourseChapters();
      }, COURSE_CHAPTERS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [loadCourseChapters, loadCourses]
  );

  return (
    <CourseStoreContext.Provider
      value={{
        listedCourses,
        listedCourseChapters,
      }}
    >
      {props.children}
    </CourseStoreContext.Provider>
  );
};

export default CourseStoreContext;

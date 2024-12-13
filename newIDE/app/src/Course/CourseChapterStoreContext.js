// @flow

import * as React from 'react';

import {
  listListedCourseChapters,
  type CourseChapterListingData,
} from '../Utils/GDevelopServices/Shop';
import { COURSE_CHAPTERS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';

type CourseChapterStoreState = {|
  listedCourseChapters: CourseChapterListingData[] | null,
|};

const initialCourseChapterStoreState: CourseChapterStoreState = {
  listedCourseChapters: null,
};

const CourseChapterStoreContext = React.createContext<CourseChapterStoreState>(
  initialCourseChapterStoreState
);

type Props = {| children: React.Node |};

export const CourseChapterStoreStateProvider = (props: Props) => {
  const [listedCourseChapters, setListedCourseChapters] = React.useState<
    CourseChapterListingData[] | null
  >(null);

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
      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching course chapters...');
        loadCourseChapters();
      }, COURSE_CHAPTERS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [loadCourseChapters]
  );

  return (
    <CourseChapterStoreContext.Provider
      value={{
        listedCourseChapters,
      }}
    >
      {props.children}
    </CourseChapterStoreContext.Provider>
  );
};

export default CourseChapterStoreContext;

// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import {
  type Course,
  type CourseChapter,
} from '../../../../Utils/GDevelopServices/Asset';
import CoursePreviewBanner from '../../../../Course/CoursePreviewBanner';
import type { CourseCompletion, CourseChapterCompletion } from '../UseCourses';
import { Line } from '../../../../UI/Grid';
import { GridList, GridListTile } from '@material-ui/core';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import CourseCard from './CourseCard';
import { getColumnsFromWindowSize } from './Utils';

const MAX_COLUMNS = getColumnsFromWindowSize('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    overflow: 'hidden',
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
  },
};

type Props = {|
  onBack: () => void,
  courses: ?Array<Course>,
  onSelectCourse: (courseId: string) => void,
  previewedCourse: ?Course,
  previewedCourseChapters: ?Array<CourseChapter>,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  getCourseChapterCompletion: (
    courseId: string,
    chapterId: string
  ) => CourseChapterCompletion | null,
|};

const CoursesPage = ({
  onBack,
  courses,
  onSelectCourse,
  previewedCourse,
  previewedCourseChapters,
  getCourseChapterCompletion,
  getCourseCompletion,
}: Props) => {
  const { listedCourses } = React.useContext(CourseStoreContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();

  if (!courses || !listedCourses) {
    return (
      <SectionContainer flexBody>
        <SectionRow expand>
          <PlaceholderLoader />
        </SectionRow>
      </SectionContainer>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          title={<Trans>Official Game Dev courses</Trans>}
          backAction={onBack}
        >
          <SectionRow>
            <CoursePreviewBanner
              course={previewedCourse}
              courseChapters={previewedCourseChapters}
              getCourseCompletion={getCourseCompletion}
              getCourseChapterCompletion={getCourseChapterCompletion}
              onDisplayCourse={() => {
                if (!previewedCourse) return;
                onSelectCourse(previewedCourse.id);
              }}
            />
          </SectionRow>
          <SectionRow>
            <Line>
              <GridList
                cols={getColumnsFromWindowSize(windowSize, isLandscape)}
                style={styles.grid}
                cellHeight="auto"
                spacing={ITEMS_SPACING * 2}
              >
                {courses && listedCourses
                  ? courses.map(course => {
                      const completion = getCourseCompletion(course.id);
                      const courseListingData = listedCourses.find(
                        listedCourse => listedCourse.id === course.id
                      );
                      return (
                        <GridListTile key={course.id}>
                          <CourseCard
                            course={course}
                            courseListingData={courseListingData}
                            completion={completion}
                            onClick={() => {
                              onSelectCourse(course.id);
                            }}
                          />
                        </GridListTile>
                      );
                    })
                  : new Array(5).fill(0).map((_, index) => (
                      <GridListTile key={`skeleton-course-${index}`}>
                        <CourseCard
                          course={null}
                          courseListingData={null}
                          completion={null}
                        />
                      </GridListTile>
                    ))}
              </GridList>
            </Line>
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

export default CoursesPage;

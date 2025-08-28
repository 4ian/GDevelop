// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import {
  type Course,
  type CourseChapter,
} from '../../../../Utils/GDevelopServices/Asset';
import type { BundleListingData } from '../../../../Utils/GDevelopServices/Shop';
import CoursePreviewBanner from '../../../../Course/CoursePreviewBanner';
import type { CourseCompletion, CourseChapterCompletion } from '../UseCourses';
import { Line } from '../../../../UI/Grid';
import { GridList, GridListTile } from '@material-ui/core';
import CourseStoreContext from '../../../../Course/CourseStoreContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { LARGE_WIDGET_SIZE } from '../CardWidget';
import CourseCard from './CourseCard';
import { getColumnsFromWindowSize } from './Utils';
import BundlePreviewBanner from '../../../../AssetStore/Bundles/BundlePreviewBanner';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

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
  onSelectBundle: (bundleListingData: BundleListingData) => void,
  previewedCourse: ?Course,
  getCourseChapters: (courseId: string) => ?Array<CourseChapter>,
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
  onSelectBundle,
  previewedCourse,
  getCourseChapters,
  getCourseChapterCompletion,
  getCourseCompletion,
}: Props) => {
  const { listedCourses } = React.useContext(CourseStoreContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const numberOfItemsOnOneRow = getColumnsFromWindowSize(
    windowSize,
    isLandscape
  );
  const { limits } = React.useContext(AuthenticatedUserContext);
  const hidePremiumProducts =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hidePremiumProducts;

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
              getCourseChapters={getCourseChapters}
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
                cols={numberOfItemsOnOneRow}
                style={styles.grid}
                cellHeight="auto"
                spacing={ITEMS_SPACING * 2}
              >
                {courses && listedCourses
                  ? courses.slice(0, numberOfItemsOnOneRow).map(course => {
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
                  : new Array(6).fill(0).map((_, index) => (
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
          {!hidePremiumProducts && (
            <SectionRow>
              <BundlePreviewBanner
                onDisplayBundle={onSelectBundle}
                i18n={i18n}
              />
            </SectionRow>
          )}
          {courses && listedCourses && courses.length > numberOfItemsOnOneRow && (
            <SectionRow>
              <Line>
                <GridList
                  cols={numberOfItemsOnOneRow}
                  style={styles.grid}
                  cellHeight="auto"
                  spacing={ITEMS_SPACING * 2}
                >
                  {courses.slice(numberOfItemsOnOneRow).map(course => {
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
                  })}
                </GridList>
              </Line>
            </SectionRow>
          )}
        </SectionContainer>
      )}
    </I18n>
  );
};

export default CoursesPage;

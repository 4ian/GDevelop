// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';

import type { Course, CourseChapter } from '../Utils/GDevelopServices/Asset';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Chip from '../UI/Chip';
import Text from '../UI/Text';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { Column, LargeSpacer, Line, Spacer } from '../UI/Grid';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../UI/Paper';
import LinearProgress from '../UI/LinearProgress';
import type {
  CourseCompletion,
  CourseChapterCompletion,
} from '../MainFrame/EditorContainers/HomePage/UseCourses';
import RaisedButton from '../UI/RaisedButton';
import { rankLabel } from '../Utils/Ordinal';
import CheckCircle from '../UI/CustomSvgIcons/CheckCircle';
import type { GDevelopTheme } from '../UI/Theme';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Lock from '../UI/CustomSvgIcons/Lock';
import EmptyBadge from '../UI/CustomSvgIcons/EmptyBadge';

const styles = {
  paper: { padding: 16 },
  mobilePaper: { padding: 8 },
  badgePaper: { padding: '8px 16px' },
  badgeImage: { width: 25 },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'space-between',
  },
  progress: { borderRadius: 4, height: 5 },
  chip: { height: 24 },
  gdevelopAvatar: { width: 20, height: 20 },
  thumbnail: { borderRadius: 4 },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 20,
  },
  emptyBadgeContainer: {
    display: 'flex',
    opacity: 0.5,
  },
};

const ChapterTile = ({
  chapter,
  chapterIndex,
  isComplete,
  gdevelopTheme,
}: {|
  chapter: ?CourseChapter,
  isComplete: boolean,
  chapterIndex: number,
  gdevelopTheme: GDevelopTheme,
|}) => {
  return (
    <Column expand>
      {chapter && chapter.isLocked ? (
        <>
          <Spacer />
          <Paper background="light" style={{ padding: 4 }}>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="center"
            >
              <div style={styles.statusContainer}>
                <Lock fontSize="inherit" color="secondary" />
              </div>
              <Text color="secondary" noMargin>
                <Trans>Unlock with {chapter.priceInCredits} credits</Trans>
              </Text>
            </LineStackLayout>
          </Paper>
          <Spacer />
        </>
      ) : (
        <LargeSpacer />
      )}

      <Line noMargin>
        <Text color="secondary" noMargin>
          {rankLabel[chapterIndex + 1]}
        </Text>
        &nbsp;
        <Text color="secondary" noMargin>
          <Trans>Chapter</Trans>
        </Text>
        {isComplete && (
          <div
            style={{
              ...styles.statusContainer,
              color: gdevelopTheme.statusIndicator.success,
            }}
          >
            <Spacer />
            <CheckCircle fontSize="inherit" />
          </div>
        )}
      </Line>
      {chapter ? (
        <Text
          size="sub-title"
          noMargin
          color={chapter.isLocked ? 'secondary' : 'primary'}
        >
          {chapter.title}
        </Text>
      ) : (
        <Text>
          <i>
            <Trans>Coming soon</Trans>
          </i>
        </Text>
      )}
      <LargeSpacer />
    </Column>
  );
};

type Props = {|
  course: Course,
  courseChapters: CourseChapter[],
  getCourseCompletion: () => CourseCompletion | null,
  getCourseChapterCompletion: (
    chapterId: string
  ) => CourseChapterCompletion | null,
  onDisplayCourse: boolean => void,
|};

const CoursePreviewBanner = ({
  course,
  courseChapters,
  getCourseCompletion,
  getCourseChapterCompletion,
  onDisplayCourse,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile, isLandscape, windowSize } = useResponsiveWindowSize();
  const courseCompletion = getCourseCompletion();

  const numberOfTilesToDisplay = isMobile ? 2 : windowSize === 'xlarge' ? 5 : 4;

  const chapterTiles = React.useMemo(
    () => {
      const completionByChapter = new Array(course.chaptersTargetCount)
        .fill(0)
        .map((_, index) => {
          const chapter = courseChapters[index];
          if (!chapter) return false;
          const chapterCompletion = getCourseChapterCompletion(
            courseChapters[index].id
          );
          if (!chapterCompletion) return false;
          return chapterCompletion.completedTasks >= chapterCompletion.tasks;
        });
      let lastCompletedChapterIndex = -1;
      // Find last chapter completed among the first completed chapters.
      // For instance, if completion looks like:
      // 1 2 3 4 5 6 7 8 9
      // ✓ ✓ ✓ ✓ ✗ ✓ ✗ ✗ ✗
      // We want to display the chapters starting from chapter 4.
      for (const chapterCompletion of completionByChapter) {
        if (chapterCompletion) lastCompletedChapterIndex++;
        else break;
      }
      const startChapterIndex = Math.max(
        // If no completed chapter, make sure the first chapter is displayed.
        0,
        Math.min(
          // If the course is near its end, make sure the X last chapters are displayed.
          course.chaptersTargetCount - numberOfTilesToDisplay,
          lastCompletedChapterIndex
        )
      );

      return new Array(numberOfTilesToDisplay).fill(0).map((_, index) => {
        const chapterIndex = startChapterIndex + index;
        if (chapterIndex >= course.chaptersTargetCount) return null;

        const chapter = courseChapters[chapterIndex];
        return (
          <React.Fragment key={`chapter-${chapterIndex}`}>
            {index > 0 &&
              (isMobile && !isLandscape ? (
                <Column noMargin>
                  <Divider orientation="horizontal" />
                </Column>
              ) : (
                <Line noMargin>
                  <Divider orientation="vertical" />
                </Line>
              ))}
            {index > 0 && <Spacer />}
            <ChapterTile
              chapter={chapter}
              chapterIndex={chapterIndex}
              gdevelopTheme={gdevelopTheme}
              isComplete={completionByChapter[chapterIndex]}
            />
          </React.Fragment>
        );
      });
    },
    [
      course.chaptersTargetCount,
      courseChapters,
      getCourseChapterCompletion,
      numberOfTilesToDisplay,
      gdevelopTheme,
      isMobile,
      isLandscape,
    ]
  );

  const renderProgress = () => (
    <LineStackLayout alignItems="center" noMargin expand>
      <Text size="sub-title">
        <Trans>{course.chaptersTargetCount} chapters</Trans>:
      </Text>
      {courseCompletion !== null && (
        <Line noMargin expand alignItems="center">
          <LinearProgress
            value={courseCompletion.percentage * 100}
            variant="determinate"
            style={styles.progress}
            color="success"
          />
        </Line>
      )}
      {courseCompletion && (
        <Column>
          <Text noMargin color="secondary">
            {courseCompletion.completedChapters}/{courseCompletion.chapters}
          </Text>
        </Column>
      )}
    </LineStackLayout>
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background="medium"
          style={isMobile && !isLandscape ? styles.mobilePaper : styles.paper}
        >
          <ResponsiveLineStackLayout
            noResponsiveLandscape
            noMargin
            noColumnMargin
          >
            <div
              style={{
                ...styles.leftColumn,
                width: isMobile && !isLandscape ? '100%' : 220,
              }}
            >
              <Line noMargin>
                <Chip
                  label={<Trans>Recommended for you</Trans>}
                  style={styles.chip}
                />
              </Line>
              <Text noMargin size="block-title">
                {selectMessageByLocale(i18n, course.titleByLocale)}
              </Text>
              <LineStackLayout noMargin alignItems="center">
                <Avatar
                  src="./res/gdevelop-logo-b-w.png"
                  style={styles.gdevelopAvatar}
                />
                <Text noMargin>GDevelop</Text>
              </LineStackLayout>
              <img
                src="https://public-resources.gdevelop.io/course/gdevelop-premium-course.jpeg"
                alt="Red hero buffed by knowledge"
                style={styles.thumbnail}
              />
            </div>
            <ColumnStackLayout expand noMargin>
              {isMobile && !isLandscape ? (
                <Column noMargin>
                  <Text color="secondary" noMargin>
                    {selectMessageByLocale(i18n, course.levelByLocale)}
                    &nbsp;•&nbsp;
                    <Trans>{course.durationInWeeks} weeks</Trans>
                  </Text>
                  {renderProgress()}
                </Column>
              ) : (
                <LineStackLayout noMargin alignItems="center" expand>
                  {renderProgress()}
                  <Text color="secondary" noMargin>
                    {selectMessageByLocale(i18n, course.levelByLocale)}
                    &nbsp;•&nbsp;
                    <Trans>{course.durationInWeeks} weeks</Trans>
                  </Text>
                </LineStackLayout>
              )}
              <ResponsiveLineStackLayout noResponsiveLandscape>
                {chapterTiles}
              </ResponsiveLineStackLayout>
              <Paper
                style={
                  isMobile && !isLandscape
                    ? styles.mobilePaper
                    : styles.badgePaper
                }
                background="light"
              >
                <ResponsiveLineStackLayout
                  noResponsiveLandscape
                  noColumnMargin
                  alignItems="center"
                  noMargin
                  justifyContent="space-between"
                >
                  <LineStackLayout alignItems="center" noMargin>
                    <div
                      style={{
                        ...styles.emptyBadgeContainer,
                        color: gdevelopTheme.text.color.secondary,
                      }}
                    >
                      <EmptyBadge />
                    </div>
                    <Text noMargin>
                      <Trans>Earn an exclusive badge</Trans>
                    </Text>
                  </LineStackLayout>
                  <RaisedButton
                    primary
                    label={
                      !courseCompletion || courseCompletion.percentage === 0 ? (
                        <Trans>Start learning</Trans>
                      ) : (
                        <Trans>Keep learning</Trans>
                      )
                    }
                    onClick={() => onDisplayCourse(true)}
                  />
                </ResponsiveLineStackLayout>
              </Paper>
            </ColumnStackLayout>
          </ResponsiveLineStackLayout>
        </Paper>
      )}
    </I18n>
  );
};

export default CoursePreviewBanner;

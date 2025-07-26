// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import ButtonBase from '@material-ui/core/ButtonBase';
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
import LockOpen from '../UI/CustomSvgIcons/LockOpen';
import EmptyBadge from '../UI/CustomSvgIcons/EmptyBadge';
import Skeleton from '@material-ui/lab/Skeleton';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

export const freeChipStyle = {
  height: 20,
  backgroundColor: '#8BE7C4',
  color: '#1D1D26',
};

const styles = {
  container: { padding: 16, display: 'flex', borderRadius: 8 },
  mobileContainer: { padding: 8, display: 'flex', borderRadius: 8 },
  badgePaper: { padding: '8px 16px' },
  mobileBadgePaper: { padding: 8 },
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
  thumbnail: { borderRadius: 4, aspectRatio: '16 / 9', maxWidth: '100%' },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 20,
  },
  statusIconOnly: {
    fontSize: 22,
  },
  emptyBadgeContainer: {
    display: 'flex',
  },
  badgeIcon: {
    height: 28,
    width: 28,
    objectFit: 'cover',
  },
};

const ChapterTile = ({
  course,
  chapter,
  chapterIndex,
  isComplete,
  gdevelopTheme,
}: {|
  course: Course,
  chapter: CourseChapter,
  isComplete: boolean,
  chapterIndex: number,
  gdevelopTheme: GDevelopTheme,
|}) => {
  return (
    <Column expand>
      <Spacer />
      {chapter.isLocked ? (
        <Paper background="light" style={{ padding: 4 }}>
          <LineStackLayout noMargin alignItems="center" justifyContent="center">
            <div style={styles.statusContainer}>
              <Lock fontSize="inherit" color="secondary" />
            </div>
            <Text color="secondary" noMargin>
              <Trans>Unlock with the full course</Trans>
            </Text>
          </LineStackLayout>
        </Paper>
      ) : isComplete ? (
        <div
          style={{
            ...styles.statusIconOnly,
            color: gdevelopTheme.statusIndicator.success,
          }}
        >
          <CheckCircle fontSize="inherit" />
        </div>
      ) : course.isLocked && chapter.isFree ? (
        <Line noMargin>
          <Chip style={freeChipStyle} label={<Trans>Free!</Trans>} />
        </Line>
      ) : (
        <div style={styles.statusIconOnly}>
          <LockOpen fontSize="inherit" color="secondary" />
        </div>
      )}

      <Spacer />
      <Line noMargin>
        <Text color="secondary" noMargin>
          {rankLabel[chapterIndex + 1]}
        </Text>
        &nbsp;
        <Text color="secondary" noMargin>
          <Trans>Chapter</Trans>
        </Text>
      </Line>
      <Text
        size="sub-title"
        noMargin
        color={chapter.isLocked ? 'secondary' : 'primary'}
      >
        {chapter.title}
      </Text>
      <LargeSpacer />
    </Column>
  );
};

type Props = {|
  course: ?Course,
  getCourseChapters: (courseId: string) => ?Array<CourseChapter>,
  getCourseCompletion: (courseId: string) => CourseCompletion | null,
  getCourseChapterCompletion: (
    courseId: string,
    chapterId: string
  ) => CourseChapterCompletion | null,
  onDisplayCourse: boolean => void,
|};

const CoursePreviewBanner = ({
  course,
  getCourseChapters,
  getCourseCompletion,
  getCourseChapterCompletion,
  onDisplayCourse,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { achievements, badges } = React.useContext(AuthenticatedUserContext);
  const { isMobile, isLandscape, windowSize } = useResponsiveWindowSize();
  const courseCompletion = course ? getCourseCompletion(course.id) : null;
  const numberOfTilesToDisplay = isMobile ? 2 : windowSize === 'xlarge' ? 5 : 4;

  const chapterTiles = React.useMemo(
    () => {
      const courseChapters = course ? getCourseChapters(course.id) : null;
      if (!course || !courseChapters) {
        return new Array(numberOfTilesToDisplay).fill(0).map((_, index) => {
          return (
            <React.Fragment key={`skeleton-${index}`}>
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
              <Column expand>
                <Skeleton height={40} />
                <Skeleton height={20} />
                <Skeleton height={60} />
                <LargeSpacer />
              </Column>
            </React.Fragment>
          );
        });
      }
      const completionByChapter = new Array(course.chaptersTargetCount)
        .fill(0)
        .map((_, index) => {
          const chapter = courseChapters[index];
          if (!chapter) return false;
          const chapterCompletion = getCourseChapterCompletion(
            course.id,
            chapter.id
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
              course={course}
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
      course,
      getCourseChapters,
      getCourseChapterCompletion,
      numberOfTilesToDisplay,
      gdevelopTheme,
      isMobile,
      isLandscape,
    ]
  );

  const renderProgress = (course: Course) => (
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

  const badgeUrl = React.useMemo(
    () => {
      if (!course) return null;
      const achievementId = `course-${course.id}`;
      const matchingAchievement =
        achievementId && achievements
          ? achievements.find(achievement => achievement.id === achievementId)
          : null;
      if (!matchingAchievement) return null;
      const hasBadge =
        badges &&
        matchingAchievement &&
        !!badges.find(badge => badge.achievementId === matchingAchievement.id);
      if (!hasBadge) return null;

      return matchingAchievement.iconUrl;
    },
    [course, badges, achievements]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Paper background="medium" variant="outlined">
          <ButtonBase
            onClick={() => onDisplayCourse(true)}
            component="div"
            style={
              isMobile && !isLandscape
                ? styles.mobileContainer
                : styles.container
            }
          >
            <Column expand noMargin>
              <ResponsiveLineStackLayout
                noResponsiveLandscape
                noMargin
                noColumnMargin
                noOverflowParent
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
                  {course ? (
                    <Text noMargin size="block-title">
                      {selectMessageByLocale(i18n, course.titleByLocale)}
                    </Text>
                  ) : (
                    <Skeleton height={40} />
                  )}
                  <LineStackLayout noMargin alignItems="center">
                    <Avatar
                      src="./res/gdevelop-logo-b-w.png"
                      style={styles.gdevelopAvatar}
                    />
                    <Text noMargin>GDevelop</Text>
                  </LineStackLayout>
                  {course ? (
                    <img
                      src={selectMessageByLocale(i18n, course.imageUrlByLocale)}
                      alt=""
                      style={styles.thumbnail}
                    />
                  ) : (
                    <Skeleton
                      width={isMobile && !isLandscape ? undefined : 220}
                      variant="rect"
                      height={124}
                    />
                  )}
                </div>
                <ColumnStackLayout expand noMargin>
                  {isMobile && !isLandscape ? (
                    course ? (
                      <Column noMargin>
                        <Text color="secondary" noMargin>
                          {selectMessageByLocale(i18n, course.levelByLocale)}
                          &nbsp;•&nbsp;
                          <Trans>{course.durationInWeeks} weeks</Trans>
                        </Text>

                        {renderProgress(course)}
                      </Column>
                    ) : (
                      <Column noMargin>
                        <Skeleton />
                        <Skeleton />
                      </Column>
                    )
                  ) : course ? (
                    <LineStackLayout noMargin alignItems="center" expand>
                      {renderProgress(course)}
                      <Text color="secondary" noMargin>
                        {selectMessageByLocale(i18n, course.levelByLocale)}
                        &nbsp;•&nbsp;
                        <Trans>{course.durationInWeeks} weeks</Trans>
                      </Text>
                    </LineStackLayout>
                  ) : (
                    <Column noMargin expand>
                      <Skeleton height={30} />
                    </Column>
                  )}
                  <ResponsiveLineStackLayout noResponsiveLandscape>
                    {chapterTiles}
                  </ResponsiveLineStackLayout>
                  <Paper
                    style={
                      isMobile && !isLandscape
                        ? styles.mobileBadgePaper
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
                            opacity: badgeUrl ? 1 : 0.5,
                            color: gdevelopTheme.text.color.secondary,
                          }}
                        >
                          {badgeUrl ? (
                            <img
                              src={badgeUrl}
                              alt="Course badge"
                              style={styles.badgeIcon}
                            />
                          ) : (
                            <EmptyBadge />
                          )}
                        </div>
                        <Text noMargin>
                          {badgeUrl ? (
                            <Trans>Congrats on finishing this course!</Trans>
                          ) : courseCompletion &&
                            courseCompletion.percentage === 1 ? (
                            // If user does not have the badge but has completed the course
                            // (possible if they finished the course before the badge logic was
                            // implemented), this copy acts as a hint for the user to undo/redo
                            // a task to trigger the logic that awards the badge.
                            <Trans>
                              Complete all tasks to claim your badge
                            </Trans>
                          ) : (
                            <Trans>Earn an exclusive badge</Trans>
                          )}
                        </Text>
                      </LineStackLayout>
                      <RaisedButton
                        primary
                        disabled={!course}
                        label={
                          !courseCompletion ||
                          courseCompletion.percentage === 0 ? (
                            <Trans>Start learning</Trans>
                          ) : courseCompletion.percentage === 1 ? (
                            <Trans>Open</Trans>
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
            </Column>
          </ButtonBase>
        </Paper>
      )}
    </I18n>
  );
};

export default CoursePreviewBanner;

// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import Avatar from '@material-ui/core/Avatar';

import type { Course } from '../Utils/GDevelopServices/Asset';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import Chip from '../UI/Chip';
import Text from '../UI/Text';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { Column, Line } from '../UI/Grid';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Paper from '../UI/Paper';
import LinearProgress from '../UI/LinearProgress';
import type { CourseCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import RaisedButton from '../UI/RaisedButton';

const styles = {
  paper: { padding: 16 },
  mobilePaper: { padding: 8 },
  badgePaper: { padding: '8px 16px' },
  badgeImage: { width: 25 },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  progress: { borderRadius: 4, height: 5 },
  chip: { height: 24 },
  gdevelopAvatar: { width: 20, height: 20 },
  thumbnail: { borderRadius: 4 },
};

type Props = {|
  course: Course,
  getCourseCompletion: () => CourseCompletion | null,
  onDisplayCourse: boolean => void,
|};

const CoursePreviewBanner = ({
  course,
  getCourseCompletion,
  onDisplayCourse,
}: Props) => {
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const courseCompletion = getCourseCompletion();

  const renderProgress = () => (
    <LineStackLayout alignItems="center" noMargin>
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
          background="dark"
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
                width: isMobile && !isLandscape ? '100%' : 200,
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
                <LineStackLayout noMargin alignItems="center">
                  {renderProgress()}
                  <Text color="secondary" noMargin>
                    {selectMessageByLocale(i18n, course.levelByLocale)}
                    &nbsp;•&nbsp;
                    <Trans>{course.durationInWeeks} weeks</Trans>
                  </Text>
                </LineStackLayout>
              )}

              <Paper
                style={
                  isMobile && !isLandscape
                    ? styles.mobilePaper
                    : styles.badgePaper
                }
                background="medium"
              >
                <ResponsiveLineStackLayout
                  noResponsiveLandscape
                  noColumnMargin
                  alignItems="center"
                  noMargin
                  justifyContent="space-between"
                >
                  <LineStackLayout alignItems="center" noMargin>
                    <img
                      src={'res/badges/empty-badge.svg'}
                      alt="Empty badge"
                      style={styles.badgeImage}
                    />

                    <Text>
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

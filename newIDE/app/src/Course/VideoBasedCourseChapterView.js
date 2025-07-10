// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type {
  VideoBasedCourseChapter,
  Course,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { Line, Spacer } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Divider from '@material-ui/core/Divider';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import Cloud from '../UI/CustomSvgIcons/Cloud';
import VideoBasedCourseChapterTaskItem from './VideoBasedCourseChapterTaskItem';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { rankLabel } from '../Utils/Ordinal';
import type { CourseChapterCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import LockedCourseChapterPreview from './LockedCourseChapterPreview';
import CourseChapterTitle from './CourseChapterTitle';
import { getYoutubeVideoIdFromUrl } from '../Utils/Youtube';

const styles = {
  icon: {
    fontSize: 18,
  },
  stickyTitle: {
    position: 'sticky',
    top: -1, // If 0, it somehow lets a 1px gap between the parent, letting the user see the text scroll behind.
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2,
  },
  videoAndMaterialsContainer: {
    display: 'flex',
    marginTop: 8,
    gap: 8,
    alignItems: 'stretch',
    flexWrap: 'wrap',
    marginBottom: 8,
    flex: 1,
    minWidth: 0,
  },
  videoContainer: {
    flex: 2,
    minWidth: 300,
    display: 'flex',
    position: 'relative',
  },
  videoIFrame: { flex: 1, aspectRatio: '16 / 9' },
  sideBar: { padding: 16, display: 'flex' },
};

type Props = {|
  chapterIndex: number,
  course: Course,
  courseChapter: VideoBasedCourseChapter,
  onOpenTemplate: () => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  onClickUnlock: () => void,
|};

const VideoBasedCourseChapterView = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      chapterIndex,
      course,
      courseChapter,
      onOpenTemplate,
      onCompleteTask,
      isTaskCompleted,
      getChapterCompletion,
      onClickUnlock,
    },
    ref
  ) => {
    const {
      values: { language },
    } = React.useContext(PreferencesContext);
    const userLanguage2LetterCode = language.split('_')[0];
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { windowSize } = useResponsiveWindowSize();
    const [openTasks, setOpenTasks] = React.useState<boolean>(false);
    const youtubeVideoId = getYoutubeVideoIdFromUrl(courseChapter.videoUrl);

    return (
      <ColumnStackLayout expand noMargin>
        <CourseChapterTitle
          course={course}
          chapterIndex={chapterIndex}
          courseChapter={courseChapter}
          getChapterCompletion={getChapterCompletion}
          ref={ref}
        />
        {courseChapter.isLocked ? (
          <LockedCourseChapterPreview
            course={course}
            courseChapter={courseChapter}
            onClickUnlock={onClickUnlock}
          />
        ) : (
          <div style={styles.videoAndMaterialsContainer}>
            {youtubeVideoId && (
              <div
                style={{
                  ...styles.videoContainer,
                  maxWidth: windowSize === 'xlarge' ? 960 : 640,
                }}
              >
                <iframe
                  title={`Video for lesson ${courseChapter.title}`}
                  type="text/html"
                  style={styles.videoIFrame}
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?cc_load_policy=1&cc_lang_pref=${
                    // Having another language than `en` as the requested caption language prevents the player from displaying the auto-translated captions.
                    'en'
                  }&hl=${userLanguage2LetterCode}`}
                  frameBorder="0"
                />
              </div>
            )}
            <ColumnStackLayout noMargin expand>
              <Text size="sub-title" noMargin>
                <Trans>Chapter materials</Trans>
              </Text>
              <Paper background="medium" style={styles.sideBar}>
                <ColumnStackLayout noMargin>
                  <Line noMargin>
                    <Text noMargin>{rankLabel[chapterIndex + 1]}</Text>
                    &nbsp;
                    <Text noMargin>
                      <Trans>Chapter</Trans>
                    </Text>
                    &nbsp;-&nbsp;
                    <Text noMargin>
                      <Trans>Template</Trans>
                    </Text>
                  </Line>
                  <Line noMargin>
                    <RaisedButton
                      primary
                      icon={<Cloud fontSize="small" />}
                      label={<Trans>Open template</Trans>}
                      onClick={onOpenTemplate}
                    />
                  </Line>
                </ColumnStackLayout>
              </Paper>
            </ColumnStackLayout>
          </div>
        )}
        {!courseChapter.isLocked && (
          <div
            style={{
              ...styles.stickyTitle,
              backgroundColor: gdevelopTheme.paper.backgroundColor.dark,
            }}
          >
            <Divider />
            <Spacer />
            <Line alignItems="center" justifyContent="space-between" noMargin>
              <Text size="block-title">
                <Trans>Tasks</Trans>
              </Text>
              <FlatButton
                primary
                label={
                  openTasks ? (
                    <Trans>Close all tasks</Trans>
                  ) : (
                    <Trans>Open all tasks</Trans>
                  )
                }
                leftIcon={
                  openTasks ? (
                    <ChevronArrowBottom style={styles.icon} />
                  ) : (
                    <ChevronArrowRight style={styles.icon} />
                  )
                }
                onClick={() => setOpenTasks(!openTasks)}
              />
            </Line>
            <Spacer />
            <Divider />
          </div>
        )}
        {!courseChapter.isLocked &&
          courseChapter.tasks.map((item, taskIndex) => (
            <VideoBasedCourseChapterTaskItem
              courseChapterTask={item}
              key={taskIndex.toString()}
              isOpen={openTasks}
              isComplete={isTaskCompleted(courseChapter.id, taskIndex)}
              onComplete={isCompleted =>
                onCompleteTask(courseChapter.id, taskIndex, isCompleted)
              }
            />
          ))}
      </ColumnStackLayout>
    );
  }
);

export default VideoBasedCourseChapterView;

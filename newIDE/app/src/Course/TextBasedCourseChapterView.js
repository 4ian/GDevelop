// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import type {
  TextBasedCourseChapter,
  CourseChapter,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import Paper from '../UI/Paper';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line, Spacer } from '../UI/Grid';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Divider from '@material-ui/core/Divider';
import FlatButton from '../UI/FlatButton';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import Cloud from '../UI/CustomSvgIcons/Cloud';
import CourseChapterTaskItem from './CourseChapterTaskItem';
import { rankLabel } from '../Utils/Ordinal';
import type { CourseChapterCompletion } from '../MainFrame/EditorContainers/HomePage/UseCourses';
import LockedCourseChapterPreview from './LockedCourseChapterPreview';
import CourseChapterTitle from './CourseChapterTitle';
import { MarkdownText } from '../UI/MarkdownText';
import ImageWithZoom from '../UI/ImageWithZoom';

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
  image: {
    maxWidth: '100%',
  },
};

type Props = {|
  chapterIndex: number,
  courseChapter: TextBasedCourseChapter,
  onOpenTemplate: () => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  onBuyWithCredits: (CourseChapter, string) => Promise<void>,
|};

const TextBasedCourseChapterView = React.forwardRef<Props, HTMLDivElement>(
  (
    {
      chapterIndex,
      courseChapter,
      onOpenTemplate,
      onCompleteTask,
      isTaskCompleted,
      getChapterCompletion,
      onBuyWithCredits,
    },
    ref
  ) => {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const [openTasks, setOpenTasks] = React.useState<boolean>(false);

    return (
      <ColumnStackLayout expand noMargin>
        <CourseChapterTitle
          chapterIndex={chapterIndex}
          courseChapter={courseChapter}
          getChapterCompletion={getChapterCompletion}
        />
        {courseChapter.isLocked ? (
          <LockedCourseChapterPreview
            onBuyWithCredits={onBuyWithCredits}
            courseChapter={courseChapter}
          />
        ) : (
          <div style={styles.videoAndMaterialsContainer}>
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
        {/* {!courseChapter.isLocked && (
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
                    <Trans>Close task</Trans>
                  ) : (
                    <Trans>Open task</Trans>
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
        )} */}
        <Column>
          {!courseChapter.isLocked &&
            courseChapter.items.map((item, itemIndex) => {
              if (item.type === 'text') {
                return (
                  <MarkdownText
                    key={itemIndex.toString()}
                    allowParagraphs
                    source={item.text}
                  />
                );
              }
              if (item.type === 'image') {
                return (
                  <ColumnStackLayout key={itemIndex.toString()}>
                    <ImageWithZoom
                      style={styles.image}
                      key={item.url}
                      alt=""
                      src={item.url}
                    />
                    {item.caption && (
                      <div
                        style={{ color: gdevelopTheme.text.color.secondary }}
                      >
                        <MarkdownText source={item.caption} />
                      </div>
                    )}
                  </ColumnStackLayout>
                );
              }

              // return (
              //   <CourseChapterTaskItem
              //     courseChapterTask={item}
              //     key={taskIndex.toString()}
              //     isOpen={openTasks}
              //     isComplete={isTaskCompleted(courseChapter.id, taskIndex)}
              //     onComplete={isCompleted =>
              //       onCompleteTask(courseChapter.id, taskIndex, isCompleted)
              //     }
              //   />
              // );
            })}
        </Column>
      </ColumnStackLayout>
    );
  }
);

export default TextBasedCourseChapterView;

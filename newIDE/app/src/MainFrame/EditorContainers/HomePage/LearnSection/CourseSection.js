// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type CourseChapter } from '../../../../Utils/GDevelopServices/Asset';
import SectionContainer from '../SectionContainer';
import CourseChapterView from '../../../../Course/CourseChapterView';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Help from '../../../../UI/CustomSvgIcons/Help';
import RaisedButton from '../../../../UI/RaisedButton';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import type { CourseChapterCompletion } from '../UseCourses';
import CheckCircle from '../../../../UI/CustomSvgIcons/CheckCircle';
import LinearProgress from '../../../../UI/LinearProgress';
import AlertMessage from '../../../../UI/AlertMessage';
import PreferencesContext, {
  allAlertMessages,
} from '../../../Preferences/PreferencesContext';

const styles = {
  desktopContainer: { display: 'flex', gap: 16 },
  mobileContainer: { position: 'relative' },
  sideContainer: { maxWidth: 250, position: 'relative' },
  sideContent: {
    position: 'sticky',
    top: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  tableOfContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 4,
  },
  navLine: {
    padding: '2px 3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 4,
  },
  navIcon: { fontSize: 20, display: 'flex' },
  footer: { height: 150 },
  askAQuestionContainer: { display: 'flex', padding: 8 },
};

const alertMessageKey = 'course-subtitles-in-user-language';

type Props = {|
  courseChapters: CourseChapter[],
  onOpenTemplateFromCourseChapter: CourseChapter => Promise<void>,
  onBack: () => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  getCourseCompletion: () => number | null,
|};

const CourseSection = ({
  courseChapters,
  onOpenTemplateFromCourseChapter,
  onBack,
  onCompleteTask,
  isTaskCompleted,
  getChapterCompletion,
  getCourseCompletion,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showAlertMessage, values } = React.useContext(PreferencesContext);
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const courseCompletion = getCourseCompletion();

  const scrollingContainerRef = React.useRef<?HTMLDivElement>(null);
  const chaptersTitleRefs = React.useRef<
    {|
      chapterId: string,
      offset: number,
    |}[]
  >(new Array(courseChapters.length));
  const [activeChapterId, setActiveChapterId] = React.useState<?string>(null);

  const subtitleHint = allAlertMessages.find(
    message => message.key === alertMessageKey
  );

  const onScroll = React.useCallback((e: Event) => {
    setActiveChapterId(() => {
      // $FlowIgnore
      const { scrollTop, offsetHeight } = e.target;
      if (scrollTop === undefined) return;

      let newActiveChapterId;
      for (const chapterAndOffset of chaptersTitleRefs.current) {
        if (
          chapterAndOffset.offset &&
          chapterAndOffset.offset < scrollTop + (offsetHeight || 0) / 3
        ) {
          newActiveChapterId = chapterAndOffset.chapterId;
        } else break;
      }

      if (
        !newActiveChapterId &&
        chaptersTitleRefs.current[0] &&
        chaptersTitleRefs.current[0].chapterId
      ) {
        newActiveChapterId = chaptersTitleRefs.current[0].chapterId;
      }

      return newActiveChapterId;
    });
  }, []);

  const scrollToChapter = React.useCallback((chapterId: string) => {
    const { current: scrollContainer } = scrollingContainerRef;
    if (!scrollContainer) return;

    const chapterAndOffset = chaptersTitleRefs.current.find(
      chapterAndOffset => chapterAndOffset.chapterId === chapterId
    );
    if (!chapterAndOffset) return;

    scrollContainer.scrollTo(0, chapterAndOffset.offset);
  }, []);

  React.useEffect(
    () => {
      const scrollContainer = scrollingContainerRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', onScroll);
        return () => scrollContainer.removeEventListener('scroll', onScroll);
      }
    },
    [onScroll]
  );

  return (
    <SectionContainer
      ref={scrollingContainerRef}
      applyTopSpacingAsMarginOnChildrenContainer
      backAction={onBack}
      title={<Trans>GDevelop design basics</Trans>}
      subtitleText={
        <Trans>
          This is a beginner-friendly course designed to introduce you to the
          fundamentals of game development using GDevelop. By the end of the
          course, you’ll have the confidence and technical skills to start
          building your own games.
        </Trans>
      }
    >
      <div
        style={
          isMobile && !isLandscape
            ? styles.mobileContainer
            : styles.desktopContainer
        }
      >
        <Column noOverflowParent noMargin>
          {!values.hiddenAlertMessages[alertMessageKey] && subtitleHint && (
            <Line>
              <AlertMessage
                kind="info"
                background="light"
                onHide={() => showAlertMessage(alertMessageKey, false)}
              >
                {subtitleHint.label}
              </AlertMessage>
            </Line>
          )}
          {courseChapters.map((chapter, index) => (
            <CourseChapterView
              chapterIndex={index}
              courseChapter={chapter}
              onOpenTemplate={() => {
                onOpenTemplateFromCourseChapter(chapter);
              }}
              onCompleteTask={onCompleteTask}
              isTaskCompleted={isTaskCompleted}
              getChapterCompletion={getChapterCompletion}
              key={chapter.id}
              ref={_ref => {
                if (_ref) {
                  chaptersTitleRefs.current[index] = {
                    chapterId: chapter.id,
                    offset: _ref.offsetTop,
                  };
                }
              }}
            />
          ))}
          <div style={styles.footer} />
        </Column>
        {isMobile && !isLandscape ? (
          <div style={{ position: 'sticky', bottom: 0 }}>
            {/* TODO: Add nav */}
          </div>
        ) : (
          <div style={styles.sideContainer}>
            <div style={styles.sideContent}>
              <Paper background="medium" style={styles.tableOfContent}>
                <Text noMargin size="sub-title">
                  Chapters
                </Text>
                {courseCompletion !== null && (
                  <Line noMargin>
                    <LinearProgress
                      value={courseCompletion * 100}
                      variant="determinate"
                      style={{ borderRadius: 4 }}
                      color="success"
                    />
                  </Line>
                )}
                <Spacer />
                {courseChapters.map((chapter, chapterIndex) => {
                  const chapterCompletion = getChapterCompletion(chapter.id);
                  return (
                    <div
                      key={chapter.id}
                      tabIndex={0}
                      onClick={() => scrollToChapter(chapter.id)}
                      style={{
                        ...styles.navLine,
                        backgroundColor:
                          chapter.id === activeChapterId
                            ? gdevelopTheme.paper.backgroundColor.light
                            : undefined,
                      }}
                    >
                      <Line noMargin>
                        <Text noMargin color={'secondary'}>
                          {chapterIndex + 1}.
                        </Text>
                        &nbsp;
                        <Text
                          noMargin
                          style={textEllipsisStyle}
                          color={chapter.isLocked ? 'secondary' : 'primary'}
                        >
                          {chapter.title}
                        </Text>
                      </Line>
                      {chapter.isLocked ? (
                        <div style={styles.navIcon}>
                          <Lock fontSize="inherit" />
                        </div>
                      ) : chapterCompletion ? (
                        chapterCompletion.completedTasks >=
                        chapterCompletion.tasks ? (
                          <div
                            style={{
                              display: 'flex',
                              fontSize: 20,
                              color: gdevelopTheme.statusIndicator.success,
                            }}
                          >
                            <CheckCircle fontSize="inherit" />
                          </div>
                        ) : (
                          <Text color="secondary" noMargin>
                            {chapterCompletion.completedTasks}/
                            {chapterCompletion.tasks}
                          </Text>
                        )
                      ) : null}
                    </div>
                  );
                })}
              </Paper>
              <Paper background="light" style={styles.askAQuestionContainer}>
                <ColumnStackLayout expand noMargin>
                  <LineStackLayout
                    expand
                    alignItems="center"
                    noMargin
                    justifyContent="center"
                  >
                    <Help />
                    <Text noMargin>
                      <Trans>Do you need any help?</Trans>
                    </Text>
                  </LineStackLayout>
                  <RaisedButton
                    label={<Trans>Ask a question</Trans>}
                    primary
                    onClick={() => {}}
                  />
                </ColumnStackLayout>
              </Paper>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default CourseSection;

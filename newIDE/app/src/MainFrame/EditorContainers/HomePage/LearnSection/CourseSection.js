// @flow

import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import {
  type CourseChapter,
  type Course,
  getCourseChapterRatingUrl,
} from '../../../../Utils/GDevelopServices/Asset';
import { type CourseListingData } from '../../../../Utils/GDevelopServices/Shop';
import SectionContainer from '../SectionContainer';
import VideoBasedCourseChapterView from '../../../../Course/VideoBasedCourseChapterView';
import TextBasedCourseChapterView from '../../../../Course/TextBasedCourseChapterView';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import { Column, LargeSpacer, Line, Spacer } from '../../../../UI/Grid';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Help from '../../../../UI/CustomSvgIcons/Help';
import RaisedButton from '../../../../UI/RaisedButton';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import type { CourseChapterCompletion, CourseCompletion } from '../UseCourses';
import CheckCircle from '../../../../UI/CustomSvgIcons/CheckCircle';
import LinearProgress from '../../../../UI/LinearProgress';
import AlertMessage from '../../../../UI/AlertMessage';
import PreferencesContext, {
  allAlertMessages,
} from '../../../Preferences/PreferencesContext';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from '../../../../UI/Accordion';
import CourseSectionHeader from './CourseSectionHeader';
import Window from '../../../../Utils/Window';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { RatingBanner } from './RatingBanner';

const styles = {
  desktopContainer: { display: 'flex', gap: 16 },
  sideContainer: {
    width: 250,
    flexShrink: 0,
    position: 'relative',
  },
  sideContent: {
    position: 'sticky',
    top: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  desktopTableOfContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 4,
  },
  mobileTableOfContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    maxHeight: 250,
    overflowY: 'auto',
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
  progress: { borderRadius: 4, height: 5 },
  mobileStickyFooter: {
    position: 'sticky',
    bottom: -1, // If 0, it somehow lets a 1px gap between the parent, letting the user see the text scroll behind.
    width: '100%',
    zIndex: 2,
  },
};

const alertMessageKey = 'course-subtitles-in-user-language';

type Props = {|
  course: Course,
  courseChapters: CourseChapter[],
  onOpenTemplateFromCourseChapter: (
    CourseChapter,
    templateId?: string
  ) => Promise<void>,
  onBack: () => void,
  onCompleteTask: (
    chapterId: string,
    taskIndex: number,
    completed: boolean
  ) => void,
  isTaskCompleted: (chapterId: string, taskIndex: number) => boolean,
  getChapterCompletion: (chapterId: string) => CourseChapterCompletion | null,
  getCourseCompletion: () => CourseCompletion | null,
  onBuyCourseWithCredits: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  onBuyCourse: (
    Course: Course,
    password: string,
    i18n: I18nType
  ) => Promise<void>,
  purchasingCourseListingData: ?CourseListingData,
  setPurchasingCourseListingData: (CourseListingData | null) => void,
  simulateAppStoreProduct?: boolean,
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
|};

const CourseSection = ({
  course,
  courseChapters,
  onOpenTemplateFromCourseChapter,
  onBack,
  onCompleteTask,
  isTaskCompleted,
  getChapterCompletion,
  getCourseCompletion,
  onBuyCourseWithCredits,
  onBuyCourse,
  purchasingCourseListingData,
  setPurchasingCourseListingData,
  simulateAppStoreProduct,
  onOpenAskAi,
}: Props) => {
  const { profile } = React.useContext(AuthenticatedUserContext);
  const userId = (profile && profile.id) || null;
  const {
    values: { language },
  } = React.useContext(PreferencesContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { showAlertMessage, values } = React.useContext(PreferencesContext);
  const { isMobile, isLandscape } = useResponsiveWindowSize();
  const courseCompletion = getCourseCompletion();
  const firstIncompleteChapterIdRef = React.useRef<string | null>(
    courseChapters.reduce((alreadyFoundIncompleteChapterId, chapter, index) => {
      if (alreadyFoundIncompleteChapterId)
        return alreadyFoundIncompleteChapterId;
      const chapterCompletion = getChapterCompletion(chapter.id);

      if (
        !chapterCompletion ||
        chapterCompletion.completedTasks < chapterCompletion.tasks
      ) {
        if (index === 0) {
          // If first chapter is not complete, either the user never started the course
          // or they didn't complete it. Either way, do not scroll so that they
          // can still see the course's title and introduction.
          return 'BEGINNER';
        }
        return chapter.id;
      }
      return null;
    }, null)
  );
  const scrollingContainerRef = React.useRef<?HTMLDivElement>(null);
  const chapterTitleRefs = React.useRef<
    {|
      chapterId: string,
      ref: HTMLDivElement,
    |}[]
  >(new Array(courseChapters.length));
  const [activeChapterId, setActiveChapterId] = React.useState<?string>(null);

  const subtitleHint = courseChapters.some(chapter => 'videoUrl' in chapter) // Display hint only if there are some video-based chapters.
    ? allAlertMessages.find(message => message.key === alertMessageKey)
    : null;

  const tableOfContent = courseChapters.map((chapter, chapterIndex) => {
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
            {chapter.shortTitle || chapter.title}
          </Text>
        </Line>
        {chapter.isLocked ? (
          <div style={styles.navIcon}>
            <Lock fontSize="inherit" />
          </div>
        ) : chapterCompletion ? (
          chapterCompletion.completedTasks >= chapterCompletion.tasks ? (
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
              {chapterCompletion.completedTasks}/{chapterCompletion.tasks}
            </Text>
          )
        ) : null}
      </div>
    );
  });

  const onScroll = React.useCallback((e: Event) => {
    setActiveChapterId(() => {
      // $FlowIgnore
      const { scrollTop, offsetHeight } = e.target;
      if (scrollTop === undefined) return;

      let newActiveChapterId;
      for (const chapterTitleRef of chapterTitleRefs.current) {
        const chapterTitleElement = chapterTitleRef.ref;

        if (
          chapterTitleElement.offsetTop <
          scrollTop + (offsetHeight || 0) / 3
        ) {
          newActiveChapterId = chapterTitleRef.chapterId;
        } else break;
      }

      if (
        !newActiveChapterId &&
        chapterTitleRefs.current[0] &&
        chapterTitleRefs.current[0].chapterId
      ) {
        newActiveChapterId = chapterTitleRefs.current[0].chapterId;
      }

      return newActiveChapterId;
    });
  }, []);

  const scrollToChapter = React.useCallback((chapterId: string) => {
    const { current: scrollContainer } = scrollingContainerRef;
    if (!scrollContainer) return;

    const chapterTitleRef = chapterTitleRefs.current.find(
      chapterTitleRef => chapterTitleRef.chapterId === chapterId
    );
    if (!chapterTitleRef) return;

    scrollContainer.scrollTo({
      top: chapterTitleRef.ref.offsetTop,
      behavior: 'smooth',
    });
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

  React.useEffect(
    () => {
      if (firstIncompleteChapterIdRef.current) {
        if (firstIncompleteChapterIdRef.current === 'BEGINNER') return;
        scrollToChapter(firstIncompleteChapterIdRef.current);
      }
    },
    [scrollToChapter]
  );

  const onClickUnlock = React.useCallback(
    () => {
      // Scroll to the top of the page, where the purchase button is.
      if (scrollingContainerRef.current) {
        scrollingContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    },
    [scrollingContainerRef]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <SectionContainer
            ref={scrollingContainerRef}
            applyTopSpacingAsMarginOnChildrenContainer
            backAction={onBack}
          >
            <div
              style={
                isMobile && !isLandscape ? undefined : styles.desktopContainer
              }
            >
              <Column noOverflowParent noMargin>
                <CourseSectionHeader
                  course={course}
                  onBuyCourseWithCredits={onBuyCourseWithCredits}
                  onBuyCourse={onBuyCourse}
                  purchasingCourseListingData={purchasingCourseListingData}
                  setPurchasingCourseListingData={
                    setPurchasingCourseListingData
                  }
                  simulateAppStoreProduct={simulateAppStoreProduct}
                />
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
                {courseChapters.map((chapter: CourseChapter, index) => (
                  <ColumnStackLayout expand noOverflowParent noMargin>
                    {chapter.videoUrl ? (
                      <VideoBasedCourseChapterView
                        chapterIndex={index}
                        course={course}
                        courseChapter={chapter}
                        onOpenTemplate={() => {
                          onOpenTemplateFromCourseChapter(chapter);
                        }}
                        onCompleteTask={onCompleteTask}
                        isTaskCompleted={isTaskCompleted}
                        getChapterCompletion={getChapterCompletion}
                        key={chapter.id}
                        onClickUnlock={onClickUnlock}
                        ref={_ref => {
                          if (_ref) {
                            chapterTitleRefs.current[index] = {
                              chapterId: chapter.id,
                              ref: _ref,
                            };
                          }
                        }}
                      />
                    ) : (
                      <TextBasedCourseChapterView
                        chapterIndex={index}
                        course={course}
                        // $FlowIgnore - Flow does not conclude this chapter can only be text-based.
                        courseChapter={chapter}
                        onOpenTemplate={(templateId?: string) => {
                          onOpenTemplateFromCourseChapter(chapter, templateId);
                        }}
                        onCompleteTask={onCompleteTask}
                        isTaskCompleted={isTaskCompleted}
                        getChapterCompletion={getChapterCompletion}
                        key={chapter.id}
                        onClickUnlock={onClickUnlock}
                        ref={_ref => {
                          if (_ref) {
                            chapterTitleRefs.current[index] = {
                              chapterId: chapter.id,
                              ref: _ref,
                            };
                          }
                        }}
                      />
                    )}
                    {!chapter.isLocked && (
                      <RatingBanner
                        disabled={!userId}
                        onClick={() => {
                          if (!userId) return;

                          const url = getCourseChapterRatingUrl({
                            userId,
                            courseId: course.id,
                            chapterId: chapter.id,
                            language,
                          });
                          Window.openExternalURL(url);
                        }}
                      />
                    )}
                    <LargeSpacer />
                  </ColumnStackLayout>
                ))}
                <div style={styles.footer} />
              </Column>
              {isMobile && !isLandscape ? null : (
                <div style={styles.sideContainer}>
                  <div style={styles.sideContent}>
                    <Paper
                      background="medium"
                      style={styles.desktopTableOfContent}
                    >
                      <Text noMargin size="sub-title">
                        <Trans>Chapters</Trans>
                      </Text>
                      {courseCompletion !== null && (
                        <Line noMargin>
                          <LinearProgress
                            value={courseCompletion.percentage * 100}
                            variant="determinate"
                            style={styles.progress}
                            color="success"
                          />
                        </Line>
                      )}
                      <Spacer />
                      {tableOfContent}
                    </Paper>
                    <Paper
                      background="light"
                      style={styles.askAQuestionContainer}
                    >
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
                          primary
                          label={<Trans>Ask the AI</Trans>}
                          onClick={() =>
                            onOpenAskAi({
                              mode: 'chat',
                              aiRequestId: null,
                              paneIdentifier: 'right',
                            })
                          }
                        />
                      </ColumnStackLayout>
                    </Paper>
                  </div>
                </div>
              )}
            </div>
          </SectionContainer>
          {isMobile && !isLandscape && (
            <div
              style={{
                ...styles.mobileStickyFooter,
                borderTop: `2px solid ${gdevelopTheme.home.separator.color}`,
                borderBottom: `1px solid ${gdevelopTheme.home.separator.color}`,
              }}
            >
              <Paper background="light" square>
                <Accordion noMargin>
                  <AccordionHeader>
                    <LineStackLayout noMargin expand alignItems="center">
                      <Text noMargin size="sub-title">
                        Chapters
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
                    </LineStackLayout>
                  </AccordionHeader>
                  <AccordionBody>
                    <div style={styles.mobileTableOfContent}>
                      {tableOfContent}
                    </div>
                  </AccordionBody>
                </Accordion>
              </Paper>
            </div>
          )}
        </>
      )}
    </I18n>
  );
};

export default CourseSection;

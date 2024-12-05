// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type CourseChapter } from '../../../../Utils/GDevelopServices/Asset';
import SectionContainer from '../SectionContainer';
import CourseChapterView from '../../../../Course/CourseChapterView';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import { Column, Line } from '../../../../UI/Grid';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Help from '../../../../UI/CustomSvgIcons/Help';
import RaisedButton from '../../../../UI/RaisedButton';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';

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

type Props = {|
  courseChapters: CourseChapter[],
  onBack: () => void,
|};

const CourseSection = ({ courseChapters, onBack }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { isMobile, isLandscape } = useResponsiveWindowSize();

  const scrollingContainerRef = React.useRef<?HTMLDivElement>(null);
  const chaptersTitleRefs = React.useRef<
    {|
      chapterId: string,
      offset: number,
    |}[]
  >(new Array(courseChapters.length));
  const [activeChapterId, setActiveChapterId] = React.useState<?string>(null);

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
          {courseChapters.map((chapter, index) => (
            <CourseChapterView
              chapterIndex={index}
              courseChapter={chapter}
              onOpenTemplate={() => {}}
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
                {courseChapters.map((chapter, chapterIndex) => (
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
                    ) : (
                      <Text color="secondary" noMargin>
                        1/{chapter.tasks.length}
                      </Text>
                    )}
                  </div>
                ))}
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

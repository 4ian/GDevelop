// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type CourseChapter } from '../../../../Utils/GDevelopServices/Asset';
import SectionContainer from '../SectionContainer';
import CourseChapterView from '../../../../Course/CourseChapterView';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';
import { Column } from '../../../../UI/Grid';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Help from '../../../../UI/CustomSvgIcons/Help';
import RaisedButton from '../../../../UI/RaisedButton';

const styles = {
  container: { display: 'flex', gap: 8 },
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
  askAQuestionContainer: { display: 'flex', padding: 8 },
};

type Props = {|
  courseChapters: CourseChapter[],
  onBack: () => void,
|};

const CourseSection = ({ courseChapters, onBack }: Props) => {
  return (
    <SectionContainer
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
      <div style={styles.container}>
        <Column noOverflowParent>
          {courseChapters.map(chapter => (
            <CourseChapterView
              courseChapter={chapter}
              onOpenTemplate={() => {}}
              key={chapter.title}
            />
          ))}
        </Column>
        <div style={styles.sideContainer}>
          <div style={styles.sideContent}>
            <Paper background="medium" style={styles.tableOfContent}>
              <Text noMargin size="sub-title">
                Chapters
              </Text>
              {courseChapters.map(chapter => (
                <LineStackLayout
                  key={chapter.title}
                  noMargin
                  alignItems="center"
                >
                  <Text
                    noMargin
                    style={textEllipsisStyle}
                    color={chapter.isLocked ? 'secondary' : 'primary'}
                  >
                    {chapter.title}
                  </Text>
                  {chapter.isLocked ? (
                    <Lock fontSize="small" />
                  ) : (
                    <Text color="secondary" noMargin>
                      1/{chapter.tasks.length}
                    </Text>
                  )}
                </LineStackLayout>
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
      </div>
    </SectionContainer>
  );
};

export default CourseSection;

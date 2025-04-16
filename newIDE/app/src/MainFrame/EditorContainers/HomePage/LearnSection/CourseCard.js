// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { CardWidget } from '../CardWidget';
import { Column, Line } from '../../../../UI/Grid';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import { Trans } from '@lingui/macro';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { type CourseCompletion } from '../UseCourses';
import { type Course } from '../../../../Utils/GDevelopServices/Asset';
import { textEllipsisStyle } from '../../../../UI/TextEllipsis';

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 16px 8px 16px',
  },
  image: { width: '100%' },
  specializationDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  newLabel: {
    position: 'absolute',
    top: 7,
    left: 9,
    borderRadius: 4,
    backgroundColor: '#F03F18',
    fontWeight: 'bold',
    color: 'white',
    padding: '2px 6px',
  },
};

const specializationLabels = {
  'game-development': <Trans>Game Development specialization</Trans>,
  'interaction-design': <Trans>Interaction Design specialization</Trans>,
};
const specializationColors = {
  'game-development': '#5CB0FF',
  'interaction-design': '#CAC84E',
};

type Props = {|
  completion: ?CourseCompletion,
  course: Course,
  onClick: () => void,
|};

const CourseCard = ({ completion, course, onClick }: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget onClick={onClick} size={'large'}>
          <Column expand noMargin noOverflowParent>
            <div style={styles.imageContainer}>
              <img
                src={selectMessageByLocale(i18n, course.imageUrlByLocale)}
                style={styles.image}
                alt=""
              />
              {course.newUntil && course.newUntil > Date.now() && (
                <div style={styles.newLabel}>
                  <Text color="inherit" noMargin displayInlineAsSpan>
                    <Trans>New</Trans>
                  </Text>
                </div>
              )}
            </div>
            <div style={styles.cardTextContainer}>
              <ColumnStackLayout
                noMargin
                expand
                justifyContent="space-between"
                useFullHeight
                noOverflowParent
              >
                <ColumnStackLayout
                  noMargin
                  expand
                  justifyContent="flex-start"
                  useFullHeight
                  noOverflowParent
                >
                  <LineStackLayout alignItems="center" noMargin>
                    <span
                      style={{
                        ...styles.specializationDot,
                        backgroundColor:
                          specializationColors[course.specializationId],
                      }}
                    />
                    <Text
                      displayInlineAsSpan
                      size="body-small"
                      noMargin
                      color="secondary"
                      style={textEllipsisStyle}
                    >
                      {specializationLabels[course.specializationId]}
                    </Text>
                  </LineStackLayout>
                  {completion && (
                    <LineStackLayout alignItems="center" noMargin>
                      <ColoredLinearProgress
                        value={
                          (completion.completedChapters / completion.chapters) *
                          100
                        }
                      />
                      <Text
                        displayInlineAsSpan
                        size="body-small"
                        noMargin
                        color="secondary"
                      >
                        {completion.completedChapters}/{completion.chapters}
                      </Text>
                    </LineStackLayout>
                  )}

                  <Text size="sub-title" noMargin color="primary" align="left">
                    {selectMessageByLocale(i18n, course.titleByLocale)}
                  </Text>
                  <Text noMargin color="secondary" align="left">
                    {selectMessageByLocale(
                      i18n,
                      course.shortDescriptionByLocale
                    )}
                  </Text>
                </ColumnStackLayout>
                <Line justifyContent="space-between">
                  <Text size="body-small" noMargin color="secondary">
                    {selectMessageByLocale(i18n, course.levelByLocale)}
                  </Text>
                  <Text size="body-small" noMargin color="secondary">
                    {course.durationInWeeks === 1 ? (
                      <Trans>1 week</Trans>
                    ) : (
                      <Trans>{course.durationInWeeks} weeks</Trans>
                    )}
                  </Text>
                </Line>
              </ColumnStackLayout>
            </div>
          </Column>
        </CardWidget>
      )}
    </I18n>
  );
};

export default CourseCard;

// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { type MessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { CardWidget } from '../CardWidget';
import { Column, Line } from '../../../../UI/Grid';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import { Trans } from '@lingui/macro';
import { selectMessageByLocale } from '../../../../Utils/i18n/MessageByLocale';
import { type CourseCompletion } from '../UseCourses';

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 10px 20px 10px',
  },
  image: { height: 130, width: 130 },
  lockerImage: { height: 80, width: 80 },
  imageContainer: {
    width: '100%',
    height: 130,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPointsList: {
    paddingInlineStart: 12,
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
};

type Props = {|
  completion: ?CourseCompletion,
  title: MessageByLocale,
  description: MessageByLocale,
  level: MessageByLocale,
  durationInWeeks?: number,
  onClick: () => void,
  imageSource: string,
|};

const CourseCard = ({
  completion,
  title,
  description,
  level,
  durationInWeeks,
  onClick,
  imageSource,
}: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget onClick={onClick} size={'small'}>
          <Column alignItems="center" expand>
            <div style={styles.imageContainer}>
              <img src={imageSource} style={styles.image} alt="" />
            </div>
            <div style={styles.cardTextContainer}>
              <ColumnStackLayout
                noMargin
                expand
                justifyContent="space-between"
                useFullHeight
              >
                <ColumnStackLayout
                  noMargin
                  expand
                  justifyContent="flex-start"
                  useFullHeight
                >
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
                    {selectMessageByLocale(i18n, title)}
                  </Text>
                  <Text noMargin color="secondary" align="left">
                    {selectMessageByLocale(i18n, description)}
                  </Text>
                </ColumnStackLayout>
                <Line noMargin justifyContent="space-between">
                  <Text size="body-small" noMargin color="secondary">
                    {selectMessageByLocale(i18n, level)}
                  </Text>
                  <Text size="body-small" noMargin color="secondary">
                    {durationInWeeks === 1 ? (
                      <Trans>1 week</Trans>
                    ) : (
                      <Trans>{durationInWeeks} weeks</Trans>
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

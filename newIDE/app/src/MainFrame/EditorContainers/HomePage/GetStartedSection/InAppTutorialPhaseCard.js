// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import Divider from '@material-ui/core/Divider';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';
import Paper from '../../../../UI/Paper';
import Text from '../../../../UI/Text';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';
import { CardWidget } from '../CardWidget';
import { Column, Line } from '../../../../UI/Grid';
import LinearProgress from '../../../../UI/LinearProgress';
import Chip from '../../../../UI/Chip';
import { Trans } from '@lingui/macro';

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
  },
};

type Props = {|
  progress?: number,
  locked: boolean,
  title: MessageDescriptor,
  description: MessageDescriptor,
  durationInMinutes: number,
  keyPoints: Array<MessageDescriptor>,
  onClick: () => void,
|};

const InAppTutorialPhaseCard = ({
  progress,
  locked,
  title,
  description,
  durationInMinutes,
  keyPoints,
  onClick,
}: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget onClick={onClick} size="large" disabled={locked}>
          <Paper
            style={{
              ...styles.cardTextContainer,
              padding: "20px 10px",
            }}
            background="dark"
          >
            <ColumnStackLayout expand justifyContent="center" useFullHeight>
              {progress && progress > 0 ? (
                <LineStackLayout alignItems="center" noMargin>
                  <Text displayInlineAsSpan noMargin size="body2">
                    {progress}%
                  </Text>
                  <LinearProgress value={progress} variant="determinate" />
                </LineStackLayout>
              ) : (
                <Line noMargin justifyContent="center">
                  <Chip
                    size="small"
                    label={<Trans>{durationInMinutes} minutes</Trans>}
                  />
                </Line>
              )}
              <Text size="block-title" noMargin>
                {i18n._(title)}
              </Text>
              <Text size="body" color="secondary" noMargin>
                {i18n._(description)}
              </Text>
              <Divider />
              <ResponsiveLineStackLayout noColumnMargin noMargin>
                <Column
                  noMargin
                  alignItems="flex-start"
                  justifyContent="flex-start"
                  expand
                >
                  <ul style={{ paddingInlineStart: 12, textAlign: 'left' }}>
                    {keyPoints.map((keyPoint, index) =>
                      index % 2 === 0 ? (
                        <Text
                          size="body2"
                          color="secondary"
                          noMargin
                          displayAsListItem
                        >
                          {i18n._(keyPoint)}
                        </Text>
                      ) : null
                    )}
                  </ul>
                </Column>
                <Column
                  noMargin
                  alignItems="flex-start"
                  justifyContent="flex-start"
                  expand
                >
                  <ul style={{ paddingInlineStart: 12, textAlign: 'left' }}>
                    {keyPoints.map((keyPoint, index) =>
                      index % 2 === 1 ? (
                        <Text
                          size="body2"
                          color="secondary"
                          noMargin
                          displayAsListItem
                        >
                          {i18n._(keyPoint)}
                        </Text>
                      ) : null
                    )}
                  </ul>
                </Column>
              </ResponsiveLineStackLayout>
            </ColumnStackLayout>
          </Paper>
        </CardWidget>
      )}
    </I18n>
  );
};

export default InAppTutorialPhaseCard;

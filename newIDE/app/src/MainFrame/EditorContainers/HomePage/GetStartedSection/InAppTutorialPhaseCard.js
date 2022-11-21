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
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import Chip from '../../../../UI/Chip';
import { Trans } from '@lingui/macro';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import GDevelopThemeContext from '../../../../UI/Theme/ThemeContext';

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    padding: '10px 10px 20px 10px',
  },
  image: { height: 130, width: 130 },
  lockerImage: { height: 80, width: 80 },
  imageContainer: {
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
  progress?: number,
  /** For tutorials that cannot be started yet. */
  locked: boolean,
  /** To prevent start on click. */
  disabled?: boolean,
  title: MessageDescriptor,
  description: MessageDescriptor,
  durationInMinutes: number,
  keyPoints: Array<MessageDescriptor>,
  onClick: () => void,
  renderImage: (props: any) => React.Node,
|};

const InAppTutorialPhaseCard = ({
  progress,
  locked,
  disabled,
  title,
  description,
  durationInMinutes,
  keyPoints,
  onClick,
  renderImage,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget
          onClick={onClick}
          size="large"
          disabled={disabled || locked}
          shadowed={locked}
        >
          <Column noMargin>
            <div
              style={{
                ...styles.imageContainer,
                backgroundColor: locked
                  ? gdevelopTheme.paper.backgroundColor.light
                  : '#7046EC',
              }}
            >
              {locked ? (
                <Lock style={styles.lockerImage} />
              ) : (
                renderImage({ style: styles.image })
              )}
            </div>
            <Paper square style={styles.cardTextContainer} background="dark">
              <ColumnStackLayout
                expand
                justifyContent="flex-start"
                useFullHeight
              >
                {progress && progress > 0 ? (
                  <LineStackLayout alignItems="center" noMargin>
                    <Text displayInlineAsSpan noMargin size="body2">
                      {progress}%
                    </Text>
                    <ColoredLinearProgress value={progress} />
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
                    <ul style={styles.keyPointsList}>
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
                    <ul style={styles.keyPointsList}>
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
          </Column>
        </CardWidget>
      )}
    </I18n>
  );
};

export default InAppTutorialPhaseCard;

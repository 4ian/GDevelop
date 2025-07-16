// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import Divider from '@material-ui/core/Divider';
import { ColumnStackLayout, LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import { type MessageDescriptor } from '../../../../Utils/i18n/MessageDescriptor.flow';
import { CardWidget } from '../CardWidget';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import ColoredLinearProgress from '../../../../UI/ColoredLinearProgress';
import Chip from '../../../../UI/Chip';
import Lock from '../../../../UI/CustomSvgIcons/Lock';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { Trans } from '@lingui/macro';

const getChipColorFromDuration = (durationInMinutes: number) => {
  if (durationInMinutes <= 2) return '#3BF7F4';
  if (durationInMinutes <= 5) return '#FFBC57';
  return '#FF8569';
};

const getChipTextFromDuration = (durationInMinutes: number) => {
  if (durationInMinutes <= 2) return <Trans>Beginner</Trans>;
  if (durationInMinutes <= 5) return <Trans>Intermediate</Trans>;
  return <Trans>Advanced</Trans>;
};

const getImageSize = ({ isMobile }: { isMobile: boolean }) =>
  isMobile ? 90 : 130;

const styles = {
  cardTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 16px',
  },
  lockerImage: { height: 80, width: 80 },
  imageContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPointsList: {
    paddingInlineStart: 12,
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  chip: {
    height: 24,
  },
};

type Props = {|
  progress?: number,
  /** For tutorials that cannot be started yet. */
  locked?: boolean,
  size?: 'large' | 'banner',
  /** To prevent start on click. */
  disabled?: boolean,
  title: MessageDescriptor,
  description: MessageDescriptor,
  shortDescription: MessageDescriptor,
  durationInMinutes?: number,
  keyPoints?: Array<MessageDescriptor>,
  onClick: () => void,
  renderImage: (props: any) => React.Node,
  loading?: boolean,
|};

const getTextStyle = disabled => (disabled ? { opacity: 0.4 } : undefined);

const InAppTutorialPhaseCard = ({
  progress,
  locked,
  size = 'large',
  disabled,
  title,
  description,
  shortDescription,
  durationInMinutes,
  keyPoints,
  onClick,
  renderImage,
  loading,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const shouldTextBeDisabled = loading || disabled || locked;
  const { isMobile } = useResponsiveWindowSize();
  const imageSize = getImageSize({ isMobile });

  return (
    <I18n>
      {({ i18n }) => (
        <CardWidget
          onClick={onClick}
          size={size}
          disabled={shouldTextBeDisabled}
        >
          <Column noMargin alignItems="center" expand>
            <div
              style={{
                ...styles.imageContainer,
                height: imageSize,
                backgroundColor: locked
                  ? gdevelopTheme.paper.backgroundColor.light
                  : disabled
                  ? gdevelopTheme.palette.type === 'dark'
                    ? '#4F28CD'
                    : '#9979F1'
                  : '#7046EC',
              }}
            >
              {locked ? (
                <Lock style={styles.lockerImage} />
              ) : (
                renderImage({
                  style: {
                    height: imageSize,
                    width: imageSize,
                    opacity: disabled ? 0.6 : 1,
                  },
                })
              )}
            </div>
            <div
              style={{
                ...styles.cardTextContainer,
                maxWidth: size === 'banner' ? '40%' : undefined,
              }}
            >
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
                  <Text
                    size="sub-title"
                    noMargin
                    color="primary"
                    align="left"
                    style={getTextStyle(shouldTextBeDisabled)}
                  >
                    {i18n._(title)}
                  </Text>
                  <Text noMargin align="left" color="secondary">
                    {isMobile ? i18n._(shortDescription) : i18n._(description)}
                  </Text>
                  {keyPoints && <Divider />}
                  {keyPoints && (
                    <Column
                      noMargin
                      alignItems="flex-start"
                      justifyContent="flex-start"
                      expand
                    >
                      <ul style={styles.keyPointsList}>
                        {keyPoints.map((keyPoint, index) => (
                          <Text
                            key={`key-point-${index}`}
                            size="body2"
                            noMargin
                            style={getTextStyle(shouldTextBeDisabled)}
                            color="secondary"
                            displayAsListItem
                          >
                            {i18n._(keyPoint)}
                          </Text>
                        ))}
                      </ul>
                    </Column>
                  )}
                </ColumnStackLayout>
                <Line justifyContent="space-between" alignItems="flex-end">
                  <Chip
                    style={{
                      ...styles.chip,
                      border: `1px solid ${getChipColorFromDuration(
                        durationInMinutes || 0
                      )}`,
                    }}
                    label={getChipTextFromDuration(durationInMinutes || 0)}
                    variant="outlined"
                  />
                  {progress && progress > 0 ? (
                    progress !== 100 ? (
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
                          label={<Trans>Finished</Trans>}
                          style={{
                            backgroundColor:
                              gdevelopTheme.statusIndicator.success,
                            color: '#111111',
                          }}
                        />
                      </Line>
                    )
                  ) : durationInMinutes ? (
                    <Line noMargin justifyContent="center">
                      <Chip
                        size="small"
                        label={
                          isMobile ? (
                            <Trans>{durationInMinutes} min.</Trans>
                          ) : durationInMinutes === 1 ? (
                            <Trans>1 minute</Trans>
                          ) : (
                            <Trans>{durationInMinutes} minutes</Trans>
                          )
                        }
                      />
                    </Line>
                  ) : (
                    <Spacer />
                  )}
                </Line>
              </ColumnStackLayout>
            </div>
          </Column>
        </CardWidget>
      )}
    </I18n>
  );
};

export default InAppTutorialPhaseCard;

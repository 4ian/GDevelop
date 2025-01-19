// @flow

import * as React from 'react';
import { type Leaderboard } from '../../Utils/GDevelopServices/Play';
import DashboardWidget from './DashboardWidget';
import { Trans } from '@lingui/macro';
import FlatButton from '../../UI/FlatButton';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { Column, Line, LargeSpacer } from '../../UI/Grid';
import Text from '../../UI/Text';
import { Divider } from '@material-ui/core';
import ArrowRight from '../../UI/CustomSvgIcons/ArrowRight';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Link from '../../UI/Link';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import RaisedButton from '../../UI/RaisedButton';
import { SubscriptionSuggestionContext } from '../../Profile/Subscription/SubscriptionSuggestionContext';

const leaderboardsHelpLink = getHelpLink('/all-features/leaderboards');
const multiplayerHelpLink = getHelpLink('/all-features/multiplayer');

type Props = {|
  leaderboards: ?Array<Leaderboard>,
  onSeeAllLeaderboards: () => void,
  onSeeLobbyConfiguration: () => void,
  displayUnlockMoreLeaderboardsCallout: boolean,
|};

const ServicesWidget = ({
  leaderboards,
  onSeeAllLeaderboards,
  onSeeLobbyConfiguration,
  displayUnlockMoreLeaderboardsCallout,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  return (
    <DashboardWidget
      widgetSize={'full'}
      title={<Trans>Player services</Trans>}
      widgetName="services"
    >
      <ResponsiveLineStackLayout noColumnMargin noMargin expand>
        <Column expand noMargin>
          <Line noMargin justifyContent="space-between" alignItems="center">
            <Text size="sub-title">
              <Trans>Game leaderboards</Trans>
            </Text>
            <FlatButton
              label={<Trans>See more</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={onSeeAllLeaderboards}
              primary
            />
          </Line>
          {!leaderboards || leaderboards.length === 0 ? (
            <Text color="secondary">
              <Trans>
                Learn how to use{' '}
                <Link
                  href={leaderboardsHelpLink}
                  onClick={() => Window.openExternalURL(leaderboardsHelpLink)}
                >
                  leaderboards
                </Link>{' '}
                on GDevelop.
              </Trans>
            </Text>
          ) : (
            <ResponsiveLineStackLayout
              noMargin
              noColumnMargin
              justifyContent="space-between"
              alignItems="center"
            >
              <Line noMargin alignItems="center">
                <Text>
                  <b>{leaderboards.length}</b>
                </Text>
                &nbsp;
                <Text color="secondary">
                  {leaderboards.length === 1 ? (
                    <Trans>leaderboard.</Trans>
                  ) : (
                    <Trans>leaderboards.</Trans>
                  )}
                </Text>
              </Line>
              {displayUnlockMoreLeaderboardsCallout && (
                <RaisedButton
                  primary
                  label={<Trans>Get more leaderboards</Trans>}
                  onClick={() =>
                    openSubscriptionDialog({
                      analyticsMetadata: {
                        reason: 'Leaderboard count per game limit reached',
                        recommendedPlanId: 'gdevelop_silver',
                      },
                    })
                  }
                />
              )}
            </ResponsiveLineStackLayout>
          )}
        </Column>
        {isMobile ? (
          <Column noMargin>
            <Divider orientation="horizontal" />
          </Column>
        ) : (
          <Line noMargin>
            <LargeSpacer />
            <Divider orientation="vertical" />
            <LargeSpacer />
          </Line>
        )}
        <Column expand noMargin>
          <Line noMargin justifyContent="space-between" alignItems="center">
            <Text size="sub-title">
              <Trans>Multiplayer lobbies</Trans>
            </Text>
            <FlatButton
              label={<Trans>See more</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={onSeeLobbyConfiguration}
              primary
            />
          </Line>
          <Text color="secondary">
            <Trans>
              Learn how to make{' '}
              <Link
                href={multiplayerHelpLink}
                onClick={() => Window.openExternalURL(multiplayerHelpLink)}
              >
                multiplayer games
              </Link>{' '}
              with GDevelop.
            </Trans>
          </Text>
        </Column>
      </ResponsiveLineStackLayout>
    </DashboardWidget>
  );
};

export default ServicesWidget;

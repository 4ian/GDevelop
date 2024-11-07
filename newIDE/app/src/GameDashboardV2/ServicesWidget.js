// @flow

import * as React from 'react';
import {
  type Leaderboard,
  type LobbyConfiguration,
} from '../Utils/GDevelopServices/Play';
import DashboardWidget from './DashboardWidget';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import { Divider } from '@material-ui/core';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';

const leaderboardsHelpLink = getHelpLink('/all-features/leaderboards');

type Props = {|
  leaderboards: ?Array<Leaderboard>,
  lobbyConfiguration: ?LobbyConfiguration,
  onSeeAllLeaderboards: () => void,
|};

const ServicesWidget = ({ leaderboards, onSeeAllLeaderboards }: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  return (
    <DashboardWidget gridSize={3} title={<Trans>Player services</Trans>}>
      <ResponsiveLineStackLayout noColumnMargin noMargin expand>
        <Column expand noMargin>
          <Line noMargin justifyContent="space-between" alignItems="center">
            <Text size="block-title">
              <Trans>Game leaderboards</Trans>
            </Text>
            <FlatButton
              label={<Trans>See more</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={onSeeAllLeaderboards}
              primary
            />
          </Line>
          {leaderboards && leaderboards.length === 0 && (
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
          )}
        </Column>
        {isMobile ? (
          <Column noMargin>
            <Divider orientation="horizontal" />
          </Column>
        ) : (
          <Line noMargin>
            <Divider orientation="vertical" />
          </Line>
        )}
        <Column expand noMargin>
          <Line noMargin justifyContent="space-between" alignItems="center">
            <Text size="block-title">
              <Trans>Multiplayer lobbies</Trans>
            </Text>
          </Line>
          {/* Add multiplayer admin. */}
        </Column>
      </ResponsiveLineStackLayout>
    </DashboardWidget>
  );
};

export default ServicesWidget;

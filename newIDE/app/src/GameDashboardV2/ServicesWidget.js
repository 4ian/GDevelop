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

type Props = {|
  leaderboards: ?Array<Leaderboard>,
  lobbyConfiguration: ?LobbyConfiguration,
  onSeeAllLeaderboards: () => void,
|};

const ServicesWidget = ({ onSeeAllLeaderboards }: Props) => {
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
              label={<Trans>See all</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={onSeeAllLeaderboards}
              primary
            />
          </Line>
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

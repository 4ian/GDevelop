// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';

import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Column, Line, Spacer } from '../../UI/Grid';
import BackgroundText from '../../UI/BackgroundText';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import DashboardWidget from './DashboardWidget';
import { type Game } from '../../Utils/GDevelopServices/Game';

const styles = {
  separator: {
    height: 50,
  },
};

// Helper to display 5.5k instead of 5502, or 1.2m instead of 1234567
export const formatPlays = (plays: number) => {
  if (plays < 1000) return plays.toString();
  if (plays < 1000000) return `${(plays / 1000).toFixed(1)}k`;
  return `${(plays / 1000000).toFixed(1)}m`;
};

type Props = {|
  games: Array<Game>,
  fullWidth?: boolean,
|};

const TotalPlaysWidget = ({ games, fullWidth }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);

  const {
    allGamesLastWeekPlays,
    allGamesLastYearPlays,
    allGamesTotalPlays,
  } = React.useMemo(
    () => {
      const allGamesLastWeekPlays = games.reduce(
        (acc, game) => acc + (game.cachedLastWeekSessionsCount || 0),
        0
      );
      const allGamesLastYearPlays = games.reduce(
        (acc, game) => acc + (game.cachedLastYearSessionsCount || 0),
        0
      );
      const allGamesTotalPlays = games.reduce(
        (acc, game) => acc + (game.cachedTotalSessionsCount || 0),
        0
      );

      return {
        allGamesLastWeekPlays,
        allGamesLastYearPlays,
        allGamesTotalPlays,
      };
    },
    [games]
  );

  return (
    <DashboardWidget
      gridSize={fullWidth ? 3 : 1.5}
      title={<Trans>Total plays</Trans>}
      minHeight="small"
    >
      <LineStackLayout
        noMargin
        alignItems="center"
        justifyContent="flex-end"
        expand
      >
        <ColumnStackLayout alignItems="center" noMargin>
          <Line noMargin alignItems="center" justifyContent="center" expand>
            <Column noMargin>
              <Text size="block-title" align="center" noMargin>
                {formatPlays(allGamesTotalPlays)}
              </Text>
              <BackgroundText>
                <Trans>Overall</Trans>
              </BackgroundText>
            </Column>
            <Spacer />
          </Line>
          <LineStackLayout
            noMargin
            alignItems="center"
            justifyContent="center"
            expand
          >
            <Column noMargin>
              <Text size="block-title" align="center" noMargin>
                {formatPlays(allGamesLastWeekPlays)}
              </Text>
              <BackgroundText>
                <Trans>Last week</Trans>
              </BackgroundText>
            </Column>
            <Spacer />
            <div
              style={{
                ...styles.separator,
                border: `1px solid ${theme.home.separator.color}`,
              }}
            />
            <Spacer />
            <Column noMargin>
              <Text size="block-title" align="center" noMargin>
                {formatPlays(allGamesLastYearPlays)}
              </Text>
              <BackgroundText>
                <Trans>Last year</Trans>
              </BackgroundText>
            </Column>
            <Spacer />
          </LineStackLayout>
        </ColumnStackLayout>
      </LineStackLayout>
    </DashboardWidget>
  );
};

export default TotalPlaysWidget;

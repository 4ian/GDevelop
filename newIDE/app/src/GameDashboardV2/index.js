// @flow

import * as React from 'react';
import { type Game } from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import GameHeader from './GameHeader';
import DashboardWidget from './DashboardWidget';
import { Trans } from '@lingui/macro';
import FlatButton from '../UI/FlatButton';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import { Grid } from '@material-ui/core';
import FeedbackWidget from './FeedbackWidget';

type Props = {|
  game: Game,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
|};

const GameDashboardV2 = ({ game }: Props) => {
  const [view, setView] = React.useState<
    'game' | 'analytics' | 'feedbacks' | 'builds' | 'services'
  >('game');

  return (
    <ColumnStackLayout noMargin>
      <GameHeader game={game} />
      <Grid container spacing={2}>
        <DashboardWidget
          gridSize={2}
          title={<Trans>Analytics</Trans>}
          seeMoreButton={
            <FlatButton
              label={<Trans>See all</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={() => setView('analytics')}
              primary
            />
          }
        />
        <FeedbackWidget onSeeAll={() => setView('feedbacks')} />
        <DashboardWidget
          gridSize={3}
          title={<Trans>Exports</Trans>}
          seeMoreButton={
            <FlatButton
              label={<Trans>See all</Trans>}
              rightIcon={<ArrowRight fontSize="small" />}
              onClick={() => setView('builds')}
              primary
            />
          }
        />
      </Grid>
    </ColumnStackLayout>
  );
};

export default GameDashboardV2;

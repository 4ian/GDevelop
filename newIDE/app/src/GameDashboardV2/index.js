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
import { listComments, type Comment } from '../Utils/GDevelopServices/Play';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  game: Game,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
|};

const GameDashboardV2 = ({ game }: Props) => {
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [view, setView] = React.useState<
    'game' | 'analytics' | 'feedbacks' | 'builds' | 'services'
  >('game');
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);

  React.useEffect(
    () => {
      if (!profile) {
        setFeedbacks(null);
        return;
      }

      const fetchData = async () => {
        const feedbacks = await listComments(
          getAuthorizationHeader,
          profile.id,
          {
            gameId: game.id,
            type: 'FEEDBACK',
          }
        );
        setFeedbacks(feedbacks);
      };

      fetchData();
    },
    [getAuthorizationHeader, profile, game.id]
  );

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
        <FeedbackWidget
          onSeeAll={() => setView('feedbacks')}
          feedbacks={feedbacks}
        />
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

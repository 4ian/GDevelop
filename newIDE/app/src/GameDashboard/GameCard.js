// @flow
import { Trans } from '@lingui/macro';
import { Card, CardActions, CardHeader, Chip } from '@material-ui/core';
import { format } from 'date-fns';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import { Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { getGameUrl, type Game } from '../Utils/GDevelopServices/Game';
import TimelineIcon from '@material-ui/icons/Timeline';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Window from '../Utils/Window';

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenDetails: () => void,
  onOpenBuilds: () => void,
  onOpenAnalytics: () => void,
  onOpenMonetization: () => void,
|};

export const GameCard = ({
  game,
  isCurrentGame,
  onOpenDetails,
  onOpenBuilds,
  onOpenAnalytics,
  onOpenMonetization,
}: Props) => {
  const openGameUrl = () => {
    const url = getGameUrl(game);
    if (!url) return;
    Window.openExternalURL(url);
  };

  return (
    <Card key={game.id}>
      <CardHeader
        title={game.gameName}
        subheader={
          <Line alignItems="center" noMargin>
            <Trans>
              Registered on{' '}
              {format(game.createdAt * 1000 /* TODO */, 'yyyy-MM-dd')}
            </Trans>
            {isCurrentGame && (
              <React.Fragment>
                <Spacer />
                <Chip
                  size="small"
                  label={<Trans>Game currently edited</Trans>}
                />
              </React.Fragment>
            )}
          </Line>
        }
      />
      <CardActions>
        <ResponsiveLineStackLayout expand noMargin justifyContent="flex-end">
          <FlatButton
            label={<Trans>See details</Trans>}
            onClick={onOpenDetails}
          />
          {game.publicWebBuildId && (
            <RaisedButton label={<Trans>Open</Trans>} onClick={openGameUrl} />
          )}
          <RaisedButton
            primary
            icon={<PlaylistPlayIcon />}
            label={<Trans>Builds</Trans>}
            onClick={onOpenBuilds}
          />
          <RaisedButton
            primary
            icon={<TimelineIcon />}
            label={<Trans>Analytics</Trans>}
            onClick={onOpenAnalytics}
          />
          <RaisedButton
            primary
            icon={<MonetizationOnIcon />}
            label={<Trans>Monetization</Trans>}
            onClick={onOpenMonetization}
          />
        </ResponsiveLineStackLayout>
      </CardActions>
    </Card>
  );
};

// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { Card, CardActions, CardHeader, Chip } from '@material-ui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { getGameUrl, type Game } from '../Utils/GDevelopServices/Game';
import TimelineIcon from '@material-ui/icons/Timeline';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import TuneIcon from '@material-ui/icons/Tune';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Window from '../Utils/Window';
import FlatButton from '../UI/FlatButton';
import { GameThumbnail } from './GameThumbnail';

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenDetails: () => void,
  onOpenBuilds: () => void,
  onOpenAnalytics: () => void,
|};

export const GameCard = ({
  game,
  isCurrentGame,
  onOpenDetails,
  onOpenBuilds,
  onOpenAnalytics,
}: Props) => {
  const openGameUrl = () => {
    const url = getGameUrl(game);
    if (!url) return;
    Window.openExternalURL(url);
  };
  return (
    <I18n>
      {({ i18n }) => (
        <Card key={game.id}>
          <Line>
            <GameThumbnail
              gameName={game.gameName}
              thumbnailUrl={game.thumbnailUrl}
            />
            <Column expand>
              <CardHeader
                title={game.gameName}
                subheader={
                  <Line alignItems="center" noMargin>
                    <Trans>Created on {i18n.date(game.createdAt * 1000)}</Trans>
                    {isCurrentGame && (
                      <>
                        <Spacer />
                        <Chip
                          size="small"
                          label={<Trans>Currently edited</Trans>}
                          color="primary"
                        />
                      </>
                    )}
                    {game.publicWebBuildId && (
                      <>
                        <Spacer />
                        <Chip
                          size="small"
                          label={<Trans>Published on Liluo.io</Trans>}
                        />
                      </>
                    )}
                  </Line>
                }
              />
              <CardActions>
                <ResponsiveLineStackLayout
                  expand
                  noMargin
                  justifyContent="flex-end"
                >
                  {game.publicWebBuildId && (
                    <RaisedButton
                      label={<Trans>Open</Trans>}
                      onClick={openGameUrl}
                      primary
                    />
                  )}
                  <FlatButton
                    icon={<TuneIcon />}
                    label={<Trans>Details</Trans>}
                    onClick={onOpenDetails}
                  />
                  <FlatButton
                    icon={<PlaylistPlayIcon />}
                    label={<Trans>Builds</Trans>}
                    onClick={onOpenBuilds}
                  />
                  <FlatButton
                    icon={<TimelineIcon />}
                    label={<Trans>Analytics</Trans>}
                    onClick={onOpenAnalytics}
                  />
                </ResponsiveLineStackLayout>
              </CardActions>
            </Column>
          </Line>
        </Card>
      )}
    </I18n>
  );
};

// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { Card, CardActions, CardHeader, Chip } from '@material-ui/core';
import * as React from 'react';
import { Column, Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { getGameUrl, type Game } from '../Utils/GDevelopServices/Game';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import Window from '../Utils/Window';
import { GameThumbnail } from './GameThumbnail';

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenGameManager: () => void,
|};

export const GameCard = ({ game, isCurrentGame, onOpenGameManager }: Props) => {
  const openGameUrl = () => {
    const url = getGameUrl(game);
    if (!url) return;
    Window.openExternalURL(url);
  };
  return (
    <I18n>
      {({ i18n }) => (
        <Card key={game.id}>
          <ResponsiveLineStackLayout>
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
                          label={
                            game.discoverable ? (
                              <Trans>Discoverable on Liluo.io</Trans>
                            ) : (
                              <Trans>Published on Liluo.io</Trans>
                            )
                          }
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
                      label={<Trans>Open in browser</Trans>}
                      onClick={openGameUrl}
                    />
                  )}
                  <RaisedButton
                    label={<Trans>Manage game</Trans>}
                    onClick={onOpenGameManager}
                    primary
                  />
                </ResponsiveLineStackLayout>
              </CardActions>
            </Column>
          </ResponsiveLineStackLayout>
        </Card>
      )}
    </I18n>
  );
};

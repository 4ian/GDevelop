// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';

import { Chip } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import ShareIcon from '@material-ui/icons/Share';
import MoreVert from '@material-ui/icons/MoreVert';

import { Column, Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { LineStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';

import { GameThumbnail } from './GameThumbnail';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import ShareDialog from './ShareDialog';

import {
  deleteGame,
  getGameUrl,
  updateGame,
  type Game,
} from '../Utils/GDevelopServices/Game';
import Window from '../Utils/Window';
import { type GamesDetailsTab } from './GameDetailsDialog';
import { showErrorBox } from '../UI/Messages/MessageBox';
import BackgroundText from '../UI/BackgroundText';
import Card from '../UI/Card';

type Props = {|
  game: Game,
  isCurrentGame: boolean,
  onOpenGameManager: (tab: GamesDetailsTab) => void,
  onUpdateGame: () => Promise<void>,
|};

type TogglableProperties =
  | 'discoverable'
  | 'acceptsBuildComments'
  | 'acceptsGameComments';

const confirmationMessage = {
  discoverable: {
    true: t`
        You are about to make this game discoverable on Liluo.io categories pages. 
        Do you want to Continue?
      `,
    false: t`
        You are about to hide this game from Liluo.io categories pages.
        Do you want to Continue?
      `,
  },
  acceptsBuildComments: {
    true: t`
        You are about to activate a feedback banner on all builds of this game.
        By doing this you're allowing feedback from any player who has access to your Liluo.io build URLs.
        Do you want to continue?
      `,
    false: t`
        You are about to de-activate the feedback banner on all your Liluo.io build pages.
        Do you want to Continue ?
      `,
  },
  acceptsGameComments: {
    true: t`
        You are about to activate a feedback banner on your Liluo.io game page.
        By doing this you will receive feedback from any Liluo.io visitor.
        Do you want to continue?
      `,
    false: t`
        You are about to de-activate the feedback banner on your Liluo.io game page.
        Do you want to Continue ?
      `,
  },
};

export const GameCard = ({
  game,
  isCurrentGame,
  onOpenGameManager,
  onUpdateGame,
}: Props) => {
  const openGameUrl = () => {
    const url = getGameUrl(game);
    if (!url) return;
    Window.openExternalURL(url);
  };
  const [showShareDialog, setShowShareDialog] = React.useState(false);
  const [
    editedProperty,
    setEditedProperty,
  ] = React.useState<?TogglableProperties>(null);
  const [isDeletingGame, setIsDeletingGame] = React.useState(false);

  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const onToggle = async (
    i18n: I18nType,
    property: TogglableProperties,
    newValue: boolean
  ) => {
    if (!profile) return;
    const answer = Window.showConfirmDialog(
      i18n._(confirmationMessage[property][newValue.toString()])
    );
    if (!answer) return;
    setEditedProperty(property);
    try {
      await updateGame(getAuthorizationHeader, profile.id, game.id, {
        // $FlowFixMe - We know that the property is a game property.
        [property]: newValue,
      });
      await onUpdateGame();
    } catch (error) {
      console.error(`Unable to update property ${property}`, error);
      showErrorBox({
        message:
          i18n._(t`Unable to update game.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'game-dashboard-update-game-error',
      });
    }
    setEditedProperty(null);
  };

  const unregisterGame = async (i18n: I18nType) => {
    const answer = Window.showConfirmDialog(
      i18n._(t`Are you sure you want to unregister this game?`) +
        '\n\n' +
        i18n._(
          t`It will disappear from your games dashboard and you won't get access to analytics, unless you register it again.`
        )
    );
    if (!answer) return;

    if (!profile) return;
    const { id } = profile;
    setIsDeletingGame(true);

    try {
      await deleteGame(getAuthorizationHeader, id, game.id);
      await onUpdateGame();
    } catch (error) {
      console.error('Unable to delete the game:', error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 'game-deletion/leaderboards-exist'
      ) {
        showErrorBox({
          message: i18n._(
            t`You cannot unregister a game that has active leaderboards. To delete them, go in the Leaderboards tab, and delete them one by one.`
          ),
          rawError: error,
          errorId: 'game-dashboard-unregister-game-active-leaderboards-error',
        });
      } else {
        showErrorBox({
          message:
            i18n._(t`Unable to delete the game.`) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'game-dashboard-unregister-game-active-leaderboards-error',
        });
      }
      setIsDeletingGame(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Card
            key={game.id}
            cardCornerAction={
              <ElementWithMenu
                element={
                  <IconButton size="small" disabled={isDeletingGame}>
                    <MoreVert />
                  </IconButton>
                }
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: i18n._(t`Game details`),
                    click: () => onOpenGameManager('details'),
                  },
                  {
                    label: i18n._(t`Game builds`),
                    click: () => onOpenGameManager('builds'),
                  },
                  {
                    label: i18n._(t`Game feedbacks`),
                    click: () => onOpenGameManager('feedback'),
                  },
                  {
                    label: i18n._(t`Game analytics`),
                    click: () => onOpenGameManager('analytics'),
                  },
                  {
                    label: i18n._(t`Game leaderboards`),
                    click: () => onOpenGameManager('leaderboards'),
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Unregister game`),
                    click: () => {
                      unregisterGame(i18n);
                    },
                  },
                ]}
              />
            }
            header={
              <Line>
                {game.publicWebBuildId && (
                  <>
                    <Text size="body2" noMargin displayInlineAsSpan>
                      {game.discoverable ? (
                        <Trans>Public on Liluo.io</Trans>
                      ) : (
                        <Trans>Not visible on Liluo.io</Trans>
                      )}
                    </Text>
                    <Spacer />
                  </>
                )}

                <BackgroundText>
                  <Trans>Created on {i18n.date(game.createdAt * 1000)}</Trans>
                </BackgroundText>
              </Line>
            }
          >
            <ResponsiveLineStackLayout noMargin>
              <Column noMargin alignItems="center">
                <GameThumbnail
                  gameName={game.gameName}
                  thumbnailUrl={game.thumbnailUrl}
                />
              </Column>
              <Spacer />
              <Column expand justifyContent="space-between">
                <ResponsiveLineStackLayout noMargin alignItems="flex-start">
                  <CardHeader
                    title={game.gameName}
                    subheader={
                      isCurrentGame && (
                        <Chip
                          size="small"
                          label={<Trans>Currently edited</Trans>}
                          color="primary"
                        />
                      )
                    }
                  />
                  <Column expand noMargin>
                    <ResponsiveLineStackLayout
                      justifyContent="flex-end"
                      noColumnMargin
                    >
                      <FlatButton
                        label={<Trans>Manage game</Trans>}
                        onClick={() => onOpenGameManager('details')}
                      />
                      <LineStackLayout noMargin>
                        <Column noMargin expand>
                          <RaisedButton
                            label={<Trans>Open in browser</Trans>}
                            onClick={openGameUrl}
                            primary
                            disabled={!game.publicWebBuildId || isDeletingGame}
                          />
                        </Column>
                        <IconButton
                          size="small"
                          disabled={!game.publicWebBuildId || isDeletingGame}
                          onClick={() => setShowShareDialog(true)}
                          tooltip={t`Share`}
                        >
                          <ShareIcon />
                        </IconButton>
                      </LineStackLayout>
                    </ResponsiveLineStackLayout>
                  </Column>
                </ResponsiveLineStackLayout>
                <Column noMargin justifyContent="flex-start">
                  <Toggle
                    labelPosition="left"
                    onToggle={() => {
                      onToggle(i18n, 'discoverable', !game.discoverable);
                    }}
                    toggled={!!game.discoverable}
                    label={<Trans>Make discoverable on Liluo.io</Trans>}
                    disabled={
                      editedProperty === 'discoverable' || isDeletingGame
                    }
                  />
                  <Toggle
                    labelPosition="left"
                    onToggle={() => {
                      onToggle(
                        i18n,
                        'acceptsGameComments',
                        !game.acceptsGameComments
                      );
                    }}
                    toggled={!!game.acceptsGameComments}
                    label={
                      <Trans>Show feedback banner on Liluo.io game page</Trans>
                    }
                    disabled={
                      editedProperty === 'acceptsGameComments' || isDeletingGame
                    }
                  />
                  <Toggle
                    labelPosition="left"
                    onToggle={() => {
                      onToggle(
                        i18n,
                        'acceptsBuildComments',
                        !game.acceptsBuildComments
                      );
                    }}
                    toggled={!!game.acceptsBuildComments}
                    label={<Trans>Ask for feedback on all build pages</Trans>}
                    disabled={
                      editedProperty === 'acceptsBuildComments' ||
                      isDeletingGame
                    }
                  />
                </Column>
              </Column>
            </ResponsiveLineStackLayout>
          </Card>
          {showShareDialog && (
            <ShareDialog
              game={game}
              onClose={() => setShowShareDialog(false)}
            />
          )}
        </>
      )}
    </I18n>
  );
};

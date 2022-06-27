// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';

import { Card, Chip } from '@material-ui/core';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import ShareIcon from '@material-ui/icons/Share';
import MoreVert from '@material-ui/icons/MoreVert';

import { Column, Line, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import Text from '../UI/Text';
import Toggle from '../UI/Toggle';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';

import { GameThumbnail } from './GameThumbnail';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import ShareDialog from './ShareDialog';

import {
  getGameUrl,
  updateGame,
  type Game,
} from '../Utils/GDevelopServices/Game';
import Window from '../Utils/Window';
import { type GamesDetailsTab } from './GameDetailsDialog';
import Dialog from '../UI/Dialog';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { showErrorBox } from '../UI/Messages/MessageBox';

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
    true: (
      <Trans>
        You are about to make this game discoverable on categories pages on
        Liluo.io. Continue?
      </Trans>
    ),
    false: (
      <Trans>
        You are about to hide this game from categories pages on Liluo.io.
        Continue?
      </Trans>
    ),
  },
  acceptsBuildComments: {
    true: (
      <Trans>
        You are about to activate a feedback banner on all your build pages on
        Liluo.io, asking for feedback on your game. Continue?
      </Trans>
    ),
    false: (
      <Trans>
        You are about to de-activate the feedback banner on all your build pages
        on Liluo.io. Continue ?
      </Trans>
    ),
  },
  acceptsGameComments: {
    true: (
      <Trans>
        You are about to activate a feedback banner on your game page on
        Liluo.io, to let any user give you feedback. Continue?
      </Trans>
    ),
    false: (
      <Trans>
        You're about to de-activate the feedback banner on your game page on
        Liluo.io. Continue ?
      </Trans>
    ),
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
    confirmationDialogName,
    setConfirmationDialogName,
  ] = React.useState<?TogglableProperties>(null);
  const [isEditingProperty, setIsEditingProperty] = React.useState(false);

  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );

  const getNewProperty = (property: ?TogglableProperties) => {
    switch (property) {
      case 'discoverable':
        return { discoverable: !game.discoverable };
      case 'acceptsBuildComments':
        return { acceptsBuildComments: !game.acceptsBuildComments };
      case 'acceptsGameComments':
        return { acceptsGameComments: !game.acceptsGameComments };
      default:
        return null;
    }
  };
  const newProperty = getNewProperty(confirmationDialogName);

  const onConfirmToggleChanges = async (i18n: I18nType) => {
    if (!profile || !confirmationDialogName) return;
    if (!newProperty) return;
    setIsEditingProperty(true);
    try {
      await updateGame(
        getAuthorizationHeader,
        profile.id,
        game.id,
        newProperty
      );
      await onUpdateGame();
      setConfirmationDialogName(null);
    } catch (error) {
      console.error(
        `Unable to update property ${confirmationDialogName}`,
        error
      );
      showErrorBox({
        message: i18n._(t`Unable to update game.`),
        rawError: error,
        errorId: 'game-dashboard-update-game-error',
      });
    } finally {
      setIsEditingProperty(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Card key={game.id} variant="outlined">
            <CardContent>
              <Line noMargin justifyContent="space-between" alignItems="center">
                <Line>
                  {game.publicWebBuildId && (
                    <>
                      <Text size="body2" noMargin displayInlineAsSpan>
                        {game.discoverable ? (
                          <Trans>Public on Liluo.io</Trans>
                        ) : (
                          <Trans>
                            Build version only (non visible on Liluo.io)
                          </Trans>
                        )}
                      </Text>
                      <Spacer />
                    </>
                  )}

                  <Text size="body2" noMargin displayInlineAsSpan>
                    <Trans>Created on {i18n.date(game.createdAt * 1000)}</Trans>
                  </Text>
                </Line>
                <ElementWithMenu
                  element={
                    <IconButton size="small" style={{ padding: 0 }}>
                      <MoreVert />
                    </IconButton>
                  }
                  buildMenuTemplate={(i18n: I18nType) => [
                    {
                      label: i18n._(t`Open details`),
                      click: () => onOpenGameManager('details'),
                    },
                    {
                      label: i18n._(t`See builds`),
                      click: () => onOpenGameManager('builds'),
                    },
                    {
                      label: i18n._(t`See feedbacks`),
                      click: () => onOpenGameManager('feedback'),
                    },
                    {
                      label: i18n._(t`Open analytics`),
                      click: () => onOpenGameManager('analytics'),
                    },
                    {
                      label: i18n._(t`Manage leaderboards`),
                      click: () => onOpenGameManager('leaderboards'),
                    },
                  ]}
                />
              </Line>
              <ResponsiveLineStackLayout noMargin>
                <GameThumbnail
                  gameName={game.gameName}
                  thumbnailUrl={game.thumbnailUrl}
                />
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
                          label={<Trans>Access feedback</Trans>}
                          onClick={() => onOpenGameManager('feedback')}
                          disabled={!game.publicWebBuildId}
                        />
                        <RaisedButton
                          label={<Trans>Open in browser</Trans>}
                          onClick={openGameUrl}
                          primary
                          disabled={!game.publicWebBuildId}
                        />
                        <IconButton
                          size="small"
                          disabled={!game.publicWebBuildId}
                          onClick={() => setShowShareDialog(true)}
                          tooltip={t`Share`}
                        >
                          <ShareIcon />
                        </IconButton>
                      </ResponsiveLineStackLayout>
                    </Column>
                  </ResponsiveLineStackLayout>
                  <Column noMargin justifyContent="flex-start">
                    <Toggle
                      labelPosition="left"
                      onToggle={() => setConfirmationDialogName('discoverable')}
                      toggled={!!game.discoverable}
                      label={<Trans>Make discoverable on Liluo.io</Trans>}
                    />
                    <Toggle
                      labelPosition="left"
                      onToggle={() =>
                        setConfirmationDialogName('acceptsGameComments')
                      }
                      toggled={!!game.acceptsGameComments}
                      label={
                        <Trans>
                          Show feedback banner on Liluo.io game page
                        </Trans>
                      }
                    />
                    <Toggle
                      labelPosition="left"
                      onToggle={() =>
                        setConfirmationDialogName('acceptsBuildComments')
                      }
                      toggled={!!game.acceptsBuildComments}
                      label={<Trans>Ask for feedback on all build pages</Trans>}
                    />
                  </Column>
                </Column>
              </ResponsiveLineStackLayout>
            </CardContent>
          </Card>
          {showShareDialog && (
            <ShareDialog
              game={game}
              onClose={() => setShowShareDialog(false)}
            />
          )}
          {confirmationDialogName && newProperty && (
            <Dialog
              open
              maxWidth="xs"
              actions={[
                <FlatButton
                  key="cancel-toggle-change"
                  label={<Trans>Cancel</Trans>}
                  onClick={() => setConfirmationDialogName(null)}
                  disabled={isEditingProperty}
                />,
                <RaisedButton
                  key="confirm-toggle-change"
                  label={<Trans>Confirm</Trans>}
                  onClick={() => onConfirmToggleChanges(i18n)}
                  disabled={isEditingProperty}
                />,
              ]}
              onApply={() => onConfirmToggleChanges(i18n)}
              cannotBeDismissed={isEditingProperty}
            >
              <Column>
                <Line>
                  {isEditingProperty ? (
                    <PlaceholderLoader />
                  ) : (
                    <Text>
                      {
                        confirmationMessage[confirmationDialogName][
                          (!!newProperty[confirmationDialogName]).toString()
                        ]
                      }
                    </Text>
                  )}
                </Line>
              </Column>
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
};

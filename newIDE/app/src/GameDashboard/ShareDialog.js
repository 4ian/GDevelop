// @flow
import { Trans } from '@lingui/macro';
import { CircularProgress } from '@material-ui/core';
import Share from '@material-ui/icons/Share';
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Column, Line } from '../UI/Grid';
import InfoBar from '../UI/Messages/InfoBar';
import ShareButtons from '../UI/ShareDialog/ShareButtons';
import ShareLink from '../UI/ShareDialog/ShareLink';
import {
  type GameSlug,
  type Game,
  getGameSlugs,
  getGameUrl,
} from '../Utils/GDevelopServices/Game';
import Window from '../Utils/Window';

type Props = {| game: Game, onClose: () => void |};

const ShareDialog = ({ game, onClose }: Props) => {
  const [isFetchingGameSlug, setIsFetchingGameSlug] = React.useState(true);
  const [gameSlug, setGameSlug] = React.useState<?GameSlug>(null);
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const fetchGameSlug = React.useCallback(
    async () => {
      if (!profile) return;
      try {
        const gameSlugs = await getGameSlugs(
          getAuthorizationHeader,
          profile.id,
          game.id
        );
        setGameSlug(gameSlugs[0]);
      } finally {
        setIsFetchingGameSlug(false);
      }
    },
    [getAuthorizationHeader, profile, game]
  );

  React.useEffect(
    () => {
      fetchGameSlug();
    },
    [fetchGameSlug]
  );

  const gameUrl = getGameUrl(game, gameSlug);
  const onCopyLinkToClipboard = () => {
    if (!profile) return;
    gameUrl && navigator.clipboard.writeText(gameUrl);
    setShowCopiedInfoBar(true);
  };
  const onOpen = () => {
    gameUrl && Window.openExternalURL(gameUrl);
  };

  const onShare = async () => {
    if (!gameUrl || !navigator.share) return;

    // We are on mobile (or on browsers supporting sharing using the system dialog).
    const shareData = {
      title: 'My GDevelop game',
      text: 'Try the game I just created with #gdevelop',
      url: gameUrl,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Couldn't share the game", err);
    }
  };

  if (!gameUrl) return null;
  return (
    <Dialog
      open
      actions={[<FlatButton label={<Trans>Close</Trans>} onClick={onClose} />]}
      title={<Trans>Share your game</Trans>}
      onRequestClose={onClose}
    >
      {!isFetchingGameSlug ? (
        <Column>
          <ShareLink
            onCopy={onCopyLinkToClipboard}
            onOpen={onOpen}
            buildUrl={gameUrl}
          />
          {navigator.share ? (
            <Line justifyContent="flex-end">
              <FlatButton
                label={<Trans>Share</Trans>}
                onClick={onShare}
                icon={<Share />}
              />
            </Line>
          ) : (
            <ShareButtons url={gameUrl} />
          )}
        </Column>
      ) : (
        <Column alignItems="center">
          <Line>
            <CircularProgress />
          </Line>
        </Column>
      )}

      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </Dialog>
  );
};

export default ShareDialog;

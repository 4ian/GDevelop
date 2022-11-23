// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Column, Line } from '../UI/Grid';
import InfoBar from '../UI/Messages/InfoBar';
import SocialShareButtons from '../UI/ShareDialog/SocialShareButtons';
import ShareLink from '../UI/ShareDialog/ShareLink';

import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  type GameSlug,
  type Game,
  getGameSlugs,
  getGameUrl,
} from '../Utils/GDevelopServices/Game';
import AlertMessage from '../UI/AlertMessage';
import ShareButton from '../UI/ShareDialog/ShareButton';
import CircularProgress from '../UI/CircularProgress';
import Text from '../UI/Text';

type Props = {| game: Game, onClose: () => void |};

const ShareDialog = ({ game, onClose }: Props) => {
  const [isFetchingGameSlug, setIsFetchingGameSlug] = React.useState(true);
  const [gameSlug, setGameSlug] = React.useState<?GameSlug>(null);
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);
  const [showAlertMessage, setShowAlertMessage] = React.useState(false);
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
      } catch (error) {
        console.error(error);
        setShowAlertMessage(true);
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

  if (!gameUrl) return null;
  return (
    <Dialog
      title={<Trans>Share your game</Trans>}
      open
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
    >
      {!isFetchingGameSlug ? (
        <Column>
          <ShareLink url={gameUrl} />
          {navigator.share ? (
            <ShareButton url={gameUrl} />
          ) : (
            <SocialShareButtons url={gameUrl} />
          )}
        </Column>
      ) : (
        <Column alignItems="center">
          <Line>
            <CircularProgress />
          </Line>
          <Text>
            <Trans>Just a few seconds while we generate the link...</Trans>
          </Text>
        </Column>
      )}

      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
      {showAlertMessage && (
        <AlertMessage kind="error" onHide={() => setShowAlertMessage(false)}>
          <Trans>
            An error occured while generating the game url with the currently
            set game slug.
          </Trans>
        </AlertMessage>
      )}
    </Dialog>
  );
};

export default ShareDialog;

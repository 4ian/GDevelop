// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import Builds from '.';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../Profile/AuthenticatedUserContext';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { getGame, type Game } from '../../Utils/GDevelopServices/Game';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  open: boolean,
  onClose: () => void,
|};

const BuildsDialog = ({ authenticatedUser, gameId, open, onClose }: Props) => {
  // Force the Dialog repositioning
  const forceUpdate = useForceUpdate();
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const [game, setGame] = React.useState<?Game>(null);

  const loadGame = React.useCallback(
    async () => {
      if (!profile || !gameId) return;

      const { id } = profile;
      try {
        const game = await getGame(getAuthorizationHeader, id, gameId);
        setGame(game);
      } catch (err) {
        console.error('Unable to load the game', err);
      }
    },
    [gameId, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      if (open) {
        loadGame();
      }
    },
    [loadGame, open]
  );

  if (!open) return null;

  return (
    <Dialog
      title={<Trans>Your game builds</Trans>}
      onRequestClose={onClose}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/publishing'} />,
      ]}
      cannotBeDismissed={false}
      open={open}
      noMargin
    >
      <Builds
        onBuildsUpdated={forceUpdate}
        authenticatedUser={authenticatedUser}
        game={game}
        onGameUpdated={setGame}
      />
    </Dialog>
  );
};

export default BuildsDialog;

// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import Builds from '.';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { type Game } from '../../Utils/GDevelopServices/Game';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  game: Game,
  open: boolean,
  onClose: () => void,
  onGameUpdated: () => Promise<void>,
|};

const BuildsDialog = ({
  authenticatedUser,
  game,
  open,
  onClose,
  onGameUpdated,
}: Props) => {
  const forceUpdate = useForceUpdate();
  if (!open) return null;

  return (
    <Dialog
      title={<Trans>{game.gameName} builds</Trans>}
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
      onRequestClose={onClose}
      open={open}
    >
      <Builds
        // Force the Dialog repositioning
        onBuildsUpdated={forceUpdate}
        authenticatedUser={authenticatedUser}
        game={game}
        onGameUpdated={onGameUpdated}
      />
    </Dialog>
  );
};

export default BuildsDialog;

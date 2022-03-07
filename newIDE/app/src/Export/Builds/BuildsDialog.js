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
  onGameUpdated: () => void,
  getThumbnailURL: (buildId: string) => ?string,
|};

const BuildsDialog = ({
  authenticatedUser,
  game,
  open,
  onClose,
  onGameUpdated,
  getThumbnailURL,
}: Props) => {
  const forceUpdate = useForceUpdate();
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
        // Force the Dialog repositioning
        onBuildsUpdated={forceUpdate}
        authenticatedUser={authenticatedUser}
        game={game}
        onGameUpdated={onGameUpdated}
        getThumbnailURL={getThumbnailURL}
      />
    </Dialog>
  );
};

export default BuildsDialog;

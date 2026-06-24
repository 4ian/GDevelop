// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

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
  onGameUpdated: (game: Game) => void,
|};

const BuildsDialog = ({
  authenticatedUser,
  game,
  open,
  onClose,
  onGameUpdated,
}: Props): null | React.Node => {
  const forceUpdate = useForceUpdate();
  if (!open) return null;

  return (
    <I18n>
      {({ i18n }) => (
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
            <HelpButton
              key="help"
              helpPagePath={'/publishing'}
              scopeName={i18n._(t`Publishing`)}
            />,
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
      )}
    </I18n>
  );
};

export default BuildsDialog;

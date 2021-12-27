// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import Builds from '.';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

type Props = {|
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  open: boolean,
  onClose: () => void,
|};
type State = {||};

export default class BuildsDialog extends Component<Props, State> {
  _onBuildsUpdated = () => {
    // Force the Dialog repositioning
    this.forceUpdate();
  };

  render() {
    const { open, onClose, authenticatedUser, gameId } = this.props;
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
          onBuildsUpdated={this._onBuildsUpdated}
          authenticatedUser={authenticatedUser}
          gameId={gameId}
        />
      </Dialog>
    );
  }
}

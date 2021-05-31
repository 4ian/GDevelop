// @flow
import type { Node } from 'React';
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import Builds from '.';
import { type UserProfile } from '../../Profile/UserProfileContext';

type Props = {|
  userProfile: UserProfile,
  open: boolean,
  onClose: () => void,
|};
type State = {||};

export default class BuildsDialog extends Component<Props, State> {
  _onBuildsUpdated: () => void = () => {
    // Force the Dialog repositioning
    this.forceUpdate();
  };

  render(): null | Node {
    const { open, onClose, userProfile } = this.props;
    if (!open) return null;

    return (
      <Dialog
        title={<Trans>All your builds</Trans>}
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
          userProfile={userProfile}
        />
      </Dialog>
    );
  }
}

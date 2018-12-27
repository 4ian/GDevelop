// @flow
import React, { Component } from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import Builds from '.';

type Props = {|
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
    const { open, onClose } = this.props;
    if (!open) return null;

    return (
      <Dialog
        title="All your builds"
        onRequestClose={onClose}
        actions={[
          <FlatButton
            label="Close"
            key="close"
            primary={false}
            onClick={onClose}
          />,
        ]}
        secondaryActions={[
          <HelpButton key="help" helpPagePath={'/publishing'} />,
        ]}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        <Builds onBuildsUpdated={this._onBuildsUpdated} />
      </Dialog>
    );
  }
}

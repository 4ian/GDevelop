// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ExtensionsSearch from '.';

type Props = {|
  project: gdProject,
  onClose: () => void,
|};

export default class ExtensionsSearchDialog extends Component<Props, {||}> {
  render() {
    const { project, onClose } = this.props;

    return (
      <Dialog
        title={<Trans>Search for New Extensions</Trans>}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary
            onClick={onClose}
          />,
        ]}
        open
        autoScrollBodyContent
        noMargin
        onRequestClose={onClose}
      >
        <ExtensionsSearch
          project={project}
          onNewExtensionInstalled={() => {}}
        />
      </Dialog>
    );
  }
}

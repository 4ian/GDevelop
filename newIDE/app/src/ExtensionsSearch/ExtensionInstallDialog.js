// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { type ExtensionShortHeader } from '../Utils/GDevelopServices/Extension';
import LeftLoader from '../UI/LeftLoader';

type Props = {|
  extensionShortHeader: ExtensionShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall: (type: string, defaultName: string) => void,
|};
type State = {||};

export default class ExtensionInstallDialog extends Component<Props, State> {
  // TODO: Load extension full header
  render() {
    const {
      isInstalling,
      extensionShortHeader,
      onClose,
      onInstall,
    } = this.props;

    return (
      <Dialog
        title={extensionShortHeader.fullName}
        actions={[
          <FlatButton
            key="close"
            label={<Trans>Back</Trans>}
            primary={false}
            onClick={onClose}
            disabled={isInstalling}
          />,
          <LeftLoader isLoading={isInstalling}>
            <FlatButton
              key="install"
              label={<Trans>Install in project</Trans>}
              primary
              onClick={onInstall}
              disabled={isInstalling}
            />
          </LeftLoader>,
        ]}
        open
        autoScrollBodyContent
        onRequestClose={onClose}
      >
        {extensionShortHeader.shortDescription}
        TODO: Display full description
      </Dialog>
    );
  }
}

// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
  getExtensionHeader,
} from '../Utils/GDevelopServices/Extension';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { MarkdownText } from '../UI/MarkdownText';
import Text from '../UI/Text';

type Props = {|
  extensionShortHeader: ExtensionShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall: () => void,
  alreadyInstalled: boolean,
|};
type State = {|
  extensionHeader: ?ExtensionHeader,
  error: ?Error,
|};

export default class ExtensionInstallDialog extends Component<Props, State> {
  state = {
    extensionHeader: null,
    error: null,
  };

  componentDidMount() {
    this._loadExtensionheader();
  }

  _loadExtensionheader = () => {
    this.setState({
      error: null,
    });
    getExtensionHeader(this.props.extensionShortHeader).then(
      extensionHeader => {
        this.setState({
          extensionHeader,
        });
      },
      error => {
        this.setState({
          error,
        });
      }
    );
  };

  render() {
    const {
      isInstalling,
      extensionShortHeader,
      onClose,
      onInstall,
      alreadyInstalled,
    } = this.props;
    const { extensionHeader, error } = this.state;

    return (
      <Dialog
        title={
          extensionHeader
            ? extensionHeader.fullName
            : extensionShortHeader.fullName
        }
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
              label={
                alreadyInstalled ? (
                  <Trans>Re-install/update</Trans>
                ) : (
                  <Trans>Install in project</Trans>
                )
              }
              primary
              onClick={onInstall}
              disabled={isInstalling}
            />
          </LeftLoader>,
        ]}
        open
        onRequestClose={onClose}
      >
        {!extensionHeader ? (
          <Text>{extensionShortHeader.shortDescription}</Text>
        ) : (
          <MarkdownText source={extensionHeader.description} isStandaloneText />
        )}
        {!extensionHeader && !error && <PlaceholderLoader />}
        {!extensionHeader && error && (
          <PlaceholderError onRetry={this._loadExtensionheader}>
            <Trans>
              Can't load the extension registry. Verify your internet connection
              or try again later.
            </Trans>
          </PlaceholderError>
        )}
      </Dialog>
    );
  }
}

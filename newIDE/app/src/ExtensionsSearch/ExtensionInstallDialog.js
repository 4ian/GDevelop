// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
  getExtensionHeader,
  isCompatibleWithExtension,
} from '../Utils/GDevelopServices/Extension';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { MarkdownText } from '../UI/MarkdownText';
import Text from '../UI/Text';
import AlertMessage from '../UI/AlertMessage';
import { getIDEVersion } from '../Version';

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

    const isCompatible = isCompatibleWithExtension(
      getIDEVersion(),
      extensionShortHeader
    );

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
                !isCompatible ? (
                  <Trans>Not compatible</Trans>
                ) : alreadyInstalled ? (
                  <Trans>Re-install/update</Trans>
                ) : (
                  <Trans>Install in project</Trans>
                )
              }
              primary
              onClick={onInstall}
              disabled={isInstalling || !isCompatible}
            />
          </LeftLoader>,
        ]}
        cannotBeDismissed={false}
        open
        onRequestClose={onClose}
      >
        {!isCompatible && (
          <AlertMessage kind="error">
            <Trans>
              Unfortunately, this extension requires a newer version of GDevelop
              to work. Upgrade GDevelop to be able to use this extension in your
              project.
            </Trans>
          </AlertMessage>
        )}
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

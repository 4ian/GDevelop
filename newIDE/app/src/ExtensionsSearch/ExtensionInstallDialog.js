// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {
  type ExtensionShortHeader,
  type ExtensionHeader,
  getExtensionHeader,
} from '../Utils/GDevelopServices/Extension';
import LeftLoader from '../UI/LeftLoader';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import ThemeConsumer from '../UI/Theme/ThemeConsumer';
import ReactMarkdown from 'react-markdown';

type Props = {|
  extensionShortHeader: ExtensionShortHeader,
  isInstalling: boolean,
  onClose: () => void,
  onInstall: (type: string, defaultName: string) => void,
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
    } = this.props;
    const { extensionHeader, error } = this.state;

    return (
      <ThemeConsumer>
        {muiTheme => (
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
            {!extensionHeader ? (
              extensionShortHeader.shortDescription
            ) : (
              <ReactMarkdown
                escapeHtml
                source={extensionHeader.description}
                className={muiTheme.markdownRootClassName}
              />
            )}
            {!extensionHeader && !error && <PlaceholderLoader />}
            {!extensionHeader && error && (
              <PlaceholderError onRetry={this._loadExtensionheader}>
                <Trans>
                  Can't load the extension registry. Verify your internet
                  connection or try again later.
                </Trans>
              </PlaceholderError>
            )}
          </Dialog>
        )}
      </ThemeConsumer>
    );
  }
}

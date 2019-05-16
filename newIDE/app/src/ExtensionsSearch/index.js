// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type ExtensionShortHeader,
  type SerializedExtension,
  getExtension,
} from '../Utils/GDevelopServices/Extension';
import { List, ListItem } from 'material-ui/List';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ExtensionInstallDialog from './ExtensionInstallDialog';
import { unserializeFromJSObject } from '../Utils/Serializer';
import { showErrorBox } from '../UI/Messages/MessageBox';

type Props = {|
  project: gdProject,
  onNewExtensionInstalled: () => void,
|};
type State = {|
  isInstalling: boolean,
  selectedExtensionShortHeader: ?ExtensionShortHeader,
  searchText: string,
  extensionsRegistry: ?ExtensionsRegistry,
|};

// TODO: Factor this?
const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

const addSerializedExtensionToProject = (
  project: gdProject,
  serializedExtension: SerializedExtension
) => {
  const newEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
    serializedExtension.name,
    0
  );

  unserializeFromJSObject(
    newEventsFunctionsExtension,
    serializedExtension,
    'unserializeFrom',
    project
  );
  // TODO: Refresh project extensions
};

export default class ExtensionsSearch extends Component<Props, State> {
  state = {
    isInstalling: false,
    extensionsRegistry: null,
    selectedExtensionShortHeader: null,
    searchText: '',
  };
  _searchBar = React.createRef<SearchBar>();

  componentDidMount() {
    getExtensionsRegistry().then(
      extensionsRegistry => {
        this.setState({
          extensionsRegistry,
        });
      },
      error => {
        // handle error
      }
    );

    // TODO: move this to componentDidUpdate
    setTimeout(() => {
      if (this._searchBar.current) this._searchBar.current.focus();
    }, 20 /* Be sure that the search bar is shown */);
  }

  _install = (i18n: I18nType, extensionShortHeader: ExtensionShortHeader) => {
    const { project } = this.props;

    this.setState({
      isInstalling: true,
    });
    getExtension(extensionShortHeader)
      .then(
        serializedExtension => {
          addSerializedExtensionToProject(project, serializedExtension);
          this.setState({
            selectedExtensionShortHeader: null,
          });
          // TODO: Display newly added behaviors
          // Use context to get functions to reload extensions.
          this.props.onNewExtensionInstalled();
        },
        err => {
          // handle error
          showErrorBox(
            i18n._(
              t`Unable to load the extension. Verify that your internet connection is up, and try again later.`
            ),
            err
          );
        }
      )
      .then(() => {
        this.setState({
          isInstalling: false,
        });
      });
  };

  render() {
    const { project } = this.props;
    const {
      selectedExtensionShortHeader,
      extensionsRegistry,
      searchText,
      isInstalling,
    } = this.state;

    return (
      <I18n>
        {({ i18n }) => (
          <React.Fragment>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {
                //TODO: filtering
              }}
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              ref={this._searchBar}
            />
            <List>
              {!extensionsRegistry && <PlaceholderLoader />}
              {!!extensionsRegistry &&
                extensionsRegistry.extensionShortHeaders.map(
                  extensionShortHeader => {
                    const alreadyInstalled = project.hasEventsFunctionsExtensionNamed(
                      extensionShortHeader.name
                    );
                    const disabled = alreadyInstalled;

                    return (
                      <ListItem
                        key={extensionShortHeader.name}
                        primaryText={
                          <span>
                            {extensionShortHeader.fullName}{' '}
                            {alreadyInstalled && (
                              <Trans> (already installed)</Trans>
                            )}
                          </span>
                        }
                        secondaryText={
                          <p>{extensionShortHeader.shortDescription}</p>
                        }
                        secondaryTextLines={2}
                        onClick={() =>
                          this.setState({
                            selectedExtensionShortHeader: extensionShortHeader,
                          })
                        }
                        style={disabled ? styles.disabledItem : undefined}
                        disabled={disabled}
                      />
                    );
                  }
                )
              //TODO: Button to create a new extension
              }
            </List>
            {!!selectedExtensionShortHeader && (
              <ExtensionInstallDialog
                isInstalling={isInstalling}
                extensionShortHeader={selectedExtensionShortHeader}
                onInstall={() =>
                  this._install(i18n, selectedExtensionShortHeader)
                }
                onClose={() =>
                  this.setState({
                    selectedExtensionShortHeader: null,
                  })
                }
              />
            )}
          </React.Fragment>
        )}
      </I18n>
    );
  }
}

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
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import PlaceholderError from '../UI/PlaceholderError';
import EmptyMessage from '../UI/EmptyMessage';

/**
 * Add a serialized (JS object) events function extension to the project,
 * triggering reload of extensions.
 */
export const addSerializedExtensionToProject = (
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  project: gdProject,
  serializedExtension: SerializedExtension
): Promise<void> => {
  const { name } = serializedExtension;
  if (!name)
    return Promise.reject(new Error('Malformed extension (missing name).'));

  const newEventsFunctionsExtension = project.hasEventsFunctionsExtensionNamed(
    name
  )
    ? project.getEventsFunctionsExtension(name)
    : project.insertNewEventsFunctionsExtension(name, 0);

  unserializeFromJSObject(
    newEventsFunctionsExtension,
    serializedExtension,
    'unserializeFrom',
    project
  );

  return eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
    project
  );
};

type Props = {|
  project: gdProject,
  onNewExtensionInstalled: () => void,
|};

type State = {|
  isInstalling: boolean,
  selectedExtensionShortHeader: ?ExtensionShortHeader,
  searchText: string,
  extensionsRegistry: ?ExtensionsRegistry,
  error: ?Error,
|};

type FilteringOptions = {|
  searchText: string,
|};

// TODO: Factor this?
const styles = {
  icon: { width: 40, height: 40 },
  disabledItem: { opacity: 0.6 },
};

const filterExtensionShortHeaders = (
  extensionShortHeaders: Array<ExtensionShortHeader>,
  { searchText }: FilteringOptions
): Array<ExtensionShortHeader> => {
  if (!searchText) return extensionShortHeaders;

  return extensionShortHeaders.filter(
    ({ name, shortDescription }) =>
      name.indexOf(searchText) !== -1 ||
      shortDescription.indexOf(searchText) !== -1
  );
};

const MAX_DISPLAYED_RESULTS = 20;

/**
 * Display a list of extensions that the user can search in.
 * Can be used as is, or in a dialog (see ExtensionsSearchDialog).
 */
export default class ExtensionsSearch extends Component<Props, State> {
  state = {
    isInstalling: false,
    extensionsRegistry: null,
    selectedExtensionShortHeader: null,
    searchText: '',
    error: null,
  };
  _searchBar = React.createRef<SearchBar>();

  componentDidMount() {
    this._loadExtensionsRegistry();
  }

  _loadExtensionsRegistry = () => {
    this.setState({
      error: null,
    });
    getExtensionsRegistry().then(
      extensionsRegistry => {
        this.setState({
          extensionsRegistry,
        });
      },
      error => {
        this.setState({
          error,
        });
      }
    );
  };

  _install = (
    i18n: I18nType,
    eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
    extensionShortHeader: ExtensionShortHeader
  ) => {
    const { project } = this.props;

    this.setState({
      isInstalling: true,
    });
    getExtension(extensionShortHeader)
      .then(
        serializedExtension => {
          return addSerializedExtensionToProject(
            eventsFunctionsExtensionsState,
            project,
            serializedExtension
          ).then(() => {
            this.setState(
              {
                selectedExtensionShortHeader: null,
              },
              () => this.props.onNewExtensionInstalled()
            );
          });
        },
        err => {
          showErrorBox(
            i18n._(
              t`Unable to download and install the extension. Verify that your internet connection is working or try again later.`
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
      error,
    } = this.state;

    const extensionShortHeaders = extensionsRegistry
      ? filterExtensionShortHeaders(extensionsRegistry.extensionShortHeaders, {
          searchText,
        })
      : [];

    return (
      <I18n>
        {({ i18n }) => (
          <EventsFunctionsExtensionsContext.Consumer>
            {eventsFunctionsExtensionsState => (
              <React.Fragment>
                <SearchBar
                  value={searchText}
                  onRequestSearch={() => {
                    if (extensionShortHeaders.length) {
                      this.setState({
                        selectedExtensionShortHeader: extensionShortHeaders[0],
                      });
                    }
                  }}
                  onChange={searchText =>
                    this.setState({
                      searchText,
                    })
                  }
                  ref={this._searchBar}
                />
                <List>
                  {!extensionsRegistry && !error && <PlaceholderLoader />}
                  {!!extensionsRegistry &&
                    extensionShortHeaders
                      .slice(0, MAX_DISPLAYED_RESULTS)
                      .map(extensionShortHeader => {
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
                      })}
                  {!!extensionsRegistry &&
                    extensionShortHeaders.length > MAX_DISPLAYED_RESULTS && (
                      <EmptyMessage>
                        <Trans>
                          There are other results not displayed. Enter more
                          precise search criteria to find other extensions.
                        </Trans>
                      </EmptyMessage>
                    )}
                  {!extensionsRegistry && error && (
                    <PlaceholderError onRetry={this._loadExtensionsRegistry}>
                      <Trans>
                        Can't load the extension registry. Verify your internet
                        connection or try again later.
                      </Trans>
                    </PlaceholderError>
                  )}
                </List>
                {!!selectedExtensionShortHeader && (
                  <ExtensionInstallDialog
                    isInstalling={isInstalling}
                    extensionShortHeader={selectedExtensionShortHeader}
                    onInstall={() =>
                      this._install(
                        i18n,
                        eventsFunctionsExtensionsState,
                        selectedExtensionShortHeader
                      )
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
          </EventsFunctionsExtensionsContext.Consumer>
        )}
      </I18n>
    );
  }
}

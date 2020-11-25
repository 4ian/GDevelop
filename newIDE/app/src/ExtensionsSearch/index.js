// @flow
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type ExtensionShortHeader,
  getExtension,
} from '../Utils/GDevelopServices/Extension';
import { List, ListItem } from '../UI/List';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import ExtensionInstallDialog from './ExtensionInstallDialog';
import { showErrorBox } from '../UI/Messages/MessageBox';
import EventsFunctionsExtensionsContext, {
  type EventsFunctionsExtensionsState,
} from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import PlaceholderError from '../UI/PlaceholderError';
import EmptyMessage from '../UI/EmptyMessage';
import SearchbarWithChips from '../UI/SearchbarWithChips';
import ListIcon from '../UI/ListIcon';
import { addSerializedExtensionsToProject } from '../AssetStore/InstallAsset';

type Props = {|
  project: gdProject,
  showOnlyWithBehaviors: boolean,
  onNewExtensionInstalled: () => void,
  onRegistryLoaded?: () => void,
|};

type State = {|
  isInstalling: boolean,
  selectedExtensionShortHeader: ?ExtensionShortHeader,
  searchText: string,
  chosenTag: string,
  extensionsRegistry: ?ExtensionsRegistry,
  error: ?Error,
|};

type FilteringOptions = {|
  searchText: string,
  chosenTag: string,
  showOnlyWithBehaviors: boolean,
|};

const filterExtensionShortHeaders = (
  extensionShortHeaders: Array<ExtensionShortHeader>,
  { searchText, chosenTag, showOnlyWithBehaviors }: FilteringOptions
): Array<ExtensionShortHeader> => {
  const behaviorsFilteredHeaders = extensionShortHeaders.filter(
    ({ eventsBasedBehaviorsCount }) =>
      !showOnlyWithBehaviors || eventsBasedBehaviorsCount > 0
  );

  if (!searchText && !chosenTag) return behaviorsFilteredHeaders;

  const lowercaseSearchText = searchText.toLowerCase();
  return behaviorsFilteredHeaders
    .filter(({ tags }) => !chosenTag || tags.indexOf(chosenTag) !== -1)
    .filter(
      ({ name, shortDescription }) =>
        !searchText ||
        (name.toLowerCase().indexOf(lowercaseSearchText) !== -1 ||
          shortDescription.toLowerCase().indexOf(lowercaseSearchText) !== -1)
    );
};

const MAX_DISPLAYED_RESULTS = 40;

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
    chosenTag: '',
  };

  componentDidMount() {
    this._loadExtensionsRegistry();
  }

  _loadExtensionsRegistry = () => {
    this.setState({
      error: null,
    });
    getExtensionsRegistry().then(
      extensionsRegistry => {
        this.setState(
          {
            extensionsRegistry,
          },
          () => {
            if (this.props.onRegistryLoaded) {
              this.props.onRegistryLoaded();
            }
          }
        );
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
          return addSerializedExtensionsToProject(
            eventsFunctionsExtensionsState,
            project,
            [serializedExtension]
          ).then(() => {
            this.setState(
              {
                selectedExtensionShortHeader: null,
              },
              () => this.props.onNewExtensionInstalled()
            );
          });
        },
        rawError => {
          showErrorBox({
            message: i18n._(
              t`Unable to download and install the extension. Verify that your internet connection is working or try again later.`
            ),
            rawError,
            errorId: 'download-extension-error',
          });
        }
      )
      .then(() => {
        this.setState({
          isInstalling: false,
        });
      });
  };

  render() {
    const { project, showOnlyWithBehaviors } = this.props;
    const {
      selectedExtensionShortHeader,
      extensionsRegistry,
      searchText,
      isInstalling,
      error,
      chosenTag,
    } = this.state;

    const extensionShortHeaders = extensionsRegistry
      ? filterExtensionShortHeaders(extensionsRegistry.extensionShortHeaders, {
          searchText,
          chosenTag,
          showOnlyWithBehaviors,
        })
      : [];

    return (
      <I18n>
        {({ i18n }) => (
          <EventsFunctionsExtensionsContext.Consumer>
            {eventsFunctionsExtensionsState => (
              <React.Fragment>
                <SearchbarWithChips
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
                  chips={
                    !!extensionsRegistry
                      ? extensionsRegistry.allTags.map(tag => ({
                          text: tag,
                          value: tag,
                        }))
                      : null
                  }
                  chosenChip={chosenTag}
                  onChooseChip={chosenTag =>
                    this.setState({
                      chosenTag,
                    })
                  }
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

                        return (
                          <ListItem
                            leftIcon={
                              <ListIcon
                                useExactIconSize
                                iconSize={40}
                                src={extensionShortHeader.previewIconUrl}
                              />
                            }
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
                              extensionShortHeader.shortDescription
                            }
                            secondaryTextLines={2}
                            onClick={() =>
                              this.setState({
                                selectedExtensionShortHeader: extensionShortHeader,
                              })
                            }
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
                    alreadyInstalled={project.hasEventsFunctionsExtensionNamed(
                      selectedExtensionShortHeader.name
                    )}
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

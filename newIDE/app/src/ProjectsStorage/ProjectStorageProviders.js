// @flow
import * as React from 'react';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '.';
import { type AppArguments } from '../Utils/Window';

/**
 * An empty StorageProvider doing nothing.
 */
const emptyStorageProvider: StorageProvider = {
  internalName: 'Empty',
  name: 'No storage',
  createOperations: () => ({
    onOpenWithPicker: () => Promise.reject('No storage provider set up'),
    onOpen: () => Promise.reject('No storage provider set up'),
    hasAutoSave: () => Promise.resolve(false),
    onSaveProject: (project: gdProject) =>
      Promise.reject('No storage provider set up'),
    onSaveProjectAs: (project: gdProject) =>
      Promise.reject('No storage provider set up'),
    onAutoSaveProject: (project: gdProject) => Promise.resolve(),
  }),
};

type Props = {|
  appArguments: AppArguments,
  storageProviders: Array<StorageProvider>,
  defaultStorageProvider?: StorageProvider,
  children: ({
    storageProviders: Array<StorageProvider>,
    getStorageProviderOperations: (
      newStorageProvider: ?StorageProvider
    ) => Promise<StorageProviderOperations>,
    initialFileMetadataToOpen: ?FileMetadata,
    getStorageProvider: () => StorageProvider,
  }) => React.Node,
|};

type InitialStorageProviderAndFileMetadata = {|
  currentStorageProvider: ?StorageProvider,
  initialFileMetadataToOpen: ?FileMetadata,
|};

type State = {|
  ...InitialStorageProviderAndFileMetadata,
  storageProviderOperations: ?StorageProviderOperations,
  renderDialog: ?() => React.Node,
|};

const computeInitialFileMetadataToOpen = (
  defaultStorageProvider: ?StorageProvider,
  storageProviders: Array<StorageProvider>,
  appArguments: AppArguments
): InitialStorageProviderAndFileMetadata => {
  const candidates = storageProviders
    .map((currentStorageProvider) => {
      return {
        currentStorageProvider,
        initialFileMetadataToOpen:
          currentStorageProvider.getFileMetadataFromAppArguments
            ? currentStorageProvider.getFileMetadataFromAppArguments(
                appArguments
              )
            : null,
      };
    })
    .filter(({ initialFileMetadataToOpen }) => !!initialFileMetadataToOpen);

  if (candidates.length === 0)
    return {
      currentStorageProvider: defaultStorageProvider,
      initialFileMetadataToOpen: null,
    };

  if (candidates.length > 1) {
    console.warn(
      'More than one storage provider can understand the app arguments. Selecting the first one.'
    );
  }

  return candidates[0];
};

export default class ProjectStorageProviders extends React.Component<
  Props,
  State
> {
  state = {
    ...computeInitialFileMetadataToOpen(
      this.props.defaultStorageProvider,
      this.props.storageProviders,
      this.props.appArguments
    ),
    storageProviderOperations: null,
    renderDialog: null,
  };

  _setDialog = (renderDialog: () => React.Node) => {
    this.setState({
      renderDialog,
    });
  };

  _closeDialog = () => {
    this.setState({
      renderDialog: null,
    });
  };

  _getStorageProviderOperations = (
    storageProvider: ?StorageProvider
  ): Promise<StorageProviderOperations> => {
    // Avoid creating a new storageProviderOperations
    // if we're not changing the storage provider.
    if (
      !storageProvider ||
      storageProvider === this.state.currentStorageProvider
    ) {
      if (this.state.storageProviderOperations) {
        return Promise.resolve(this.state.storageProviderOperations);
      }
    }

    const newStorageProvider: StorageProvider =
      storageProvider ||
      this.state.currentStorageProvider ||
      emptyStorageProvider;
    const storageProviderOperations = newStorageProvider.createOperations({
      setDialog: this._setDialog,
      closeDialog: this._closeDialog,
    });

    return new Promise((resolve) => {
      this.setState(
        {
          currentStorageProvider: newStorageProvider,
          storageProviderOperations,
        },
        () => {
          resolve(storageProviderOperations);
        }
      );
    });
  };

  _getStorageProvider = () => {
    return this.state.currentStorageProvider || emptyStorageProvider;
  };

  render() {
    const { children, storageProviders } = this.props;
    const { renderDialog, initialFileMetadataToOpen } = this.state;

    return (
      <React.Fragment>
        {children({
          storageProviders,
          getStorageProviderOperations: this._getStorageProviderOperations,
          initialFileMetadataToOpen,
          getStorageProvider: this._getStorageProvider,
        })}
        {renderDialog && renderDialog()}
      </React.Fragment>
    );
  }
}

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
  name: 'No storage',
  createOperations: () => ({
    onOpenWithPicker: () => Promise.reject('No storage provider set up'),
    onOpen: () => Promise.reject('No storage provider set up'),
    hasAutoSave: () => Promise.resolve(false),
    onSaveProject: (project: gdProject) =>
      Promise.reject('No storage provider set up'),
    onSaveProjectAs: (project: gdProject) =>
      Promise.reject('No storage provider set up'),
    onAutoSaveProject: (project: gdProject) => {},
  }),
};

type Props = {|
  appArguments: AppArguments,
  storageProviders: Array<StorageProvider>,
  defaultStorageProvider?: StorageProvider,
  children: ({
    currentStorageProviderOperations: StorageProviderOperations,
    storageProviders: Array<StorageProvider>,
    useStorageProvider: (newStorageProvider: ?StorageProvider) => Promise<void>,
    initialFileMetadataToOpen: ?FileMetadata,
  }) => React.Node,
|};

type InitialStorageProviderAndFileMetadata = {|
  currentStorageProvider: ?StorageProvider,
  initialFileMetadataToOpen: ?FileMetadata,
|};

type State = {|
  ...InitialStorageProviderAndFileMetadata,
  renderDialog: ?() => React.Node,
|};

const computeInitialFileMetadataToOpen = (
  defaultStorageProvider: ?StorageProvider,
  storageProviders: Array<StorageProvider>,
  appArguments: AppArguments
): InitialStorageProviderAndFileMetadata => {
  const candidates = storageProviders
    .map(currentStorageProvider => {
      return {
        currentStorageProvider,
        initialFileMetadataToOpen: currentStorageProvider.getFileMetadataFromAppArguments
          ? currentStorageProvider.getFileMetadataFromAppArguments(appArguments)
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
      this.props.appArguments),
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

  _useStorageProvider = (storageProvider: ?StorageProvider): Promise<void> => {
    if (!storageProvider) return Promise.resolve();

    return new Promise(resolve => {
      this.setState(
        {
          currentStorageProvider: storageProvider,
        },
        () => {
          resolve();
        }
      );
    });
  };

  render() {
    const { children, storageProviders } = this.props;
    const { renderDialog, initialFileMetadataToOpen } = this.state;
    const currentStorageProvider =
      this.state.currentStorageProvider || emptyStorageProvider;

    return (
      <React.Fragment>
        {children({
          currentStorageProviderOperations: currentStorageProvider.createOperations(
            {
              setDialog: this._setDialog,
              closeDialog: this._closeDialog,
            }
          ),
          storageProviders,
          useStorageProvider: this._useStorageProvider,
          initialFileMetadataToOpen,
        })}
        {renderDialog && renderDialog()}
      </React.Fragment>
    );
  }
}

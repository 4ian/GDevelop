// @flow
import * as React from 'react';
import { type StorageProvider, type StorageProviderOperations } from '.';

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
  storageProviders: Array<StorageProvider>,
  defaultStorageProvider?: StorageProvider,
  children: ({
    currentStorageProviderOperations: StorageProviderOperations,
    storageProviders: Array<StorageProvider>,
    useStorageProvider: (newStorageProvider: ?StorageProvider) => Promise<void>,
  }) => React.Node,
|};

type State = {|
  currentStorageProvider: ?StorageProvider,
  renderDialog: ?() => React.Node,
|};

export default class ProjectStorageProviders extends React.Component<
  Props,
  State
> {
  state = {
    currentStorageProvider: this.props.defaultStorageProvider,
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
    const { renderDialog } = this.state;
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
        })}
        {renderDialog && renderDialog()}
      </React.Fragment>
    );
  }
}

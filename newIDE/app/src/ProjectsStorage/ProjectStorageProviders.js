// @flow
import * as React from 'react';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '.';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
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
    ) => StorageProviderOperations,
    initialFileMetadataToOpen: ?FileMetadata,
    getStorageProvider: () => StorageProvider,
  }) => React.Node,
|};

type InitialStorageProviderAndFileMetadata = {|
  currentStorageProvider: ?StorageProvider,
  initialFileMetadataToOpen: ?FileMetadata,
|};

const computeDefaultConfiguration = (
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

const ProjectStorageProviders = (props: Props) => {
  const storageProviderOperations = React.useRef<?StorageProviderOperations>(
    null
  );
  const [renderDialog, setRenderDialog] = React.useState<?() => React.Node>(
    null
  );
  const defaultConfiguration = computeDefaultConfiguration(
    props.defaultStorageProvider,
    props.storageProviders,
    props.appArguments
  );
  const currentStorageProvider = React.useRef<?StorageProvider>(
    defaultConfiguration.currentStorageProvider
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const setDialog = (_renderDialog: () => React.Node) => {
    setRenderDialog(_renderDialog);
  };

  const closeDialog = () => {
    setRenderDialog(null);
  };

  const getStorageProviderOperations = (
    newStorageProvider: ?StorageProvider
  ): StorageProviderOperations => {
    // Avoid creating a new storageProviderOperations
    // if we're not changing the storage provider.
    if (
      !newStorageProvider ||
      newStorageProvider === currentStorageProvider.current
    ) {
      if (storageProviderOperations.current) {
        return storageProviderOperations.current;
      }
    }

    const storageProviderToUse: StorageProvider =
      newStorageProvider ||
      currentStorageProvider.current ||
      emptyStorageProvider;
    const storageProviderOperationsToUse = storageProviderToUse.createOperations(
      {
        setDialog,
        closeDialog,
        authenticatedUser,
      }
    );
    currentStorageProvider.current = storageProviderToUse;
    storageProviderOperations.current = storageProviderOperationsToUse;

    return storageProviderOperationsToUse;
  };

  const getStorageProvider = () => {
    return currentStorageProvider.current || emptyStorageProvider;
  };

  React.useEffect(
    () => {
      const { current: storageProvider } = currentStorageProvider;
      if (!storageProvider) return;
      console.log('recreating operations');
      storageProviderOperations.current = storageProvider.createOperations({
        setDialog,
        closeDialog,
        authenticatedUser,
      });
    },
    [authenticatedUser]
  );

  return (
    <React.Fragment>
      {props.children({
        storageProviders: props.storageProviders,
        getStorageProviderOperations,
        initialFileMetadataToOpen:
          defaultConfiguration.initialFileMetadataToOpen,
        getStorageProvider,
      })}
      {renderDialog && renderDialog()}
    </React.Fragment>
  );
};

export default ProjectStorageProviders;

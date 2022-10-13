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
 * Use only for tests or for case where no storage provider was set
 * (this is a "null object").
 */
export const emptyStorageProvider: StorageProvider = {
  internalName: 'Empty',
  name: 'No storage',
  createOperations: () => ({
    onOpenWithPicker: () => Promise.reject('No storage provider set up'),
    onOpen: () => Promise.reject('No storage provider set up'),
    hasAutoSave: () => Promise.resolve(false),
    onSaveProject: (project: gdProject) =>
      Promise.reject('No storage provider set up'),
    onChooseSaveProjectAsLocation: (project: gdProject) =>
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
      newStorageProvider?: ?StorageProvider
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
    setRenderDialog((): (() => React.Node) => _renderDialog);
  };

  const closeDialog = () => {
    setRenderDialog(null);
  };

  const getStorageProviderOperations = (
    newStorageProvider?: ?StorageProvider
  ): StorageProviderOperations => {
    if (!newStorageProvider) {
      if (!storageProviderOperations.current) {
        currentStorageProvider.current = emptyStorageProvider;
        storageProviderOperations.current = emptyStorageProvider.createOperations(
          {
            setDialog,
            closeDialog,
            authenticatedUser,
          }
        );
      }
      return storageProviderOperations.current;
    }

    // Avoid creating a new storageProviderOperations
    // if we're not changing the storage provider.
    if (
      newStorageProvider === currentStorageProvider.current &&
      storageProviderOperations.current
    ) {
      return storageProviderOperations.current;
    }

    const storageProviderOperationsToUse = newStorageProvider.createOperations({
      setDialog,
      closeDialog,
      authenticatedUser,
    });

    // If the storage provider is unable to open a project, we won't keep it, we just
    // return it for a one time usage (example: DownloadFileStorageProvider).
    const keepForNextOperations = !!storageProviderOperationsToUse.onOpen;
    if (keepForNextOperations) {
      currentStorageProvider.current = newStorageProvider;
      storageProviderOperations.current = storageProviderOperationsToUse;
    }

    return storageProviderOperationsToUse;
  };

  const getStorageProvider = () => {
    return currentStorageProvider.current || emptyStorageProvider;
  };

  // Some storage providers might need the current authenticated user
  // to create their operations. This effect makes sure operations are always
  // up to date with the current authenticated user.
  React.useEffect(
    () => {
      const { current: storageProvider } = currentStorageProvider;
      if (!storageProvider) return;
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

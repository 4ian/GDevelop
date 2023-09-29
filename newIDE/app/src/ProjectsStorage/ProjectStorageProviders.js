// @flow
import * as React from 'react';
import {
  type StorageProvider,
  type StorageProviderOperations,
  type FileMetadata,
} from '.';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type AppArguments } from '../Utils/Window';
import { type ResourcesActionsMenuBuilder } from '.';

/**
 * An empty StorageProvider doing nothing.
 * Use only for tests or for case where no storage provider was set
 * (this is a "null object").
 */
export const emptyStorageProvider: StorageProvider = {
  internalName: 'Empty',
  name: 'No storage',
  createOperations: () => ({}),
};

type Props = {|
  appArguments: AppArguments,
  storageProviders: Array<StorageProvider>,
  defaultStorageProvider?: StorageProvider,
  children: ({
    storageProviders: Array<StorageProvider>,
    getStorageProviderResourceOperations: () => ?ResourcesActionsMenuBuilder,
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
  const storageProviderResourceOperations = React.useRef<?ResourcesActionsMenuBuilder>(
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

  /** Wrapper around setRenderDialog to allow passing a function without confusing React. */
  const setDialog = React.useCallback(
    (_renderDialog: () => React.Node) => {
      setRenderDialog((): (() => React.Node) => _renderDialog);
    },
    [setRenderDialog]
  );

  /** Wrapper around setRenderDialog to close the dialog. */
  const closeDialog = React.useCallback(() => {
    setRenderDialog(null);
  }, []);

  const getStorageProviderOperations = React.useCallback(
    (newStorageProvider?: ?StorageProvider): StorageProviderOperations => {
      if (!newStorageProvider) {
        if (!storageProviderOperations.current) {
          currentStorageProvider.current = emptyStorageProvider;
          storageProviderResourceOperations.current = null;
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

      const storageProviderOperationsToUse = newStorageProvider.createOperations(
        {
          setDialog,
          closeDialog,
          authenticatedUser,
        }
      );

      // If the storage provider is unable to open a project, we won't keep it, we just
      // return it for a one time usage (example: DownloadFileStorageProvider).
      const keepForNextOperations = !!storageProviderOperationsToUse.onOpen;
      if (keepForNextOperations) {
        currentStorageProvider.current = newStorageProvider;
        storageProviderOperations.current = storageProviderOperationsToUse;
        storageProviderResourceOperations.current = newStorageProvider.createResourceOperations
          ? newStorageProvider.createResourceOperations({ authenticatedUser })
          : null;
      }

      return storageProviderOperationsToUse;
    },
    [authenticatedUser, setDialog, closeDialog]
  );

  const getStorageProvider = React.useCallback(() => {
    return currentStorageProvider.current || emptyStorageProvider;
  }, []);

  const getStorageProviderResourceOperations = React.useCallback(() => {
    return storageProviderResourceOperations.current;
  }, []);

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
      storageProviderResourceOperations.current = storageProvider.createResourceOperations
        ? storageProvider.createResourceOperations({ authenticatedUser })
        : null;
    },
    [authenticatedUser, setDialog, closeDialog]
  );

  return (
    <React.Fragment>
      {props.children({
        storageProviders: props.storageProviders,
        getStorageProviderOperations,
        initialFileMetadataToOpen:
          defaultConfiguration.initialFileMetadataToOpen,
        getStorageProvider,
        getStorageProviderResourceOperations,
      })}
      {renderDialog && renderDialog()}
    </React.Fragment>
  );
};

export default ProjectStorageProviders;

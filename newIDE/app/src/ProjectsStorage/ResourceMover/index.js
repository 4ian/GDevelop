// @flow
import { type StorageProviderOperations, type StorageProvider } from '../index';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';

export type MoveAllProjectResourcesOptions = {|
  project: gdProject,
  oldFileMetadata: FileMetadata,
  oldStorageProvider: StorageProvider,
  oldStorageProviderOperations: StorageProviderOperations,
  newFileMetadata: FileMetadata,
  newStorageProvider: StorageProvider,
  newStorageProviderOperations: StorageProviderOperations,
  authenticatedUser: AuthenticatedUser,
  onProgress: (number, number) => void,
|};

export type MoveAllProjectResourcesResult = {|
  erroredResources: Array<{|
    resource: gdResource,
    error: Error,
  |}>,
|};

export type MoveAllProjectResourcesFunction = (
  options: MoveAllProjectResourcesOptions
) => Promise<MoveAllProjectResourcesResult>;

export type ResourceMover = {|
  moveAllProjectResources: MoveAllProjectResourcesFunction,
|};

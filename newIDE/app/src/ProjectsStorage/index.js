// @flow
import * as React from 'react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type AppArguments } from '../Utils/Window';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';

/**
 * The data containing the file/url/file identifier to be loaded
 * by a storage provider.
 */
export type FileMetadata = {|
  /** The file id, path or local path according to the provider. */
  fileIdentifier: string,
  lastModifiedDate?: number,
|};

export type FileMetadataAndStorageProviderName = {
  fileMetadata: FileMetadata,
  storageProviderName: string,
};

/**
 * Interface returned by a storage provider to manipulate files.
 */
export type StorageProviderOperations = {|
  // Project opening:
  onOpenWithPicker?: () => Promise<?FileMetadata>,
  onOpen?: (
    fileMetadata: FileMetadata
  ) => Promise<{|
    content: Object,
  |}>,
  getOpenErrorMessage?: (error: Error) => MessageDescriptor,

  // If set to true, opening a project at startup with this storage provider
  // will trigger a confirmation modal (so that a user interaction happen).
  doesInitialOpenRequireUserInteraction?: boolean,

  // Project saving:
  onSaveProject?: (
    project: gdProject,
    fileMetadata: FileMetadata
  ) => Promise<{|
    wasSaved: boolean,
    fileMetadata: FileMetadata,
  |}>,
  onSaveProjectAs?: (
    project: gdProject,
    fileMetadata: ?FileMetadata
  ) => Promise<{|
    wasSaved: boolean,
    fileMetadata: ?FileMetadata,
  |}>,

  // Project properties saving:
  onChangeProjectProperty?: (
    project: gdProject,
    fileMetadata: FileMetadata,
    properties: { name: string } // In order to synchronize project and cloud project names.
  ) => Promise<void>,

  // Project auto saving:
  onAutoSaveProject?: (
    project: gdProject,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  hasAutoSave?: (
    fileMetadata: FileMetadata,
    compareLastModified: boolean
  ) => Promise<boolean>,
  onGetAutoSave?: (fileMetadata: FileMetadata) => Promise<FileMetadata>,
|};

/**
 * A storage provider is a function returning a StorageProviderOperations.
 */
export type StorageProvider = {|
  internalName: string,
  name: MessageDescriptor,
  needUserAuthentication?: boolean,
  hiddenInOpenDialog?: boolean,
  hiddenInSaveDialog?: boolean,
  disabled?: boolean,
  renderIcon?: () => React.Node,
  getFileMetadataFromAppArguments?: AppArguments => ?FileMetadata,
  createOperations: ({
    /** Open a dialog (a render function) */
    setDialog: (() => React.Node) => void,
    /** Close the dialog */
    closeDialog: () => void,
    authenticatedUser: AuthenticatedUser,
  }) => StorageProviderOperations,
|};

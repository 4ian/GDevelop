// @flow
import * as React from 'react';

/**
 * The data containing the file/url/file identifier to be loaded
 * by a storage provider.
 */
export type FileMetadata = {|
  // The file id, path or local path according to the provider
  fileIdentifier: string,
|};

/**
 * Interface returned by a storage provider to manipulate files.
 */
export type StorageProviderOperations = {|
  onOpenWithPicker?: () => Promise<?FileMetadata>,
  onOpen?: (
    fileMetadata: FileMetadata
  ) => Promise<{|
    content: Object,
    fileMetadata: FileMetadata,
  |}>,
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
  onAutoSaveProject?: (project: gdProject, fileMetadata: FileMetadata) => void,
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
  name: string,
  hiddenInOpenDialog?: boolean,
  hiddenInSaveDialog?: boolean,
  disabled?: boolean,
  renderIcon?: () => React.Node,
  createOperations: ({
    /** Open a dialog (a render function) */
    setDialog: (() => React.Node) => void,
    /** Close the dialog */
    closeDialog: () => void,
  }) => StorageProviderOperations,
|};

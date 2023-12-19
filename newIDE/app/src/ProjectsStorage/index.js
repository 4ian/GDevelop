// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type AppArguments } from '../Utils/Window';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  type ShowAlertFunction,
  type ShowConfirmFunction,
} from '../UI/Alert/AlertContext';

/**
 * The data containing the file/url/file identifier to be loaded
 * by a storage provider.
 */
export type FileMetadata = {|
  /** The file id, path or local path according to the provider. */
  fileIdentifier: string,
  /** The version id if the provider supports versioning */
  version?: string,
  lastModifiedDate?: number,
  name?: string,
  gameId?: string,
  /** The user id of the user owning the project if not the authenticated user. */
  ownerId?: string,
|};

/**
 * The data containing the file/url/name of a new location to be saved
 * by a storage provider.
 */
export type SaveAsLocation = {|
  /**
   * The file id, path or local path according to the provider. Might be null if not known
   * or unused (for example, a cloud project uses only a name to identify a new project).
   */
  fileIdentifier?: string,
  /**
   * The name of the file. Might be null if unused
   * (for example, a local file path is stored only in `fileIdentifier`).
   */
  name?: string,
  /**
   * The id of the game. Might be null if no game is published.
   */
  gameId?: string,

  // New fields can be added if a storage provider needs other things to identify
  // a new location where to save a project to.
|};

export type FileMetadataAndStorageProviderName = {
  fileMetadata: FileMetadata,
  storageProviderName: string,
};

export type ResourcesActionsProps = {|
  project: gdProject,
  fileMetadata: FileMetadata,
  resource: gdResource,
  i18n: I18nType,
  informUser: (
    ?{|
      message: React.Node,
      actionLabel?: React.Node,
      onActionClick?: () => void,
    |}
  ) => void,
  updateInterface: () => void,
  cleanUserSelectionOfResources: () => void,
|};

export type ResourcesActionsMenuBuilder = ResourcesActionsProps => Array<MenuItemTemplate>;

/**
 * Interface returned by a storage provider to manipulate files.
 */
export type StorageProviderOperations = {|
  // Project opening:
  onOpenWithPicker?: () => Promise<?FileMetadata>,
  onOpen?: (
    fileMetadata: FileMetadata,
    onProgress?: (progress: number, message: MessageDescriptor) => void
  ) => Promise<{|
    content: Object,
  |}>,
  getOpenErrorMessage?: (error: Error) => MessageDescriptor,
  getWriteErrorMessage?: (error: Error) => MessageDescriptor,

  // If set to true, opening a project at startup with this storage provider
  // will trigger a confirmation modal (so that a user interaction happen).
  doesInitialOpenRequireUserInteraction?: boolean,

  onEnsureCanAccessResources?: (
    project: gdProject,
    fileMetadata: FileMetadata
  ) => Promise<void>,

  // Project saving:
  onSaveProject?: (
    project: gdProject,
    fileMetadata: FileMetadata,
    options?: {| previousVersion?: string, restoredFromVersionId?: string |}
  ) => Promise<{|
    wasSaved: boolean,
    fileMetadata: FileMetadata,
  |}>,
  onChooseSaveProjectAsLocation?: ({|
    project: gdProject,
    fileMetadata: ?FileMetadata, // This is the current location.
  |}) => Promise<{|
    saveAsLocation: ?SaveAsLocation, // This is the newly chosen location (or null if cancelled).
  |}>,
  onSaveProjectAs?: (
    project: gdProject,
    saveAsLocation: ?SaveAsLocation, // This is the new location to save to.
    options: {|
      onStartSaving: () => void,
      onMoveResources: ({|
        newFileMetadata: FileMetadata,
      |}) => Promise<void>,
    |}
  ) => Promise<{|
    wasSaved: boolean,
    /** This is the location where the project was saved, or null if not persisted. */
    fileMetadata: ?FileMetadata,
  |}>,
  canFileMetadataBeSafelySaved?: (
    fileMetadata: FileMetadata,
    actions: {|
      showAlert: ShowAlertFunction,
      showConfirmation: ShowConfirmFunction,
    |}
  ) => Promise<boolean>,
  canFileMetadataBeSafelySavedAs?: (
    fileMetadata: FileMetadata,
    actions: {|
      showAlert: ShowAlertFunction,
      showConfirmation: ShowConfirmFunction,
    |}
  ) => Promise<boolean>,

  // Project properties saving:
  onChangeProjectProperty?: (
    project: gdProject,
    fileMetadata: FileMetadata,
    properties: {| name?: string, gameId?: string |} // In order to synchronize project and cloud project names.
  ) => Promise<null | {| version: string, lastModifiedDate: number |}>,

  // Project auto saving:
  onAutoSaveProject?: (
    project: gdProject,
    fileMetadata: FileMetadata
  ) => Promise<void>,
  getAutoSaveCreationDate?: (
    fileMetadata: FileMetadata,
    compareLastModified: boolean
  ) => Promise<?number>,
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
  renderIcon?: ({| size?: 'small' | 'medium' |}) => React.Node,
  getFileMetadataFromAppArguments?: AppArguments => ?FileMetadata,
  getProjectLocation?: ({|
    projectName: string,
    saveAsLocation: ?SaveAsLocation,
    newProjectsDefaultFolder?: string,
  |}) => SaveAsLocation,
  renderNewProjectSaveAsLocationChooser?: (props: {|
    projectName: string,
    saveAsLocation: ?SaveAsLocation,
    setSaveAsLocation: (?SaveAsLocation) => void,
    newProjectsDefaultFolder?: string,
  |}) => React.Node,
  createOperations: ({|
    /** Open a dialog (a render function) */
    setDialog: (() => React.Node) => void,
    /** Close the dialog */
    closeDialog: () => void,
    authenticatedUser: AuthenticatedUser,
  |}) => StorageProviderOperations,
  createResourceOperations?: ({|
    authenticatedUser: AuthenticatedUser,
  |}) => ResourcesActionsMenuBuilder,
  /** Resources external changes */
  setupResourcesWatcher?: ({|
    fileIdentifier: string,
    callback: ({| identifier: string |}) => void,
    options?: any,
  |}) => () => void,
|};

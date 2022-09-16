// @flow
import * as React from 'react';
import { type UnsavedChanges } from '../UnsavedChangesContext';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import type { StorageProvider } from '../../ProjectsStorage';
import { type PreviewDebuggerServer } from '../../Export/PreviewLauncher.flow';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';

export type EditorContainerExtraProps = {|
  // Events function extension editor
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,

  // Homepage
  storageProviders?: Array<StorageProvider>,
|};

export type RenderEditorContainerProps = {|
  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,

  // Some optional extra props to pass to the rendered editor
  extraEditorProps: ?EditorContainerExtraProps,

  // Resources:
  resourceManagementProps: ResourceManagementProps,

  unsavedChanges: ?UnsavedChanges,

  // Preview:
  setPreviewedLayout: (
    layoutName: ?string,
    externalLayoutName?: ?string
  ) => void,
  previewDebuggerServer: ?PreviewDebuggerServer,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,

  // Opening other editors:
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  onOpenEvents: (sceneName: string) => void,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,

  // Events function management:
  onLoadEventsFunctionsExtensions: () => Promise<void>,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction,
    editorIdentifier:
      | 'scene-events-editor'
      | 'extension-events-editor'
      | 'external-events-editor'
  ) => void,

  // Project opening
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onCreateProject: (?ExampleShortHeader) => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenOnboardingDialog: () => void,
  onChangeSubscription: () => void,
  onOpenProfile: () => void,
  onOpenPreferences: () => void,
  onOpenAbout: () => void,

  // Resources handling
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,

  // Project creation
  onOpenProjectPreCreationDialog: (?ExampleShortHeader) => void,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

// @flow
import * as React from 'react';
import { type UnsavedChanges } from '../UnsavedChangesContext';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource';
import { type PreviewDebuggerServer } from '../../Export/PreviewLauncher.flow';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
  type OnOpenProjectAfterCreationFunction,
} from '../../ProjectCreation/CreateProjectDialog';
import { type FileMetadataAndStorageProviderName } from '../../ProjectsStorage';

export type EditorContainerExtraProps = {|
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,
|};

export type RenderEditorContainerProps = {|
  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,

  // Some optional extra props to pass to the rendered editor
  extraEditorProps: ?EditorContainerExtraProps,

  // Resources:
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,

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
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onCreateProject: () => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onOpenOnboardingDialog: () => void,
  onChangeSubscription: () => void,
  onOpenProfile: () => void,

  // Resources handling
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,

  // Project creation
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onCreateBlank: OnCreateBlankFunction,
  onOpenProjectAfterCreation: OnOpenProjectAfterCreationFunction,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

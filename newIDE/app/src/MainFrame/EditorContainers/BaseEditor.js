// @flow
import * as React from 'react';
import { type PreviewOptions } from '../../Export/PreviewLauncher.flow';
import { type UnsavedChanges } from '../UnsavedChangesContext';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource.flow';
import { type PreviewButtonSettings } from '../Toolbar/PreviewButtons';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';

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
  showNetworkPreviewButton: boolean,
  showPreviewButton: boolean,
  previewButtonSettings: PreviewButtonSettings,
  onLayoutPreview: (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ) => void,
  onExternalLayoutPreview: (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ) => void,

  // Opening other editors:
  onOpenDebugger: () => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,

  // Events function management:
  onLoadEventsFunctionsExtensions: () => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => void,

  // Project opening
  canOpen: boolean,
  onOpen: () => void,
  onCreate: () => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenAboutDialog: () => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onChangeSubscription: () => void,

  // Resources handling
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

export type EditorContainerExtraProps = {|
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,
|};

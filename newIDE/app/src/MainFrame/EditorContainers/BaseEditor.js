// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type PreviewOptions } from '../../Export/PreviewLauncher.flow';
import { type UnsavedChanges } from '../UnsavedChangesContext';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../../ResourcesList/ResourceSource';
import { type PreviewDebuggerServer } from '../../Export/PreviewLauncher.flow';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import { type ResourceExternalEditor } from '../../ResourcesList/ResourceExternalEditor.flow';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import {
  type OnCreateFromExampleShortHeaderFunction,
  type OnCreateBlankFunction,
} from '../../ProjectCreation/CreateProjectDialog';

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
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,

  // Events function management:
  onLoadEventsFunctionsExtensions: () => Promise<void>,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => void,

  // Project opening
  canOpen: boolean,
  onOpen: () => void,
  onOpenProjectManager: () => void,
  onCloseProject: () => Promise<void>,

  // Other dialogs opening:
  onOpenTutorials: () => void,
  onOpenGamesShowcase: () => void,
  onOpenExamples: () => void,
  onOpenHelpFinder: () => void,
  onOpenLanguageDialog: () => void,
  onChangeSubscription: () => void,
  onOpenProfile: () => void,

  // Resources handling
  onDeleteResource: (resource: gdResource, cb: (boolean) => void) => void,
  onRenameResource: (
    resource: gdResource,
    newName: string,
    cb: (boolean) => void
  ) => void,

  // Project creation from an example
  onCreateFromExampleShortHeader: OnCreateFromExampleShortHeaderFunction,
  onOpenFromExampleShortHeader: (
    storageProvider: empty,
    fileMetadata: empty
  ) => Promise<void>,

  // Blank project creation
  onCreateBlank: OnCreateBlankFunction,
  onOpenBlank: (storageProvider: empty, fileMetadata: empty) => Promise<void>,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

export type EditorContainerExtraProps = {|
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,
|};

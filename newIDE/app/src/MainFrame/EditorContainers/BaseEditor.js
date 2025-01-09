// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type NewProjectSetup } from '../../ProjectCreation/NewProjectSetupDialog';
import { type UnsavedChanges } from '../UnsavedChangesContext';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import type { StorageProvider } from '../../ProjectsStorage';
import { type PreviewDebuggerServer } from '../../ExportAndShare/PreviewLauncher.flow';
import { type HotReloadPreviewButtonProps } from '../../HotReload/HotReloadPreviewButton';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
} from '../../ProjectsStorage';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import { type CourseChapter } from '../../Utils/GDevelopServices/Asset';
import { type GamesList } from '../../GameDashboard/UseGamesList';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';

export type EditorContainerExtraProps = {|
  // Events function extension editor
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,
  initiallyFocusedObjectName?: ?string,

  // Homepage
  storageProviders?: Array<StorageProvider>,
|};

export type RenderEditorContainerProps = {|
  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
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
  onOpenCustomObjectEditor: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject
  ) => void,
  openObjectEvents: (extensionName: string, objectName: string) => void,

  // Events function management:
  onLoadEventsFunctionsExtensions: () => Promise<void>,
  onReloadEventsFunctionsExtensionMetadata: (
    extension: gdEventsFunctionsExtension
  ) => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction,
    editorIdentifier:
      | 'scene-events-editor'
      | 'extension-events-editor'
      | 'external-events-editor'
  ) => void,
  onRenamedEventsBasedObject: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    oldName: string,
    newName: string
  ) => void,
  onDeletedEventsBasedObject: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    name: string
  ) => void,

  // Project opening
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onOpenProjectManager: () => void,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,

  // Games
  gamesList: GamesList,

  // Other dialogs opening:
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  onOpenLanguageDialog: () => void,
  onOpenVersionHistory: () => void,
  selectInAppTutorial: (tutorialId: string) => void,
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
  onOpenNewProjectSetupDialog: () => void,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType
  ) => Promise<void>,
  onOpenTemplateFromTutorial: (tutorialId: string) => Promise<void>,
  onOpenTemplateFromCourseChapter: CourseChapter => Promise<void>,
  onOpenPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,

  // Project save
  onSave: () => Promise<void>,
  canSave: boolean,

  // Object editing
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
  onEventsBasedObjectChildrenEdited: () => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,

  onExtractAsExternalLayout: (name: string) => void,
  onExtractAsEventBasedObject: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

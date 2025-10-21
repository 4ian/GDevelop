// @flow
import * as React from 'react';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../../ProjectCreation/NewProjectSetupDialog';
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
import { type GamesPlatformFrameTools } from './HomePage/PlaySection/UseGamesPlatformFrame';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type CreateProjectResult } from '../../Utils/UseCreateProject';

export type EditorContainerExtraProps = {|
  // Events function extension editor
  initiallyFocusedFunctionName?: ?string,
  initiallyFocusedBehaviorName?: ?string,
  initiallyFocusedObjectName?: ?string,

  // Homepage
  storageProviders?: Array<StorageProvider>,

  // Ask AI
  mode?: 'chat' | 'agent',
  aiRequestId?: string | null,
|};

export type SceneEventsOutsideEditorChanges = {|
  scene: gdLayout,
  newOrChangedAiGeneratedEventIds: Set<string>,
|};

export type InstancesOutsideEditorChanges = {|
  scene: gdLayout,
|};

export type ObjectsOutsideEditorChanges = {|
  scene: gdLayout,
|};

export type ObjectGroupsOutsideEditorChanges = {|
  scene: gdLayout,
|};

export type RenderEditorContainerProps = {|
  isActive: boolean,
  projectItemName: ?string,
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
  setToolbar: (?React.Node) => void,
  setGamesPlatformFrameShown: ({| shown: boolean, isMobile: boolean |}) => void,

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
  onOpenLayout: (
    sceneName: string,
    options?: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  onOpenEvents: (sceneName: string) => void,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onOpenCustomObjectEditor: (
    gdEventsFunctionsExtension,
    gdEventsBasedObject,
    variantName: string
  ) => void,
  openObjectEvents: (extensionName: string, objectName: string) => void,
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,

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

  // Games Platform
  gamesPlatformFrameTools: GamesPlatformFrameTools,

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
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  onOpenTemplateFromTutorial: (tutorialId: string) => Promise<void>,
  onOpenTemplateFromCourseChapter: (
    CourseChapter,
    templateId?: string
  ) => Promise<void>,
  onOpenPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,

  // Project save
  onSave: () => Promise<void>,
  canSave: boolean,

  // Object editing
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
  onSceneObjectsDeleted: (scene: gdLayout) => void,

  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,

  // Events editing
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
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
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
|};

export type RenderEditorContainerPropsWithRef = {|
  ref: any => any, // TODO - improve the typing of this ref.
  ...RenderEditorContainerProps,
|};

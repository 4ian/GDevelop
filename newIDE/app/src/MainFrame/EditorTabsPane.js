// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import TabsTitlebar from './TabsTitlebar';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import { TabContentContainer } from '../UI/ClosableTabs';
import { DraggableEditorTabs } from './EditorTabs/DraggableEditorTabs';
import CommandsContextScopedProvider from '../CommandPalette/CommandsScopedContext';
import ErrorBoundary, {
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import {
  getEditorsForPane,
  getCurrentTabIndexForPane,
  getCurrentTabForPane,
  type EditorTabsState,
  type EditorTab,
  hasEditorTabOpenedWithKey,
  changeCurrentTab,
  closeEditorTab,
  closeOtherEditorTabs,
  closeAllEditorTabs,
  moveTabToTheRightOfHoveredTab,
  saveUiSettings,
} from './EditorTabs/EditorTabsHandler';
import { type PreviewState } from './PreviewState';
import { type SceneEventsOutsideEditorChanges } from './EditorContainers/BaseEditor';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type GamesList } from '../GameDashboard/UseGamesList';
import { type GamesPlatformFrameTools } from './EditorContainers/HomePage/PlaySection/UseGamesPlatformFrame';
import {
  type FileMetadata,
  type FileMetadataAndStorageProviderName,
} from '../ProjectsStorage';
import UnsavedChangesContext from './UnsavedChangesContext';
import { type OpenedVersionStatus } from '../VersionHistory';
import { type StorageProvider } from '../ProjectsStorage';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { type CourseChapter } from '../Utils/GDevelopServices/Asset';
import { type NewProjectSetup } from '../ProjectCreation/NewProjectSetupDialog';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type ShareTab } from '../ExportAndShare/ShareDialog';

export type EditorTabsPaneCommonProps = {|
  editorTabs: EditorTabsState,
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  tabsTitleBarAndEditorToolbarHidden: boolean,
  setTabsTitleBarAndEditorToolbarHidden: (hidden: boolean) => void,
  canSave: boolean,
  isSavingProject: boolean,
  isSharingEnabled: boolean,
  hasPreviewsRunning: boolean,
  previewState: PreviewState,
  checkedOutVersionStatus: ?OpenedVersionStatus,
  canDoNetworkPreview: boolean,
  gamesPlatformFrameTools: GamesPlatformFrameTools,

  // Callbacks from MainFrame
  toggleProjectManager: () => void,
  saveProject: () => Promise<void>,
  openShareDialog: (tab?: ShareTab) => void,
  launchDebuggerAndPreview: () => void,
  launchNewPreview: (?{ numberOfWindows: number }) => Promise<void>,
  launchNetworkPreview: () => Promise<void>,
  launchHotReloadPreview: () => Promise<void>,
  launchPreviewWithDiagnosticReport: () => Promise<void>,
  setPreviewOverride: (override: {|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  openVersionHistoryPanel: () => void,
  onQuitVersionHistory: () => Promise<void>,
  openAskAi: () => void,
  getStorageProvider: () => StorageProvider,
  setPreviewedLayout: (layoutName: ?string) => void,
  openExternalEvents: (name: string) => void,
  openLayout: (
    name: string,
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
  openTemplateFromTutorial: (tutorialId: string) => Promise<void>,
  openTemplateFromCourseChapter: (
    courseChapter: CourseChapter,
    templateId?: string
  ) => Promise<void>,
  previewDebuggerServer: ?any,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  resourceManagementProps: ResourceManagementProps,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction,
    editorIdentifier:
      | 'scene-events-editor'
      | 'extension-events-editor'
      | 'external-events-editor'
  ) => void,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onOpenCustomObjectEditor: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variantName: string
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
  openObjectEvents: (extensionName: string, objectName: string) => void,
  canOpen: boolean,
  openOpenFromStorageProviderDialog: () => void,
  openFromFileMetadataWithStorageProvider: (
    file: FileMetadataAndStorageProviderName
  ) => Promise<void>,
  openNewProjectDialog: () => void,
  openProjectManager: (open: boolean) => void,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,
  onSelectExampleShortHeader: ({|
    exampleShortHeader: ?ExampleShortHeader,
    preventBackHome?: boolean,
  |}) => void,
  onSelectPrivateGameTemplateListingData: ({|
    privateGameTemplateListingData: ?PrivateGameTemplateListingData,
    preventBackHome?: boolean,
  |}) => void,
  createEmptyProject: (newProjectSetup: NewProjectSetup) => Promise<void>,
  createProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType,
    isQuickCustomization?: boolean
  ) => Promise<void>,
  onOpenProfileDialog: () => void,
  openLanguageDialog: (open: boolean) => void,
  openPreferencesDialog: (open: boolean) => void,
  openAboutDialog: (open: boolean) => void,
  selectInAppTutorial: (tutorialId: string) => void,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  isProjectClosedSoAvoidReloadingExtensions: boolean,
  renameResourcesInProject: (
    project: gdProject,
    renames: { [string]: string }
  ) => void,
  openBehaviorEvents: (extensionName: string, behaviorName: string) => void,
  onExtractAsExternalLayout: (name: string) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  deleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
  onSceneObjectsDeleted: (scene: gdLayout) => void,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  gamesList: GamesList,

  setEditorTabs: (editorTabs: EditorTabsState) => void,
|};

type Props = {|
  ...EditorTabsPaneCommonProps,
  paneIdentifier: string,
  isLeftMost: boolean,
  isRightMost: boolean,
|};

const EditorTabsPane = React.forwardRef<Props, {||}>((props, ref) => {
  const {
    editorTabs,
    currentProject,
    currentFileMetadata,
    tabsTitleBarAndEditorToolbarHidden,
    setTabsTitleBarAndEditorToolbarHidden,
    canSave,
    isSavingProject,
    isSharingEnabled,
    hasPreviewsRunning,
    previewState,
    checkedOutVersionStatus,
    canDoNetworkPreview,
    gamesPlatformFrameTools,
    toggleProjectManager,
    saveProject,
    openShareDialog,
    launchDebuggerAndPreview,
    launchNewPreview,
    launchNetworkPreview,
    launchHotReloadPreview,
    launchPreviewWithDiagnosticReport,
    setPreviewOverride,
    openVersionHistoryPanel,
    onQuitVersionHistory,
    openAskAi,
    getStorageProvider,
    setPreviewedLayout,
    openExternalEvents,
    openLayout,
    openTemplateFromTutorial,
    openTemplateFromCourseChapter,
    previewDebuggerServer,
    hotReloadPreviewButtonProps,
    resourceManagementProps,
    onCreateEventsFunction,
    openInstructionOrExpression,
    onOpenCustomObjectEditor,
    onRenamedEventsBasedObject,
    onDeletedEventsBasedObject,
    openObjectEvents,
    canOpen,
    openOpenFromStorageProviderDialog,
    openFromFileMetadataWithStorageProvider,
    openNewProjectDialog,
    openProjectManager,
    askToCloseProject,
    closeProject,
    onSelectExampleShortHeader,
    onSelectPrivateGameTemplateListingData,
    createEmptyProject,
    createProjectFromExample,
    onOpenProfileDialog,
    openLanguageDialog,
    openPreferencesDialog,
    openAboutDialog,
    selectInAppTutorial,
    eventsFunctionsExtensionsState,
    isProjectClosedSoAvoidReloadingExtensions,
    renameResourcesInProject,
    openBehaviorEvents,
    onExtractAsExternalLayout,
    onOpenEventBasedObjectEditor,
    onOpenEventBasedObjectVariantEditor,
    deleteEventsBasedObjectVariant,
    onEventsBasedObjectChildrenEdited,
    onSceneObjectEdited,
    onSceneObjectsDeleted,
    onSceneEventsModifiedOutsideEditor,
    onExtensionInstalled,
    gamesList,
    setEditorTabs,
    paneIdentifier,
    isLeftMost,
    isRightMost,
  } = props;

  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const hasAskAiOpened = hasEditorTabOpenedWithKey(editorTabs, 'ask-ai');

  // Internal editor toolbar management
  const setEditorToolbar = React.useCallback(
    (editorToolbar: ?React.Node, isCurrentTab: boolean = true) => {
      if (!toolbarRef.current || !isCurrentTab) return;

      toolbarRef.current.setEditorToolbar(editorToolbar || null);
    },
    []
  );

  const updateToolbar = React.useCallback(
    () => {
      const editorTab = getCurrentTabForPane(editorTabs, paneIdentifier);
      if (!editorTab || !editorTab.editorRef) {
        setEditorToolbar(null);
        return;
      }

      editorTab.editorRef.updateToolbar();
    },
    [editorTabs, setEditorToolbar, paneIdentifier]
  );

  React.useEffect(
    () => {
      updateToolbar();
    },
    [updateToolbar]
  );

  // Tab management functions
  const _onEditorTabActivated = React.useCallback(
    (editorTab: EditorTab) => {
      updateToolbar();
      // Ensure the editors shown on the screen are updated. This is for
      // example useful if global objects have been updated in another editor.
      if (editorTab.editorRef) {
        editorTab.editorRef.forceUpdateEditor();
      }
    },
    [updateToolbar]
  );

  const _onChangeEditorTab = React.useCallback(
    (value: number) => {
      const newEditorTabs = changeCurrentTab(editorTabs, paneIdentifier, value);
      setEditorTabs(newEditorTabs);

      const newCurrentTab = getCurrentTabForPane(newEditorTabs, paneIdentifier);
      if (newCurrentTab) {
        _onEditorTabActivated(newCurrentTab);
      }
    },
    [editorTabs, setEditorTabs, _onEditorTabActivated, paneIdentifier]
  );

  const _onCloseEditorTab = React.useCallback(
    (editorTab: EditorTab) => {
      saveUiSettings(editorTabs);
      setEditorTabs(closeEditorTab(editorTabs, editorTab));
    },
    [editorTabs, setEditorTabs]
  );

  const _onCloseOtherEditorTabs = React.useCallback(
    (editorTab: EditorTab) => {
      saveUiSettings(editorTabs);
      setEditorTabs(closeOtherEditorTabs(editorTabs, editorTab));
    },
    [editorTabs, setEditorTabs]
  );

  const _onCloseAllEditorTabs = React.useCallback(
    () => {
      saveUiSettings(editorTabs);
      setEditorTabs(closeAllEditorTabs(editorTabs));
    },
    [editorTabs, setEditorTabs]
  );

  const onDropEditorTab = React.useCallback(
    (fromIndex: number, toHoveredIndex: number) => {
      setEditorTabs(
        moveTabToTheRightOfHoveredTab(
          editorTabs,
          paneIdentifier,
          fromIndex,
          toHoveredIndex
        )
      );
    },
    [editorTabs, paneIdentifier, setEditorTabs]
  );

  const paneEditorTabs = getEditorsForPane(editorTabs, paneIdentifier);
  const currentTab = getCurrentTabForPane(editorTabs, paneIdentifier);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <TabsTitlebar
        isLeftMost={isLeftMost}
        isRightMost={isRightMost}
        hidden={tabsTitleBarAndEditorToolbarHidden}
        toggleProjectManager={toggleProjectManager}
        renderTabs={(onEditorTabHovered, onEditorTabClosing) => (
          <DraggableEditorTabs
            hideLabels={false}
            editors={paneEditorTabs}
            currentTab={currentTab}
            onClickTab={(id: number) => _onChangeEditorTab(id)}
            onCloseTab={(editorTab: EditorTab) => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseEditorTab(editorTab);
            }}
            onCloseOtherTabs={(editorTab: EditorTab) => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseOtherEditorTabs(editorTab);
            }}
            onCloseAll={() => {
              // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
              onEditorTabClosing();
              _onCloseAllEditorTabs();
            }}
            onTabActivated={(editorTab: EditorTab) =>
              _onEditorTabActivated(editorTab)
            }
            onDropTab={onDropEditorTab}
            onHoverTab={(
              editorTab: ?EditorTab,
              options: {| isLabelTruncated: boolean |}
            ) => onEditorTabHovered(editorTab, options)}
          />
        )}
        hasAskAiOpened={hasAskAiOpened}
        onOpenAskAi={openAskAi}
      />
      <Toolbar
        ref={toolbarRef}
        hidden={tabsTitleBarAndEditorToolbarHidden}
        showProjectButtons={
          !['start page', 'debugger', 'ask-ai', null].includes(
            currentTab ? currentTab.key : null
          )
        }
        canSave={canSave}
        onSave={saveProject}
        openShareDialog={() =>
          openShareDialog(/* leave the dialog decide which tab to open */)
        }
        isSharingEnabled={isSharingEnabled}
        onOpenDebugger={launchDebuggerAndPreview}
        hasPreviewsRunning={hasPreviewsRunning}
        onPreviewWithoutHotReload={launchNewPreview}
        onNetworkPreview={launchNetworkPreview}
        onHotReloadPreview={launchHotReloadPreview}
        onLaunchPreviewWithDiagnosticReport={launchPreviewWithDiagnosticReport}
        canDoNetworkPreview={canDoNetworkPreview}
        setPreviewOverride={setPreviewOverride}
        isPreviewEnabled={
          !!currentProject && currentProject.getLayoutsCount() > 0
        }
        previewState={previewState}
        onOpenVersionHistory={openVersionHistoryPanel}
        checkedOutVersionStatus={checkedOutVersionStatus}
        onQuitVersionHistory={onQuitVersionHistory}
        canQuitVersionHistory={!isSavingProject}
      />
      {paneEditorTabs.map((editorTab, id) => {
        const isCurrentTab =
          getCurrentTabIndexForPane(editorTabs, paneIdentifier) === id;
        const errorBoundaryProps = getEditorErrorBoundaryProps(editorTab.key);

        return (
          <TabContentContainer
            key={editorTab.key}
            active={isCurrentTab}
            // Deactivate pointer events when the play tab is active, so the iframe
            // can be interacted with.
            removePointerEvents={gamesPlatformFrameTools.iframeVisible}
          >
            <CommandsContextScopedProvider active={isCurrentTab}>
              <ErrorBoundary
                componentTitle={errorBoundaryProps.componentTitle}
                scope={errorBoundaryProps.scope}
              >
                {editorTab.renderEditorContainer({
                  isActive: isCurrentTab,
                  extraEditorProps: editorTab.extraEditorProps,
                  project: currentProject,
                  fileMetadata: currentFileMetadata,
                  storageProvider: getStorageProvider(),
                  ref: editorRef => (editorTab.editorRef = editorRef),
                  setToolbar: editorToolbar =>
                    setEditorToolbar(editorToolbar, isCurrentTab),
                  hideTabsTitleBarAndEditorToolbar: setTabsTitleBarAndEditorToolbarHidden,
                  projectItemName: editorTab.projectItemName,
                  setPreviewedLayout,
                  onOpenExternalEvents: openExternalEvents,
                  onOpenEvents: (sceneName: string) => {
                    openLayout(sceneName, {
                      openEventsEditor: true,
                      openSceneEditor: false,
                      focusWhenOpened: 'events',
                    });
                  },
                  onOpenLayout: openLayout,
                  onOpenTemplateFromTutorial: openTemplateFromTutorial,
                  onOpenTemplateFromCourseChapter: openTemplateFromCourseChapter,
                  previewDebuggerServer,
                  hotReloadPreviewButtonProps,
                  resourceManagementProps,
                  onSave: saveProject,
                  canSave,
                  onCreateEventsFunction,
                  openInstructionOrExpression,
                  onOpenCustomObjectEditor: onOpenCustomObjectEditor,
                  onRenamedEventsBasedObject: onRenamedEventsBasedObject,
                  onDeletedEventsBasedObject: onDeletedEventsBasedObject,
                  openObjectEvents,
                  unsavedChanges: unsavedChanges,
                  canOpen,
                  onChooseProject: () => openOpenFromStorageProviderDialog(),
                  onOpenRecentFile: openFromFileMetadataWithStorageProvider,
                  onOpenNewProjectSetupDialog: openNewProjectDialog,
                  onOpenProjectManager: () => openProjectManager(true),
                  onOpenVersionHistory: openVersionHistoryPanel,
                  askToCloseProject,
                  closeProject,
                  onSelectExampleShortHeader: exampleShortHeader => {
                    onSelectExampleShortHeader({
                      exampleShortHeader,
                      preventBackHome: true,
                    });
                  },
                  onSelectPrivateGameTemplateListingData: privateGameTemplateListingData => {
                    onSelectPrivateGameTemplateListingData({
                      privateGameTemplateListingData,
                      preventBackHome: true,
                    });
                  },
                  onOpenPrivateGameTemplateListingData: privateGameTemplateListingData => {
                    onSelectPrivateGameTemplateListingData({
                      privateGameTemplateListingData,
                      preventBackHome: true,
                    });
                  },
                  onCreateEmptyProject: createEmptyProject,
                  onCreateProjectFromExample: createProjectFromExample,
                  onOpenProfile: onOpenProfileDialog,
                  onOpenLanguageDialog: () => openLanguageDialog(true),
                  onOpenPreferences: () => openPreferencesDialog(true),
                  onOpenAbout: () => openAboutDialog(true),
                  selectInAppTutorial: selectInAppTutorial,
                  onLoadEventsFunctionsExtensions: async () => {
                    if (isProjectClosedSoAvoidReloadingExtensions) {
                      return;
                    }
                    return eventsFunctionsExtensionsState.loadProjectEventsFunctionsExtensions(
                      currentProject
                    );
                  },
                  onReloadEventsFunctionsExtensionMetadata: extension => {
                    if (isProjectClosedSoAvoidReloadingExtensions) {
                      return;
                    }
                    eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata(
                      currentProject,
                      extension
                    );
                  },
                  onDeleteResource: (
                    resource: gdResource,
                    cb: boolean => void
                  ) => {
                    // TODO: Project wide refactoring of objects/events using the resource
                    cb(true);
                  },
                  onRenameResource: (
                    resource: gdResource,
                    newName: string,
                    cb: boolean => void
                  ) => {
                    if (currentProject)
                      renameResourcesInProject(currentProject, {
                        [resource.getName()]: newName,
                      });

                    cb(true);
                  },
                  openBehaviorEvents: openBehaviorEvents,
                  onExtractAsExternalLayout: onExtractAsExternalLayout,
                  onExtractAsEventBasedObject: onOpenEventBasedObjectEditor,
                  onOpenEventBasedObjectEditor: onOpenEventBasedObjectEditor,
                  onOpenEventBasedObjectVariantEditor: onOpenEventBasedObjectVariantEditor,
                  onDeleteEventsBasedObjectVariant: deleteEventsBasedObjectVariant,
                  onEventsBasedObjectChildrenEdited: onEventsBasedObjectChildrenEdited,
                  onSceneObjectEdited: onSceneObjectEdited,
                  onSceneObjectsDeleted: onSceneObjectsDeleted,
                  onSceneEventsModifiedOutsideEditor: onSceneEventsModifiedOutsideEditor,
                  onExtensionInstalled: onExtensionInstalled,
                  gamesList,
                  gamesPlatformFrameTools,
                })}
              </ErrorBoundary>
            </CommandsContextScopedProvider>
          </TabContentContainer>
        );
      })}
    </div>
  );
});

export default EditorTabsPane;

// @flow
import * as React from 'react';
import TabsTitlebar from './TabsTitlebar';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import { TabContentContainer } from '../UI/ClosableTabs';
import { DraggableEditorTabs } from './EditorTabs/DraggableEditorTabs';
import CommandsContextScopedProvider from '../CommandPalette/CommandsScopedContext';
import ErrorBoundary, {
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import {
  getEditors,
  getCurrentTabIndex,
  getCurrentTab,
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
import type { PreviewState } from './PreviewState';
import type { 
  RenderEditorContainerPropsWithRef,
  SceneEventsOutsideEditorChanges,
} from './EditorContainers/BaseEditor';
import type { ResourceManagementProps } from '../ResourcesList/ResourceSource';
import type { HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import type { GamesList } from '../GameDashboard/UseGamesList';
import type { GamesPlatformFrameTools } from './EditorContainers/HomePage/PlaySection/UseGamesPlatformFrame';
import type { FileMetadata } from '../ProjectsStorage';
import UnsavedChangesContext from './UnsavedChangesContext';
import type { InAppTutorialOrchestrator } from '../InAppTutorial/InAppTutorialOrchestrator';
import type { VersionHistoryPanelStatus } from '../VersionHistory/UseVersionHistory';

const gd: libGDevelop = global.gd;

type Props = {|
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
  checkedOutVersionStatus: VersionHistoryPanelStatus,
  canDoNetworkPreview: boolean,
  gamesPlatformFrameTools: GamesPlatformFrameTools,
  
  // Callbacks from MainFrame
  toggleProjectManager: () => void,
  saveProject: () => Promise<void>,
  openShareDialog: (tab?: string) => void,
  launchDebuggerAndPreview: () => void,
  launchNewPreview: (options?: {| networkPreview?: boolean |}) => void,
  launchNetworkPreview: () => void,
  launchHotReloadPreview: () => void,
  launchPreviewWithDiagnosticReport: () => void,
  setPreviewOverride: (override: {|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  openVersionHistoryPanel: () => void,
  onQuitVersionHistory: () => void,
  openAskAi: () => void,
  getStorageProvider: () => any,
  setPreviewedLayout: (layoutName: ?string) => void,
  openExternalEvents: (name: string) => void,
  openLayout: (name: string, options?: any) => void,
  openTemplateFromTutorial: any => void,
  openTemplateFromCourseChapter: any => void,
  previewDebuggerServer: ?any,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  resourceManagementProps: ResourceManagementProps,
  onCreateEventsFunction: any,
  openInstructionOrExpression: any,
  onOpenCustomObjectEditor: any => void,
  onRenamedEventsBasedObject: any => void,
  onDeletedEventsBasedObject: any => void,
  openObjectEvents: any,
  canOpen: boolean,
  openOpenFromStorageProviderDialog: () => void,
  openFromFileMetadataWithStorageProvider: any => void,
  openNewProjectDialog: () => void,
  openProjectManager: (open: boolean) => void,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,
  onSelectExampleShortHeader: any => void,
  onSelectPrivateGameTemplateListingData: any => void,
  createEmptyProject: any,
  createProjectFromExample: any,
  onOpenProfileDialog: () => void,
  openLanguageDialog: (open: boolean) => void,
  openPreferencesDialog: (open: boolean) => void,
  openAboutDialog: (open: boolean) => void,
  selectInAppTutorial: any => void,
  eventsFunctionsExtensionsState: any,
  isProjectClosedSoAvoidReloadingExtensions: boolean,
  renameResourcesInProject: (project: gdProject, renames: {[string]: string}) => void,
  openBehaviorEvents: any,
  onExtractAsExternalLayout: any,
  onOpenEventBasedObjectEditor: any,
  onOpenEventBasedObjectVariantEditor: any,
  deleteEventsBasedObjectVariant: any,
  onEventsBasedObjectChildrenEdited: any,
  onSceneObjectEdited: any,
  onSceneObjectsDeleted: any,
  onSceneEventsModifiedOutsideEditor: any,
  onExtensionInstalled: any,
  gamesList: GamesList,
  inAppTutorialOrchestratorRef: {| current: ?InAppTutorialOrchestrator |},
  setEditorTabs: (editorTabs: EditorTabsState) => void,
|};

const EditorsPane = React.forwardRef<Props, ToolbarInterface>((props, ref) => {
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
    inAppTutorialOrchestratorRef,
    setEditorTabs,
  } = props;
  
  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const hasAskAiOpened = hasEditorTabOpenedWithKey(editorTabs, 'ask-ai');

  // Internal editor toolbar management
  const setEditorToolbar = React.useCallback((editorToolbar: any, isCurrentTab: boolean = true) => {
    if (!toolbarRef.current || !isCurrentTab) return;

    toolbarRef.current.setEditorToolbar(editorToolbar);
  }, []);

  const updateToolbar = React.useCallback(() => {
    const editorTab = getCurrentTab(editorTabs);
    if (!editorTab || !editorTab.editorRef) {
      setEditorToolbar(null);
      return;
    }

    editorTab.editorRef.updateToolbar();
  }, [editorTabs, setEditorToolbar]);

  React.useEffect(() => {
    updateToolbar();
  }, [updateToolbar]);

  // Tab management functions
  const _onEditorTabActivated = React.useCallback((editorTab: EditorTab) => {
    updateToolbar();
    // Ensure the editors shown on the screen are updated. This is for
    // example useful if global objects have been updated in another editor.
    if (editorTab.editorRef) {
      editorTab.editorRef.forceUpdateEditor();
    }
  }, [updateToolbar]);

  const _onChangeEditorTab = React.useCallback((value: number) => {
    const newEditorTabs = changeCurrentTab(editorTabs, value);
    setEditorTabs(newEditorTabs);
    _onEditorTabActivated(getCurrentTab(newEditorTabs));
  }, [editorTabs, setEditorTabs, _onEditorTabActivated]);

  const _onCloseEditorTab = React.useCallback((editorTab: EditorTab) => {
    saveUiSettings(editorTabs);
    setEditorTabs(closeEditorTab(editorTabs, editorTab));
  }, [editorTabs, setEditorTabs]);

  const _onCloseOtherEditorTabs = React.useCallback((editorTab: EditorTab) => {
    saveUiSettings(editorTabs);
    setEditorTabs(closeOtherEditorTabs(editorTabs, editorTab));
  }, [editorTabs, setEditorTabs]);

  const _onCloseAllEditorTabs = React.useCallback(() => {
    saveUiSettings(editorTabs);
    setEditorTabs(closeAllEditorTabs(editorTabs));
  }, [editorTabs, setEditorTabs]);

  const onDropEditorTab = React.useCallback((fromIndex: number, toHoveredIndex: number) => {
    setEditorTabs(moveTabToTheRightOfHoveredTab(editorTabs, fromIndex, toHoveredIndex));
  }, [editorTabs, setEditorTabs]);

  // Expose toolbar interface methods
  React.useImperativeHandle(ref, () => ({
    setEditorToolbar,
  }), [setEditorToolbar]);

  return (
    <>
      <TabsTitlebar
        hidden={tabsTitleBarAndEditorToolbarHidden}
        toggleProjectManager={toggleProjectManager}
        renderTabs={(onEditorTabHovered, onEditorTabClosing) => (
          <DraggableEditorTabs
            hideLabels={false}
            editorTabs={editorTabs}
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
            getCurrentTab(editorTabs)
              ? getCurrentTab(editorTabs).key
              : null
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
      {getEditors(editorTabs).map((editorTab, id) => {
        const isCurrentTab = getCurrentTabIndex(editorTabs) === id;
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
    </>
  );
});

export default EditorsPane;
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
  getEditorTabOpenedWithKey,
  changeCurrentTab,
  closeEditorTab,
  closeOtherEditorTabs,
  closeAllEditorTabs,
  moveTabToTheRightOfHoveredTab,
  saveUiSettings,
} from './EditorTabs/EditorTabsHandler';
import { type PreviewState } from './PreviewState';
import {
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
} from './EditorContainers/BaseEditor';
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
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { MuiThemeOnlyProvider } from '../UI/Theme/FullThemeProvider';
import useForceUpdate from '../Utils/UseForceUpdate';
import useOnResize from '../Utils/UseOnResize';
import DrawerTopBar from '../UI/DrawerTopBar';
import { type FloatingPaneState } from './PanesContainer';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
};

export type EditorTabsPaneCommonProps = {|
  editorTabs: EditorTabsState,
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
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
  onOpenAskAi: ({|
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
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
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  gamesList: GamesList,

  setEditorTabs: (editorTabs: EditorTabsState) => void,
|};

type Props = {|
  ...EditorTabsPaneCommonProps,
  onSetPointerEventsNone: (enablePointerEventsNone: boolean) => void,
  paneIdentifier: string,
  isLeftMostPane: boolean,
  isRightMostPane: boolean,
  isDrawer: boolean,
  areSidePanesDrawers: boolean,
  onSetPaneDrawerState: (
    paneIdentifier: string,
    newState: FloatingPaneState
  ) => void,
|};

const EditorTabsPane = React.forwardRef<Props, {||}>((props, ref) => {
  const {
    editorTabs,
    currentProject,
    currentFileMetadata,
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
    onOpenAskAi,
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
    onInstancesModifiedOutsideEditor,
    onExtensionInstalled,
    gamesList,
    setEditorTabs,
    onSetPointerEventsNone,
    paneIdentifier,
    isLeftMostPane,
    isRightMostPane,
    isDrawer,
    onSetPaneDrawerState,
    areSidePanesDrawers,
  } = props;

  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const askAiPaneIdentifier = getEditorTabOpenedWithKey(editorTabs, 'ask-ai');
  const containerRef = React.useRef<?HTMLDivElement>(null);

  const [
    tabsTitleBarAndEditorToolbarHidden,
    setTabsTitleBarAndEditorToolbarHidden,
  ] = React.useState(false);

  const onSetGamesPlatformFrameShown = React.useCallback(
    ({ shown, isMobile }: {| shown: boolean, isMobile: boolean |}) => {
      onSetPointerEventsNone(shown);
      setTabsTitleBarAndEditorToolbarHidden(shown && isMobile);
    },
    [onSetPointerEventsNone]
  );

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
  const onEditorTabActivated = React.useCallback(
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

  const onChangeEditorTab = React.useCallback(
    (value: number) => {
      const newEditorTabs = changeCurrentTab(editorTabs, paneIdentifier, value);
      setEditorTabs(newEditorTabs);

      const newCurrentTab = getCurrentTabForPane(newEditorTabs, paneIdentifier);
      if (newCurrentTab) {
        onEditorTabActivated(newCurrentTab);
      }
    },
    [editorTabs, setEditorTabs, onEditorTabActivated, paneIdentifier]
  );

  const onCloseEditorTab = React.useCallback(
    (editorTab: EditorTab) => {
      saveUiSettings(editorTabs);
      setEditorTabs(closeEditorTab(editorTabs, editorTab));
    },
    [editorTabs, setEditorTabs]
  );

  const onCloseOtherEditorTabs = React.useCallback(
    (editorTab: EditorTab) => {
      saveUiSettings(editorTabs);
      setEditorTabs(closeOtherEditorTabs(editorTabs, editorTab));
    },
    [editorTabs, setEditorTabs]
  );

  const onCloseAllEditorTabs = React.useCallback(
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

  // Use a layout effect to read the pane width and height, which is then used
  // to communicate to children editors the dimensions of their "window" (the pane).
  // The layout effect ensures that we get the pane width and height after the pane has been rendered
  // but before the browser repaints the component.
  const [paneWidth, setPaneWidth] = React.useState<number | null>(null);
  const [paneHeight, setPaneHeight] = React.useState<number | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (
        container.clientWidth !== paneWidth ||
        container.clientHeight !== paneHeight
      ) {
        setPaneWidth(container.clientWidth);
        setPaneHeight(container.clientHeight);
      }
    }
  });
  useOnResize(useForceUpdate()); // Ensure the pane is re-rendered when the window is resized.

  const onOpenAskAiFromTitlebar = React.useCallback(
    () => {
      if (
        askAiPaneIdentifier &&
        askAiPaneIdentifier.paneIdentifier === 'right'
      ) {
        onSetPaneDrawerState('right', 'open');
        return;
      }

      onOpenAskAi({
        mode: 'agent',
        aiRequestId: null,
        paneIdentifier: currentProject ? 'right' : 'center',
      });
    },
    [askAiPaneIdentifier, onOpenAskAi, currentProject, onSetPaneDrawerState]
  );

  return (
    <div style={styles.container} ref={containerRef}>
      {isDrawer ? (
        <DrawerTopBar
          drawerAnchor={isRightMostPane ? 'right' : 'left'}
          title={'Ask AI'}
          id={paneIdentifier + '-top-bar'}
          onClose={() => onSetPaneDrawerState(paneIdentifier, 'closed')}
        />
      ) : (
        <TabsTitlebar
          isLeftMostPane={isLeftMostPane}
          isRightMostPane={isRightMostPane}
          displayMenuIcon={paneIdentifier === 'center'}
          hidden={tabsTitleBarAndEditorToolbarHidden}
          toggleProjectManager={toggleProjectManager}
          renderTabs={(onEditorTabHovered, onEditorTabClosing) => (
            <DraggableEditorTabs
              hideLabels={false}
              editors={paneEditorTabs}
              currentTab={currentTab}
              onClickTab={onChangeEditorTab}
              onCloseTab={(editorTab: EditorTab) => {
                // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
                onEditorTabClosing();
                onCloseEditorTab(editorTab);
              }}
              onCloseOtherTabs={(editorTab: EditorTab) => {
                // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
                onEditorTabClosing();
                onCloseOtherEditorTabs(editorTab);
              }}
              onCloseAll={() => {
                // Call onEditorTabClosing before to ensure any tooltip is removed before the tab is closed.
                onEditorTabClosing();
                onCloseAllEditorTabs();
              }}
              onTabActivated={onEditorTabActivated}
              onDropTab={onDropEditorTab}
              onHoverTab={onEditorTabHovered}
            />
          )}
          displayAskAi={
            !askAiPaneIdentifier
              ? // If Ask AI is closed, display the button on the right most part of the window.
                isRightMostPane
              : // If it's open, only show it if it's in a drawer pane.
                areSidePanesDrawers &&
                askAiPaneIdentifier.paneIdentifier !== 'center'
          }
          onAskAiClicked={onOpenAskAiFromTitlebar}
        />
      )}
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
      <SpecificDimensionsWindowSizeProvider
        innerWidth={paneWidth}
        innerHeight={paneHeight}
      >
        <MuiThemeOnlyProvider>
          {paneEditorTabs.map((editorTab, id) => {
            const isCurrentTab =
              getCurrentTabIndexForPane(editorTabs, paneIdentifier) === id;
            const errorBoundaryProps = getEditorErrorBoundaryProps(
              editorTab.key
            );

            return (
              <TabContentContainer key={editorTab.key} active={isCurrentTab}>
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
                      getStorageProvider,
                      ref: editorRef => (editorTab.editorRef = editorRef),
                      setToolbar: editorToolbar =>
                        setEditorToolbar(editorToolbar, isCurrentTab),
                      setGamesPlatformFrameShown: onSetGamesPlatformFrameShown,
                      projectItemName: editorTab.projectItemName,
                      setPreviewedLayout,
                      onOpenAskAi,
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
                      onChooseProject: () =>
                        openOpenFromStorageProviderDialog(),
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
                      onInstancesModifiedOutsideEditor: onInstancesModifiedOutsideEditor,
                      onExtensionInstalled: onExtensionInstalled,
                      gamesList,
                      gamesPlatformFrameTools,
                    })}
                  </ErrorBoundary>
                </CommandsContextScopedProvider>
              </TabContentContainer>
            );
          })}
        </MuiThemeOnlyProvider>
      </SpecificDimensionsWindowSizeProvider>
    </div>
  );
});

export default EditorTabsPane;

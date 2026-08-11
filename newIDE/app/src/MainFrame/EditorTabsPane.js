// @flow
import * as React from 'react';
import TabsTitlebar from './TabsTitlebar';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import { TabContentContainer } from '../UI/ClosableTabs';
import { DraggableEditorTabs } from './EditorTabs/DraggableEditorTabs';
import ActiveTabCommandsProvider from '../CommandPalette/ActiveTabCommandsProvider';
import ErrorBoundary, {
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import {
  getEditorsForPane,
  getCurrentTabIndexForPane,
  getCurrentTabForPane,
  type EditorTabsState,
  type EditorTab,
  type EditorKind,
  getEditorTabOpenedWithKey,
  getAllEditorTabs,
  changeCurrentTab,
  closeEditorTab,
  closeOtherEditorTabs,
  closeAllEditorTabs,
  moveTabToTheRightOfHoveredTab,
  saveUiSettings,
} from './EditorTabs/EditorTabsHandler';
import { type PreviewState } from './PreviewState';
import {
  type OpenLayoutHandler,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
  type ProjectItemRenamedOutsideEditorChanges,
  type WillDeleteSceneChanges,
  type WillDeleteGameplayTestChanges,
  type WillDeleteObjectChanges,
} from '../EditorFunctions/OutsideEditorChanges';
import { type NavigateToEventFromGlobalSearchParams } from '../Utils/Search';
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
import { type StorageProvider, type SaveAsLocation } from '../ProjectsStorage';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { type ExpandedCloudProjectVersion } from '../Utils/GDevelopServices/Project';
import { type CourseChapter } from '../Utils/GDevelopServices/Asset';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type ShareTab } from '../ExportAndShare/ShareDialog';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { MuiThemeOnlyProvider } from '../UI/Theme/FullThemeProvider';
import useForceUpdate from '../Utils/UseForceUpdate';
import useOnResize from '../Utils/UseOnResize';
import DrawerTopBar from '../UI/DrawerTopBar';
import { type FloatingPaneState } from './PanesContainer';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import { type OpenAskAiOptions } from '../AiGeneration/Utils';
import { type GameplayTestsCallbacks } from '../GameplayTests/GameplayTestRunner';
import { type ToolbarButtonConfig } from './CustomToolbarButton';
import { type TriggerNpmScript } from './NpmScriptRunner/useNpmScriptRunner';
import { useActiveEmbeddedGameFrameHoleCount } from '../EmbeddedGame/EmbeddedGameFrameHole';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
};

const shouldRemovePointerEvents = (
  kind: EditorKind,
  gameEditorMode: 'embedded-game' | 'instances-editor',
  hasActiveEmbeddedGameFrameHole: boolean
) => {
  if (gameEditorMode === 'embedded-game' && hasActiveEmbeddedGameFrameHole) {
    // Scene editors can have an embedded game, so they redefine manually which
    // components can have clicks/touches. Do this only while the iframe hole is
    // actually active, as debugger state can outlive the visible editor.
    return (
      kind === 'layout' ||
      kind === 'external layout' ||
      kind === 'custom object'
    );
  }
  return false;
};

export type EditorTabsPaneCommonProps = {|
  editorTabs: EditorTabsState,
  currentProject: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  canSave: boolean,
  isSavingProject: boolean,
  isSharingEnabled: boolean,
  hasPreviewsRunning: boolean,
  isPreviewLaunchInProgress: boolean,
  previewState: PreviewState,
  checkedOutVersionStatus: ?OpenedVersionStatus,
  canDoNetworkPreview: boolean,
  gamesPlatformFrameTools: GamesPlatformFrameTools,
  gameEditorMode: 'embedded-game' | 'instances-editor',
  setGameEditorMode: ('embedded-game' | 'instances-editor') => void,
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
  triggerNpmScript: TriggerNpmScript,

  // Callbacks from MainFrame
  toggleProjectManager: () => void,
  isProjectManagerPinned: boolean,
  saveProject: () => Promise<?FileMetadata>,
  autoSaveConstants: (constants: Object) => Promise<boolean>,
  saveProjectAsWithStorageProvider: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
  onCheckoutVersion: (
    version: ExpandedCloudProjectVersion,
    options?: {| dontSaveCheckedOutVersionStatus?: boolean |}
  ) => Promise<boolean>,
  getOrLoadProjectVersion: (
    versionId: string
  ) => Promise<?ExpandedCloudProjectVersion>,
  openShareDialog: (tab?: ShareTab) => void,
  launchDebuggerAndPreview: () => void | Promise<void>,
  launchNewPreview: (
    ?{|
      numberOfWindows?: number,
      forceAlwaysOnTopInPreview?: boolean,
    |}
  ) => Promise<void>,
  launchNetworkPreview: () => Promise<void>,
  launchHotReloadPreview: () => Promise<void>,
  launchPreviewWithDiagnosticReport: () => Promise<void>,
  displayCollisionShapesInPreview: boolean,
  setDisplayCollisionShapesInPreview: boolean => void,
  displaySignalAnimationsInPreview: boolean,
  setDisplaySignalAnimationsInPreview: boolean => void,
  setPreviewOverride: (override: {|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  onRestartInGameEditor: (reason: string) => void,
  showRestartInGameEditorAfterErrorButton: boolean,
  openVersionHistoryPanel: () => void,
  onQuitVersionHistory: () => Promise<void>,
  onOpenAskAi: (?OpenAskAiOptions) => void,
  onCloseAskAi: () => void,
  onCreateStickyNote: () => void,
  isStickyNotesManagerShown: boolean,
  gameplayTestsCallbacks: GameplayTestsCallbacks,
  getStorageProvider: () => StorageProvider,
  setPreviewedLayout: ({|
    layoutName: string | null,
    externalLayoutName: string | null,
    eventsBasedObjectType: string | null,
    eventsBasedObjectVariantName: string | null,
  |}) => void,
  openExternalEvents: (name: string) => void,
  openLayout: OpenLayoutHandler,
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
  ) => Promise<void>,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onOpenCustomObjectEditor: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variantName: string
  ) => void,
  onOpenPrefabDetailEditor: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onOpenPrefabSettings: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onOpenEventsFunctionsExtension: (
    extensionName: string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
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
  onNavigateToEventFromGlobalSearch: (
    params: NavigateToEventFromGlobalSearchParams
  ) => void,
  onEditorTabClosing: (editorTab: EditorTab) => void,
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
  createEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  createProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
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
  onExtractAsEventBasedObject: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onEventBasedObjectTypeChanged: () => void,
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
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) => void,
  onSceneObjectsDeleted: (scene: gdLayout) => void,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  onProjectItemRenamedOutsideEditor: (
    changes: ProjectItemRenamedOutsideEditorChanges
  ) => void,
  onWillDeleteScene: (changes: WillDeleteSceneChanges) => Promise<void>,
  onWillDeleteGameplayTest: (
    changes: WillDeleteGameplayTestChanges
  ) => Promise<void>,
  onWillDeleteObject: (changes: WillDeleteObjectChanges) => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onLoadEventsFunctionsExtensions: ({|
    shouldHotReloadEditor: boolean,
  |}) => Promise<void>,
  onEffectAdded: () => void,
  onObjectListsModified: ({ isNewObjectTypeUsed: boolean }) => void,
  onExternalAssociationChanged: () => void,
  triggerHotReloadInGameEditorIfNeeded: () => void,
  gamesList: GamesList,

  setEditorTabs: (editorTabs: EditorTabsState) => void,
  onFocusedEditorTabChange: (
    editorTab: EditorTab,
    options?: {| force?: boolean |}
  ) => void,
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
  onPopOutTab?: ?(editorTab: EditorTab) => void,
  onRequestPaneClose?: ?(onClosed: () => void) => void,
  drawerState?: FloatingPaneState,
  rightPaneDrawerOpen?: boolean,
|};

const EditorTabsPane: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<{}>,
}> = React.forwardRef<Props, {||}>((props, ref) => {
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
    isProjectManagerPinned,
    saveProject,
    autoSaveConstants,
    saveProjectAsWithStorageProvider,
    onCheckoutVersion,
    getOrLoadProjectVersion,
    openShareDialog,
    launchDebuggerAndPreview,
    launchNewPreview,
    launchNetworkPreview,
    launchHotReloadPreview,
    launchPreviewWithDiagnosticReport,
    displayCollisionShapesInPreview,
    setDisplayCollisionShapesInPreview,
    displaySignalAnimationsInPreview,
    setDisplaySignalAnimationsInPreview,
    setPreviewOverride,
    openVersionHistoryPanel,
    onQuitVersionHistory,
    onOpenAskAi,
    onCloseAskAi,
    onCreateStickyNote,
    isStickyNotesManagerShown,
    gameplayTestsCallbacks,
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
    onOpenPrefabDetailEditor,
    onOpenPrefabSettings,
    onOpenEventsFunctionsExtension,
    onRenamedEventsBasedObject,
    onDeletedEventsBasedObject,
    openObjectEvents,
    onNavigateToEventFromGlobalSearch,
    onEditorTabClosing,
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
    onLoadEventsFunctionsExtensions,
    renameResourcesInProject,
    openBehaviorEvents,
    onExtractAsExternalLayout,
    onExtractAsEventBasedObject,
    onEventBasedObjectTypeChanged,
    onOpenEventBasedObjectEditor,
    onOpenEventBasedObjectVariantEditor,
    deleteEventsBasedObjectVariant,
    onEventsBasedObjectChildrenEdited,
    onSceneObjectEdited,
    onSceneObjectsDeleted,
    onSceneEventsModifiedOutsideEditor,
    onInstancesModifiedOutsideEditor,
    onObjectsModifiedOutsideEditor,
    onObjectGroupsModifiedOutsideEditor,
    onProjectItemRenamedOutsideEditor,
    onWillDeleteScene,
    onWillDeleteGameplayTest,
    onWillDeleteObject,
    onWillInstallExtension,
    onExtensionInstalled,
    onEffectAdded,
    onObjectListsModified,
    onExternalAssociationChanged,
    triggerHotReloadInGameEditorIfNeeded,
    gamesList,
    setEditorTabs,
    onFocusedEditorTabChange,
    onSetPointerEventsNone,
    paneIdentifier,
    isLeftMostPane,
    isRightMostPane,
    isDrawer,
    onSetPaneDrawerState,
    areSidePanesDrawers,
    gameEditorMode,
    setGameEditorMode,
    onRestartInGameEditor,
    showRestartInGameEditorAfterErrorButton,
    toolbarButtons,
    projectPath,
    triggerNpmScript,
    onRequestPaneClose,
    rightPaneDrawerOpen,
  } = props;

  const hasActiveEmbeddedGameFrameHole =
    useActiveEmbeddedGameFrameHoleCount() > 0;
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
      // The games platform iframe only needs clicks to pass through the start
      // page content. Disabling the entire pane is too broad: if the iframe
      // visibility state gets out of sync, every editor in the pane stops
      // receiving input.
      onSetPointerEventsNone(false);
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
      if (paneIdentifier === 'center') {
        onFocusedEditorTabChange(editorTab);
      }
    },
    [onFocusedEditorTabChange, paneIdentifier]
  );

  const onChangeEditorTab = React.useCallback(
    (value: number) => {
      const newEditorTabs = changeCurrentTab(editorTabs, paneIdentifier, value);
      setEditorTabs(newEditorTabs);
      // The new active prop renders the selected editor and ClosableTab reports
      // its activation after that commit. Doing either operation imperatively
      // here would render a large events sheet again while switching tabs.
    },
    [editorTabs, setEditorTabs, paneIdentifier]
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

  // When the Ask AI tab is among the tabs about to be closed and a request is
  // running, let the AI editor ask the user whether it should keep working,
  // stop, or cancel the close. Returns false only if the close should be
  // aborted (the user picked "Cancel").
  const shouldProceedClosingTabs = React.useCallback(
    (tabsBeingClosed: Array<EditorTab>): Promise<boolean> => {
      const askAiTab = tabsBeingClosed.find(tab => tab.key === 'ask-ai');
      if (askAiTab && askAiTab.editorRef) {
        // $FlowFixMe[incompatible-use] - the key ensures an AskAiEditorInterface.
        const ref = (askAiTab.editorRef: any);
        if (ref.requestClose) {
          return ref.requestClose();
        }
      }
      return Promise.resolve(true);
    },
    []
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

      onOpenAskAi();
    },
    [askAiPaneIdentifier, onOpenAskAi, onSetPaneDrawerState]
  );

  return (
    <div style={styles.container} ref={containerRef}>
      {isDrawer ? (
        <DrawerTopBar
          drawerAnchor={isRightMostPane ? 'right' : 'left'}
          title={'Ask AI'}
          id={paneIdentifier + '-top-bar'}
          onClose={() => {
            // Closing the drawer hides the editor but does not unmount it, so
            // the AI keeps running. Still ask (via the AI editor's requestClose)
            // whether it should be stopped; only hide the drawer if confirmed.
            shouldProceedClosingTabs(paneEditorTabs).then(shouldClose => {
              if (shouldClose) onSetPaneDrawerState(paneIdentifier, 'closed');
            });
          }}
          disableSafeAreaTopMargin
        />
      ) : (
        <TabsTitlebar
          isLeftMostPane={isLeftMostPane}
          isRightMostPane={isRightMostPane}
          displayMenuIcon={
            paneIdentifier === 'center' && !isProjectManagerPinned
          }
          displayLeftSafeMargins={!isProjectManagerPinned}
          hidden={tabsTitleBarAndEditorToolbarHidden}
          toggleProjectManager={toggleProjectManager}
          renderTabs={(onEditorTabHovered, clearTooltipOnTabClose) => (
            <DraggableEditorTabs
              hideLabels={false}
              editors={paneEditorTabs}
              currentTab={currentTab}
              onClickTab={onChangeEditorTab}
              onCloseTab={(editorTab: EditorTab) => {
                clearTooltipOnTabClose();
                shouldProceedClosingTabs([editorTab]).then(shouldClose => {
                  if (!shouldClose) return;
                  onEditorTabClosing(editorTab);
                  if (
                    onRequestPaneClose &&
                    paneEditorTabs.length === 1 &&
                    !areSidePanesDrawers
                  ) {
                    onRequestPaneClose(() => onCloseEditorTab(editorTab));
                  } else {
                    onCloseEditorTab(editorTab);
                  }
                });
              }}
              onCloseOtherTabs={(editorTab: EditorTab) => {
                clearTooltipOnTabClose();
                const tabsBeingClosed = paneEditorTabs.filter(
                  paneEditorTab =>
                    paneEditorTab !== editorTab && paneEditorTab.closable
                );
                shouldProceedClosingTabs(tabsBeingClosed).then(shouldClose => {
                  if (!shouldClose) return;
                  tabsBeingClosed.forEach(paneEditorTab => {
                    onEditorTabClosing(paneEditorTab);
                  });
                  onCloseOtherEditorTabs(editorTab);
                });
              }}
              onCloseAll={() => {
                clearTooltipOnTabClose();
                const tabsBeingClosed = paneEditorTabs.filter(
                  paneEditorTab => paneEditorTab.closable
                );
                shouldProceedClosingTabs(tabsBeingClosed).then(shouldClose => {
                  if (!shouldClose) return;
                  tabsBeingClosed.forEach(paneEditorTab => {
                    onEditorTabClosing(paneEditorTab);
                  });
                  onCloseAllEditorTabs();
                });
              }}
              onPopOutTab={props.onPopOutTab}
              onTabActivated={onEditorTabActivated}
              onDropTab={onDropEditorTab}
              onHoverTab={onEditorTabHovered}
            />
          )}
          displayAskAi={
            !askAiPaneIdentifier
              ? // If Ask AI is closed, display the button on the right most part of the window.
                isRightMostPane
              : // If it's open in a drawer, only show the button when the drawer is closed,
                // so the button re-appears (with a glow) when the user dismisses the panel.
                areSidePanesDrawers &&
                askAiPaneIdentifier.paneIdentifier !== 'center' &&
                !rightPaneDrawerOpen
          }
          onAskAiClicked={onOpenAskAiFromTitlebar}
          displayStickyNotes={!!currentProject && isRightMostPane}
          onStickyNotesClicked={onCreateStickyNote}
          isStickyNotesManagerShown={isStickyNotesManagerShown}
        />
      )}
      <Toolbar
        ref={toolbarRef}
        hidden={tabsTitleBarAndEditorToolbarHidden}
        showProjectButtons={
          !['start page', 'debugger', 'ask-ai', 'global-search', null].includes(
            currentTab ? currentTab.key : null
          )
        }
        showPreviewAndShareButtons={
          // A gameplay test is run with its own button: no preview or share.
          !currentTab || currentTab.kind !== 'gameplay-test'
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
        displayCollisionShapesInPreview={displayCollisionShapesInPreview}
        setDisplayCollisionShapesInPreview={setDisplayCollisionShapesInPreview}
        displaySignalAnimationsInPreview={displaySignalAnimationsInPreview}
        setDisplaySignalAnimationsInPreview={
          setDisplaySignalAnimationsInPreview
        }
        canDoNetworkPreview={canDoNetworkPreview}
        setPreviewOverride={setPreviewOverride}
        isPreviewEnabled={
          !!currentProject &&
          currentProject.getLayoutsCount() > 0 &&
          !props.isPreviewLaunchInProgress
        }
        previewState={previewState}
        onOpenVersionHistory={openVersionHistoryPanel}
        checkedOutVersionStatus={checkedOutVersionStatus}
        onQuitVersionHistory={onQuitVersionHistory}
        canQuitVersionHistory={!isSavingProject}
        toolbarButtons={toolbarButtons}
        projectPath={projectPath}
        triggerNpmScript={triggerNpmScript}
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

            const editorContent = (
              <ActiveTabCommandsProvider active={isCurrentTab}>
                <ErrorBoundary
                  componentTitle={errorBoundaryProps.componentTitle}
                  scope={errorBoundaryProps.scope}
                >
                  {editorTab.renderEditorContainer({
                    editorId: editorTab.id,
                    gameEditorMode,
                    setGameEditorMode,
                    isActive: isCurrentTab,
                    extraEditorProps: editorTab.extraEditorProps,
                    project: currentProject,
                    fileMetadata: currentFileMetadata,
                    storageProvider: getStorageProvider(),
                    ref: editorRef => (editorTab.editorRef = editorRef),
                    setToolbar: editorToolbar => {
                      setEditorToolbar(editorToolbar, isCurrentTab);
                    },
                    setGamesPlatformFrameShown: onSetGamesPlatformFrameShown,
                    projectItemName: editorTab.projectItemName,
                    setPreviewedLayout,
                    onOpenAskAi,
                    onCloseAskAi,
                    gameplayTestsCallbacks,
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
                    onRestartInGameEditor,
                    showRestartInGameEditorAfterErrorButton,
                    resourceManagementProps,
                    onSave: saveProject,
                    onAutoSaveConstants: autoSaveConstants,
                    onSaveProjectAsWithStorageProvider: saveProjectAsWithStorageProvider,
                    canSave,
                    onCheckoutVersion,
                    getOrLoadProjectVersion,
                    onCreateEventsFunction,
                    openInstructionOrExpression,
                    onOpenCustomObjectEditor: onOpenCustomObjectEditor,
                    onOpenPrefabDetailEditor: onOpenPrefabDetailEditor,
                    onOpenPrefabSettings: onOpenPrefabSettings,
                    onOpenEventsFunctionsExtension,
                    onRenamedEventsBasedObject: onRenamedEventsBasedObject,
                    onDeletedEventsBasedObject: onDeletedEventsBasedObject,
                    openObjectEvents,
                    onNavigateToEventFromGlobalSearch,
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
                    onLoadEventsFunctionsExtensions: onLoadEventsFunctionsExtensions,
                    onReloadEventsFunctionsExtensionMetadata: extension => {
                      if (isProjectClosedSoAvoidReloadingExtensions) {
                        return;
                      }
                      eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata(
                        currentProject,
                        extension
                      );
                      for (const editorTab of getAllEditorTabs(editorTabs)) {
                        const { editorRef } = editorTab;
                        if (editorRef) {
                          editorRef.forceUpdateEditor();
                        }
                      }
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
                    onExtractAsEventBasedObject: onExtractAsEventBasedObject,
                    onEventBasedObjectTypeChanged: onEventBasedObjectTypeChanged,
                    onOpenEventBasedObjectEditor: onOpenEventBasedObjectEditor,
                    onOpenEventBasedObjectVariantEditor: onOpenEventBasedObjectVariantEditor,
                    onDeleteEventsBasedObjectVariant: deleteEventsBasedObjectVariant,
                    onEventsBasedObjectChildrenEdited: onEventsBasedObjectChildrenEdited,
                    onSceneObjectEdited: onSceneObjectEdited,
                    onSceneObjectsDeleted: onSceneObjectsDeleted,
                    onSceneEventsModifiedOutsideEditor: onSceneEventsModifiedOutsideEditor,
                    onInstancesModifiedOutsideEditor: onInstancesModifiedOutsideEditor,
                    onObjectsModifiedOutsideEditor: onObjectsModifiedOutsideEditor,
                    onObjectGroupsModifiedOutsideEditor: onObjectGroupsModifiedOutsideEditor,
                    onProjectItemRenamedOutsideEditor: onProjectItemRenamedOutsideEditor,
                    onWillDeleteScene: onWillDeleteScene,
                    onWillDeleteGameplayTest: onWillDeleteGameplayTest,
                    onWillDeleteObject: onWillDeleteObject,
                    onWillInstallExtension: onWillInstallExtension,
                    onExtensionInstalled: onExtensionInstalled,
                    onEffectAdded: onEffectAdded,
                    onObjectListsModified: onObjectListsModified,
                    onExternalAssociationChanged,
                    triggerHotReloadInGameEditorIfNeeded: triggerHotReloadInGameEditorIfNeeded,
                    gamesList,
                    gamesPlatformFrameTools,
                  })}
                </ErrorBoundary>
              </ActiveTabCommandsProvider>
            );

            return (
              <TabContentContainer
                key={editorTab.id}
                active={isCurrentTab}
                removePointerEvents={
                  // Deactivate pointer events when the play tab is active, so the iframe
                  // can be interacted with.
                  (editorTab.kind === 'start page' &&
                    gamesPlatformFrameTools.iframeVisible) ||
                  shouldRemovePointerEvents(
                    editorTab.kind,
                    gameEditorMode,
                    hasActiveEmbeddedGameFrameHole
                  )
                }
              >
                {editorContent}
              </TabContentContainer>
            );
          })}
        </MuiThemeOnlyProvider>
      </SpecificDimensionsWindowSizeProvider>
    </div>
  );
});

export default EditorTabsPane;

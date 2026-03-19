// @flow
import * as React from 'react';
import WindowPortal from '../UI/WindowPortal';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import { type MainFrameToolbarProps } from './Toolbar';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  ErrorBoundary,
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import { CommandsContextScopedProvider } from '../CommandPalette/CommandsContext';
import UnsavedChangesContext from './UnsavedChangesContext';
import type { EditorTab } from './EditorTabs/EditorTabsHandler';
import type { EditorTabsPaneCommonProps } from './EditorTabsPane';

type Props = {|
  editorTab: EditorTab,
  onClose: (editorTab: EditorTab) => void,
  onPopIn: (editorTab: EditorTab) => void,
  commonProps: EditorTabsPaneCommonProps,
|};

/**
 * Renders a single editor tab in a separate browser window (WindowPortal).
 * Each external window has its own Toolbar, theme provider, and responsive
 * size tracking.
 */
const ExternalEditorWindow = ({
  editorTab,
  onClose,
  onPopIn,
  commonProps,
}: Props): React.Node => {
  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const toolbarInitialized = React.useRef(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = React.useState<number | null>(null);
  const [windowHeight, setWindowHeight] = React.useState<number | null>(null);
  const unsavedChanges = React.useContext(UnsavedChangesContext);

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
    gameEditorMode,
    setGameEditorMode,
    toolbarButtons,
    projectPath,
    saveProject,
    saveProjectAsWithStorageProvider,
    onCheckoutVersion,
    getOrLoadProjectVersion,
    openShareDialog,
    launchDebuggerAndPreview,
    launchNewPreview,
    launchNetworkPreview,
    launchHotReloadPreview,
    launchPreviewWithDiagnosticReport,
    setPreviewOverride,
    onRestartInGameEditor,
    showRestartInGameEditorAfterErrorButton,
    openVersionHistoryPanel,
    onQuitVersionHistory,
    onOpenAskAi,
    onCloseAskAi,
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
    onWillInstallExtension,
    onExtensionInstalled,
    onLoadEventsFunctionsExtensions,
    onEffectAdded,
    onObjectListsModified,
    onExternalLayoutAssociationChanged,
    triggerHotReloadInGameEditorIfNeeded,
    gamesList,
  } = commonProps;

  // Track the external window dimensions via ResizeObserver.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWindowWidth(entry.contentRect.width);
        setWindowHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const errorBoundaryProps = getEditorErrorBoundaryProps(editorTab.key);

  const editorContent = (
    <CommandsContextScopedProvider active>
      <ErrorBoundary
        componentTitle={errorBoundaryProps.componentTitle}
        scope={errorBoundaryProps.scope}
      >
        {editorTab.renderEditorContainer({
          editorId: editorTab.key,
          gameEditorMode,
          setGameEditorMode,
          isActive: true,
          extraEditorProps: editorTab.extraEditorProps,
          project: currentProject,
          fileMetadata: currentFileMetadata,
          storageProvider: getStorageProvider(),
          ref: editorRef => (editorTab.editorRef = editorRef),
          setToolbar: editorToolbar => {
            if (toolbarRef.current) {
              toolbarRef.current.setEditorToolbar(editorToolbar || null);
            }
          },
          setGamesPlatformFrameShown: () => {},
          projectItemName: editorTab.projectItemName,
          setPreviewedLayout,
          onOpenAskAi,
          onCloseAskAi,
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
          onSaveProjectAsWithStorageProvider: saveProjectAsWithStorageProvider,
          canSave,
          onCheckoutVersion,
          getOrLoadProjectVersion,
          onCreateEventsFunction,
          openInstructionOrExpression,
          onOpenCustomObjectEditor: onOpenCustomObjectEditor,
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
          },
          onDeleteResource: (
            resource: gdResource,
            cb: boolean => void
          ) => {
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
          onWillInstallExtension: onWillInstallExtension,
          onExtensionInstalled: onExtensionInstalled,
          onEffectAdded: onEffectAdded,
          onObjectListsModified: onObjectListsModified,
          onExternalLayoutAssociationChanged,
          triggerHotReloadInGameEditorIfNeeded: triggerHotReloadInGameEditorIfNeeded,
          gamesList,
          gamesPlatformFrameTools,
        })}
      </ErrorBoundary>
    </CommandsContextScopedProvider>
  );

  return (
    <WindowPortal
      key={`external-${editorTab.key}`}
      title={editorTab.label || 'GDevelop'}
      onClose={() => {
        onEditorTabClosing(editorTab);
        onClose(editorTab);
      }}
      width={1024}
      height={750}
    >
      <FullThemeProvider>
        <Toolbar
          ref={ref => {
            if (!ref) return;
            toolbarRef.current = ref;
            if (!toolbarInitialized.current && editorTab.editorRef) {
              toolbarInitialized.current = true;
              editorTab.editorRef.updateToolbar();
            }
          }}
          hidden={false}
          showProjectButtons={
            !['start page', 'debugger', 'ask-ai', 'global-search'].includes(
              editorTab.key
            )
          }
          canSave={canSave}
          onSave={saveProject}
          openShareDialog={() => openShareDialog()}
          isSharingEnabled={isSharingEnabled}
          onOpenDebugger={launchDebuggerAndPreview}
          hasPreviewsRunning={hasPreviewsRunning}
          onPreviewWithoutHotReload={launchNewPreview}
          onNetworkPreview={launchNetworkPreview}
          onHotReloadPreview={launchHotReloadPreview}
          onLaunchPreviewWithDiagnosticReport={
            launchPreviewWithDiagnosticReport
          }
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
          toolbarButtons={toolbarButtons}
          projectPath={projectPath}
        />
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            flex: 1,
            width: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <SpecificDimensionsWindowSizeProvider
            innerWidth={windowWidth}
            innerHeight={windowHeight}
          >
            {editorContent}
          </SpecificDimensionsWindowSizeProvider>
        </div>
      </FullThemeProvider>
    </WindowPortal>
  );
};

export default ExternalEditorWindow;

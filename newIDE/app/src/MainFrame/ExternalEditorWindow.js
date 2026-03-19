// @flow
import * as React from 'react';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import CommandsContextScopedProvider from '../CommandPalette/CommandsScopedContext';
import ErrorBoundary, {
  getEditorErrorBoundaryProps,
} from '../UI/ErrorBoundary';
import { type EditorTab } from './EditorTabs/EditorTabsHandler';
import UnsavedChangesContext from './UnsavedChangesContext';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import WindowPortal from '../UI/WindowPortal';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { type EditorTabsPaneCommonProps } from './EditorTabsPane';

type Props = {|
  ...EditorTabsPaneCommonProps,
  editorTab: EditorTab,
  onClose: (editorTab: EditorTab) => void,
  onPopIn: (editorTab: EditorTab) => void,
|};

const ExternalEditorWindow = (props: Props): React.Node => {
  const { editorTab, onClose, onPopIn } = props;

  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const initializedToolbar = React.useRef<boolean>(false);
  const unsavedChanges = React.useContext(UnsavedChangesContext);

  // Track the external window's dimensions via ResizeObserver.
  // Use a callback ref so the observer is attached as soon as the DOM node
  // appears inside the WindowPortal (which creates its container asynchronously).
  const [windowWidth, setWindowWidth] = React.useState<number | null>(null);
  const [windowHeight, setWindowHeight] = React.useState<number | null>(null);
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const containerRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Disconnect any previous observer.
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setWindowWidth(entry.contentRect.width);
          setWindowHeight(entry.contentRect.height);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    },
    []
  );

  // Clean up observer on unmount.
  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const errorBoundaryProps = getEditorErrorBoundaryProps(editorTab.key);

  return (
    <WindowPortal
      key={`popout-${editorTab.key}`}
      title={editorTab.label || 'GDevelop'}
      onClose={() => {
        props.onEditorTabClosing(editorTab);
        onClose(editorTab);
      }}
      width={1024}
      height={750}
    >
      <FullThemeProvider>
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
          }}
        >
          <Toolbar
            ref={ref => {
              if (!ref) return;
              toolbarRef.current = ref;
              if (!initializedToolbar.current && editorTab.editorRef) {
                initializedToolbar.current = true;
                editorTab.editorRef.updateToolbar();
              }
            }}
            hidden={false}
            showProjectButtons={
              !['start page', 'debugger', 'ask-ai', 'global-search'].includes(
                editorTab.key
              )
            }
            canSave={props.canSave}
            onSave={props.saveProject}
            openShareDialog={() => props.openShareDialog()}
            isSharingEnabled={props.isSharingEnabled}
            onOpenDebugger={props.launchDebuggerAndPreview}
            hasPreviewsRunning={props.hasPreviewsRunning}
            onPreviewWithoutHotReload={props.launchNewPreview}
            onNetworkPreview={props.launchNetworkPreview}
            onHotReloadPreview={props.launchHotReloadPreview}
            onLaunchPreviewWithDiagnosticReport={
              props.launchPreviewWithDiagnosticReport
            }
            canDoNetworkPreview={props.canDoNetworkPreview}
            setPreviewOverride={props.setPreviewOverride}
            isPreviewEnabled={
              !!props.currentProject &&
              props.currentProject.getLayoutsCount() > 0
            }
            previewState={props.previewState}
            onOpenVersionHistory={props.openVersionHistoryPanel}
            checkedOutVersionStatus={props.checkedOutVersionStatus}
            onQuitVersionHistory={props.onQuitVersionHistory}
            canQuitVersionHistory={!props.isSavingProject}
            toolbarButtons={props.toolbarButtons}
            projectPath={props.projectPath}
          />
          <SpecificDimensionsWindowSizeProvider
            innerWidth={windowWidth}
            innerHeight={windowHeight}
          >
            <div
              style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <CommandsContextScopedProvider active={true}>
                <ErrorBoundary
                  componentTitle={errorBoundaryProps.componentTitle}
                  scope={errorBoundaryProps.scope}
                >
                  {editorTab.renderEditorContainer({
                    editorId: editorTab.key,
                    gameEditorMode: props.gameEditorMode,
                    setGameEditorMode: props.setGameEditorMode,
                    isActive: true,
                    extraEditorProps: editorTab.extraEditorProps,
                    project: props.currentProject,
                    fileMetadata: props.currentFileMetadata,
                    storageProvider: props.getStorageProvider(),
                    ref: editorRef => (editorTab.editorRef = editorRef),
                    setToolbar: editorToolbar => {
                      const toolbar = toolbarRef.current;
                      if (toolbar) {
                        toolbar.setEditorToolbar(editorToolbar || null);
                      }
                    },
                    setGamesPlatformFrameShown: () => {},
                    projectItemName: editorTab.projectItemName,
                    setPreviewedLayout: props.setPreviewedLayout,
                    onOpenAskAi: props.onOpenAskAi,
                    onCloseAskAi: props.onCloseAskAi,
                    onOpenExternalEvents: props.openExternalEvents,
                    onOpenEvents: (sceneName: string) => {
                      props.openLayout(sceneName, {
                        openEventsEditor: true,
                        openSceneEditor: false,
                        focusWhenOpened: 'events',
                      });
                    },
                    onOpenLayout: props.openLayout,
                    onOpenTemplateFromTutorial: props.openTemplateFromTutorial,
                    onOpenTemplateFromCourseChapter:
                      props.openTemplateFromCourseChapter,
                    previewDebuggerServer: props.previewDebuggerServer,
                    hotReloadPreviewButtonProps:
                      props.hotReloadPreviewButtonProps,
                    onRestartInGameEditor: props.onRestartInGameEditor,
                    showRestartInGameEditorAfterErrorButton:
                      props.showRestartInGameEditorAfterErrorButton,
                    resourceManagementProps: props.resourceManagementProps,
                    onSave: props.saveProject,
                    onSaveProjectAsWithStorageProvider:
                      props.saveProjectAsWithStorageProvider,
                    canSave: props.canSave,
                    onCheckoutVersion: props.onCheckoutVersion,
                    getOrLoadProjectVersion: props.getOrLoadProjectVersion,
                    onCreateEventsFunction: props.onCreateEventsFunction,
                    openInstructionOrExpression:
                      props.openInstructionOrExpression,
                    onOpenCustomObjectEditor: props.onOpenCustomObjectEditor,
                    onOpenEventsFunctionsExtension:
                      props.onOpenEventsFunctionsExtension,
                    onRenamedEventsBasedObject:
                      props.onRenamedEventsBasedObject,
                    onDeletedEventsBasedObject:
                      props.onDeletedEventsBasedObject,
                    openObjectEvents: props.openObjectEvents,
                    onNavigateToEventFromGlobalSearch:
                      props.onNavigateToEventFromGlobalSearch,
                    unsavedChanges: unsavedChanges,
                    canOpen: props.canOpen,
                    onChooseProject: () =>
                      props.openOpenFromStorageProviderDialog(),
                    onOpenRecentFile:
                      props.openFromFileMetadataWithStorageProvider,
                    onOpenNewProjectSetupDialog: props.openNewProjectDialog,
                    onOpenProjectManager: () => props.openProjectManager(true),
                    onOpenVersionHistory: props.openVersionHistoryPanel,
                    askToCloseProject: props.askToCloseProject,
                    closeProject: props.closeProject,
                    onSelectExampleShortHeader: exampleShortHeader => {
                      props.onSelectExampleShortHeader({
                        exampleShortHeader,
                        preventBackHome: true,
                      });
                    },
                    onSelectPrivateGameTemplateListingData: privateGameTemplateListingData => {
                      props.onSelectPrivateGameTemplateListingData({
                        privateGameTemplateListingData,
                        preventBackHome: true,
                      });
                    },
                    onOpenPrivateGameTemplateListingData: privateGameTemplateListingData => {
                      props.onSelectPrivateGameTemplateListingData({
                        privateGameTemplateListingData,
                        preventBackHome: true,
                      });
                    },
                    onCreateEmptyProject: props.createEmptyProject,
                    onCreateProjectFromExample: props.createProjectFromExample,
                    onOpenProfile: props.onOpenProfileDialog,
                    onOpenLanguageDialog: () =>
                      props.openLanguageDialog(true),
                    onOpenPreferences: () =>
                      props.openPreferencesDialog(true),
                    onOpenAbout: () => props.openAboutDialog(true),
                    selectInAppTutorial: props.selectInAppTutorial,
                    onLoadEventsFunctionsExtensions:
                      props.onLoadEventsFunctionsExtensions,
                    onReloadEventsFunctionsExtensionMetadata: extension => {
                      if (
                        props.isProjectClosedSoAvoidReloadingExtensions
                      ) {
                        return;
                      }
                      props.eventsFunctionsExtensionsState.reloadProjectEventsFunctionsExtensionMetadata(
                        props.currentProject,
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
                      if (props.currentProject)
                        props.renameResourcesInProject(props.currentProject, {
                          [resource.getName()]: newName,
                        });
                      cb(true);
                    },
                    openBehaviorEvents: props.openBehaviorEvents,
                    onExtractAsExternalLayout:
                      props.onExtractAsExternalLayout,
                    onExtractAsEventBasedObject:
                      props.onExtractAsEventBasedObject,
                    onEventBasedObjectTypeChanged:
                      props.onEventBasedObjectTypeChanged,
                    onOpenEventBasedObjectEditor:
                      props.onOpenEventBasedObjectEditor,
                    onOpenEventBasedObjectVariantEditor:
                      props.onOpenEventBasedObjectVariantEditor,
                    onDeleteEventsBasedObjectVariant:
                      props.deleteEventsBasedObjectVariant,
                    onEventsBasedObjectChildrenEdited:
                      props.onEventsBasedObjectChildrenEdited,
                    onSceneObjectEdited: props.onSceneObjectEdited,
                    onSceneObjectsDeleted: props.onSceneObjectsDeleted,
                    onSceneEventsModifiedOutsideEditor:
                      props.onSceneEventsModifiedOutsideEditor,
                    onInstancesModifiedOutsideEditor:
                      props.onInstancesModifiedOutsideEditor,
                    onObjectsModifiedOutsideEditor:
                      props.onObjectsModifiedOutsideEditor,
                    onObjectGroupsModifiedOutsideEditor:
                      props.onObjectGroupsModifiedOutsideEditor,
                    onWillInstallExtension: props.onWillInstallExtension,
                    onExtensionInstalled: props.onExtensionInstalled,
                    onEffectAdded: props.onEffectAdded,
                    onObjectListsModified: props.onObjectListsModified,
                    onExternalLayoutAssociationChanged:
                      props.onExternalLayoutAssociationChanged,
                    triggerHotReloadInGameEditorIfNeeded:
                      props.triggerHotReloadInGameEditorIfNeeded,
                    gamesList: props.gamesList,
                    gamesPlatformFrameTools: props.gamesPlatformFrameTools,
                  })}
                </ErrorBoundary>
              </CommandsContextScopedProvider>
            </div>
          </SpecificDimensionsWindowSizeProvider>
        </div>
      </FullThemeProvider>
    </WindowPortal>
  );
};

export default ExternalEditorWindow;

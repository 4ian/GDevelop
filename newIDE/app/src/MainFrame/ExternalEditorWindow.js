// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
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
import IconButton from '../UI/IconButton';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { useKeyboardShortcuts } from '../KeyboardShortcuts';
import CommandPalette, {
  type CommandPaletteInterface,
} from '../CommandPalette/CommandPalette';

type Props = {|
  ...EditorTabsPaneCommonProps,
  editorTab: EditorTab,
  onClose: (editorTab: EditorTab) => void,
  onPopIn: (editorTab: EditorTab) => void,
|};

const getPopOutDimensions = (
  originalPaneIdentifier: ?string
): {| popOutWidth: number, popOutHeight: number |} => {
  const screenWidth = window.outerWidth;
  const screenHeight = window.outerHeight;

  if (originalPaneIdentifier === 'left' || originalPaneIdentifier === 'right') {
    return {
      popOutWidth: Math.round(screenWidth / 3),
      popOutHeight: Math.ceil(screenHeight * 0.8),
    };
  }
  // 'center' or fallback: same size as main window
  return {
    popOutWidth: Math.ceil(screenWidth * 0.9),
    popOutHeight: Math.ceil(screenHeight * 0.8),
  };
};

// TODO: Rename this (and the file) to PoppedOutEditorContainerWindow.
const ExternalEditorWindow = (props: Props): React.Node => {
  const { editorTab, onClose, onPopIn } = props;

  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const initializedToolbar = React.useRef<boolean>(false);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const localCommandPaletteRef = React.useRef<?CommandPaletteInterface>(null);

  // Store the external window's document for keyboard shortcuts.
  const [
    externalWindowDocument,
    setExternalWindowDocument,
  ] = React.useState<?Document>(null);

  const onWindowReady = React.useCallback((externalWindow: any) => {
    setExternalWindowDocument(externalWindow ? externalWindow.document : null);
  }, []);

  // Compute adaptive window size based on which pane the tab came from.
  const { popOutWidth, popOutHeight } = React.useMemo(
    () => getPopOutDimensions(editorTab.originalPaneIdentifier),
    [editorTab.originalPaneIdentifier]
  );

  // Register keyboard shortcuts in the external window.
  useKeyboardShortcuts({
    targetDocument: externalWindowDocument || undefined,
    previewDebuggerServer: props.previewDebuggerServer,
    ignoreHandledByElectron: true,
    onRunCommand: React.useCallback(commandName => {
      if (commandName === 'OPEN_COMMAND_PALETTE') {
        if (localCommandPaletteRef.current) {
          localCommandPaletteRef.current.open();
        }
      } else {
        if (localCommandPaletteRef.current) {
          localCommandPaletteRef.current.launchCommand(commandName);
        }
      }
    }, []),
  });

  const errorBoundaryProps = getEditorErrorBoundaryProps(editorTab.key);

  return (
    <WindowPortal
      key={`popout-${editorTab.key}`}
      title={editorTab.label || 'GDevelop'}
      onClose={() => {
        props.onEditorTabClosing(editorTab);
        onClose(editorTab);
      }}
      initialWidth={popOutWidth}
      initialHeight={popOutHeight}
      onWindowReady={onWindowReady}
      renderContent={({ windowSize }) => (
        <SpecificDimensionsWindowSizeProvider
          innerWidth={windowSize.width}
          innerHeight={windowSize.height}
        >
          <FullThemeProvider>
            <CommandPalette ref={localCommandPaletteRef} />
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
              showProjectButtons={false}
              customLeftContent={
                <IconButton
                  size="small"
                  onClick={() => onPopIn(editorTab)}
                  tooltip={t`Pop back into main window`}
                  color="default"
                >
                  <OpenInBrowserIcon />
                </IconButton>
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
                    onOpenLanguageDialog: () => props.openLanguageDialog(true),
                    onOpenPreferences: () => props.openPreferencesDialog(true),
                    onOpenAbout: () => props.openAboutDialog(true),
                    selectInAppTutorial: props.selectInAppTutorial,
                    onLoadEventsFunctionsExtensions:
                      props.onLoadEventsFunctionsExtensions,
                    onReloadEventsFunctionsExtensionMetadata: extension => {
                      if (props.isProjectClosedSoAvoidReloadingExtensions) {
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
                    onExtractAsExternalLayout: props.onExtractAsExternalLayout,
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
          </FullThemeProvider>
        </SpecificDimensionsWindowSizeProvider>
      )}
    />
  );
};

export default ExternalEditorWindow;

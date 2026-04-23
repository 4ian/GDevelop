// @flow
import * as React from 'react';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import ToolbarTitlebar from './ToolbarTitlebar';
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
import { useKeyboardShortcuts } from '../KeyboardShortcuts';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Window from '../Utils/Window';
import PortalContainerContext from '../UI/PortalContainerContext';
import CommandPalette, {
  type CommandPaletteInterface,
} from '../CommandPalette/CommandPalette';
import AlertProvider from '../UI/Alert/AlertProvider';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { I18n } from '@lingui/react';
import useNewResourceDialog from '../ResourcesList/useNewResourceDialog';

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

const PoppedOutEditorContainerWindow = (props: Props): React.Node => {
  const { editorTab, onClose, onPopIn } = props;

  const toolbarRef = React.useRef<?ToolbarInterface>(null);
  const initializedToolbar = React.useRef<boolean>(false);
  const unsavedChanges = React.useContext(UnsavedChangesContext);
  const localCommandPaletteRef = React.useRef<?CommandPaletteInterface>(null);

  // Store the external window's document for keyboard shortcuts.
  const [externalWindow, setExternalWindow] = React.useState<?any>(null);
  const externalWindowDocument = externalWindow
    ? externalWindow.document
    : null;

  const onWindowReady = React.useCallback((externalWindow: any) => {
    setExternalWindow(externalWindow);
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

  const {
    onChooseResource: poppedOutOnChooseResource,
    renderNewResourceDialog,
  } = useNewResourceDialog();

  const poppedOutResourceManagementProps = React.useMemo(
    () => ({
      ...props.resourceManagementProps,
      onChooseResource: poppedOutOnChooseResource,
    }),
    [props.resourceManagementProps, poppedOutOnChooseResource]
  );

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
            <AlertProvider>
              <PoppedOutWindowBackgroundColor />
              <CommandPalette ref={localCommandPaletteRef} />
              <ToolbarTitlebar
                onPopIn={() => onPopIn(editorTab)}
                renderToolbar={() => (
                  <Toolbar
                    ref={toolbarRef}
                    hidden={false}
                    showProjectButtons={false}
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
                    triggerNpmScript={props.triggerNpmScript}
                  />
                )}
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
                  <DragAndDropContextProvider
                    key={
                      externalWindowDocument
                        ? `dnd-${editorTab.key}-external-window`
                        : `dnd-${editorTab.key}-main-window-fallback`
                    }
                    window={externalWindow}
                  >
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
                        ref: editorRef => {
                          editorTab.editorRef = editorRef;

                          // Take the opportunity to show the toolbar when the editor is first ready.
                          if (
                            !initializedToolbar.current &&
                            editorTab.editorRef
                          ) {
                            initializedToolbar.current = true;
                            editorTab.editorRef.updateToolbar();
                          }
                        },
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
                        onOpenTemplateFromTutorial:
                          props.openTemplateFromTutorial,
                        onOpenTemplateFromCourseChapter:
                          props.openTemplateFromCourseChapter,
                        previewDebuggerServer: props.previewDebuggerServer,
                        hotReloadPreviewButtonProps:
                          props.hotReloadPreviewButtonProps,
                        onRestartInGameEditor: props.onRestartInGameEditor,
                        showRestartInGameEditorAfterErrorButton:
                          props.showRestartInGameEditorAfterErrorButton,
                        resourceManagementProps: poppedOutResourceManagementProps,
                        onSave: props.saveProject,
                        onSaveProjectAsWithStorageProvider:
                          props.saveProjectAsWithStorageProvider,
                        canSave: props.canSave,
                        onCheckoutVersion: props.onCheckoutVersion,
                        getOrLoadProjectVersion: props.getOrLoadProjectVersion,
                        onCreateEventsFunction: props.onCreateEventsFunction,
                        openInstructionOrExpression:
                          props.openInstructionOrExpression,
                        onOpenCustomObjectEditor:
                          props.onOpenCustomObjectEditor,
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
                        onOpenProjectManager: () =>
                          props.openProjectManager(true),
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
                        onCreateProjectFromExample:
                          props.createProjectFromExample,
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
                            props.renameResourcesInProject(
                              props.currentProject,
                              {
                                [resource.getName()]: newName,
                              }
                            );
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
                  </DragAndDropContextProvider>
                </CommandsContextScopedProvider>
              </div>
              <I18n>
                {({ i18n }) =>
                  renderNewResourceDialog({
                    project: props.currentProject,
                    fileMetadata: props.currentFileMetadata,
                    getStorageProvider: props.getStorageProvider,
                    i18n,
                    resourceSources:
                      props.resourceManagementProps.resourceSources,
                  })
                }
              </I18n>
            </AlertProvider>
          </FullThemeProvider>
        </SpecificDimensionsWindowSizeProvider>
      )}
    />
  );
};

/**
 * Sets the background color of the popped-out window to match the theme,
 * similar to what ProjectTitlebar does for the main window.
 */
const PoppedOutWindowBackgroundColor = () => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const portalContainer = React.useContext(PortalContainerContext);

  React.useEffect(
    () => {
      Window.setWindowBackgroundColor(
        gdevelopTheme.toolbar.backgroundColor,
        portalContainer ? portalContainer.ownerDocument : undefined
      );
    },
    [gdevelopTheme.toolbar.backgroundColor, portalContainer]
  );

  return null;
};

export default PoppedOutEditorContainerWindow;

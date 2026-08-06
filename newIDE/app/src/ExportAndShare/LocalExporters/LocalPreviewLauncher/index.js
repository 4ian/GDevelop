// @flow
import * as React from 'react';
import LocalFileSystem from '../LocalFileSystem';
import optionalRequire from '../../../Utils/OptionalRequire';
import { findGDJS } from '../../../GameEngineFinder/LocalGDJSFinder';
import LocalNetworkPreviewDialog from './LocalNetworkPreviewDialog';
import assignIn from 'lodash/assignIn';
import {
  type PreviewOptions,
  type PreviewLauncherProps,
  type CaptureOptions,
} from '../../PreviewLauncher.flow';
import {
  getDebuggerServerAddress,
  localPreviewDebuggerServer,
} from './LocalPreviewDebuggerServer';
import Window from '../../../Utils/Window';
import { getIDEVersionWithHash } from '../../../Version';
import { setEmbeddedGameFramePreviewLocation } from '../../../EmbeddedGame/EmbeddedGameFrame';
import {
  addGlobalObjectGroupsToDataJs,
  addGlobalObjectGroupsToProjectData,
} from '../../PreviewGlobalObjectGroupsPatch';
import { hasConstantPlaceholderDiagnostic } from '../../../Utils/ConstantPlaceholderDiagnostics';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd: libGDevelop = global.gd;

let nextPreviewId = 1;

type State = {|
  networkPreviewDialogOpen: boolean,
  networkPreviewHost: ?string,
  networkPreviewPort: ?number,
  networkPreviewError: ?any,
  previewGamePath: ?string,
  previewBrowserWindowOptions: ?{
    width: number,
    height: number,
    useContentSize: boolean,
    title: string,
    backgroundColor: string,
  },
  hideMenuBar: boolean,
  alwaysOnTop: boolean,
  numberOfWindows: number,
  captureOptions: ?CaptureOptions,
|};

const prepareExporter = async ({
  isForInGameEdition,
}: {
  isForInGameEdition: boolean,
}): Promise<{|
  outputDir: string,
  exporter: gdjsExporter,
  gdjsRoot: string,
  fileSystem: any,
|}> => {
  const { gdjsRoot } = await findGDJS();
  console.info('GDJS found in ', gdjsRoot);

  const localFileSystem = new LocalFileSystem({
    downloadUrlsToLocalFiles: false,
  });
  const fileSystem = assignIn(new gd.AbstractFileSystemJS(), localFileSystem);
  const outputDir = path.join(
    fileSystem.getTempDir(),
    isForInGameEdition ? 'in-game-editor-preview' : 'preview'
  );
  const exporter = new gd.Exporter(fileSystem, gdjsRoot);

  return {
    outputDir,
    exporter,
    gdjsRoot,
    fileSystem,
  };
};

export default class LocalPreviewLauncher extends React.Component<
  PreviewLauncherProps,
  State
> {
  canDoNetworkPreview = (): any => true;
  _onPreviewWindowClosed: ?(event: any) => Promise<void>;

  // $FlowFixMe[missing-local-annot]
  state = {
    networkPreviewDialogOpen: false,
    networkPreviewHost: null,
    networkPreviewPort: null,
    networkPreviewError: null,
    previewGamePath: null,
    previewBrowserWindowOptions: null,
    hideMenuBar: true,
    alwaysOnTop: true,
    numberOfWindows: 1,
    captureOptions: null,
  };
  _openPreviewBrowserWindow = () => {
    const {
      previewGamePath,
      previewBrowserWindowOptions,
      captureOptions,
      alwaysOnTop,
      hideMenuBar,
      numberOfWindows,
    } = this.state;
    if (!previewBrowserWindowOptions || !previewGamePath) return;

    if (!ipcRenderer) return;

    ipcRenderer.invoke('preview-open', {
      previewBrowserWindowOptions,
      previewGameIndexHtmlPath: `file://${previewGamePath}/index.html`,
      alwaysOnTop,
      hideMenuBar,
      numberOfWindows,
      captureOptions,
    });

    if (this._onPreviewWindowClosed) {
      ipcRenderer.removeListener(
        'preview-window-closed',
        this._onPreviewWindowClosed
      );
    }

    this._onPreviewWindowClosed = async event => {
      if (captureOptions) {
        await this.props.onCaptureFinished(captureOptions);
      }
    };
    ipcRenderer.on('preview-window-closed', this._onPreviewWindowClosed);
  };

  closePreview = (windowId: number) => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('preview-close', { windowId });
  };

  closeAllPreviews = async (): Promise<void> => {
    if (ipcRenderer) {
      try {
        await ipcRenderer.invoke('preview-close-all');
      } catch (error) {
        console.info('Unable to close all preview windows - ignoring.', error);
      }
    }

    // This should be unnecessary since the preview windows are closed above.
    const previewDebuggerServer = this.getPreviewDebuggerServer();
    if (previewDebuggerServer) {
      previewDebuggerServer.closeAllConnections();
    }
  };

  focusAllPreviews = () => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('preview-focus-all').catch(error => {
      console.info('Unable to focus preview windows - ignoring.', error);
    });
  };

  injectPreviewClickUserGesture = (inputs: Array<Object>): Promise<?Object> => {
    if (!ipcRenderer) {
      return Promise.resolve({
        success: false,
        attempted: true,
        supported: false,
        error: 'Native preview input injection requires Electron.',
      });
    }
    return ipcRenderer
      .invoke('preview-inject-user-gesture', { inputs })
      .catch(error => ({
        success: false,
        attempted: true,
        supported: true,
        error: error.message || String(error),
      }));
  };

  // Capture a preview window's content from the MAIN process (immune to renderer
  // suspension of an occluded preview). Returns { dataUrl, width, height } or
  // { error }. Resolves null if not running in Electron.
  capturePreviewPage = (windowId: ?number): Promise<?Object> => {
    if (!ipcRenderer) return Promise.resolve(null);
    return ipcRenderer
      .invoke('preview-capture-page', { windowId })
      .catch(error => ({ error: error.message || String(error) }));
  };

  _openPreviewWindow = (
    project: gdProject,
    gamePath: string,
    options: PreviewOptions
  ): void => {
    this.setState(
      // $FlowFixMe[incompatible-type]
      {
        previewBrowserWindowOptions: {
          width: project.getGameResolutionWidth(),
          height: project.getGameResolutionHeight(),
          useContentSize: true,
          title: `Preview of ${project.getName()}`,
          backgroundColor: '#000000',
          webPreferences: {
            webSecurity: false, // Allow to access to local files,
            // Allow Node.js API access in renderer process, as long
            // as we've not removed dependency on it and on "@electron/remote".
            nodeIntegration: true,
            contextIsolation: false,
            backgroundThrottling: false,
          },
        },
        previewGamePath: gamePath,
        hideMenuBar: !options.getIsMenuBarHiddenInPreview(),
        alwaysOnTop:
          options.forceAlwaysOnTopInPreview ||
          options.getIsAlwaysOnTopInPreview(),
        numberOfWindows: options.numberOfWindows,
        captureOptions: options.captureOptions,
      },
      () => {
        if (!options.networkPreview) {
          this._openPreviewBrowserWindow();
        } else {
          if (!ipcRenderer) return;

          ipcRenderer.removeAllListeners('serve-folder-done');
          ipcRenderer.removeAllListeners('local-network-ips');
          ipcRenderer.on('serve-folder-done', (event, err, serverParams) => {
            if (err) {
              this.setState({
                networkPreviewDialogOpen: true,
                networkPreviewPort: null,
                networkPreviewHost: null,
                networkPreviewError: err,
              });
            } else {
              this.setState({
                networkPreviewDialogOpen: true,
                networkPreviewPort: serverParams.port,
              });
            }
          });
          ipcRenderer.on('local-network-ip', (event, ipAddress) => {
            this.setState({
              networkPreviewHost: ipAddress,
            });
          });
          ipcRenderer.send('serve-folder', {
            root: gamePath,
          });
          ipcRenderer.send('get-local-network-ip');
        }
      }
    );
  };

  launchPreview = async (previewOptions: PreviewOptions): Promise<any> => {
    const {
      project,
      sceneName,
      externalLayoutName,
      eventsBasedObjectType,
      eventsBasedObjectVariantName,
    } = previewOptions;

    const previewId = nextPreviewId++;
    console.log(
      `[LocalPreviewLauncher] Launching preview #${previewId} with options:`,
      previewOptions
    );

    // Start the debugger server for previews. Even if not used,
    // useful if the user opens the Debugger editor later, or want to
    // hot reload.
    try {
      await this.getPreviewDebuggerServer().startServer({});
    } catch (err) {
      console.error(
        'Unable to start the Debugger Server for the preview:',
        err
      );
    }

    const { outputDir, exporter, gdjsRoot, fileSystem } = await prepareExporter(
      {
        isForInGameEdition: previewOptions.isForInGameEdition,
      }
    );
    if (previewOptions.isLaunchCancelled()) {
      exporter.delete();
      return;
    }

    var previewStartTime = performance.now();

    const previewExportOptions = new gd.PreviewExportOptions(
      project,
      outputDir
    );
    previewExportOptions.setIsDevelopmentEnvironment(Window.isDev());
    previewExportOptions.setLayoutName(sceneName);
    previewExportOptions.setIsInGameEdition(previewOptions.isForInGameEdition);
    previewExportOptions.setEditorId(previewOptions.editorId || '');
    if (externalLayoutName) {
      previewExportOptions.setExternalLayoutName(externalLayoutName);
    }
    if (eventsBasedObjectType) {
      previewExportOptions.setEventsBasedObjectType(eventsBasedObjectType);
      previewExportOptions.setEventsBasedObjectVariantName(
        eventsBasedObjectVariantName || ''
      );
    }

    if (previewOptions.isForInGameEdition) {
      previewExportOptions.useWindowMessageDebuggerClient();
    } else {
      const previewDebuggerServerAddress = getDebuggerServerAddress();
      if (previewDebuggerServerAddress) {
        previewExportOptions.useWebsocketDebuggerClientWithServerAddress(
          previewDebuggerServerAddress.address,
          '' + previewDebuggerServerAddress.port
        );
      }
    }

    const includeFileHashs = this.props.getIncludeFileHashs();
    for (const includeFile in includeFileHashs) {
      const hash = includeFileHashs[includeFile];
      previewExportOptions.setIncludeFileHash(includeFile, hash);
    }

    // Give the preview the path to the "@electron/remote" module of the editor,
    // as this is required by some features and we've not removed dependency
    // on "@electron/remote" yet.
    previewExportOptions.setElectronRemoteRequirePath(
      path.join(
        gdjsRoot,
        '../preview_node_modules',
        '@electron/remote',
        'renderer/index.js'
      )
    );

    // TODO Filter according to isForInGameEdition because the first game preview
    // won't necessarily be the first debugger.
    // It doesn't have any side effect because when it wont actually do an hot-reload
    // since the game preview doesn't exist yet.
    const debuggerIds = previewOptions.isForInGameEdition
      ? this.getPreviewDebuggerServer().getExistingEmbeddedGameFrameDebuggerIds()
      : this.getPreviewDebuggerServer().getExistingPreviewDebuggerIds();
    const shouldHotReload = previewOptions.hotReload && !!debuggerIds.length;
    if (shouldHotReload) {
      previewExportOptions.setShouldClearExportFolder(
        previewOptions.shouldHardReload
      );
      // At hot-reload, the ProjectData are passed into the message.
      // It means that we don't need to write them in a file.
      previewExportOptions.setShouldReloadProjectData(false);
      previewExportOptions.setShouldReloadLibraries(
        previewOptions.shouldReloadLibraries ||
          previewOptions.shouldGenerateScenesEventsCode
      );
      previewExportOptions.setShouldGenerateScenesEventsCode(
        previewOptions.shouldGenerateScenesEventsCode
      );
    }

    previewExportOptions.setDisplayCollisionMask(
      previewOptions.displayCollisionMask
    );
    previewExportOptions.setDisplaySignalAnimations(
      previewOptions.displaySignalAnimations
    );
    previewExportOptions.setFullLoadingScreen(previewOptions.fullLoadingScreen);
    previewExportOptions.setGDevelopVersionWithHash(getIDEVersionWithHash());
    previewExportOptions.setCrashReportUploadLevel(
      this.props.crashReportUploadLevel
    );
    previewExportOptions.setPreviewContext(this.props.previewContext);
    previewExportOptions.setProjectTemplateSlug(project.getTemplateSlug());
    previewExportOptions.setSourceGameId(this.props.sourceGameId);

    if (previewOptions.inAppTutorialMessageInPreview) {
      previewExportOptions.setInAppTutorialMessageInPreview(
        previewOptions.inAppTutorialMessageInPreview,
        previewOptions.inAppTutorialMessagePositionInPreview
      );
    }

    if (previewOptions.fallbackAuthor) {
      previewExportOptions.setFallbackAuthor(
        previewOptions.fallbackAuthor.id,
        previewOptions.fallbackAuthor.username
      );
    }
    if (previewOptions.authenticatedPlayer) {
      previewExportOptions.setAuthenticatedPlayer(
        previewOptions.authenticatedPlayer.playerId,
        previewOptions.authenticatedPlayer.playerUsername,
        previewOptions.authenticatedPlayer.playerToken
      );
    }
    if (previewOptions.captureOptions) {
      if (previewOptions.captureOptions.screenshots) {
        previewOptions.captureOptions.screenshots.forEach(screenshot => {
          previewExportOptions.addScreenshotCapture(
            screenshot.delayTimeInSeconds,
            screenshot.signedUrl,
            screenshot.publicUrl
          );
        });
      }
    }
    if (previewOptions.editorCameraState3D) {
      previewExportOptions.setEditorCameraState3D(
        previewOptions.editorCameraState3D.cameraMode,
        previewOptions.editorCameraState3D.positionX,
        previewOptions.editorCameraState3D.positionY,
        previewOptions.editorCameraState3D.positionZ,
        previewOptions.editorCameraState3D.rotationAngle,
        previewOptions.editorCameraState3D.elevationAngle,
        previewOptions.editorCameraState3D.distance
      );
    }
    if (previewOptions.inGameEditorSettings) {
      previewExportOptions.setInGameEditorSettingsJson(
        JSON.stringify(previewOptions.inGameEditorSettings)
      );
    }

    if (!previewOptions.onWillWritePreviewFiles()) {
      exporter.delete();
      previewExportOptions.delete();
      return;
    }

    const exportSuccessful = exporter.exportProjectForPixiPreview(
      previewExportOptions
    );
    if (
      hasConstantPlaceholderDiagnostic(
        project.getWholeProjectDiagnosticReport()
      )
    ) {
      this.props.onInvalidConstantPlaceholder();
      exporter.delete();
      previewExportOptions.delete();
      return;
    }
    if (!exportSuccessful) {
      exporter.delete();
      previewExportOptions.delete();
      throw new Error('Unable to export the project for preview.');
    }

    const dataJsPath = path.join(outputDir, 'data.js');
    fileSystem.writeToFile(
      dataJsPath,
      addGlobalObjectGroupsToDataJs(project, fileSystem.readFile(dataJsPath))
    );

    if (shouldHotReload) {
      const projectDataElement = new gd.SerializerElement();
      exporter.serializeProjectData(
        project,
        previewExportOptions,
        projectDataElement
      );
      const projectData = addGlobalObjectGroupsToProjectData(
        project,
        JSON.parse(gd.Serializer.toJSON(projectDataElement))
      );
      projectDataElement.delete();

      const runtimeGameOptionsElement = new gd.SerializerElement();
      exporter.serializeRuntimeGameOptions(
        previewExportOptions,
        runtimeGameOptionsElement
      );
      const runtimeGameOptions = JSON.parse(
        gd.Serializer.toJSON(runtimeGameOptionsElement)
      );
      runtimeGameOptionsElement.delete();

      if (previewOptions.shouldHardReload) {
        console.log(
          `[LocalPreviewLauncher] Triggering hard reload for preview #${previewId}...`
        );
        debuggerIds.forEach(debuggerId => {
          this.getPreviewDebuggerServer().sendMessage(debuggerId, {
            command: 'hardReload',
          });
        });
      } else {
        debuggerIds.forEach(debuggerId => {
          console.log(
            `[LocalPreviewLauncher] Triggering hot reload for preview #${previewId}...`
          );
          this.getPreviewDebuggerServer().sendMessage(debuggerId, {
            command: 'hotReload',
            payload: {
              shouldReloadResources: previewOptions.shouldReloadResources,
              projectData,
              runtimeGameOptions,
            },
          });
        });
      }
    } else {
      if (previewOptions.isForInGameEdition) {
        setEmbeddedGameFramePreviewLocation({
          previewIndexHtmlLocation: `file://${outputDir}/index.html`,
        });
      }

      if (previewOptions.numberOfWindows >= 1) {
        this._openPreviewWindow(project, outputDir, previewOptions);
      }
    }

    exporter.delete();
    previewExportOptions.delete();

    const previewStopTime = performance.now();
    console.info(
      `[LocalPreviewLauncher] Preview #${previewId} took ${previewStopTime -
        previewStartTime}ms`
    );
  };

  getPreviewDebuggerServer(): any {
    return localPreviewDebuggerServer;
  }

  render(): any {
    const {
      networkPreviewDialogOpen,
      networkPreviewHost,
      networkPreviewPort,
      networkPreviewError,
    } = this.state;

    return (
      <LocalNetworkPreviewDialog
        open={networkPreviewDialogOpen}
        url={
          networkPreviewHost && networkPreviewPort
            ? `${networkPreviewHost}:${networkPreviewPort}`
            : null
        }
        error={networkPreviewError}
        onClose={() => this.setState({ networkPreviewDialogOpen: false })}
        onExport={this.props.onExport}
        onRunPreviewLocally={this._openPreviewBrowserWindow}
      />
    );
  }
}

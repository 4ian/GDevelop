// @flow
import { Trans } from '@lingui/macro';

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
import SubscriptionChecker, {
  type SubscriptionCheckerInterface,
} from '../../../Profile/Subscription/SubscriptionChecker';
import {
  getDebuggerServerAddress,
  localPreviewDebuggerServer,
} from './LocalPreviewDebuggerServer';
import Window from '../../../Utils/Window';
import { getIDEVersionWithHash } from '../../../Version';
import { setEmbeddedGameFramePreviewLocation } from '../../../EmbeddedGame/EmbeddedGameFrame';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd: libGDevelop = global.gd;

type State = {|
  networkPreviewDialogOpen: boolean,
  networkPreviewHost: ?string,
  networkPreviewPort: ?number,
  networkPreviewError: ?any,
  hotReloadsCount: number,
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
  };
};

export default class LocalPreviewLauncher extends React.Component<
  PreviewLauncherProps,
  State
> {
  canDoNetworkPreview = () => true;

  state = {
    networkPreviewDialogOpen: false,
    networkPreviewHost: null,
    networkPreviewPort: null,
    networkPreviewError: null,
    previewGamePath: null,
    previewBrowserWindowOptions: null,
    hotReloadsCount: 0,
    hideMenuBar: true,
    alwaysOnTop: true,
    numberOfWindows: 1,
    captureOptions: null,
  };
  _networkPreviewSubscriptionChecker: ?SubscriptionCheckerInterface = null;
  _hotReloadSubscriptionChecker: ?SubscriptionCheckerInterface = null;

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

    ipcRenderer.removeAllListeners('preview-window-closed');
    ipcRenderer.on('preview-window-closed', async event => {
      if (captureOptions) {
        await this.props.onCaptureFinished(captureOptions);
      }
    });
  };

  closePreview = (windowId: number) => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('preview-close', { windowId });
  };

  closeAllPreviews = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('preview-close-all').catch(error => {
        console.info('Unable to close all preview windows - ignoring.', error);
      });
    }

    // This should be unnecessary since the preview windows are closed above.
    const previewDebuggerServer = this.getPreviewDebuggerServer();
    if (previewDebuggerServer) {
      previewDebuggerServer.closeAllConnections();
    }
  };

  _openPreviewWindow = (
    project: gdProject,
    gamePath: string,
    options: PreviewOptions
  ): void => {
    this.setState(
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
          },
        },
        previewGamePath: gamePath,
        hideMenuBar: !options.getIsMenuBarHiddenInPreview(),
        alwaysOnTop: options.getIsAlwaysOnTopInPreview(),
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

            setTimeout(() => this._checkSubscriptionForNetworkPreview());
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

    const { outputDir, exporter, gdjsRoot } = await prepareExporter({
      isForInGameEdition: previewOptions.isForInGameEdition,
    });

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
    const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
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

    exporter.exportProjectForPixiPreview(previewExportOptions);

    if (shouldHotReload) {
      const projectDataElement = new gd.SerializerElement();
      exporter.serializeProjectData(
        project,
        previewExportOptions,
        projectDataElement
      );
      const projectData = JSON.parse(gd.Serializer.toJSON(projectDataElement));
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
        debuggerIds.forEach(debuggerId => {
          this.getPreviewDebuggerServer().sendMessage(debuggerId, {
            command: 'hardReload',
          });
        });
      } else {
        debuggerIds.forEach(debuggerId => {
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
      if (!previewOptions.isForInGameEdition) {
        if (
          this.state.hotReloadsCount % 16 === 0 &&
          this._hotReloadSubscriptionChecker
        ) {
          this._hotReloadSubscriptionChecker.checkUserHasSubscription();
        }
        this.setState(state => ({
          hotReloadsCount: state.hotReloadsCount + 1,
        }));
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
    console.info(`Preview took ${previewStopTime - previewStartTime}ms`);
  };

  getPreviewDebuggerServer() {
    return localPreviewDebuggerServer;
  }

  _checkSubscriptionForNetworkPreview = () => {
    if (!this._networkPreviewSubscriptionChecker) return true;

    return this._networkPreviewSubscriptionChecker.checkUserHasSubscription();
  };

  render() {
    const {
      networkPreviewDialogOpen,
      networkPreviewHost,
      networkPreviewPort,
      networkPreviewError,
    } = this.state;

    return (
      <React.Fragment>
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._networkPreviewSubscriptionChecker = subscriptionChecker)
          }
          onChangeSubscription={() =>
            this.setState({ networkPreviewDialogOpen: false })
          }
          id="Preview over wifi"
          title={<Trans>Preview over wifi</Trans>}
          placementId="preview-wifi"
          mode="try"
          isNotShownDuringInAppTutorial
        />
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._hotReloadSubscriptionChecker = subscriptionChecker)
          }
          id="Hot reloading"
          title={
            <Trans>Live preview (apply changes to the running preview)</Trans>
          }
          placementId="hot-reloading"
          mode="try"
          isNotShownDuringInAppTutorial
        />
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
      </React.Fragment>
    );
  }
}

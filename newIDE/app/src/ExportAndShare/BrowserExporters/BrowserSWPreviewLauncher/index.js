// @flow
import * as React from 'react';
import BrowserPreviewErrorDialog from '../BrowserPreview/BrowserPreviewErrorDialog';
import BrowserSWFileSystem from '../BrowserSWFileSystem';
import { findGDJS } from '../../../GameEngineFinder/BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import {
  type PreviewOptions,
  type PreparePreviewWindowsOptions,
  type PreviewLauncherProps,
} from '../../PreviewLauncher.flow';
import {
  browserPreviewDebuggerServer,
  registerNewPreviewWindow,
} from '../BrowserPreview/BrowserPreviewDebuggerServer';
import Window from '../../../Utils/Window';
import { getGDevelopResourceJwtToken } from '../../../Utils/GDevelopServices/Project';
import { isNativeMobileApp } from '../../../Utils/Platform';
import { getIDEVersionWithHash } from '../../../Version';
import {
  getBrowserSWPreviewBaseUrl,
  getBrowserSWPreviewRootUrl,
} from './BrowserSWPreviewIndexedDB';
import { setEmbeddedGameFramePreviewLocation } from '../../../EmbeddedGame/EmbeddedGameFrame';
import { immediatelyOpenNewPreviewWindow } from '../BrowserPreview/BrowserPreviewWindow';
const gd: libGDevelop = global.gd;

const prepareExporter = async ({
  isForInGameEdition,
}: {
  isForInGameEdition: boolean,
}): Promise<{|
  outputDir: string,
  exporter: gdjsExporter,
  browserSWFileSystem: BrowserSWFileSystem,
|}> => {
  const { gdjsRoot, filesContent } = await findGDJS('preview');
  console.info('[BrowserSWPreviewLauncher] GDJS found in', gdjsRoot);

  const baseUrl = getBrowserSWPreviewBaseUrl();
  const rootUrl = getBrowserSWPreviewRootUrl();
  const outputDir = `${baseUrl}/${
    isForInGameEdition ? 'in-game-editor-preview' : 'preview'
  }`;

  console.log(
    '[BrowserSWPreviewLauncher] Preview will be served from:',
    outputDir
  );

  const browserSWFileSystem = new BrowserSWFileSystem({
    filesContent,
    rootUrl: `${rootUrl}/`,
  });
  const fileSystem = assignIn(
    new gd.AbstractFileSystemJS(),
    browserSWFileSystem
  );
  const exporter = new gd.Exporter(fileSystem, gdjsRoot);
  exporter.setCodeOutputDirectory(outputDir);

  return {
    exporter,
    outputDir,
    browserSWFileSystem,
  };
};

type State = {|
  error: ?Error,
|};

export default class BrowserSWPreviewLauncher extends React.Component<
  PreviewLauncherProps,
  State
> {
  canDoNetworkPreview = () => false;

  state = {
    error: null,
  };

  closeAllPreviews = () => {
    // This will also close the preview windows themselves.
    browserPreviewDebuggerServer.closeAllConnections();
  };

  immediatelyPreparePreviewWindows = (
    options: PreparePreviewWindowsOptions
  ) => {
    const debuggerIds = options.isForInGameEdition
      ? this.getPreviewDebuggerServer().getExistingEmbeddedGameFrameDebuggerIds()
      : this.getPreviewDebuggerServer().getExistingPreviewDebuggerIds();
    const shouldHotReload = options.hotReload && !!debuggerIds.length;

    // Immediately open windows (otherwise Safari will block the window opening if done after
    // an asynchronous operation).
    const previewWindows =
      shouldHotReload || options.isForInGameEdition
        ? []
        : Array.from({ length: options.numberOfWindows }, () => {
            try {
              return immediatelyOpenNewPreviewWindow(options.project);
            } catch (error) {
              console.error(
                '[BrowserSWPreviewLauncher] Unable to open a new preview window - this window will be ignored:',
                error
              );
              return null;
            }
          }).filter(Boolean);

    return previewWindows;
  };

  launchPreview = async (previewOptions: PreviewOptions): Promise<any> => {
    const {
      project,
      sceneName,
      externalLayoutName,
      eventsBasedObjectType,
      eventsBasedObjectVariantName,
      previewWindows,
    } = previewOptions;
    this.setState({
      error: null,
    });

    const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
    const shouldHotReload = previewOptions.hotReload && !!debuggerIds.length;

    try {
      await this.getPreviewDebuggerServer().startServer({
        origin: new URL(getBrowserSWPreviewBaseUrl()).origin,
      });
    } catch (err) {
      // Ignore any error when running the debugger server - the preview
      // can still work without it.
      console.error(
        '[BrowserSWPreviewLauncher] Unable to start the Debugger Server for the preview:',
        err
      );
    }

    try {
      const {
        exporter,
        outputDir,
        browserSWFileSystem,
      } = await prepareExporter({
        isForInGameEdition: previewOptions.isForInGameEdition,
      });

      const previewExportOptions = new gd.PreviewExportOptions(
        project,
        outputDir
      );
      previewExportOptions.setLayoutName(sceneName);
      previewExportOptions.setIsDevelopmentEnvironment(Window.isDev());
      previewExportOptions.setIsInGameEdition(
        previewOptions.isForInGameEdition
      );
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

      previewExportOptions.useWindowMessageDebuggerClient();

      const includeFileHashs = this.props.getIncludeFileHashs();
      for (const includeFile in includeFileHashs) {
        const hash = includeFileHashs[includeFile];
        previewExportOptions.setIncludeFileHash(includeFile, hash);
      }

      // TODO Filter according to isForInGameEdition because the first game preview
      // won't necessarily be the first debugger.
      // It doesn't have any side effect because when it wont actually do an hot-reload
      // since the game preview doesn't exist yet.
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

      previewExportOptions.setFullLoadingScreen(
        previewOptions.fullLoadingScreen
      );

      previewExportOptions.setNativeMobileApp(isNativeMobileApp());
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
      if (previewOptions.captureOptions.screenshots) {
        previewOptions.captureOptions.screenshots.forEach(screenshot => {
          previewExportOptions.addScreenshotCapture(
            screenshot.delayTimeInSeconds,
            screenshot.signedUrl,
            screenshot.publicUrl
          );
        });
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

      // The token, if any, to be used to read resources on GDevelop Cloud buckets.
      const gdevelopResourceToken = getGDevelopResourceJwtToken();
      if (gdevelopResourceToken)
        previewExportOptions.setGDevelopResourceToken(gdevelopResourceToken);

      console.log(
        '[BrowserSWPreviewLauncher] Exporting project for preview...'
      );
      exporter.exportProjectForPixiPreview(previewExportOptions);

      console.log(
        '[BrowserSWPreviewLauncher] Storing preview files in IndexedDB...'
      );
      await browserSWFileSystem.applyPendingOperations();

      if (previewOptions.isForInGameEdition) {
        setEmbeddedGameFramePreviewLocation({
          previewIndexHtmlLocation: outputDir + '/index.html',
        });
      }

      if (shouldHotReload) {
        const projectDataElement = new gd.SerializerElement();
        exporter.serializeProjectData(
          project,
          previewExportOptions,
          projectDataElement
        );
        const projectData = JSON.parse(
          gd.Serializer.toJSON(projectDataElement)
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
          console.log('[BrowserSWPreviewLauncher] Triggering hard reload...');
          debuggerIds.forEach(debuggerId => {
            this.getPreviewDebuggerServer().sendMessage(debuggerId, {
              command: 'hardReload',
            });
          });
        } else {
          console.log('[BrowserSWPreviewLauncher] Triggering hot reload...');
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
      } else if (previewWindows) {
        if (previewOptions.isForInGameEdition) {
          setEmbeddedGameFramePreviewLocation({
            previewIndexHtmlLocation: outputDir + '/index.html',
          });
        }

        console.log(
          '[BrowserSWPreviewLauncher] Opening new preview window(s)...'
        );
        previewWindows.forEach((previewWindow: WindowProxy) => {
          // Change the HTML file displayed by the preview window so that it starts loading
          // the game.
          previewWindow.location = outputDir + '/index.html';
          try {
            previewWindow.focus();
          } catch (e) {}

          // Register the window so that it can be accessed
          // by the debugger and for the captures to be detected when it closes.
          const debuggerId = registerNewPreviewWindow(previewWindow);
          browserPreviewDebuggerServer.registerCallbacks({
            onErrorReceived: () => {},
            onServerStateChanged: () => {},
            onConnectionClosed: async ({ id }) => {
              if (id !== debuggerId) {
                return;
              }

              if (previewOptions.captureOptions) {
                await this.props.onCaptureFinished(
                  previewOptions.captureOptions
                );
              }
            },
            onConnectionOpened: () => {},
            onConnectionErrored: () => {},
            onHandleParsedMessage: () => {},
          });
        });
      } else {
        throw new Error(
          'Internal error: no preview windows to open and no hot reload to trigger.'
        );
      }

      previewExportOptions.delete();
      exporter.delete();

      console.log('[BrowserSWPreviewLauncher] Preview launched successfully!');
    } catch (error) {
      console.error(
        '[BrowserSWPreviewLauncher] Error launching preview:',
        error
      );
      this.setState({
        error,
      });
    }
  };

  getPreviewDebuggerServer() {
    return browserPreviewDebuggerServer;
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <BrowserPreviewErrorDialog
          error={error}
          onClose={() =>
            this.setState({
              error: null,
            })
          }
        />
      );
    }

    return null;
  }
}

// @flow
import * as React from 'react';
import BrowserPreviewErrorDialog from '../BrowserPreview/BrowserPreviewErrorDialog';
import BrowserS3FileSystem from '../BrowserS3FileSystem';
import { findGDJS } from '../../../GameEngineFinder/BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import {
  type PreviewOptions,
  type PreviewLauncherProps,
} from '../../PreviewLauncher.flow';
import { getBaseUrl } from '../../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../../Utils/TimestampedId';
import {
  browserPreviewDebuggerServer,
  getExistingPreviewWindowForDebuggerId,
  registerNewPreviewWindow,
} from '../BrowserPreview/BrowserPreviewDebuggerServer';
import Window from '../../../Utils/Window';
import { getGDevelopResourceJwtToken } from '../../../Utils/GDevelopServices/Project';
import { isNativeMobileApp } from '../../../Utils/Platform';
import { getIDEVersionWithHash } from '../../../Version';
import { setEmbeddedGameFramePreviewLocation } from '../../../EmbeddedGame/EmbeddedGameFrame';
import { immediatelyOpenNewPreviewWindow } from '../BrowserPreview/BrowserPreviewWindow';
const gd: libGDevelop = global.gd;

type State = {|
  error: ?Error,
|};

export default class BrowserS3PreviewLauncher extends React.Component<
  PreviewLauncherProps,
  State
> {
  canDoNetworkPreview = () => false;

  state = {
    error: null,
  };

  _prepareExporter = (): Promise<{|
    outputDir: string,
    exporter: gdjsExporter,
    browserS3FileSystem: BrowserS3FileSystem,
  |}> => {
    return findGDJS('preview').then(({ gdjsRoot, filesContent }) => {
      console.info('GDJS found in ', gdjsRoot);

      const prefix = makeTimestampedId();

      const outputDir = getBaseUrl() + prefix;
      const browserS3FileSystem = new BrowserS3FileSystem({
        filesContent,
        bucketBaseUrl: getBaseUrl(),
        prefix,
      });
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        browserS3FileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);
      exporter.setCodeOutputDirectory(outputDir);

      return {
        exporter,
        outputDir,
        browserS3FileSystem,
      };
    });
  };

  launchPreview = async (previewOptions: PreviewOptions): Promise<any> => {
    const {
      project,
      sceneName,
      externalLayoutName,
      eventsBasedObjectType,
      eventsBasedObjectVariantName,
      numberOfWindows,
    } = previewOptions;
    this.setState({
      error: null,
    });

    const debuggerIds = previewOptions.isForInGameEdition
      ? this.getPreviewDebuggerServer().getExistingEmbeddedGameFrameDebuggerIds()
      : this.getPreviewDebuggerServer().getExistingPreviewDebuggerIds();
    const lastDebuggerId = debuggerIds.length
      ? debuggerIds[debuggerIds.length - 1]
      : null;
    const shouldHotReload = previewOptions.hotReload && lastDebuggerId !== null;

    // We abuse the "hot reload" to choose if we open a new window or replace
    // the content of an existing one. But hot reload is NOT implemented (yet -
    // it would need to generate the preview in the same place and trigger a reload
    // of the scripts).
    const existingPreviewWindow = shouldHotReload
      ? getExistingPreviewWindowForDebuggerId(lastDebuggerId)
      : null;

    const previewWindows = existingPreviewWindow
      ? [existingPreviewWindow]
      : Array.from({ length: numberOfWindows }, () => {
          try {
            return immediatelyOpenNewPreviewWindow(project);
          } catch (error) {
            console.error(
              'Unable to open a new preview window - this window will be ignored:',
              error
            );
            return null;
          }
        }).filter(Boolean);

    try {
      await this.getPreviewDebuggerServer().startServer({
        origin: new URL(getBaseUrl()).origin,
      });
    } catch (err) {
      // Ignore any error when running the debugger server - the preview
      // can still work without it.
      console.error(
        'Unable to start the Debugger Server for the preview:',
        err
      );
    }

    try {
      const {
        exporter,
        outputDir,
        browserS3FileSystem,
      } = await this._prepareExporter();

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

      if (isNativeMobileApp()) {
        previewExportOptions.useMinimalDebuggerClient();
      } else {
        previewExportOptions.useWindowMessageDebuggerClient();
      }

      // Scripts generated from extensions keep the same URL even after being modified.
      // Use a cache bursting parameter to force the browser to reload them.
      previewExportOptions.setNonRuntimeScriptsCacheBurst(Date.now());

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

      exporter.exportProjectForPixiPreview(previewExportOptions);
      previewExportOptions.delete();
      exporter.delete();

      // Upload any file that must be exported for the preview.
      await browserS3FileSystem.uploadPendingObjects();

      if (previewOptions.isForInGameEdition) {
        setEmbeddedGameFramePreviewLocation({
          previewIndexHtmlLocation: outputDir + '/index.html',
        });
      }

      // Change the HTML file displayed by the preview window so that it starts loading
      // the game.
      previewWindows.forEach((previewWindow: WindowProxy) => {
        previewWindow.location = outputDir + '/index.html';
        try {
          previewWindow.focus();
        } catch (e) {}
      });

      // If the preview windows are new, register them so that they can be accessed
      // by the debugger and for the captures to be detected when they close.
      if (!existingPreviewWindow) {
        previewWindows.forEach((previewWindow: WindowProxy) => {
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
      }
    } catch (error) {
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

// @flow
import * as React from 'react';
import BrowserPreviewErrorDialog from '../BrowserPreview/BrowserPreviewErrorDialog';
import BrowserSWFileSystem from '../BrowserSWFileSystem';
import { findGDJS } from '../../../GameEngineFinder/BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import {
  type PreviewOptions,
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
import { immediatelyOpenNewPreviewWindow } from '../BrowserPreview/BrowserPreviewWindow';
const gd: libGDevelop = global.gd;

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

  _prepareExporter = (): Promise<{|
    outputDir: string,
    exporter: gdjsExporter,
    browserSWFileSystem: BrowserSWFileSystem,
  |}> => {
    return findGDJS('preview').then(({ gdjsRoot, filesContent }) => {
      console.info('[BrowserSWPreviewLauncher] GDJS found in', gdjsRoot);

      const isForInGameEdition = false; // TODO: adapt for the 3D editor branch.

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
    });
  };

  launchPreview = async (previewOptions: PreviewOptions): Promise<any> => {
    const { project, layout, externalLayout, numberOfWindows } = previewOptions;
    this.setState({
      error: null,
    });

    const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
    const shouldHotReload = previewOptions.hotReload && !!debuggerIds.length;

    // Immediately open windows (otherwise Safari will block the window opening if done after
    // an asynchronous operation).
    const previewWindows = shouldHotReload
      ? []
      : Array.from({ length: numberOfWindows }, () => {
          try {
            return immediatelyOpenNewPreviewWindow(project);
          } catch (error) {
            console.error(
              '[BrowserSWPreviewLauncher] Unable to open a new preview window - this window will be ignored:',
              error
            );
            return null;
          }
        }).filter(Boolean);

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
      } = await this._prepareExporter();

      const previewExportOptions = new gd.PreviewExportOptions(
        project,
        outputDir
      );
      previewExportOptions.setLayoutName(layout.getName());
      previewExportOptions.setIsDevelopmentEnvironment(Window.isDev());
      if (externalLayout) {
        previewExportOptions.setExternalLayoutName(externalLayout.getName());
      }

      previewExportOptions.useWindowMessageDebuggerClient();

      const includeFileHashs = this.props.getIncludeFileHashs();
      for (const includeFile in includeFileHashs) {
        const hash = includeFileHashs[includeFile];
        previewExportOptions.setIncludeFileHash(includeFile, hash);
      }

      previewExportOptions.setProjectDataOnlyExport(
        // Only export project data if asked and if a hot-reloading is being done.
        shouldHotReload && previewOptions.projectDataOnlyExport
      );

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

      // The token, if any, to be used to read resources on GDevelop Cloud buckets.
      const gdevelopResourceToken = getGDevelopResourceJwtToken();
      if (gdevelopResourceToken)
        previewExportOptions.setGDevelopResourceToken(gdevelopResourceToken);

      console.log(
        '[BrowserSWPreviewLauncher] Exporting project for preview...'
      );
      exporter.exportProjectForPixiPreview(previewExportOptions);
      previewExportOptions.delete();
      exporter.delete();

      console.log(
        '[BrowserSWPreviewLauncher] Storing preview files in IndexedDB...'
      );
      await browserSWFileSystem.applyPendingOperations();

      if (shouldHotReload) {
        console.log('[BrowserSWPreviewLauncher] Triggering hot reload...');
        debuggerIds.forEach(debuggerId => {
          this.getPreviewDebuggerServer().sendMessage(debuggerId, {
            command: 'hotReload',
          });
        });
      } else {
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
      }

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

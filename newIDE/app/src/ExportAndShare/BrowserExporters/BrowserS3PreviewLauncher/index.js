// @flow
import * as React from 'react';
import BrowserPreviewErrorDialog from './BrowserPreviewErrorDialog';
import BrowserS3FileSystem from '../BrowserS3FileSystem';
import { findGDJS } from '../../../GameEngineFinder/BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../../PreviewLauncher.flow';
import { getBaseUrl } from '../../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../../Utils/TimestampedId';
import {
  browserPreviewDebuggerServer,
  getExistingPreviewWindowForDebuggerId,
  registerNewPreviewWindow,
} from './BrowserPreviewDebuggerServer';
import Window from '../../../Utils/Window';
import { displayBlackLoadingScreen } from '../../../Utils/BrowserExternalWindowUtils';
import { getGDevelopResourceJwtToken } from '../../../Utils/GDevelopServices/Project';
const gd: libGDevelop = global.gd;

type State = {|
  error: ?Error,
|};

type Props = {|
  getIncludeFileHashs: () => { [string]: number },
  onExport?: () => void,
|};

let nextPreviewWindowId = 0;

/**
 * Open a window showing a black "loading..." screen. It's important this is done
 * NOT in an asynchronous way but JUST after a click. Otherwise, browsers like Safari
 * will block the window opening.
 */
export const immediatelyOpenNewPreviewWindow = (
  project: gdProject
): WindowProxy => {
  const width = project.getGameResolutionWidth();
  const height = project.getGameResolutionHeight();
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  const targetId = 'GDevelopPreview' + nextPreviewWindowId++;
  const previewWindow = window.open(
    'about:blank',
    targetId,
    `width=${width},height=${height},left=${left},top=${top}`
  );

  displayBlackLoadingScreen(previewWindow);

  return previewWindow;
};

export default class BrowserS3PreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => false;
  canDoHotReload = () => false;

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
    const { project, layout, externalLayout } = previewOptions;
    this.setState({
      error: null,
    });

    const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
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

    const previewWindow =
      existingPreviewWindow || immediatelyOpenNewPreviewWindow(project);

    try {
      await this.getPreviewDebuggerServer().startServer();
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
      previewExportOptions.setLayoutName(layout.getName());
      previewExportOptions.setIsDevelopmentEnvironment(Window.isDev());
      if (externalLayout) {
        previewExportOptions.setExternalLayoutName(externalLayout.getName());
      }

      previewExportOptions.useWindowMessageDebuggerClient();

      // Scripts generated from extensions keep the same URL even after being modified.
      // Use a cache bursting parameter to force the browser to reload them.
      previewExportOptions.setNonRuntimeScriptsCacheBurst(Date.now());

      previewExportOptions.setFullLoadingScreen(
        previewOptions.fullLoadingScreen
      );

      if (previewOptions.fallbackAuthor) {
        previewExportOptions.setFallbackAuthor(
          previewOptions.fallbackAuthor.id,
          previewOptions.fallbackAuthor.username
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

      // Change the HTML file displayed by the preview window so that it starts loading
      // the game.
      previewWindow.location = outputDir + '/index.html';

      // If the preview window is a new one, register it so that it can be accessed
      // by the debugger.
      if (!existingPreviewWindow) {
        registerNewPreviewWindow(previewWindow);
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

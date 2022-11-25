// @flow
import * as React from 'react';
import BrowserPreviewLinkDialog from './BrowserPreviewLinkDialog';
import BrowserPreviewErrorDialog from './BrowserPreviewErrorDialog';
import BrowserS3FileSystem from '../BrowserS3FileSystem';
import { findGDJS } from '../../../GameEngineFinder/BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../../PreviewLauncher.flow';
import { getBaseUrl } from '../../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../../Utils/TimestampedId';
import {
  browserPreviewDebuggerServer,
  getExistingTargetIdForDebuggerId,
  registerPreviewWindow,
} from './BrowserPreviewDebuggerServer';
import Window from '../../../Utils/Window';
const gd: libGDevelop = global.gd;

type State = {|
  previewLinkDialog: ?{
    project: gdProject,
    url: string,
  },
  error: ?Error,
|};

type Props = {|
  getIncludeFileHashs: () => { [string]: number },
  onExport?: () => void,
|};

let nextPreviewWindowId = 0;

/**
 * This opens a preview window at the specified URL for the specified project.
 * This will be a new window if `existingTargetId` is null, or will replace an existing
 * window content if `existingTargetId` is specified.
 */
export const openPreviewWindow = (
  project: gdProject,
  url: string,
  existingTargetId: ?string
): {| previewWindow: any, targetId: string |} => {
  const width = project.getGameResolutionWidth();
  const height = project.getGameResolutionHeight();
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  const targetId = existingTargetId
    ? // Reuse the existing target id if specified - which means the URL will
      // replace the one in an existing preview window.
      existingTargetId
    : // Otherwise, create a new target id to open a new window.
      'GDevelopPreview' + nextPreviewWindowId++;

  const previewWindow = window.open(
    url,
    targetId,
    `width=${width},height=${height},left=${left},top=${top}`
  );

  return { previewWindow, targetId };
};

export default class BrowserS3PreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => false;
  canDoHotReload = () => false;

  state = {
    previewLinkDialog: null,
    error: null,
  };

  _prepareExporter = (): Promise<any> => {
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

  launchPreview = (previewOptions: PreviewOptions): Promise<any> => {
    const { project, layout, externalLayout } = previewOptions;
    this.setState({
      error: null,
    });

    return this.getPreviewDebuggerServer()
      .startServer()
      .catch(err => {
        // Ignore any error when running the debugger server - the preview
        // can still work without it.
        console.error(
          'Unable to start the Debugger Server for the preview:',
          err
        );
      })
      .then(() => this._prepareExporter())
      .then(({ exporter, outputDir, browserS3FileSystem }) => {
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

        const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
        const lastDebuggerId = debuggerIds.length
          ? debuggerIds[debuggerIds.length - 1]
          : null;
        const shouldHotReload =
          previewOptions.hotReload && lastDebuggerId !== null;

        // Scripts generated from extensions keep the same URL even after being modified.
        // Use a cache bursting parameter to force the browser to reload them.
        previewExportOptions.setNonRuntimeScriptsCacheBurst(Date.now());

        previewExportOptions.setFullLoadingScreen(
          previewOptions.fullLoadingScreen
        );

        exporter.exportProjectForPixiPreview(previewExportOptions);
        previewExportOptions.delete();
        exporter.delete();
        return browserS3FileSystem.uploadPendingObjects().then(() => {
          const url = outputDir + '/index.html';
          const { previewWindow, targetId } = openPreviewWindow(
            project,
            url,
            // We abuse the "hot reload" to choose if we open a new window or replace
            // the content of an existing one. But hot reload is NOT implemented (yet -
            // it would need to generate the preview in the same place and trigger a reload
            // of the scripts).
            shouldHotReload
              ? getExistingTargetIdForDebuggerId(lastDebuggerId)
              : null // Open a new window with a new target id.
          );

          if (!previewWindow) {
            this.setState({
              previewLinkDialog: {
                project,
                url,
              },
            });
          } else {
            registerPreviewWindow({
              previewWindow,
              targetId,
            });
          }
        });
      })
      .catch((error: Error) => {
        this.setState({
          error,
        });
      });
  };

  getPreviewDebuggerServer() {
    return browserPreviewDebuggerServer;
  }

  render() {
    const { previewLinkDialog, error } = this.state;

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

    if (previewLinkDialog) {
      return (
        <BrowserPreviewLinkDialog
          url={previewLinkDialog.url}
          project={previewLinkDialog.project}
          onPreviewWindowOpened={({ previewWindow, targetId }) => {
            registerPreviewWindow({
              previewWindow,
              targetId,
            });
          }}
          onClose={() =>
            this.setState({
              previewLinkDialog: null,
            })
          }
        />
      );
    }

    return null;
  }
}

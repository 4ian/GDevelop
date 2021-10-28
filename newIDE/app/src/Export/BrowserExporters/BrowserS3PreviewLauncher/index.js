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
  onChangeSubscription?: () => void,
|};

export const openPreviewWindow = (project: gdProject, url: string): any => {
  const width = project.getGameResolutionWidth();
  const height = project.getGameResolutionHeight();
  const left = window.screenX + window.innerWidth / 2 - width / 2;
  const top = window.screenY + window.innerHeight / 2 - height / 2;

  const windowObjectReference = window.open(
    url,
    'GDevelopPreview',
    `width=${width},height=${height},left=${left},top=${top}`
  );
  return windowObjectReference;
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

    return this._prepareExporter()
      .then(({ exporter, outputDir, browserS3FileSystem }) => {
        const previewExportOptions = new gd.PreviewExportOptions(
          project,
          outputDir
        );
        previewExportOptions.setLayoutName(layout.getName());
        if (externalLayout) {
          previewExportOptions.setExternalLayoutName(externalLayout.getName());
        }

        // Scripts generated from extensions keep the same URL even after being modified.
        // Use a cache bursting parameter to force the browser to reload them.
        previewExportOptions.setNonRuntimeScriptsCacheBurst(Date.now());

        exporter.exportProjectForPixiPreview(previewExportOptions);
        previewExportOptions.delete();
        exporter.delete();
        return browserS3FileSystem.uploadPendingObjects().then(() => {
          const url = outputDir + '/index.html';
          const windowObjectReference = openPreviewWindow(project, url);

          if (!windowObjectReference) {
            this.setState({
              previewLinkDialog: {
                project,
                url,
              },
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
    // Debugger server is not supported in the web-app.
    return null;
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

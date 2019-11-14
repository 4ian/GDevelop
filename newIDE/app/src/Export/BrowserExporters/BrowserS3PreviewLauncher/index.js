// @flow
import * as React from 'react';
import BrowserPreviewLinkDialog from './BrowserPreviewLinkDialog';
import BrowserPreviewErrorDialog from './BrowserPreviewErrorDialog';
import BrowserS3FileSystem from '../BrowserS3FileSystem';
import { findGDJS } from '../BrowserS3GDJSFinder';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../../PreviewLauncher.flow';
import { getBaseUrl } from '../../../Utils/GDevelopServices/Preview';
import { makeTimestampedId } from '../../../Utils/TimestampedId';
const gd = global.gd;

type State = {|
  showPreviewLinkDialog: boolean,
  url: ?string,
  error: ?Error,
|};

type Props = {|
  onExport?: () => void,
  onChangeSubscription?: () => void,
|};

export default class BrowserS3PreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => false;

  state = {
    showPreviewLinkDialog: false,
    url: null,
    error: null,
  };

  _openPreviewWindow = (project: gdProject, url: string): any => {
    const windowObjectReference = window.open(url, `_blank`);
    return {
      url,
      windowObjectReference,
    };
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
      exporter.setCodeOutputDirectory(getBaseUrl() + prefix);

      return {
        exporter,
        outputDir,
        browserS3FileSystem,
      };
    });
  };

  launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ): Promise<any> => {
    this.setState({
      error: null,
    });

    return this._prepareExporter()
      .then(({ exporter, outputDir, browserS3FileSystem }) => {
        exporter.exportLayoutForPixiPreview(project, layout, outputDir);
        exporter.delete();
        return browserS3FileSystem
          .uploadPendingObjects()
          .then(() => {
            const finalUrl = outputDir + '/index.html';
            return this._openPreviewWindow(project, finalUrl);
          })
          .then(({ url, windowObjectReference }) => {
            if (!windowObjectReference) {
              this.setState({
                showPreviewLinkDialog: true,
                url,
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

  launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ): Promise<any> => {
    this.setState({
      error: null,
    });

    return this._prepareExporter()
      .then(({ exporter, outputDir, browserS3FileSystem }) => {
        exporter.exportExternalLayoutForPixiPreview(
          project,
          layout,
          externalLayout,
          outputDir
        );
        exporter.delete();
        return browserS3FileSystem
          .uploadPendingObjects()
          .then(() => {
            const finalUrl = outputDir + '/index.html';
            return this._openPreviewWindow(project, finalUrl);
          })
          .then(({ url, windowObjectReference }) => {
            if (!windowObjectReference) {
              this.setState({
                showPreviewLinkDialog: true,
                url,
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

  render() {
    const { showPreviewLinkDialog, url, error } = this.state;

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

    if (showPreviewLinkDialog) {
      return (
        <BrowserPreviewLinkDialog
          url={url}
          onClose={() =>
            this.setState({
              showPreviewLinkDialog: false,
            })
          }
        />
      );
    }

    return null;
  }
}

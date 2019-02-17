// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import localFileSystem from '../LocalFileSystem';
import optionalRequire from '../../../Utils/OptionalRequire';
import { timeFunction } from '../../../Utils/TimeFunction';
import { findGDJS } from '../LocalGDJSFinder';
import LocalNetworkPreviewDialog from './LocalNetworkPreviewDialog';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../../PreviewLauncher.flow';
import { findLocalIp } from './LocalIpFinder';
import SubscriptionChecker from '../../../Profile/SubscriptionChecker';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const BrowserWindow = electron ? electron.remote.BrowserWindow : null;
const gd = global.gd;

type Props = {|
  onExport?: () => void,
  onChangeSubscription?: () => void,
|};

type State = {
  networkPreviewDialogOpen: boolean,
  networkPreviewHost: ?string,
  networkPreviewPort: ?number,
  networkPreviewError: ?any,
  previewGamePath: ?string,
  previewBrowserWindowConfig: ?{
    width: number,
    height: number,
    useContentSize: boolean,
    title: string,
    backgroundColor: string,
  },
};

export default class LocalPreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => true;

  state = {
    networkPreviewDialogOpen: false,
    networkPreviewHost: null,
    networkPreviewPort: null,
    networkPreviewError: null,
    previewGamePath: null,
    previewBrowserWindowConfig: null,
  };
  _subscriptionChecker: ?SubscriptionChecker = null;

  _openPreviewBrowserWindow = () => {
    if (
      !BrowserWindow ||
      !this.state.previewBrowserWindowConfig ||
      !this.state.previewGamePath
    )
      return;

    const win = new BrowserWindow(this.state.previewBrowserWindowConfig);
    win.loadURL(`file://${this.state.previewGamePath}/index.html`);
  };

  _openPreviewWindow = (
    project: gdProject,
    gamePath: string,
    options: PreviewOptions
  ): void => {
    this.setState(
      {
        previewBrowserWindowConfig: {
          width: project.getMainWindowDefaultWidth(),
          height: project.getMainWindowDefaultHeight(),
          useContentSize: true,
          title: `Preview of ${project.getName()}`,
          backgroundColor: '#000000',
        },
        previewGamePath: gamePath,
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

            setTimeout(() => this._checkSubscription());
          });
          ipcRenderer.on('local-network-ips', (event, ipAddresses) => {
            this.setState({
              networkPreviewHost: findLocalIp(ipAddresses),
            });
          });
          ipcRenderer.send('serve-folder', {
            root: gamePath,
          });
          ipcRenderer.send('get-local-network-ips');
        }
      }
    );
  };

  _prepareExporter = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      findGDJS(gdjsRoot => {
        if (!gdjsRoot) {
          //TODO
          console.error('Could not find GDJS');
          return reject();
        }
        console.info('GDJS found in ', gdjsRoot);

        const fileSystem = assignIn(
          new gd.AbstractFileSystemJS(),
          localFileSystem
        );
        const outputDir = path.join(fileSystem.getTempDir(), 'preview');
        const exporter = new gd.Exporter(fileSystem, gdjsRoot);

        resolve({
          outputDir,
          exporter,
        });
      });
    });
  };

  launchLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    options: PreviewOptions
  ): Promise<any> => {
    if (!project || !layout) return Promise.reject();

    return this._prepareExporter().then(({ outputDir, exporter }) => {
      timeFunction(
        () => {
          exporter.exportLayoutForPixiPreview(project, layout, outputDir);
          exporter.delete();
          this._openPreviewWindow(project, outputDir, options);
        },
        time => console.info(`Preview took ${time}ms`)
      );
    });
  };

  launchExternalLayoutPreview = (
    project: gdProject,
    layout: gdLayout,
    externalLayout: gdExternalLayout,
    options: PreviewOptions
  ): Promise<any> => {
    if (!project || !externalLayout) return Promise.reject();

    return this._prepareExporter().then(({ outputDir, exporter }) => {
      timeFunction(
        () => {
          exporter.exportExternalLayoutForPixiPreview(
            project,
            layout,
            externalLayout,
            outputDir
          );
          exporter.delete();
          this._openPreviewWindow(project, outputDir, options);
        },
        time => console.info(`Preview took ${time}ms`)
      );
    });
  };

  _checkSubscription = (options: PreviewOptions) => {
    if (!this._subscriptionChecker) return true;

    return this._subscriptionChecker.checkHasSubscription();
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
            (this._subscriptionChecker = subscriptionChecker)
          }
          onChangeSubscription={() => {
            this.setState({ networkPreviewDialogOpen: false });
            if (this.props.onChangeSubscription)
              this.props.onChangeSubscription();
          }}
          id="Preview over wifi"
          title={<Trans>Preview over wifi</Trans>}
          mode="try"
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

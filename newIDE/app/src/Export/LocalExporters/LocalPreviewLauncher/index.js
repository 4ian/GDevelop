// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import LocalFileSystem from '../LocalFileSystem';
import optionalRequire from '../../../Utils/OptionalRequire';
import { timeFunction } from '../../../Utils/TimeFunction';
import { findGDJS } from '../../../GameEngineFinder/LocalGDJSFinder';
import LocalNetworkPreviewDialog from './LocalNetworkPreviewDialog';
import assignIn from 'lodash/assignIn';
import { type PreviewOptions } from '../../PreviewLauncher.flow';
import SubscriptionChecker, {
  type SubscriptionCheckerInterface,
} from '../../../Profile/Subscription/SubscriptionChecker';
import {
  getDebuggerServerAddress,
  localPreviewDebuggerServer,
} from './LocalPreviewDebuggerServer';
import Window from '../../../Utils/Window';
const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd: libGDevelop = global.gd;

type Props = {|
  getIncludeFileHashs: () => { [string]: number },
  onExport?: () => void,
|};

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
|};

export default class LocalPreviewLauncher extends React.Component<
  Props,
  State
> {
  canDoNetworkPreview = () => true;
  canDoHotReload = () => true;

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
  };
  _networkPreviewSubscriptionChecker: ?SubscriptionCheckerInterface = null;
  _hotReloadSubscriptionChecker: ?SubscriptionCheckerInterface = null;

  _openPreviewBrowserWindow = () => {
    const { previewGamePath, previewBrowserWindowOptions } = this.state;
    if (!previewBrowserWindowOptions || !previewGamePath) return;

    if (!ipcRenderer) return;

    ipcRenderer.invoke('preview-open', {
      previewBrowserWindowOptions,
      previewGameIndexHtmlPath: `file://${previewGamePath}/index.html`,
      alwaysOnTop: this.state.alwaysOnTop,
      hideMenuBar: this.state.hideMenuBar,
    });
  };

  closePreview = (windowId: number) => {
    if (!ipcRenderer) return;
    ipcRenderer.invoke('preview-close', { windowId });
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

  _prepareExporter = (): Promise<{|
    outputDir: string,
    exporter: gdjsExporter,
    gdjsRoot: string,
  |}> => {
    return findGDJS().then(({ gdjsRoot }) => {
      console.info('GDJS found in ', gdjsRoot);

      const localFileSystem = new LocalFileSystem({
        downloadUrlsToLocalFiles: false,
      });
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        localFileSystem
      );
      const outputDir = path.join(fileSystem.getTempDir(), 'preview');
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);

      return {
        outputDir,
        exporter,
        gdjsRoot,
      };
    });
  };

  launchPreview = (previewOptions: PreviewOptions): Promise<any> => {
    const { project, layout, externalLayout } = previewOptions;

    // Start the debugger server for previews. Even if not used,
    // useful if the user opens the Debugger editor later, or want to
    // hot reload.
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
      .then(({ outputDir, exporter, gdjsRoot }) => {
        timeFunction(
          () => {
            const previewExportOptions = new gd.PreviewExportOptions(
              project,
              outputDir
            );
            previewExportOptions.setIsDevelopmentEnvironment(Window.isDev());
            previewExportOptions.setLayoutName(layout.getName());
            if (externalLayout) {
              previewExportOptions.setExternalLayoutName(
                externalLayout.getName()
              );
            }

            const previewDebuggerServerAddress = getDebuggerServerAddress();
            if (previewDebuggerServerAddress) {
              previewExportOptions.useWebsocketDebuggerClientWithServerAddress(
                previewDebuggerServerAddress.address,
                '' + previewDebuggerServerAddress.port
              );
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

            const debuggerIds = this.getPreviewDebuggerServer().getExistingDebuggerIds();
            const shouldHotReload =
              previewOptions.hotReload && !!debuggerIds.length;

            previewExportOptions.setProjectDataOnlyExport(
              // Only export project data if asked and if a hot-reloading is being done.
              shouldHotReload && previewOptions.projectDataOnlyExport
            );

            previewExportOptions.setFullLoadingScreen(
              previewOptions.fullLoadingScreen
            );

            if (previewOptions.fallbackAuthor) {
              previewExportOptions.setFallbackAuthor(
                previewOptions.fallbackAuthor.id,
                previewOptions.fallbackAuthor.username
              );
            }

            exporter.exportProjectForPixiPreview(previewExportOptions);
            previewExportOptions.delete();
            exporter.delete();

            if (shouldHotReload) {
              debuggerIds.forEach(debuggerId => {
                this.getPreviewDebuggerServer().sendMessage(debuggerId, {
                  command: 'hotReload',
                });
              });

              if (
                this.state.hotReloadsCount % 16 === 0 &&
                this._hotReloadSubscriptionChecker
              ) {
                this._hotReloadSubscriptionChecker.checkUserHasSubscription();
              }
              this.setState(state => ({
                hotReloadsCount: state.hotReloadsCount + 1,
              }));
            } else {
              this._openPreviewWindow(project, outputDir, previewOptions);
            }
          },
          time => console.info(`Preview took ${time}ms`)
        );
      });
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
          mode="try"
        />
        <SubscriptionChecker
          ref={subscriptionChecker =>
            (this._hotReloadSubscriptionChecker = subscriptionChecker)
          }
          id="Hot reloading"
          title={
            <Trans>Live preview (apply changes to the running preview)</Trans>
          }
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

// @flow
import * as React from 'react';

export type PreviewOptions = {|
  project: gdProject,
  layout: gdLayout,
  externalLayout: ?gdExternalLayout,
  networkPreview: boolean,
  hotReload: boolean,
  projectDataOnlyExport: boolean,
  fullLoadingScreen: boolean,
  getIsMenuBarHiddenInPreview: () => boolean,
  getIsAlwaysOnTopInPreview: () => boolean,
|};

/** The functions that PreviewLauncher must expose on their class */
export type PreviewLauncherInterface = {
  launchPreview: (previewOptions: PreviewOptions) => Promise<any>,
  canDoNetworkPreview: () => boolean,
  canDoHotReload: () => boolean,
  +getPreviewDebuggerServer: () => ?PreviewDebuggerServer,
};

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
  getIncludeFileHashs: () => { [string]: number },
  onExport: () => void,
  onChangeSubscription: () => void,
|};

/**
 * A PreviewLaunchComponent supports the props and has at least the functions exposed in PreviewLauncherInterface.
 * This is important as MainFrame is keeping ref to it to launch previews.
 */
export type PreviewLauncherComponent = React.AbstractComponent<
  PreviewLauncherProps,
  PreviewLauncherInterface
>;

/** Each game connected to the debugger server is identified by a unique number. */
export type DebuggerId = number;

/** The callbacks for a debugger server used for previews. */
export type PreviewDebuggerServerCallbacks = {|
  onErrorReceived: (err: Error) => void,
  onServerStateChanged: () => void,
  onConnectionClosed: ({|
    id: DebuggerId,
    debuggerIds: Array<DebuggerId>,
  |}) => void,
  onConnectionOpened: ({|
    id: DebuggerId,
    debuggerIds: Array<DebuggerId>,
  |}) => void,
  onHandleParsedMessage: ({| id: DebuggerId, parsedMessage: Object |}) => void,
|};

/** The address to be used to communicate with the debugger server using WebSockets. */
export type ServerAddress = {
  address: string,
  port: number,
};

/** Interface to run a debugger server for previews. */
export type PreviewDebuggerServer = {|
  startServer: () => Promise<void>,
  getServerState: () => 'started' | 'stopped',
  getServerAddress: () => ?ServerAddress,
  getExistingDebuggerIds: () => Array<DebuggerId>,
  sendMessage: (id: DebuggerId, message: Object) => void,
  registerCallbacks: (callbacks: PreviewDebuggerServerCallbacks) => () => void,
|};

/** The logs returned by the game hot-reloader. */
export type HotReloaderLog = {|
  kind: 'fatal' | 'error' | 'warning' | 'info',
  message: string,
|};

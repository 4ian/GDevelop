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
  fallbackAuthor: ?{ id: string, username: string },
  getIsMenuBarHiddenInPreview: () => boolean,
  getIsAlwaysOnTopInPreview: () => boolean,
|};

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
  getIncludeFileHashs: () => { [string]: number },
  onExport: () => void,
|};

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
  onConnectionErrored: ({|
    id: DebuggerId,
    errorMessage: string,
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
  getExistingDebuggerIds: () => Array<DebuggerId>,
  sendMessage: (id: DebuggerId, message: Object) => void,
  registerCallbacks: (callbacks: PreviewDebuggerServerCallbacks) => () => void,
|};

/** The logs returned by the game hot-reloader. */
export type HotReloaderLog = {|
  kind: 'fatal' | 'error' | 'warning' | 'info',
  message: string,
|};

/**
 * The functions that PreviewLauncher must expose on their class.
 * TODO: Use strict typing when the components that implement this interface
 * are functional component with strict interfaces.
 */
export type PreviewLauncherInterface = {
  launchPreview: (previewOptions: PreviewOptions) => Promise<any>,
  canDoNetworkPreview: () => boolean,
  canDoHotReload: () => boolean,
  +closePreview?: (windowId: number) => void,
  +getPreviewDebuggerServer: () => ?PreviewDebuggerServer,
};

/**
 * A PreviewLaunchComponent supports the props and has at least the functions exposed in PreviewLauncherInterface.
 * This is important as MainFrame is keeping ref to it to launch previews.
 */
export type PreviewLauncherComponent = React.AbstractComponent<
  PreviewLauncherProps,
  PreviewLauncherInterface
>;

// @flow
import * as React from 'react';

// Simpler version of the CaptureOptions, as only the delayTimeInSeconds is needed to start configuring the preview capture.
export type LaunchCaptureOptions = {|
  screenshots: Array<{|
    delayTimeInSeconds: number,
  |}>,
|};

export type LaunchPreviewOptions = {
  networkPreview?: boolean,
  hotReload?: boolean,
  projectDataOnlyExport?: boolean,
  fullLoadingScreen?: boolean,
  forceDiagnosticReport?: boolean,
  numberOfWindows?: number,
  launchCaptureOptions?: LaunchCaptureOptions,
};
export type CaptureOptions = {|
  screenshots: Array<{|
    signedUrl: string,
    delayTimeInSeconds: number,
    publicUrl: string,
  |}>,
|};

export type PreviewOptions = {|
  project: gdProject,
  layout: gdLayout,
  externalLayout: ?gdExternalLayout,
  networkPreview: boolean,
  hotReload: boolean,
  projectDataOnlyExport: boolean,
  fullLoadingScreen: boolean,
  fallbackAuthor: ?{ id: string, username: string },
  authenticatedPlayer: ?{
    playerId: string,
    playerUsername: string,
    playerToken: string,
  },
  numberOfWindows: number,
  getIsMenuBarHiddenInPreview: () => boolean,
  getIsAlwaysOnTopInPreview: () => boolean,
  captureOptions: CaptureOptions,
  onCaptureFinished: CaptureOptions => Promise<void>,
|};

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
  crashReportUploadLevel: string,
  previewContext: string,
  sourceGameId: string,
  getIncludeFileHashs: () => { [string]: number },
  onExport: () => void,
  onCaptureFinished: CaptureOptions => Promise<void>,
|};

/** Each game connected to the debugger server is identified by a unique number. */
export type DebuggerId = number;

/** The callbacks for a debugger server used for previews. */
export type PreviewDebuggerServerCallbacks = {|
  onErrorReceived: (err: Error) => void | Promise<void>,
  onServerStateChanged: () => void | Promise<void>,
  onConnectionClosed: ({|
    id: DebuggerId,
    debuggerIds: Array<DebuggerId>,
  |}) => void | Promise<void>,
  onConnectionOpened: ({|
    id: DebuggerId,
    debuggerIds: Array<DebuggerId>,
  |}) => void | Promise<void>,
  onConnectionErrored: ({|
    id: DebuggerId,
    errorMessage: string,
  |}) => void | Promise<void>,
  onHandleParsedMessage: ({|
    id: DebuggerId,
    parsedMessage: Object,
  |}) => void | Promise<void>,
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

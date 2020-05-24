// @flow
import * as React from 'react';

export type PreviewOptions = {|
  project: gdProject,
  layout: gdLayout,
  externalLayout: ?gdExternalLayout,
  networkPreview: boolean,
|};

/** The functions that PreviewLauncher must expose on their class */
export type PreviewLauncherInterface = {
  launchPreview: (options: PreviewOptions) => Promise<any>,
  canDoNetworkPreview: () => boolean,
  +getPreviewDebuggerServer: () => ?PreviewDebuggerServer,
};

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
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

/** Interface to run a debugger server for previews. */
export type PreviewDebuggerServer = {|
  startServer: () => void,
  getServerState: () => 'started' | 'stopped',
  getExistingDebuggerIds: () => Array<DebuggerId>,
  sendMessage: (id: DebuggerId, message: Object) => void,
  registerCallbacks: (callbacks: PreviewDebuggerServerCallbacks) => () => void,
|};

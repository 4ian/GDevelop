// @flow
import * as React from 'react';
import { type EditorCameraState } from '../EmbeddedGame/EmbeddedGameFrame';
import { type InGameEditorSettings } from '../EmbeddedGame/InGameEditorSettings';

// Simpler version of the CaptureOptions, as only the delayTimeInSeconds is needed to start configuring the preview capture.
export type LaunchCaptureOptions = {|
  screenshots: Array<{|
    delayTimeInSeconds: number,
  |}>,
|};

export type LaunchPreviewOptions = {
  networkPreview?: boolean,
  // When set, preview this specific layout instead of the editor's currently
  // active/previewed tab. Used by MCP so an agent can preview the project's
  // first scene (or a named scene) without controlling which tab is focused.
  forcedPreviewLayoutName?: ?string,
  hotReload?: boolean,
  shouldReloadProjectData?: boolean,
  shouldReloadLibraries?: boolean,
  shouldGenerateScenesEventsCode?: boolean,
  shouldReloadResources?: boolean,
  shouldHardReload?: boolean,
  fullLoadingScreen?: boolean,
  forceDiagnosticReport?: boolean,
  skipDiagnosticErrorBlocking?: boolean,
  numberOfWindows?: number,
  forceAlwaysOnTopInPreview?: boolean,
  isForInGameEdition?: {|
    editorId: string,
    forcedSceneName: string | null,
    forcedExternalLayoutName: string | null,
    eventsBasedObjectType: string | null,
    eventsBasedObjectVariantName: string | null,
    editorCameraState3D: EditorCameraState | null,
  |},
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
  sceneName: string,
  externalLayoutName: string | null,
  eventsBasedObjectType: string | null,
  eventsBasedObjectVariantName: string | null,
  networkPreview: boolean,
  hotReload: boolean,
  shouldReloadProjectData: boolean,
  shouldReloadLibraries: boolean,
  shouldGenerateScenesEventsCode: boolean,
  shouldReloadResources: boolean,
  shouldHardReload: boolean,
  displayCollisionMask: boolean,
  displaySignalAnimations: boolean,
  fullLoadingScreen: boolean,
  forceAlwaysOnTopInPreview: boolean,
  fallbackAuthor: ?{ id: string, username: string },
  authenticatedPlayer: ?{
    playerId: string,
    playerUsername: string,
    playerToken: string,
  },
  isForInGameEdition: boolean,
  editorId: string,
  getIsMenuBarHiddenInPreview: () => boolean,
  getIsAlwaysOnTopInPreview: () => boolean,
  captureOptions: CaptureOptions | null,
  onCaptureFinished: CaptureOptions => Promise<void>,
  inAppTutorialMessageInPreview: string,
  inAppTutorialMessagePositionInPreview: string,
  editorCameraState3D: EditorCameraState | null,
  inGameEditorSettings: InGameEditorSettings | null,
  numberOfWindows: number,

  /**
   * Returns true when this launch no longer owns the preview pipeline. Launchers
   * must check it after asynchronous setup and before touching the project.
   */
  isLaunchCancelled: () => boolean,

  /**
   * Called immediately before the launcher starts writing preview files.
   * Returning false means the launch was cancelled while the launcher was
   * preparing and must stop without touching the shared preview output.
   */
  onWillWritePreviewFiles: () => boolean,

  // Only for the web-app:
  previewWindows: Array<WindowProxy> | null,
|};

export type PreparePreviewWindowsOptions = {|
  project: gdProject,
  hotReload: boolean,
  numberOfWindows: number,
  isForInGameEdition: boolean,
|};

/** The props that PreviewLauncher must support */
export type PreviewLauncherProps = {|
  crashReportUploadLevel: string,
  previewContext: string,
  sourceGameId: string,
  getIncludeFileHashs: () => { [string]: number },
  onExport: () => void,
  onInvalidConstantPlaceholder: () => void,
  onCaptureFinished: CaptureOptions => Promise<void>,
|};

/** Each game connected to the debugger server is identified by a unique string. */
export type DebuggerId = string;

/** Each game connected to the debugger server can communicate its status. */
export type DebuggerStatus = {|
  isPaused: boolean,
  isInGameEdition: boolean,
  sceneName: string | null,
|};

/** The callbacks for a debugger server used for previews. */
export type PreviewDebuggerServerCallbacks = {|
  onErrorReceived: (err: Error) => void | Promise<void>,
  onServerStateChanged: () => void | Promise<void>,
  onConnectionClosed: ({|
    id: DebuggerId,
    debuggerIds: Array<DebuggerId>,
    connectionInfo?: Object,
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
export interface PreviewDebuggerServer {
  startServer({ origin?: string }): Promise<void>;
  getServerState(): 'started' | 'stopped';
  getExistingDebuggerIds(): Array<DebuggerId>;
  getExistingEmbeddedGameFrameDebuggerIds(): Array<DebuggerId>;
  getExistingPreviewDebuggerIds(): Array<DebuggerId>;
  getRecentLogs(id: DebuggerId): Array<Object>;
  getConnectionInfo(id: DebuggerId): ?Object;
  getLastConnectionInfo(): ?Object;
  sendMessage(id: DebuggerId, message: Object): void;
  sendMessageWithResponse(message: Object): Promise<Object>;
  registerCallbacks(callbacks: PreviewDebuggerServerCallbacks): () => void;
  registerEmbeddedGameFrame(window: WindowProxy): void;
  unregisterEmbeddedGameFrame(window: WindowProxy): void;
  closeAllPreviewConnections(): void;
  closeAllConnections(): void;
}

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
  +immediatelyPreparePreviewWindows?: (
    options: PreparePreviewWindowsOptions
  ) => Array<WindowProxy> | null,
  launchPreview: (previewOptions: PreviewOptions) => Promise<any>,
  canDoNetworkPreview: () => boolean,
  +closePreview?: (windowId: number) => void,
  +closeAllPreviews?: () => void | Promise<void>,
  +focusAllPreviews?: () => void,
  +injectPreviewClickUserGesture?: (inputs: Array<Object>) => Promise<?Object>,
  +capturePreviewPage?: (windowId: ?number) => Promise<?Object>,
  +getPreviewDebuggerServer: () => ?PreviewDebuggerServer,
};

/**
 * A PreviewLaunchComponent supports the props and has at least the functions exposed in PreviewLauncherInterface.
 * This is important as MainFrame is keeping ref to it to launch previews.
 */
export type PreviewLauncherComponent = React.ComponentType<{
  ...PreviewLauncherProps,
  +ref?: React.RefSetter<PreviewLauncherInterface>,
}>;
